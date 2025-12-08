/**
 * Voice Streaming API Routes
 * 
 * REST and WebSocket endpoints for voice streaming service
 * Supports bidirectional streaming, wake word detection, and TTS/STT
 */

import { Router } from 'express';
import { getVoiceStreamingService } from '../services/voice-streaming-service.js';

const router = Router();

// Initialize voice service
let voiceService = null;

async function ensureVoiceService(req) {
  if (!voiceService) {
    voiceService = getVoiceStreamingService(req.app.locals.db);
    await voiceService.initialize();
  }
  return voiceService;
}

/**
 * @swagger
 * /api/voice/health:
 *   get:
 *     summary: Check voice service health
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const stats = await service.getServiceStats();
    
    res.json({
      status: 'healthy',
      initialized: true,
      activeSessions: stats.activeSessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /api/voice/config:
 *   get:
 *     summary: Get current voice configuration
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: Voice configuration
 */
router.get('/config', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const config = service.getConfig();
    
    res.json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/config:
 *   put:
 *     summary: Update voice configuration
 *     tags: [Voice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated configuration
 */
router.put('/config', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const configId = req.body.configId || 'default-voice-config';
    const updates = req.body;
    delete updates.configId;
    
    const updatedConfig = await service.updateConfig(configId, updates);
    
    res.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/voices:
 *   get:
 *     summary: Get available TTS voices
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: List of TTS voices
 */
router.get('/voices', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const voices = service.getVoices();
    const defaultVoice = service.getDefaultVoice();
    
    res.json({
      success: true,
      voices,
      defaultVoiceId: defaultVoice?.voiceId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/voices/{voiceId}:
 *   get:
 *     summary: Get a specific TTS voice
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: voiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voice details
 */
router.get('/voices/:voiceId', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const voice = service.getVoice(req.params.voiceId);
    
    if (!voice) {
      return res.status(404).json({
        success: false,
        error: 'Voice not found',
      });
    }
    
    res.json({
      success: true,
      voice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/commands:
 *   get:
 *     summary: Get available voice commands
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: List of voice commands
 */
router.get('/commands', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const commands = service.getCommands();
    
    res.json({
      success: true,
      commands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/commands/detect:
 *   post:
 *     summary: Detect if text contains wake word or command
 *     tags: [Voice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detection result
 */
router.post('/commands/detect', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }
    
    const service = await ensureVoiceService(req);
    const wakeWord = service.detectWakeWord(text);
    const command = service.matchCommand(text);
    
    res.json({
      success: true,
      wakeWordDetected: !!wakeWord,
      wakeWord: wakeWord?.commandPhrase,
      commandDetected: !!command,
      command: command ? {
        commandId: command.commandId,
        commandPhrase: command.commandPhrase,
        commandType: command.commandType,
        actionType: command.actionType,
      } : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/sessions:
 *   post:
 *     summary: Start a new voice session
 *     tags: [Voice]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               campaignId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session created
 */
router.post('/sessions', async (req, res) => {
  try {
    const { userId, campaignId } = req.body;
    const service = await ensureVoiceService(req);
    const session = await service.startSession(userId, campaignId);
    
    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/sessions/{sessionId}:
 *   get:
 *     summary: Get session details
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const stats = await service.getSessionStats(req.params.sessionId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      session: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/sessions/{sessionId}/end:
 *   post:
 *     summary: End a voice session
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    await service.endSession(req.params.sessionId);
    
    res.json({
      success: true,
      message: 'Session ended',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/sessions/{sessionId}/messages:
 *   post:
 *     summary: Record a voice message
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direction:
 *                 type: string
 *                 enum: [input, output]
 *               messageType:
 *                 type: string
 *                 enum: [voice, text, wake_word, command, system]
 *               transcript:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               audioDurationMs:
 *                 type: number
 *               confidenceScore:
 *                 type: number
 *     responses:
 *       200:
 *         description: Message recorded
 */
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { direction, messageType, transcript, audioUrl, audioDurationMs, confidenceScore } = req.body;
    
    if (!direction || !messageType) {
      return res.status(400).json({
        success: false,
        error: 'direction and messageType are required',
      });
    }
    
    const service = await ensureVoiceService(req);
    const message = await service.recordMessage(
      req.params.sessionId,
      direction,
      messageType,
      { transcript, audioUrl, audioDurationMs, confidenceScore }
    );
    
    res.json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/workflows:
 *   get:
 *     summary: Get available voice workflows
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: List of workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const workflows = service.getWorkflows();
    
    res.json({
      success: true,
      workflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/workflows/{workflowId}:
 *   get:
 *     summary: Get a specific workflow
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow details
 */
router.get('/workflows/:workflowId', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const workflow = service.getWorkflow(req.params.workflowId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/workflows/{workflowId}/execute:
 *   post:
 *     summary: Execute a voice workflow
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               inputData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Workflow execution result
 */
router.post('/workflows/:workflowId/execute', async (req, res) => {
  try {
    const { sessionId, inputData } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required',
      });
    }
    
    const service = await ensureVoiceService(req);
    const result = await service.executeWorkflow(req.params.workflowId, sessionId, inputData || {});
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/stats:
 *   get:
 *     summary: Get voice service statistics
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: Service statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const service = await ensureVoiceService(req);
    const stats = await service.getServiceStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/speak:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Voice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               voiceId:
 *                 type: string
 *               speed:
 *                 type: number
 *               pitch:
 *                 type: number
 *     responses:
 *       200:
 *         description: TTS result (returns metadata, actual speech synthesis handled by client)
 */
router.post('/speak', async (req, res) => {
  try {
    const { text, voiceId, speed, pitch } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }
    
    const service = await ensureVoiceService(req);
    const config = service.getConfig();
    const voice = voiceId ? service.getVoice(voiceId) : service.getDefaultVoice();
    
    res.json({
      success: true,
      text,
      voice: voice || { voiceId: 'default', name: 'Default Voice' },
      settings: {
        speed: speed || config?.ttsSpeed || 1.0,
        pitch: pitch || config?.ttsPitch || 1.0,
        volume: config?.ttsVolume || 1.0,
      },
      // The actual TTS is handled by the Web Speech API in the browser
      useNativeTTS: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/voice/transcribe:
 *   post:
 *     summary: Placeholder for server-side transcription (currently client-handled)
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: Transcription handled by client
 */
router.post('/transcribe', async (req, res) => {
  // Note: In the current implementation, transcription is handled client-side
  // using the Web Speech API. This endpoint is a placeholder for future
  // server-side transcription using Whisper or similar services.
  res.json({
    success: true,
    message: 'Transcription is currently handled client-side using Web Speech API',
    supportedMethods: ['Web Speech API', 'MediaRecorder + Server Whisper (future)'],
  });
});

export default router;

/**
 * WebSocket handler for bidirectional voice streaming
 * To be called from the main server's socket.io setup
 */
export function setupVoiceWebSocket(io, db) {
  const voiceNamespace = io.of('/voice');
  
  voiceNamespace.on('connection', async (socket) => {
    console.log('🎤 Voice client connected:', socket.id);
    
    const service = getVoiceStreamingService(db);
    await service.initialize();
    
    let currentSession = null;
    
    // Start a voice session
    socket.on('session:start', async (data) => {
      try {
        const { userId, campaignId } = data || {};
        currentSession = await service.startSession(userId, campaignId);
        socket.emit('session:started', currentSession);
        console.log(`🎙️ Voice session started for socket ${socket.id}: ${currentSession.sessionId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // End the current session
    socket.on('session:end', async () => {
      if (currentSession) {
        await service.endSession(currentSession.sessionId);
        socket.emit('session:ended', { sessionId: currentSession.sessionId });
        currentSession = null;
      }
    });
    
    // Wake word detected
    socket.on('wake_word:detected', async (data) => {
      if (!currentSession) {
        currentSession = await service.startSession();
        socket.emit('session:started', currentSession);
      }
      
      await service.recordMessage(
        currentSession.sessionId,
        'input',
        'wake_word',
        { transcript: data.wakeWord || 'hello deepseek' }
      );
      
      socket.emit('listening:started', { 
        sessionId: currentSession.sessionId,
        wakeWord: data.wakeWord,
      });
    });
    
    // Voice input received
    socket.on('voice:input', async (data) => {
      if (!currentSession) return;
      
      const { transcript, confidenceScore, audioDurationMs } = data;
      
      // Record the input message
      await service.recordMessage(
        currentSession.sessionId,
        'input',
        'voice',
        { transcript, confidenceScore, audioDurationMs }
      );
      
      // Check for commands
      const command = service.matchCommand(transcript);
      if (command) {
        socket.emit('command:detected', {
          command: command.commandPhrase,
          type: command.commandType,
          action: command.actionType,
        });
      }
      
      // Process with DeepSeek
      try {
        const workflow = service.getWorkflow('voice-to-deepseek-response');
        if (workflow) {
          const result = await service.executeWorkflow(
            'voice-to-deepseek-response',
            currentSession.sessionId,
            { transcript }
          );
          
          socket.emit('voice:response', {
            sessionId: currentSession.sessionId,
            response: result.results.response,
            voice: result.results.voice,
            voiceId: result.results.voiceId,
          });
          
          // Record the output message
          await service.recordMessage(
            currentSession.sessionId,
            'output',
            'voice',
            { transcript: result.results.response }
          );
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Audio stream chunk (for future WebRTC/streaming implementation)
    socket.on('audio:chunk', async (chunk) => {
      // Handle incoming audio chunk for server-side processing
      // This would be used with Whisper or similar STT service
      socket.emit('audio:received', { bytes: chunk.length });
    });
    
    // Client disconnected
    socket.on('disconnect', async () => {
      console.log('🔌 Voice client disconnected:', socket.id);
      if (currentSession) {
        await service.endSession(currentSession.sessionId);
      }
    });
  });
  
  return voiceNamespace;
}
