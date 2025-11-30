/**
 * Voice Streaming Service
 * 
 * Provides voice-to-voice communication with DeepSeek AI
 * Features:
 * - Wake word detection ("Hello DeepSeek", "DeepSeek out loud")
 * - Speech-to-text using Web Speech API / Whisper
 * - Text-to-speech with configurable voices
 * - Bidirectional streaming support
 * - Privacy-focused: only listens when activated
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} VoiceServiceConfig
 * @property {string} wakeWord
 * @property {number} wakeWordSensitivity
 * @property {boolean} wakeWordEnabled
 * @property {string} language
 * @property {string} speechRecognitionModel
 * @property {string} ttsProvider
 * @property {string} ttsVoiceId
 * @property {number} ttsSpeed
 * @property {number} ttsPitch
 * @property {number} ttsVolume
 * @property {boolean} ttsEnabled
 * @property {boolean} bidiStreamingEnabled
 * @property {'wake_word_only'|'push_to_talk'|'always_listening'|'disabled'} privacyMode
 * @property {number} autoStopOnSilenceSeconds
 * @property {boolean} deleteRecordingsAfterProcessing
 * @property {boolean} autorunEnabled
 */

/**
 * @typedef {Object} VoiceSession
 * @property {string} sessionId
 * @property {string} configId
 * @property {string} [userId]
 * @property {string} [campaignId]
 * @property {'active'|'paused'|'processing'|'completed'|'error'|'cancelled'} status
 * @property {Date} startedAt
 * @property {number} messagesCount
 * @property {string} [lastTranscript]
 * @property {string} [lastResponse]
 * @property {Object} context
 */

/**
 * @typedef {Object} VoiceMessage
 * @property {string} messageId
 * @property {string} sessionId
 * @property {'input'|'output'} direction
 * @property {'voice'|'text'|'wake_word'|'command'|'system'} messageType
 * @property {string} [transcript]
 * @property {string} [audioUrl]
 * @property {number} [audioDurationMs]
 * @property {number} [confidenceScore]
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} VoiceCommand
 * @property {string} commandId
 * @property {string} commandPhrase
 * @property {string} commandPattern
 * @property {'wake_word'|'action'|'query'|'navigation'|'workflow'|'system'} commandType
 * @property {string} actionType
 * @property {Object} actionConfig
 * @property {string} [workflowId]
 * @property {boolean} requiresConfirmation
 * @property {string} [responseTemplate]
 */

/**
 * @typedef {Object} TTSVoice
 * @property {string} voiceId
 * @property {string} provider
 * @property {string} name
 * @property {string} displayName
 * @property {string} language
 * @property {string} [gender]
 * @property {'standard'|'enhanced'|'neural'|'premium'} quality
 * @property {boolean} isDefault
 * @property {boolean} supportsStreaming
 */

/**
 * @typedef {Object} VoiceWorkflowStep
 * @property {number} step
 * @property {'detect_wake_word'|'capture_audio'|'speech_to_text'|'process'|'text_to_speech'|'stream_audio'|'api_call'} type
 * @property {string} handler
 * @property {Object} config
 */

/**
 * @typedef {Object} VoiceWorkflow
 * @property {string} workflowId
 * @property {string} name
 * @property {string} [description]
 * @property {string} [category]
 * @property {VoiceWorkflowStep[]} steps
 * @property {boolean} autorunEnabled
 * @property {'active'|'inactive'|'draft'|'testing'} status
 */

/**
 * Voice Streaming Service Class
 */
export class VoiceStreamingService extends EventEmitter {
  /** @type {Pool} */
  db;
  /** @type {Map<string, VoiceSession>} */
  activeSessions;
  /** @type {Map<string, VoiceCommand>} */
  commands;
  /** @type {Map<string, TTSVoice>} */
  voices;
  /** @type {Map<string, VoiceWorkflow>} */
  workflows;
  /** @type {VoiceServiceConfig|null} */
  config;
  /** @type {boolean} */
  isInitialized;

  /**
   * @param {Pool} [dbPool]
   */
  constructor(dbPool) {
    super();
    
    this.db = dbPool || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    this.activeSessions = new Map();
    this.commands = new Map();
    this.voices = new Map();
    this.workflows = new Map();
    this.config = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the voice service
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🎤 Initializing Voice Streaming Service...');
      
      // Load default configuration
      await this.loadDefaultConfig();
      
      // Load voice commands
      await this.loadVoiceCommands();
      
      // Load TTS voices
      await this.loadTTSVoices();
      
      // Load workflows
      await this.loadWorkflows();
      
      this.isInitialized = true;
      console.log('✅ Voice Streaming Service initialized');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Voice Streaming Service:', error);
      throw error;
    }
  }

  /**
   * Load default voice configuration from database
   */
  async loadDefaultConfig() {
    try {
      const result = await this.db.query(`
        SELECT * FROM voice_service_configs 
        WHERE is_default = true AND status = 'active'
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        this.config = {
          wakeWord: row.wake_word,
          wakeWordSensitivity: parseFloat(row.wake_word_sensitivity),
          wakeWordEnabled: row.wake_word_enabled,
          language: row.language,
          speechRecognitionModel: row.speech_recognition_model,
          ttsProvider: row.tts_provider,
          ttsVoiceId: row.tts_voice_id,
          ttsSpeed: parseFloat(row.tts_speed),
          ttsPitch: parseFloat(row.tts_pitch),
          ttsVolume: parseFloat(row.tts_volume),
          ttsEnabled: row.tts_enabled,
          bidiStreamingEnabled: row.bidi_streaming_enabled,
          privacyMode: row.privacy_mode,
          autoStopOnSilenceSeconds: row.auto_stop_on_silence_seconds,
          deleteRecordingsAfterProcessing: row.delete_recordings_after_processing,
          autorunEnabled: row.autorun_enabled,
        };
        console.log('📋 Loaded voice configuration:', this.config.wakeWord);
      } else {
        // Use default configuration
        this.config = {
          wakeWord: 'hello deepseek',
          wakeWordSensitivity: 0.7,
          wakeWordEnabled: true,
          language: 'en-US',
          speechRecognitionModel: 'whisper',
          ttsProvider: 'native',
          ttsVoiceId: 'deepseek-natural',
          ttsSpeed: 1.0,
          ttsPitch: 1.0,
          ttsVolume: 1.0,
          ttsEnabled: true,
          bidiStreamingEnabled: true,
          privacyMode: 'wake_word_only',
          autoStopOnSilenceSeconds: 3,
          deleteRecordingsAfterProcessing: true,
          autorunEnabled: false,
        };
        console.log('📋 Using default voice configuration');
      }
    } catch (error) {
      console.warn('⚠️ Could not load voice config from database, using defaults');
      this.config = {
        wakeWord: 'hello deepseek',
        wakeWordSensitivity: 0.7,
        wakeWordEnabled: true,
        language: 'en-US',
        speechRecognitionModel: 'whisper',
        ttsProvider: 'native',
        ttsVoiceId: 'deepseek-natural',
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        ttsVolume: 1.0,
        ttsEnabled: true,
        bidiStreamingEnabled: true,
        privacyMode: 'wake_word_only',
        autoStopOnSilenceSeconds: 3,
        deleteRecordingsAfterProcessing: true,
        autorunEnabled: false,
      };
    }
  }

  /**
   * Load voice commands from database
   */
  async loadVoiceCommands() {
    try {
      const result = await this.db.query(`
        SELECT * FROM voice_commands 
        WHERE is_enabled = true
        ORDER BY priority ASC
      `);

      for (const row of result.rows) {
        this.commands.set(row.command_id, {
          commandId: row.command_id,
          commandPhrase: row.command_phrase,
          commandPattern: row.command_pattern,
          commandType: row.command_type,
          actionType: row.action_type,
          actionConfig: row.action_config || {},
          workflowId: row.workflow_id,
          requiresConfirmation: row.requires_confirmation,
          responseTemplate: row.response_template,
        });
      }
      console.log(`📢 Loaded ${this.commands.size} voice commands`);
    } catch (error) {
      console.warn('⚠️ Could not load voice commands from database');
    }
  }

  /**
   * Load TTS voices from database
   */
  async loadTTSVoices() {
    try {
      const result = await this.db.query(`
        SELECT * FROM tts_voices 
        WHERE is_enabled = true
        ORDER BY is_default DESC, name ASC
      `);

      for (const row of result.rows) {
        this.voices.set(row.voice_id, {
          voiceId: row.voice_id,
          provider: row.provider,
          name: row.name,
          displayName: row.display_name,
          language: row.language,
          gender: row.gender,
          quality: row.quality,
          isDefault: row.is_default,
          supportsStreaming: row.supports_streaming,
        });
      }
      console.log(`🔊 Loaded ${this.voices.size} TTS voices`);
    } catch (error) {
      console.warn('⚠️ Could not load TTS voices from database');
    }
  }

  /**
   * Load voice workflows from database
   */
  async loadWorkflows() {
    try {
      const result = await this.db.query(`
        SELECT * FROM voice_workflows 
        WHERE status = 'active'
        ORDER BY name ASC
      `);

      for (const row of result.rows) {
        this.workflows.set(row.workflow_id, {
          workflowId: row.workflow_id,
          name: row.name,
          description: row.description,
          category: row.category,
          steps: row.steps,
          autorunEnabled: row.autorun_enabled,
          status: row.status,
        });
      }
      console.log(`🔄 Loaded ${this.workflows.size} voice workflows`);
    } catch (error) {
      console.warn('⚠️ Could not load voice workflows from database');
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Update configuration
   */
  async updateConfig(configId, updates) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      wakeWord: 'wake_word',
      wakeWordSensitivity: 'wake_word_sensitivity',
      wakeWordEnabled: 'wake_word_enabled',
      language: 'language',
      speechRecognitionModel: 'speech_recognition_model',
      ttsProvider: 'tts_provider',
      ttsVoiceId: 'tts_voice_id',
      ttsSpeed: 'tts_speed',
      ttsPitch: 'tts_pitch',
      ttsVolume: 'tts_volume',
      ttsEnabled: 'tts_enabled',
      bidiStreamingEnabled: 'bidi_streaming_enabled',
      privacyMode: 'privacy_mode',
      autoStopOnSilenceSeconds: 'auto_stop_on_silence_seconds',
      deleteRecordingsAfterProcessing: 'delete_recordings_after_processing',
      autorunEnabled: 'autorun_enabled',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key]) {
        updateFields.push(`${fieldMapping[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length > 0) {
      values.push(configId);
      await this.db.query(`
        UPDATE voice_service_configs 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE config_id = $${paramIndex}
      `, values);

      // Reload configuration
      await this.loadDefaultConfig();
    }

    return this.config;
  }

  /**
   * Start a new voice session
   */
  async startSession(userId, campaignId) {
    const sessionId = uuidv4();
    
    const session = {
      sessionId,
      configId: 'default-voice-config',
      userId,
      campaignId,
      status: 'active',
      startedAt: new Date(),
      messagesCount: 0,
      context: {},
    };

    // Save to database
    try {
      await this.db.query(`
        INSERT INTO voice_sessions (session_id, config_id, user_id, campaign_id, status)
        VALUES ($1, $2, $3, $4, $5)
      `, [sessionId, session.configId, userId, campaignId, 'active']);
    } catch (error) {
      console.warn('⚠️ Could not save voice session to database');
    }

    this.activeSessions.set(sessionId, session);
    this.emit('session:started', session);
    
    console.log(`🎙️ Started voice session: ${sessionId}`);
    return session;
  }

  /**
   * End a voice session
   */
  async endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      
      // Update database
      try {
        await this.db.query(`
          UPDATE voice_sessions 
          SET status = 'completed', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE session_id = $1
        `, [sessionId]);
      } catch (error) {
        console.warn('⚠️ Could not update voice session in database');
      }

      this.activeSessions.delete(sessionId);
      this.emit('session:ended', session);
      
      console.log(`🛑 Ended voice session: ${sessionId}`);
    }
  }

  /**
   * Check if text contains wake word
   */
  detectWakeWord(text) {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of this.commands.values()) {
      if (command.commandType === 'wake_word') {
        // Check exact phrase match
        if (normalizedText.includes(command.commandPhrase.toLowerCase())) {
          return command;
        }
        
        // Check regex pattern if available
        if (command.commandPattern) {
          try {
            const regex = new RegExp(command.commandPattern, 'i');
            if (regex.test(normalizedText)) {
              return command;
            }
          } catch (e) {
            // Invalid regex, skip
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Match a voice command
   */
  matchCommand(text) {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of this.commands.values()) {
      // Check exact phrase match
      if (normalizedText.includes(command.commandPhrase.toLowerCase())) {
        return command;
      }
      
      // Check regex pattern if available
      if (command.commandPattern) {
        try {
          const regex = new RegExp(command.commandPattern, 'i');
          if (regex.test(normalizedText)) {
            return command;
          }
        } catch (e) {
          // Invalid regex, skip
        }
      }
    }
    
    return null;
  }

  /**
   * Record a voice message
   */
  async recordMessage(
    sessionId,
    direction,
    messageType,
    content
  ) {
    const messageId = uuidv4();
    
    const message = {
      messageId,
      sessionId,
      direction,
      messageType,
      transcript: content.transcript,
      audioUrl: content.audioUrl,
      audioDurationMs: content.audioDurationMs,
      confidenceScore: content.confidenceScore,
      timestamp: new Date(),
    };

    // Save to database
    try {
      await this.db.query(`
        INSERT INTO voice_messages (
          message_id, session_id, direction, message_type, 
          transcript, audio_url, audio_duration_ms, confidence_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        messageId, sessionId, direction, messageType,
        content.transcript, content.audioUrl, content.audioDurationMs, content.confidenceScore
      ]);

      // Update session message count
      await this.db.query(`
        UPDATE voice_sessions 
        SET messages_count = messages_count + 1,
            last_transcript = CASE WHEN $2 = 'input' THEN $3 ELSE last_transcript END,
            last_response = CASE WHEN $2 = 'output' THEN $3 ELSE last_response END,
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $1
      `, [sessionId, direction, content.transcript]);
    } catch (error) {
      console.warn('⚠️ Could not save voice message to database');
    }

    // Update session in memory
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.messagesCount++;
      if (direction === 'input') {
        session.lastTranscript = content.transcript;
      } else {
        session.lastResponse = content.transcript;
      }
    }

    this.emit('message:recorded', message);
    return message;
  }

  /**
   * Get available TTS voices
   */
  getVoices() {
    return Array.from(this.voices.values());
  }

  /**
   * Get voice by ID
   */
  getVoice(voiceId) {
    return this.voices.get(voiceId);
  }

  /**
   * Get default voice
   */
  getDefaultVoice() {
    return Array.from(this.voices.values()).find(v => v.isDefault);
  }

  /**
   * Get available voice commands
   */
  getCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Get available workflows
   */
  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }

  /**
   * Execute a voice workflow
   */
  async executeWorkflow(workflowId, sessionId, inputData = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const runId = uuidv4();
    const startTime = Date.now();

    try {
      // Create workflow run record
      await this.db.query(`
        INSERT INTO voice_workflow_runs (run_id, workflow_id, session_id, status, input_data)
        VALUES ($1, $2, $3, 'running', $4)
      `, [runId, workflowId, sessionId, JSON.stringify(inputData)]);

      const stepResults = [];
      let currentData = inputData;

      // Execute each step
      for (const step of workflow.steps) {
        console.log(`🔄 Executing step ${step.step}: ${step.type} (${step.handler})`);
        
        // Update current step
        await this.db.query(`
          UPDATE voice_workflow_runs 
          SET current_step = $2, updated_at = CURRENT_TIMESTAMP
          WHERE run_id = $1
        `, [runId, step.step]);

        // Execute step (placeholder - actual implementation would call appropriate handlers)
        const stepResult = await this.executeWorkflowStep(step, currentData, sessionId);
        stepResults.push({
          step: step.step,
          type: step.type,
          result: stepResult,
          timestamp: new Date().toISOString(),
        });

        currentData = { ...currentData, ...stepResult };
      }

      const totalDuration = Date.now() - startTime;

      // Update workflow run as completed
      await this.db.query(`
        UPDATE voice_workflow_runs 
        SET status = 'completed', 
            completed_at = CURRENT_TIMESTAMP,
            total_duration_ms = $2,
            output_data = $3,
            step_results = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE run_id = $1
      `, [runId, totalDuration, JSON.stringify(currentData), JSON.stringify(stepResults)]);

      this.emit('workflow:completed', { runId, workflowId, sessionId, results: currentData });
      
      return {
        runId,
        workflowId,
        status: 'completed',
        duration: totalDuration,
        results: currentData,
        steps: stepResults,
      };
    } catch (error) {
      // Update workflow run as failed
      await this.db.query(`
        UPDATE voice_workflow_runs 
        SET status = 'failed', 
            error_message = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE run_id = $1
      `, [runId, error.message]);

      this.emit('workflow:failed', { runId, workflowId, error });
      throw error;
    }
  }

  /**
   * Execute a single workflow step
   */
  async executeWorkflowStep(
    step,
    inputData,
    sessionId
  ) {
    switch (step.type) {
      case 'detect_wake_word':
        // Wake word detection is handled by the client
        return { wakeWordDetected: true };

      case 'capture_audio':
        // Audio capture is handled by the client
        return { audioCaptured: true, duration: inputData.audioDuration };

      case 'speech_to_text':
        // STT processing - would integrate with Whisper or Web Speech API
        return { transcript: inputData.transcript || '' };

      case 'process':
        // DeepSeek chat processing
        if (step.handler === 'deepseek_chat') {
          return await this.processWithDeepSeek(inputData.transcript, sessionId, step.config);
        }
        return inputData;

      case 'text_to_speech':
        // TTS processing
        return await this.generateSpeech(inputData.response || inputData.transcript, step.config);

      case 'stream_audio':
        // Audio streaming is handled by the client
        return { streamed: true };

      case 'api_call':
        // Generic API call
        return await this.executeApiCall(step.config, inputData);

      default:
        return inputData;
    }
  }

  /**
   * Process text with DeepSeek
   */
  async processWithDeepSeek(
    text,
    sessionId,
    config = {}
  ) {
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const model = config.model || process.env.OLLAMA_MODEL || 'deepseek-r1:latest';

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: text,
          stream: false,
          options: {
            temperature: config.temperature || 0.7,
            max_tokens: config.max_tokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response || '',
        model,
        processed: true,
      };
    } catch (error) {
      console.error('DeepSeek processing error:', error);
      return {
        response: 'I apologize, but I encountered an error processing your request.',
        error: error.message,
        processed: false,
      };
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(
    text,
    config = {}
  ) {
    const voiceId = config.voice || this.config?.ttsVoiceId || 'deepseek-natural';
    const voice = this.voices.get(voiceId);

    // In a real implementation, this would call a TTS service
    // For now, we return the text and let the client handle TTS
    return {
      text,
      voiceId,
      voice: voice?.displayName || 'Default',
      audioGenerated: true,
    };
  }

  /**
   * Execute a generic API call
   */
  async executeApiCall(config, inputData) {
    // Placeholder for generic API call execution
    return { apiCallExecuted: true, config, inputData };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const result = await this.db.query(`
        SELECT 
          vs.*,
          COUNT(vm.id) as message_count,
          SUM(CASE WHEN vm.direction = 'input' THEN vm.audio_duration_ms ELSE 0 END) as input_duration,
          SUM(CASE WHEN vm.direction = 'output' THEN vm.audio_duration_ms ELSE 0 END) as output_duration
        FROM voice_sessions vs
        LEFT JOIN voice_messages vm ON vs.session_id = vm.session_id
        WHERE vs.session_id = $1
        GROUP BY vs.id
      `, [sessionId]);

      return result.rows[0] || null;
    } catch (error) {
      console.warn('⚠️ Could not get session stats');
      return null;
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats() {
    try {
      const result = await this.db.query(`
        SELECT * FROM v_voice_service_stats
      `);

      return result.rows[0] || {
        totalSessions: 0,
        activeSessions: this.activeSessions.size,
        totalMessages: 0,
        uniqueUsers: 0,
      };
    } catch (error) {
      return {
        totalSessions: 0,
        activeSessions: this.activeSessions.size,
        totalMessages: 0,
        uniqueUsers: 0,
      };
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down Voice Streaming Service...');
    
    // End all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      await this.endSession(sessionId);
    }
    
    await this.db.end();
    this.emit('shutdown');
    console.log('✅ Voice Streaming Service shut down');
  }
}

// Export singleton instance
let voiceServiceInstance = null;

export function getVoiceStreamingService(db) {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new VoiceStreamingService(db);
  }
  return voiceServiceInstance;
}

export default VoiceStreamingService;
