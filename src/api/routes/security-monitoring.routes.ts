/**
 * Security Monitoring API Routes
 * RESTful API endpoints for security layers, monitoring, and pattern tracking
 */

import express, { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { SecurityMonitoringService } from '../../services/security-monitoring.service';
import { validateRequest } from '../../middleware/validation.middleware';

export function createSecurityMonitoringRoutes(db: Pool): Router {
  const router = express.Router();
  const service = new SecurityMonitoringService(db);

  // ============================================================================
  // SECURITY LAYERS
  // ============================================================================

  // Create security layer
  router.post('/layers', async (req: Request, res: Response) => {
    try {
      const layer = await service.createSecurityLayer(req.body);
      res.status(201).json(layer);
    } catch (error: any) {
      console.error('Error creating security layer:', error);
      res.status(500).json({ error: 'Failed to create security layer', message: error.message });
    }
  });

  // Get security layer
  router.get('/layers/:layer_id', async (req: Request, res: Response) => {
    try {
      const layer = await service.getSecurityLayer(req.params.layer_id);
      res.json(layer);
    } catch (error: any) {
      console.error('Error getting security layer:', error);
      res.status(404).json({ error: 'Security layer not found', message: error.message });
    }
  });

  // ============================================================================
  // INSTANCE SECURITY
  // ============================================================================

  // Attach security layer to instance
  router.post('/instances/:instance_id/attach-layer', async (req: Request, res: Response) => {
    try {
      const { layer_id, prompt_context } = req.body;
      const profile = await service.attachSecurityLayerToInstance(
        req.params.instance_id,
        layer_id,
        prompt_context
      );
      res.status(201).json(profile);
    } catch (error: any) {
      console.error('Error attaching security layer:', error);
      res.status(500).json({ error: 'Failed to attach security layer', message: error.message });
    }
  });

  // Get instance security profile
  router.get('/instances/:instance_id/profile', async (req: Request, res: Response) => {
    try {
      const profile = await service.getInstanceSecurityProfile(req.params.instance_id);
      if (!profile) {
        return res.status(404).json({ error: 'Security profile not found' });
      }
      res.json(profile);
    } catch (error: any) {
      console.error('Error getting security profile:', error);
      res.status(500).json({ error: 'Failed to get security profile', message: error.message });
    }
  });

  // Run security checks on instance
  router.post('/instances/:instance_id/check', async (req: Request, res: Response) => {
    try {
      const checks = await service.runSecurityChecks(req.params.instance_id);
      res.json({ checks, total: checks.length });
    } catch (error: any) {
      console.error('Error running security checks:', error);
      res.status(500).json({ error: 'Failed to run security checks', message: error.message });
    }
  });

  // Get security checks for instance
  router.get('/instances/:instance_id/checks', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const checks = await service.getSecurityChecks(req.params.instance_id, limit);
      res.json({ checks, total: checks.length });
    } catch (error: any) {
      console.error('Error getting security checks:', error);
      res.status(500).json({ error: 'Failed to get security checks', message: error.message });
    }
  });

  // Log instance activity
  router.post('/instances/:instance_id/log-activity', async (req: Request, res: Response) => {
    try {
      await service.logInstanceActivity(req.params.instance_id, req.body);
      res.status(201).json({ success: true });
    } catch (error: any) {
      console.error('Error logging activity:', error);
      res.status(500).json({ error: 'Failed to log activity', message: error.message });
    }
  });

  // ============================================================================
  // WORKFLOW PATTERNS
  // ============================================================================

  // Track workflow pattern
  router.post('/patterns', async (req: Request, res: Response) => {
    try {
      const { workflow_id, pattern_type, execution_data } = req.body;
      const pattern = await service.trackWorkflowPattern(
        workflow_id,
        pattern_type,
        execution_data
      );
      res.status(201).json(pattern);
    } catch (error: any) {
      console.error('Error tracking pattern:', error);
      res.status(500).json({ error: 'Failed to track pattern', message: error.message });
    }
  });

  // Get successful patterns
  router.get('/patterns/successful', async (req: Request, res: Response) => {
    try {
      const minSuccessRate = parseInt(req.query.min_success_rate as string) || 80;
      const patterns = await service.getSuccessfulPatterns(minSuccessRate);
      res.json({ patterns, total: patterns.length });
    } catch (error: any) {
      console.error('Error getting successful patterns:', error);
      res.status(500).json({ error: 'Failed to get patterns', message: error.message });
    }
  });

  return router;
}
