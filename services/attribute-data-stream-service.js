/**
 * Attribute Data Stream Service
 *
 * Manages real-time data streams for individual SEO attributes and attribute bundles
 * Enables:
 * - Single attribute mining and streaming
 * - Multi-attribute bundling into data streams
 * - Real-time data transformation and validation
 * - Stream aggregation and analytics
 * - Integration with workflow services
 */

import EventEmitter from 'events';
import { Pool } from 'pg';

class AttributeDataStreamService extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      streamProtocol: config.streamProtocol || 'websocket',
      bufferSize: config.bufferSize || 100,
      flushInterval: config.flushInterval || 5000,
      enableValidation: config.enableValidation !== false,
      enableTransformation: config.enableTransformation !== false,
      ...config,
    };

    this.db =
      config.db ||
      new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
      });

    // Stream registry
    this.streams = new Map();
    this.attributeConfig = null;

    // Metrics
    this.metrics = {
      totalStreams: 0,
      activeStreams: 0,
      messagesProcessed: 0,
      validationErrors: 0,
      throughput: 0,
    };
  }

  /**
   * Initialize the service
   */
  async initialize() {
    console.log('🌊 Initializing Attribute Data Stream Service...');

    try {
      // Load attribute configuration
      await this.loadAttributeConfig();

      // Initialize database tables
      await this.initializeDatabase();

      // Load existing streams
      await this.loadExistingStreams();

      console.log('✅ Attribute Data Stream Service initialized');
      console.log(`   - ${Object.keys(this.attributeConfig).length} attributes loaded`);
      console.log(`   - ${this.streams.size} active streams`);

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Load attribute configuration
   */
  async loadAttributeConfig() {
    try {
      // Load from database first
      const result = await this.db.query(
        'SELECT * FROM attribute_configurations WHERE active = true'
      );

      if (result.rows.length > 0) {
        this.attributeConfig = result.rows.reduce((acc, row) => {
          acc[row.attribute_name] = row.config;
          return acc;
        }, {});
        console.log(`   Loaded ${result.rows.length} attributes from database`);
        return;
      }
    } catch (error) {
      console.log('   No attributes in database, loading from config file');
    }

    // Fallback to config file
    try {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'config', 'seo-attributes.json');
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const configData = JSON.parse(fileContent);
      this.attributeConfig = configData.attributes || {};

      // Save to database for future use
      await this.saveAttributeConfigToDatabase();
    } catch (error) {
      console.warn(
        '⚠️  Failed to load attribute config from file, using fallback set:',
        error.message
      );
      this.attributeConfig = this.getFallbackAttributeConfig();
    }
  }

  /**
   * Save attribute config to database
   */
  async saveAttributeConfigToDatabase() {
    console.log('💾 Saving attribute configuration to database...');

    for (const [name, config] of Object.entries(this.attributeConfig)) {
      try {
        await this.db.query(
          `INSERT INTO attribute_configurations (attribute_name, config, version, active)
           VALUES ($1, $2, 1, true)
           ON CONFLICT (attribute_name) 
           DO UPDATE SET config = $2, updated_at = CURRENT_TIMESTAMP`,
          [name, JSON.stringify(config)]
        );
      } catch (error) {
        console.error(`Failed to save attribute ${name}:`, error.message);
      }
    }

    console.log('✅ Attribute configuration saved');
  }

  getFallbackAttributeConfig() {
    return {
      title: {
        category: 'meta',
        selector: 'title',
        type: 'string',
        mlWeight: 0.1,
      },
      metaDescription: {
        category: 'meta',
        selector: 'meta[name="description"]',
        type: 'string',
        mlWeight: 0.08,
      },
      metaKeywords: {
        category: 'meta',
        selector: 'meta[name="keywords"]',
        type: 'string',
        mlWeight: 0.05,
      },
      canonical: {
        category: 'technical',
        selector: 'link[rel="canonical"]',
        type: 'url',
        mlWeight: 0.05,
      },
      h1: {
        category: 'content',
        selector: 'h1',
        type: 'string',
        mlWeight: 0.06,
      },
      h1Text: {
        category: 'content',
        selector: 'h1',
        type: 'string',
        mlWeight: 0.06,
      },
      h2Text: {
        category: 'content',
        selector: 'h2',
        type: 'string',
        mlWeight: 0.04,
      },
      wordCount: {
        category: 'content',
        selector: 'body',
        type: 'number',
        mlWeight: 0.05,
      },
      isSecure: {
        category: 'technical',
        selector: null,
        type: 'boolean',
        mlWeight: 0.04,
      },
      robots: {
        category: 'technical',
        selector: 'meta[name="robots"]',
        type: 'string',
        mlWeight: 0.03,
      },
      pageLoadTime: {
        category: 'performance',
        selector: null,
        type: 'number',
        mlWeight: 0.04,
      },
      firstContentfulPaint: {
        category: 'performance',
        selector: null,
        type: 'number',
        mlWeight: 0.04,
      },
    };
  }

  /**
   * Initialize database tables
   */
  async initializeDatabase() {
    const migrations = [
      // Attribute data stream registry
      `CREATE TABLE IF NOT EXISTS attribute_data_streams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stream_id VARCHAR(255) NOT NULL UNIQUE,
        stream_name VARCHAR(255) NOT NULL,
        stream_type VARCHAR(50) NOT NULL,
        protocol VARCHAR(50) DEFAULT 'websocket',
        attributes TEXT[] NOT NULL,
        configuration JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        messages_count BIGINT DEFAULT 0,
        last_message_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Stream messages buffer
      `CREATE TABLE IF NOT EXISTS attribute_stream_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stream_id VARCHAR(255) NOT NULL,
        message_data JSONB NOT NULL,
        attributes JSONB NOT NULL,
        metadata JSONB,
        validated BOOLEAN DEFAULT false,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_stream_id (stream_id),
        INDEX idx_processed (processed),
        INDEX idx_created_at (created_at)
      )`,

      // Stream analytics
      `CREATE TABLE IF NOT EXISTS attribute_stream_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stream_id VARCHAR(255) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value FLOAT NOT NULL,
        time_window VARCHAR(50),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_stream_metric (stream_id, metric_name),
        INDEX idx_recorded_at (recorded_at)
      )`,
    ];

    for (const migration of migrations) {
      try {
        await this.db.query(migration);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Migration error:', error);
        }
      }
    }
  }

  /**
   * Load existing streams from database
   */
  async loadExistingStreams() {
    try {
      const result = await this.db.query('SELECT * FROM attribute_data_streams WHERE status = $1', [
        'active',
      ]);

      for (const row of result.rows) {
        const stream = {
          id: row.stream_id,
          name: row.stream_name,
          type: row.stream_type,
          protocol: row.protocol,
          attributes: row.attributes,
          config: row.configuration,
          buffer: [],
          status: row.status,
          metrics: {
            messagesCount: row.messages_count || 0,
            lastMessageAt: row.last_message_at,
          },
        };

        this.streams.set(stream.id, stream);
      }
    } catch (error) {
      console.error('Failed to load existing streams:', error);
    }
  }

  /**
   * Create a data stream for a single attribute
   */
  async createAttributeStream(attributeName, config = {}) {
    console.log(`📊 Creating stream for attribute: ${attributeName}`);

    const attributeConfig = this.attributeConfig[attributeName];
    if (!attributeConfig) {
      throw new Error(`Attribute not found: ${attributeName}`);
    }

    const streamId = `attr-${attributeName}-${Date.now()}`;
    const stream = {
      id: streamId,
      name: config.name || `${attributeName}-stream`,
      type: 'single-attribute',
      protocol: this.config.streamProtocol,
      attributes: [attributeName],
      attributeConfig: attributeConfig,
      buffer: [],
      bufferSize: config.bufferSize || this.config.bufferSize,
      flushInterval: config.flushInterval || this.config.flushInterval,
      status: 'active',
      metrics: {
        messagesCount: 0,
        lastMessageAt: null,
        throughput: 0,
        validationErrors: 0,
      },
      subscribers: new Set(),
      transformers: [],
      validators: [],
    };

    // Setup validation if enabled
    if (this.config.enableValidation && attributeConfig.validation) {
      stream.validators.push(this.createValidator(attributeConfig.validation));
    }

    // Setup transformation if enabled
    if (this.config.enableTransformation && attributeConfig.scraping?.transform) {
      stream.transformers.push(this.createTransformer(attributeConfig.scraping.transform));
    }

    // Save to database
    await this.saveStreamToDatabase(stream);

    // Start auto-flush if configured
    if (stream.flushInterval > 0) {
      stream.flushTimer = setInterval(() => {
        this.flushStreamBuffer(streamId);
      }, stream.flushInterval);
    }

    this.streams.set(streamId, stream);
    this.metrics.totalStreams++;
    this.metrics.activeStreams++;

    console.log(`✅ Stream created: ${streamId}`);
    this.emit('streamCreated', stream);

    return stream;
  }

  /**
   * Create a bundled data stream from multiple attributes
   */
  async createBundledStream(streamName, attributeNames, config = {}) {
    console.log(`📊 Creating bundled stream: ${streamName}`);
    console.log(`   Attributes: ${attributeNames.join(', ')}`);

    // Validate all attributes exist
    for (const attrName of attributeNames) {
      if (!this.attributeConfig[attrName]) {
        throw new Error(`Attribute not found: ${attrName}`);
      }
    }

    const streamId = `bundle-${streamName}-${Date.now()}`;
    const stream = {
      id: streamId,
      name: streamName,
      type: 'bundled-attributes',
      protocol: this.config.streamProtocol,
      attributes: attributeNames,
      attributeConfigs: attributeNames.map(name => ({
        name,
        config: this.attributeConfig[name],
      })),
      buffer: [],
      bufferSize: config.bufferSize || this.config.bufferSize,
      flushInterval: config.flushInterval || this.config.flushInterval,
      status: 'active',
      metrics: {
        messagesCount: 0,
        lastMessageAt: null,
        throughput: 0,
        validationErrors: 0,
      },
      subscribers: new Set(),
      transformers: [],
      validators: [],
      aggregators: config.aggregators || [],
    };

    // Setup validators for each attribute
    if (this.config.enableValidation) {
      for (const attrName of attributeNames) {
        const attrConfig = this.attributeConfig[attrName];
        if (attrConfig.validation) {
          stream.validators.push({
            attribute: attrName,
            validator: this.createValidator(attrConfig.validation),
          });
        }
      }
    }

    // Save to database
    await this.saveStreamToDatabase(stream);

    // Start auto-flush
    if (stream.flushInterval > 0) {
      stream.flushTimer = setInterval(() => {
        this.flushStreamBuffer(streamId);
      }, stream.flushInterval);
    }

    this.streams.set(streamId, stream);
    this.metrics.totalStreams++;
    this.metrics.activeStreams++;

    console.log(`✅ Bundled stream created: ${streamId}`);
    this.emit('streamCreated', stream);

    return stream;
  }

  /**
   * Push data to a stream
   */
  async pushToStream(streamId, data) {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    // Validate data if enabled
    if (this.config.enableValidation) {
      const validationResult = await this.validateStreamData(stream, data);
      if (!validationResult.valid) {
        this.metrics.validationErrors++;
        this.emit('validationError', {
          streamId,
          data,
          errors: validationResult.errors,
        });

        if (stream.config?.strictValidation) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
      }
    }

    // Transform data if enabled
    if (this.config.enableTransformation && stream.transformers.length > 0) {
      data = await this.transformStreamData(stream, data);
    }

    // Add to buffer
    const message = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        streamId,
        validated: true,
      },
    };

    stream.buffer.push(message);
    stream.metrics.messagesCount++;
    stream.metrics.lastMessageAt = new Date();
    this.metrics.messagesProcessed++;

    // Notify subscribers
    for (const subscriber of stream.subscribers) {
      try {
        subscriber(message);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    }

    // Flush if buffer is full
    if (stream.buffer.length >= stream.bufferSize) {
      await this.flushStreamBuffer(streamId);
    }

    this.emit('messagePushed', { streamId, message });

    return message;
  }

  /**
   * Create validator from validation config
   */
  createValidator(validationConfig) {
    return data => {
      const errors = [];

      if (validationConfig.required && !data) {
        errors.push('Value is required');
      }

      if (validationConfig.minLength && data.length < validationConfig.minLength) {
        errors.push(`Minimum length is ${validationConfig.minLength}`);
      }

      if (validationConfig.maxLength && data.length > validationConfig.maxLength) {
        errors.push(`Maximum length is ${validationConfig.maxLength}`);
      }

      if (validationConfig.pattern) {
        const regex = new RegExp(validationConfig.pattern);
        if (!regex.test(data)) {
          errors.push(`Value does not match pattern: ${validationConfig.pattern}`);
        }
      }

      if (validationConfig.min !== undefined && data < validationConfig.min) {
        errors.push(`Minimum value is ${validationConfig.min}`);
      }

      if (validationConfig.max !== undefined && data > validationConfig.max) {
        errors.push(`Maximum value is ${validationConfig.max}`);
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    };
  }

  /**
   * Create transformer from transform config
   */
  createTransformer(transformType) {
    const transformers = {
      trim: data => (typeof data === 'string' ? data.trim() : data),
      lowercase: data => (typeof data === 'string' ? data.toLowerCase() : data),
      uppercase: data => (typeof data === 'string' ? data.toUpperCase() : data),
      number: data => Number(data),
      boolean: data => Boolean(data),
    };

    return transformers[transformType] || (data => data);
  }

  /**
   * Validate stream data
   */
  async validateStreamData(stream, data) {
    const errors = [];

    if (stream.type === 'single-attribute') {
      const validator = stream.validators[0];
      if (validator) {
        const result = validator(data);
        if (!result.valid) {
          errors.push(...result.errors);
        }
      }
    } else if (stream.type === 'bundled-attributes') {
      for (const validatorConfig of stream.validators) {
        const attrData = data[validatorConfig.attribute];
        const result = validatorConfig.validator(attrData);
        if (!result.valid) {
          errors.push(...result.errors.map(e => `${validatorConfig.attribute}: ${e}`));
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform stream data
   */
  async transformStreamData(stream, data) {
    let transformed = data;

    for (const transformer of stream.transformers) {
      transformed = transformer(transformed);
    }

    return transformed;
  }

  /**
   * Flush stream buffer to database
   */
  async flushStreamBuffer(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream || stream.buffer.length === 0) {
      return;
    }

    const messages = [...stream.buffer];
    stream.buffer = [];

    try {
      // Batch insert messages
      for (const message of messages) {
        await this.db.query(
          `INSERT INTO attribute_stream_messages 
           (stream_id, message_data, attributes, validated, processed)
           VALUES ($1, $2, $3, true, false)`,
          [streamId, JSON.stringify(message.data), JSON.stringify(stream.attributes)]
        );
      }

      // Update stream metrics
      await this.db.query(
        `UPDATE attribute_data_streams 
         SET messages_count = messages_count + $1, 
             last_message_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE stream_id = $2`,
        [messages.length, streamId]
      );

      this.emit('bufferFlushed', {
        streamId,
        messageCount: messages.length,
      });
    } catch (error) {
      console.error(`Failed to flush buffer for stream ${streamId}:`, error);
      // Put messages back in buffer
      stream.buffer.unshift(...messages);
    }
  }

  /**
   * Save stream to database
   */
  async saveStreamToDatabase(stream) {
    try {
      await this.db.query(
        `INSERT INTO attribute_data_streams 
         (stream_id, stream_name, stream_type, protocol, attributes, configuration, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (stream_id) 
         DO UPDATE SET 
           stream_name = $2,
           attributes = $5,
           configuration = $6,
           updated_at = CURRENT_TIMESTAMP`,
        [
          stream.id,
          stream.name,
          stream.type,
          stream.protocol,
          stream.attributes,
          JSON.stringify(stream.config || {}),
          stream.status,
        ]
      );
    } catch (error) {
      console.error('Failed to save stream to database:', error);
    }
  }

  /**
   * Subscribe to stream updates
   */
  subscribe(streamId, callback) {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    stream.subscribers.add(callback);

    return () => {
      stream.subscribers.delete(callback);
    };
  }

  /**
   * Get stream by ID
   */
  getStream(streamId) {
    return this.streams.get(streamId);
  }

  /**
   * Get all streams
   */
  getAllStreams() {
    return Array.from(this.streams.values());
  }

  /**
   * Get streams by attribute
   */
  getStreamsByAttribute(attributeName) {
    return Array.from(this.streams.values()).filter(stream =>
      stream.attributes.includes(attributeName)
    );
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeStreams: Array.from(this.streams.values()).filter(s => s.status === 'active').length,
      streamDetails: Array.from(this.streams.values()).map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        attributes: s.attributes,
        bufferSize: s.buffer.length,
        messagesCount: s.metrics.messagesCount,
        subscribers: s.subscribers.size,
      })),
    };
  }

  /**
   * Close a stream
   */
  async closeStream(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) {
      return;
    }

    // Flush remaining buffer
    await this.flushStreamBuffer(streamId);

    // Clear flush timer
    if (stream.flushTimer) {
      clearInterval(stream.flushTimer);
    }

    // Update status
    stream.status = 'closed';
    await this.db.query('UPDATE attribute_data_streams SET status = $1 WHERE stream_id = $2', [
      'closed',
      streamId,
    ]);

    this.streams.delete(streamId);
    this.metrics.activeStreams--;

    this.emit('streamClosed', { streamId });
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    console.log('🛑 Shutting down Attribute Data Stream Service...');

    // Close all streams
    for (const streamId of this.streams.keys()) {
      await this.closeStream(streamId);
    }

    // Close database
    await this.db.end();

    console.log('✅ Shutdown complete');
  }
}

export default AttributeDataStreamService;
