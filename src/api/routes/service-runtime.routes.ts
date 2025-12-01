import express, { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import ServiceRuntimeLoggingService from '../../services/service-runtime-logging.service';

function parseLimit(value: unknown, fallback = 50): number {
  if (Array.isArray(value)) {
    return parseLimit(value[0], fallback);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : Math.max(parsed, 1);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(Math.floor(value), 1);
  }

  return fallback;
}

export function createServiceRuntimeRoutes(db: Pool): Router {
  const router = express.Router();
  const runtimeService = new ServiceRuntimeLoggingService(db);

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Service runtime routes operational' });
  });

  // ============================================================================
  // Runtime Profiles
  // ============================================================================
  router.post('/profiles', async (req: Request, res: Response) => {
    try {
      const { serviceId, profileKey, name } = req.body;

      if (!serviceId || !profileKey || !name) {
        return res.status(400).json({
          error: 'Missing required fields: serviceId, profileKey, name',
        });
      }

      const profile = await runtimeService.createRuntimeProfile({
        serviceId,
        profileKey,
        name,
        description: req.body.description,
        environment: req.body.environment,
        baseUrl: req.body.baseUrl,
        authStrategy: req.body.authStrategy,
        defaultModel: req.body.defaultModel,
        configuration: req.body.configuration,
        limits: req.body.limits,
        isDefault: req.body.isDefault,
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error('Failed to create runtime profile:', error);
      res.status(500).json({ error: 'Failed to create runtime profile' });
    }
  });

  router.get('/profiles', async (req: Request, res: Response) => {
    try {
      const profiles = await runtimeService.listRuntimeProfiles({
        serviceId: typeof req.query.serviceId === 'string' ? req.query.serviceId : undefined,
        environment: typeof req.query.environment === 'string' ? req.query.environment : undefined,
        limit: parseLimit(req.query.limit),
      });

      res.json(profiles);
    } catch (error) {
      console.error('Failed to list runtime profiles:', error);
      res.status(500).json({ error: 'Failed to list runtime profiles' });
    }
  });

  router.get('/profiles/:profileId', async (req: Request, res: Response) => {
    try {
      const profile = await runtimeService.getRuntimeProfile(req.params.profileId);
      if (!profile) {
        return res.status(404).json({ error: 'Runtime profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Failed to fetch runtime profile:', error);
      res.status(500).json({ error: 'Failed to fetch runtime profile' });
    }
  });

  router.patch('/profiles/:profileId', async (req: Request, res: Response) => {
    try {
      const profile = await runtimeService.updateRuntimeProfile(req.params.profileId, {
        name: req.body.name,
        description: req.body.description,
        environment: req.body.environment,
        baseUrl: req.body.baseUrl,
        authStrategy: req.body.authStrategy,
        defaultModel: req.body.defaultModel,
        configuration: req.body.configuration,
        limits: req.body.limits,
        isDefault: req.body.isDefault,
      });

      if (!profile) {
        return res.status(404).json({ error: 'Runtime profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Failed to update runtime profile:', error);
      res.status(500).json({ error: 'Failed to update runtime profile' });
    }
  });

  // ============================================================================
  // Stream Channels
  // ============================================================================
  router.get('/services/:serviceId/channels', async (req: Request, res: Response) => {
    try {
      const channels = await runtimeService.listStreamChannels(req.params.serviceId);
      res.json(channels);
    } catch (error) {
      console.error('Failed to list service channels:', error);
      res.status(500).json({ error: 'Failed to list service channels' });
    }
  });

  router.post('/services/:serviceId/channels', async (req: Request, res: Response) => {
    try {
      const { name, channelType } = req.body;
      if (!name || !channelType) {
        return res.status(400).json({ error: 'Missing required fields: name, channelType' });
      }

      const channel = await runtimeService.createStreamChannel({
        serviceId: req.params.serviceId,
        name,
        description: req.body.description,
        channelType,
        schemaDefinition: req.body.schemaDefinition,
        retentionPolicy: req.body.retentionPolicy,
        isActive: req.body.isActive,
      });

      res.status(201).json(channel);
    } catch (error) {
      console.error('Failed to create service channel:', error);
      res.status(500).json({ error: 'Failed to create service channel' });
    }
  });

  router.patch('/services/:serviceId/channels/:channelId', async (req: Request, res: Response) => {
    try {
      const channel = await runtimeService.updateStreamChannel(req.params.channelId, {
        name: req.body.name,
        description: req.body.description,
        channelType: req.body.channelType,
        schemaDefinition: req.body.schemaDefinition,
        retentionPolicy: req.body.retentionPolicy,
        isActive: req.body.isActive,
      });

      if (!channel) {
        return res.status(404).json({ error: 'Service channel not found' });
      }

      res.json(channel);
    } catch (error) {
      console.error('Failed to update service channel:', error);
      res.status(500).json({ error: 'Failed to update service channel' });
    }
  });

  // ============================================================================
  // Service Sessions
  // ============================================================================
  router.post('/sessions', async (req: Request, res: Response) => {
    try {
      const { serviceId } = req.body;
      if (!serviceId) {
        return res.status(400).json({ error: 'Missing required field: serviceId' });
      }

      const session = await runtimeService.createServiceSession({
        serviceId,
        profileId: req.body.profileId,
        sessionLabel: req.body.sessionLabel,
        status: req.body.status,
        startedAt: req.body.startedAt,
        runtimeMetadata: req.body.runtimeMetadata,
        healthSnapshot: req.body.healthSnapshot,
      });

      res.status(201).json(session);
    } catch (error) {
      console.error('Failed to create service session:', error);
      res.status(500).json({ error: 'Failed to create service session' });
    }
  });

  router.get('/sessions', async (req: Request, res: Response) => {
    try {
      const sessions = await runtimeService.listServiceSessions({
        serviceId: typeof req.query.serviceId === 'string' ? req.query.serviceId : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        limit: parseLimit(req.query.limit),
      });

      res.json(sessions);
    } catch (error) {
      console.error('Failed to list service sessions:', error);
      res.status(500).json({ error: 'Failed to list service sessions' });
    }
  });

  router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const includeParam = req.query.include;
      const includes = Array.isArray(includeParam)
        ? includeParam.flatMap(item => item.split(','))
        : typeof includeParam === 'string'
          ? includeParam.split(',')
          : [];

      const detail = await runtimeService.getServiceSessionDetails(req.params.sessionId, {
        includeEvents: includes.includes('events'),
        includeStreams: includes.includes('streams'),
        includeMetrics: includes.includes('metrics'),
        eventLimit: parseLimit(req.query.eventLimit, 100),
        streamLimit: parseLimit(req.query.streamLimit, 100),
        metricLimit: parseLimit(req.query.metricLimit, 100),
      });

      if (!detail) {
        return res.status(404).json({ error: 'Service session not found' });
      }

      res.json(detail);
    } catch (error) {
      console.error('Failed to fetch service session:', error);
      res.status(500).json({ error: 'Failed to fetch service session' });
    }
  });

  router.patch('/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const session = await runtimeService.updateServiceSession(req.params.sessionId, {
        status: req.body.status,
        endedAt: req.body.endedAt,
        runtimeMetadata: req.body.runtimeMetadata,
        healthSnapshot: req.body.healthSnapshot,
        errorSummary: req.body.errorSummary,
      });

      if (!session) {
        return res.status(404).json({ error: 'Service session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Failed to update service session:', error);
      res.status(500).json({ error: 'Failed to update service session' });
    }
  });

  router.post('/sessions/:sessionId/events', async (req: Request, res: Response) => {
    try {
      const { eventType } = req.body;
      if (!eventType) {
        return res.status(400).json({ error: 'Missing required field: eventType' });
      }

      const event = await runtimeService.logServiceSessionEvent({
        serviceSessionId: req.params.sessionId,
        eventType,
        eventSource: req.body.eventSource,
        severity: req.body.severity,
        eventPayload: req.body.eventPayload,
        occurredAt: req.body.occurredAt,
        metadata: req.body.metadata,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error('Failed to log service session event:', error);
      res.status(500).json({ error: 'Failed to log service session event' });
    }
  });

  router.post('/sessions/:sessionId/streams', async (req: Request, res: Response) => {
    try {
      const { channelId } = req.body;
      if (!channelId) {
        return res.status(400).json({ error: 'Missing required field: channelId' });
      }

      const stream = await runtimeService.recordServiceSessionStream({
        serviceSessionId: req.params.sessionId,
        channelId,
        sequenceNumber: req.body.sequenceNumber,
        payload: req.body.payload,
        status: req.body.status,
        capturedAt: req.body.capturedAt,
        metadata: req.body.metadata,
      });

      res.status(201).json(stream);
    } catch (error) {
      console.error('Failed to record service session stream:', error);
      res.status(500).json({ error: 'Failed to record service session stream' });
    }
  });

  router.post('/sessions/:sessionId/metrics', async (req: Request, res: Response) => {
    try {
      const { metricName, metricValue } = req.body;
      if (!metricName || metricValue === undefined || metricValue === null) {
        return res.status(400).json({ error: 'Missing required fields: metricName, metricValue' });
      }

      const metric = await runtimeService.recordServiceSessionMetric({
        serviceSessionId: req.params.sessionId,
        metricName,
        metricValue: Number(metricValue),
        unit: req.body.unit,
        recordedAt: req.body.recordedAt,
        metadata: req.body.metadata,
      });

      res.status(201).json(metric);
    } catch (error) {
      console.error('Failed to record service session metric:', error);
      res.status(500).json({ error: 'Failed to record service session metric' });
    }
  });

  return router;
}

export default createServiceRuntimeRoutes;
