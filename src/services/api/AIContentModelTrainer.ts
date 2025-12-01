/**
 * AI Content Model Trainer
 *
 * Trains TensorFlow.js models for content generation using historical data
 * and performance metrics. Implements continuous learning from feedback.
 */

import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs/promises';
import { createRequire } from 'module';
import * as path from 'path';
import { Pool } from 'pg';

const requireTF = createRequire(import.meta.url);

const TENSORFLOW_BACKEND = (() => {
    try {
        requireTF('@tensorflow/tfjs-node');
        if (typeof tf.setBackend === 'function' && typeof tf.findBackend === 'function' && tf.findBackend('tensorflow')) {
            tf.setBackend('tensorflow').catch(() => {});
        }
        console.log('AIContentModelTrainer: native TensorFlow backend enabled');
        return 'tensorflow';
    } catch (err) {
        console.warn('AIContentModelTrainer: native TensorFlow bindings unavailable, using @tensorflow/tfjs fallback');
        return 'tfjs';
    }
})();

const TF_NODE_AVAILABLE = TENSORFLOW_BACKEND === 'tensorflow';

interface TrainingConfig {
    modelType: 'title' | 'meta_description' | 'content' | 'combined';
    epochs: number;
    batchSize: number;
    learningRate: number;
    validationSplit: number;
    minDatasetSize: number;
}

interface TrainingData {
    features: number[][];
    labels: number[][];
    vocabulary: Map<string, number>;
    maxSequenceLength: number;
}

interface ModelMetrics {
    accuracy: number;
    loss: number;
    precision: number;
    recall: number;
    f1Score: number;
}

export class AIContentModelTrainer {
    private db: Pool;
    private modelSaveDir: string;
    private vocabularyMap: Map<string, number>;
    private reverseVocabularyMap: Map<number, string>;

    constructor(dbPool: Pool, modelSaveDir: string = './models/content-generation') {
        this.db = dbPool;
        this.modelSaveDir = modelSaveDir;
        this.vocabularyMap = new Map();
        this.reverseVocabularyMap = new Map();
    }

    /**
     * Train a content generation model
     */
    async trainModel(config: TrainingConfig): Promise<string> {
        console.log(`Starting model training for ${config.modelType}...`);
        const startTime = Date.now();

        try {
            // Step 1: Collect training data from database
            console.log('Collecting training data...');
            const trainingData = await this.collectTrainingData(config);

            if (trainingData.features.length < config.minDatasetSize) {
                throw new Error(`Insufficient training data. Found ${trainingData.features.length}, need at least ${config.minDatasetSize}`);
            }

            console.log(`Collected ${trainingData.features.length} training samples`);

            // Step 2: Build and compile model
            console.log('Building model architecture...');
            const model = this.buildModel(config, trainingData);

            // Step 3: Prepare tensors
            console.log('Preparing training tensors...');
            const { xTrain, yTrain, xVal, yVal } = this.prepareTensors(trainingData, config);

            // Step 4: Train the model
            console.log('Training model...');
            const history = await model.fit(xTrain, yTrain, {
                epochs: config.epochs,
                batchSize: config.batchSize,
                validationData: [xVal, yVal],
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        console.log(`Epoch ${epoch + 1}/${config.epochs} - loss: ${logs?.loss.toFixed(4)} - accuracy: ${logs?.acc?.toFixed(4)} - val_loss: ${logs?.val_loss.toFixed(4)} - val_acc: ${logs?.val_acc?.toFixed(4)}`);
                    }
                },
                shuffle: true
            });

            // Step 5: Evaluate model
            console.log('Evaluating model...');
            const metrics = await this.evaluateModel(model, xVal, yVal);

            // Step 6: Save model
            console.log('Saving model...');
            const modelPath = await this.saveModel(model, config, trainingData);

            // Step 7: Record training run in database
            const trainingRunId = await this.recordTrainingRun(config, trainingData, metrics, modelPath);

            // Cleanup tensors
            xTrain.dispose();
            yTrain.dispose();
            xVal.dispose();
            yVal.dispose();

            const trainingTime = Date.now() - startTime;
            console.log(`Model training completed in ${(trainingTime / 1000).toFixed(2)}s`);
            console.log(`Model ID: ${trainingRunId}`);
            console.log(`Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);

            return trainingRunId;

        } catch (error) {
            console.error('Error during model training:', error);
            throw error;
        }
    }

    /**
     * Collect training data from database
     */
    private async collectTrainingData(config: TrainingConfig): Promise<TrainingData> {
        let query = '';
        let dataField = '';

        switch (config.modelType) {
            case 'title':
                dataField = 'generated_title';
                break;
            case 'meta_description':
                dataField = 'generated_meta_description';
                break;
            case 'content':
                dataField = 'generated_content';
                break;
            case 'combined':
                dataField = 'generated_title, generated_meta_description, generated_content';
                break;
        }

        // Get high-performing content with good metrics
        query = `
            SELECT
                gc.${dataField},
                gc.input_features,
                gc.seo_score,
                gc.readability_score,
                AVG(cp.search_position) as avg_position,
                AVG(cp.search_ctr) as avg_ctr,
                AVG(tf.rating) as avg_rating
            FROM ai_content.generated_content gc
            LEFT JOIN ai_content.content_performance cp ON gc.id = cp.generated_content_id
            LEFT JOIN ai_content.training_feedback tf ON gc.id = tf.generated_content_id
            WHERE gc.quality_validation_passed = true
                AND gc.status = 'deployed'
                AND gc.seo_score >= 70
            GROUP BY gc.id, gc.${dataField}, gc.input_features, gc.seo_score, gc.readability_score
            HAVING COUNT(cp.id) >= 3 AND AVG(cp.search_position) <= 10
            ORDER BY gc.seo_score DESC, AVG(cp.search_position) ASC
            LIMIT 10000
        `;

        const result = await this.db.query(query);

        // Also get negative examples (low performers) for balanced training
        const negativeQuery = `
            SELECT
                gc.${dataField},
                gc.input_features,
                gc.seo_score,
                gc.readability_score,
                AVG(cp.search_position) as avg_position,
                AVG(cp.search_ctr) as avg_ctr,
                AVG(tf.rating) as avg_rating
            FROM ai_content.generated_content gc
            LEFT JOIN ai_content.content_performance cp ON gc.id = cp.generated_content_id
            LEFT JOIN ai_content.training_feedback tf ON gc.id = tf.generated_content_id
            WHERE gc.quality_validation_passed = false
                OR gc.seo_score < 50
            GROUP BY gc.id, gc.${dataField}, gc.input_features, gc.seo_score, gc.readability_score
            LIMIT 2000
        `;

        const negativeResult = await this.db.query(negativeQuery);

        // Combine positive and negative examples
        const allData = [...result.rows, ...negativeResult.rows];

        // Build vocabulary from all content
        this.buildVocabulary(allData, dataField);

        // Convert to feature vectors
        const features: number[][] = [];
        const labels: number[][] = [];

        for (const row of allData) {
            // Extract features from input_features JSON
            const inputFeatures = this.extractFeatureVector(row.input_features);

            // Convert text to sequence
            let textContent = '';
            if (config.modelType === 'combined') {
                textContent = `${row.generated_title || ''} ${row.generated_meta_description || ''} ${row.generated_content || ''}`;
            } else {
                textContent = row[dataField] || '';
            }

            const sequence = this.textToSequence(textContent, 100);

            features.push([...inputFeatures, ...sequence]);
            labels.push(this.createLabel(row)); // Performance-based label
        }

        return {
            features,
            labels,
            vocabulary: this.vocabularyMap,
            maxSequenceLength: 100
        };
    }

    /**
     * Build vocabulary from training data
     */
    private buildVocabulary(data: any[], textField: string): void {
        const allWords = new Set<string>();

        // Add special tokens
        this.vocabularyMap.set('<PAD>', 0);
        this.vocabularyMap.set('<UNK>', 1);
        this.vocabularyMap.set('<START>', 2);
        this.vocabularyMap.set('<END>', 3);

        this.reverseVocabularyMap.set(0, '<PAD>');
        this.reverseVocabularyMap.set(1, '<UNK>');
        this.reverseVocabularyMap.set(2, '<START>');
        this.reverseVocabularyMap.set(3, '<END>');

        for (const row of data) {
            let text = '';

            if (textField.includes(',')) {
                // Combined fields
                text = Object.values(row).join(' ');
            } else {
                text = row[textField] || '';
            }

            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            words.forEach(word => allWords.add(word));
        }

        // Add words to vocabulary (limit to most common 50000 words)
        const wordArray = Array.from(allWords);
        const topWords = wordArray.slice(0, 50000);

        topWords.forEach((word, index) => {
            const vocabIndex = index + 4; // Offset by special tokens
            this.vocabularyMap.set(word, vocabIndex);
            this.reverseVocabularyMap.set(vocabIndex, word);
        });

        console.log(`Vocabulary size: ${this.vocabularyMap.size}`);
    }

    /**
     * Extract numeric feature vector from input features
     */
    private extractFeatureVector(inputFeatures: any): number[] {
        if (!inputFeatures) {
            return new Array(50).fill(0); // Default 50 features
        }

        const features: number[] = [];

        // Extract relevant numeric features
        features.push(inputFeatures.currentWordCount || 0);
        features.push(inputFeatures.currentKeywordDensity || 0);
        features.push(inputFeatures.seoFeatures?.overall_score || 0);
        features.push(inputFeatures.seoFeatures?.position || 100);
        features.push(inputFeatures.competitorAvgLength || 0);

        // Add SEO features if available
        if (inputFeatures.seoFeatures) {
            const seoFeats = inputFeatures.seoFeatures;

            features.push(seoFeats.title_length || 0);
            features.push(seoFeats.meta_description_length || 0);
            features.push(seoFeats.word_count || 0);
            features.push(seoFeats.keyword_in_title ? 1 : 0);
            features.push(seoFeats.keyword_in_meta ? 1 : 0);
            features.push(seoFeats.keyword_in_h1 ? 1 : 0);
            features.push(seoFeats.has_alt_text ? 1 : 0);
            features.push(seoFeats.has_schema ? 1 : 0);
            features.push(seoFeats.mobile_friendly ? 1 : 0);
            features.push(seoFeats.page_speed_score || 0);
            features.push(seoFeats.lcp || 0);
            features.push(seoFeats.fid || 0);
            features.push(seoFeats.cls || 0);
            features.push(seoFeats.internal_links || 0);
            features.push(seoFeats.external_links || 0);
        }

        // Pad or trim to exactly 50 features
        while (features.length < 50) features.push(0);
        return features.slice(0, 50);
    }

    /**
     * Convert text to numerical sequence
     */
    private textToSequence(text: string, maxLength: number): number[] {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const sequence: number[] = [this.vocabularyMap.get('<START>') || 2];

        for (const word of words) {
            const index = this.vocabularyMap.get(word) || this.vocabularyMap.get('<UNK>') || 1;
            sequence.push(index);

            if (sequence.length >= maxLength - 1) break;
        }

        sequence.push(this.vocabularyMap.get('<END>') || 3);

        // Pad sequence
        while (sequence.length < maxLength) {
            sequence.push(this.vocabularyMap.get('<PAD>') || 0);
        }

        return sequence.slice(0, maxLength);
    }

    /**
     * Create label based on performance metrics
     */
    private createLabel(row: any): number[] {
        // Multi-class classification: [poor, average, good, excellent]
        const score = row.seo_score || 0;
        const position = row.avg_position || 100;
        const ctr = row.avg_ctr || 0;
        const rating = row.avg_rating || 0;

        // Calculate overall performance score
        const performanceScore =
            (score / 100) * 0.4 +
            (Math.max(0, (100 - position) / 100)) * 0.3 +
            (ctr / 10) * 0.2 +
            (rating / 5) * 0.1;

        // Convert to one-hot encoding
        if (performanceScore >= 0.8) return [0, 0, 0, 1]; // excellent
        if (performanceScore >= 0.6) return [0, 0, 1, 0]; // good
        if (performanceScore >= 0.4) return [0, 1, 0, 0]; // average
        return [1, 0, 0, 0]; // poor
    }

    /**
     * Build model architecture
     */
    private buildModel(config: TrainingConfig, trainingData: TrainingData): tf.LayersModel {
        const inputDim = trainingData.features[0].length;
        const outputDim = trainingData.labels[0].length;

        const model = tf.sequential();

        // Input layer
        model.add(tf.layers.dense({
            inputShape: [inputDim],
            units: 256,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }));

        model.add(tf.layers.dropout({ rate: 0.3 }));

        // Hidden layers
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }));

        model.add(tf.layers.dropout({ rate: 0.3 }));

        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu'
        }));

        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Output layer
        model.add(tf.layers.dense({
            units: outputDim,
            activation: 'softmax'
        }));

        // Compile model
        model.compile({
            optimizer: tf.train.adam(config.learningRate),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    /**
     * Prepare training and validation tensors
     */
    private prepareTensors(trainingData: TrainingData, config: TrainingConfig): any {
        const splitIndex = Math.floor(trainingData.features.length * (1 - config.validationSplit));

        const trainFeatures = trainingData.features.slice(0, splitIndex);
        const trainLabels = trainingData.labels.slice(0, splitIndex);
        const valFeatures = trainingData.features.slice(splitIndex);
        const valLabels = trainingData.labels.slice(splitIndex);

        return {
            xTrain: tf.tensor2d(trainFeatures),
            yTrain: tf.tensor2d(trainLabels),
            xVal: tf.tensor2d(valFeatures),
            yVal: tf.tensor2d(valLabels)
        };
    }

    /**
     * Evaluate model performance
     */
    private async evaluateModel(model: tf.LayersModel, xVal: tf.Tensor, yVal: tf.Tensor): Promise<ModelMetrics> {
        // model.evaluate may return framework-specific tensor scalars; cast to
        // `any` here to avoid depending on exact TF typings during triage.
        const evaluation = model.evaluate(xVal, yVal) as any;       

        const loss = await evaluation[0].data();
        const accuracy = await evaluation[1].data();

        // Calculate precision, recall, F1
        const predictions = model.predict(xVal) as tf.Tensor;
        const predArray = await predictions.array() as number[][];
        const trueArray = await yVal.array() as number[][];

        let truePositives = 0;
        let falsePositives = 0;
        let falseNegatives = 0;

        for (let i = 0; i < predArray.length; i++) {
            const predClass = predArray[i].indexOf(Math.max(...predArray[i]));
            const trueClass = trueArray[i].indexOf(Math.max(...trueArray[i]));

            if (predClass === trueClass && predClass > 1) { // Focus on good/excellent classes
                truePositives++;
            } else if (predClass > 1 && trueClass <= 1) {
                falsePositives++;
            } else if (predClass <= 1 && trueClass > 1) {
                falseNegatives++;
            }
        }

        const precision = truePositives / (truePositives + falsePositives) || 0;
        const recall = truePositives / (truePositives + falseNegatives) || 0;
        const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

        predictions.dispose();

        return {
            accuracy: accuracy[0],
            loss: loss[0],
            precision,
            recall,
            f1Score
        };
    }

    /**
     * Save trained model to disk
     */
    private async saveModel(model: tf.LayersModel, config: TrainingConfig, trainingData: TrainingData): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const modelName = `${config.modelType}-model-${timestamp}`;
        const modelPath = path.join(this.modelSaveDir, modelName);

        // Create directory if it doesn't exist
        await fs.mkdir(modelPath, { recursive: true });

        // Save TensorFlow model
        if (!TF_NODE_AVAILABLE) {
            throw new Error('TensorFlow native bindings are required to save models to disk. Install optional dependency @tensorflow/tfjs-node to enable model persistence.');
        }

        await model.save(`file://${modelPath}`);

        // Save vocabulary
        const vocabularyPath = path.join(modelPath, 'vocabulary.json');
        const vocabularyData = {
            vocabularyMap: Array.from(this.vocabularyMap.entries()),
            maxSequenceLength: trainingData.maxSequenceLength
        };
        await fs.writeFile(vocabularyPath, JSON.stringify(vocabularyData, null, 2));

        console.log(`Model saved to: ${modelPath}`);

        return modelPath;
    }

    /**
     * Record training run in database
     */
    private async recordTrainingRun(
        config: TrainingConfig,
        trainingData: TrainingData,
        metrics: ModelMetrics,
        modelPath: string
    ): Promise<string> {
        const query = `
            INSERT INTO ai_content.generation_models (
                model_name, model_version, model_type, model_path,
                training_dataset_size, training_features, hyperparameters,
                accuracy_metrics, status, deployed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `;

        const modelVersion = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        const modelName = `${config.modelType}-generator-v${modelVersion}`;

        const values = [
            modelName,
            modelVersion,
            config.modelType,
            modelPath,
            trainingData.features.length,
            JSON.stringify({
                vocabularySize: trainingData.vocabulary.size,
                maxSequenceLength: trainingData.maxSequenceLength,
                featureCount: trainingData.features[0].length
            }),
            JSON.stringify({
                epochs: config.epochs,
                batchSize: config.batchSize,
                learningRate: config.learningRate,
                validationSplit: config.validationSplit
            }),
            JSON.stringify({
                accuracy: metrics.accuracy,
                loss: metrics.loss,
                precision: metrics.precision,
                recall: metrics.recall,
                f1Score: metrics.f1Score
            }),
            metrics.accuracy >= 0.7 ? 'active' : 'testing', // Auto-deploy if accuracy >= 70%
            metrics.accuracy >= 0.7 ? new Date() : null
        ];

        const result = await this.db.query(query, values);
        return result.rows[0].id;
    }

    /**
     * Retrain model with new feedback data
     */
    async retrainWithFeedback(modelId: string): Promise<string> {
        console.log(`Retraining model ${modelId} with new feedback...`);

        // Get original model config
        const modelQuery = 'SELECT * FROM ai_content.generation_models WHERE id = $1';
        const modelResult = await this.db.query(modelQuery, [modelId]);

        if (modelResult.rows.length === 0) {
            throw new Error(`Model ${modelId} not found`);
        }

        const originalModel = modelResult.rows[0];
        const hyperparameters = originalModel.hyperparameters;

        const config: TrainingConfig = {
            modelType: originalModel.model_type,
            epochs: hyperparameters.epochs,
            batchSize: hyperparameters.batchSize,
            learningRate: hyperparameters.learningRate * 0.1, // Lower learning rate for fine-tuning
            validationSplit: hyperparameters.validationSplit,
            minDatasetSize: 100
        };

        // Train new model with updated data
        return await this.trainModel(config);
    }
}

export default AIContentModelTrainer;
