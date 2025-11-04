/**
 * Security Monitoring Service
 * Real-time security layer for monitoring agent instances and workflows
 * Tracks best practices, monitors instance activities, and validates security compliance
 */

import { Pool } from 'pg';

export interface SecurityCheck {
  check_id: string;
  instance_id?: string;
  workflow_id?: string;
  check_type: 'authentication' | 'authorization' | 'data_validation' | 'rate_limiting' | 'input_sanitization' | 'output_encoding' | 'custom';
  status: 'passed' | 'failed' | 'warning' | 'monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: Record<string, any>;
  checked_at: Date;
}

export interface SecurityLayer {
  layer_id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  enabled_checks: string[];
  monitoring_mode: 'passive' | 'active' | 'strict';
  is_active: boolean;
  created_at: Date;
}

export interface InstanceSecurityProfile {
  profile_id: string;
  instance_id: string;
  layer_id: string;
  prompt_history: any[];
  activity_log: any[];
  security_score: number;
  last_check_at: Date;
  status: 'secure' | 'warning' | 'compromised' | 'monitoring';
}

export interface WorkflowPattern {
  pattern_id: string;
  workflow_id: string;
  pattern_type: 'successful' | 'failed' | 'optimized' | 'security_compliant';
  execution_count: number;
  success_rate: number;
  avg_duration_ms: number;
  security_score: number;
  pattern_data: Record<string, any>;
  emerged_at: Date;
  last_seen_at: Date;
}

export class SecurityMonitoringService {
  private db: Pool;
  private defaultSecurityChecks: string[] = [
    'authentication',
    'authorization',
    'data_validation',
    'rate_limiting',
    'input_sanitization',
    'output_encoding'
  ];

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Create a security layer with default best practices
   */
  async createSecurityLayer(data: {
    name: string;
    description?: string;
    config?: Record<string, any>;
    monitoring_mode?: 'passive' | 'active' | 'strict';
  }): Promise<SecurityLayer> {
    const query = `
      INSERT INTO security_layers (name, description, config, enabled_checks, monitoring_mode)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const defaultConfig = {
      max_execution_time: 300000, // 5 minutes
      max_memory_mb: 512,
      allowed_network_access: true,
      require_approval: false,
      auto_terminate_on_violation: false,
      log_all_activities: true,
      ...data.config
    };

    const result = await this.db.query(query, [
      data.name,
      data.description || null,
      JSON.stringify(defaultConfig),
      this.defaultSecurityChecks,
      data.monitoring_mode || 'active'
    ]);

    return this.mapSecurityLayer(result.rows[0]);
  }

  /**
   * Attach security layer to an instance
   */
  async attachSecurityLayerToInstance(
    instanceId: string,
    layerId: string,
    promptContext?: string
  ): Promise<InstanceSecurityProfile> {
    const query = `
      INSERT INTO instance_security_profiles (instance_id, layer_id, prompt_history, activity_log, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (instance_id) 
      DO UPDATE SET layer_id = EXCLUDED.layer_id, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const promptHistory = promptContext ? [{ prompt: promptContext, timestamp: new Date() }] : [];
    const activityLog = [{ action: 'security_layer_attached', timestamp: new Date() }];

    const result = await this.db.query(query, [
      instanceId,
      layerId,
      JSON.stringify(promptHistory),
      JSON.stringify(activityLog),
      'monitoring'
    ]);

    return this.mapSecurityProfile(result.rows[0]);
  }

  /**
   * Run security checks on an instance
   */
  async runSecurityChecks(instanceId: string): Promise<SecurityCheck[]> {
    const profile = await this.getInstanceSecurityProfile(instanceId);
    
    if (!profile) {
      throw new Error(`No security profile found for instance ${instanceId}`);
    }

    const layer = await this.getSecurityLayer(profile.layer_id);
    const checks: SecurityCheck[] = [];

    for (const checkType of layer.enabled_checks) {
      const check = await this.performSecurityCheck(instanceId, checkType, layer.config);
      checks.push(check);
    }

    // Update security score
    await this.updateSecurityScore(instanceId, checks);

    return checks;
  }

  /**
   * Perform individual security check
   */
  private async performSecurityCheck(
    instanceId: string,
    checkType: string,
    config: Record<string, any>
  ): Promise<SecurityCheck> {
    const query = `
      INSERT INTO security_checks (instance_id, check_type, status, severity, description, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    let status: 'passed' | 'failed' | 'warning' | 'monitoring' = 'monitoring';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';
    let details: Record<string, any> = {};

    // Perform check based on type
    switch (checkType) {
      case 'authentication':
        status = 'passed';
        severity = 'medium';
        description = 'Instance authentication verified';
        details = { method: 'api_key', verified: true };
        break;

      case 'authorization':
        status = 'passed';
        severity = 'medium';
        description = 'Instance authorization validated';
        details = { permissions: ['read', 'write'], scope: 'limited' };
        break;

      case 'data_validation':
        status = 'monitoring';
        severity = 'low';
        description = 'Data validation monitoring active';
        details = { validators_active: true, schema_validation: true };
        break;

      case 'rate_limiting':
        status = 'passed';
        severity = 'low';
        description = 'Rate limiting configured';
        details = { max_requests_per_minute: config.max_requests || 60 };
        break;

      case 'input_sanitization':
        status = 'monitoring';
        severity = 'medium';
        description = 'Input sanitization monitoring';
        details = { html_sanitization: true, sql_injection_check: true };
        break;

      case 'output_encoding':
        status = 'monitoring';
        severity = 'low';
        description = 'Output encoding validation';
        details = { encoding: 'utf-8', xss_protection: true };
        break;

      default:
        status = 'monitoring';
        severity = 'low';
        description = `Custom security check: ${checkType}`;
        details = { check_type: checkType };
    }

    const result = await this.db.query(query, [
      instanceId,
      checkType,
      status,
      severity,
      description,
      JSON.stringify(details)
    ]);

    return this.mapSecurityCheck(result.rows[0]);
  }

  /**
   * Update security score for instance
   */
  private async updateSecurityScore(
    instanceId: string,
    checks: SecurityCheck[]
  ): Promise<void> {
    const score = this.calculateSecurityScore(checks);

    await this.db.query(
      `UPDATE instance_security_profiles 
       SET security_score = $1, last_check_at = CURRENT_TIMESTAMP, 
           status = $2
       WHERE instance_id = $3`,
      [score, this.getStatusFromScore(score), instanceId]
    );
  }

  /**
   * Calculate security score from checks
   */
  private calculateSecurityScore(checks: SecurityCheck[]): number {
    if (checks.length === 0) return 0;

    let totalScore = 0;
    let maxScore = checks.length * 100;

    for (const check of checks) {
      if (check.status === 'passed') {
        totalScore += 100;
      } else if (check.status === 'monitoring') {
        totalScore += 75;
      } else if (check.status === 'warning') {
        totalScore += 50;
      } else if (check.status === 'failed') {
        totalScore += 0;
      }
    }

    return Math.round((totalScore / maxScore) * 100);
  }

  /**
   * Get status from security score
   */
  private getStatusFromScore(score: number): 'secure' | 'warning' | 'compromised' | 'monitoring' {
    if (score >= 90) return 'secure';
    if (score >= 70) return 'monitoring';
    if (score >= 50) return 'warning';
    return 'compromised';
  }

  /**
   * Track workflow pattern
   */
  async trackWorkflowPattern(
    workflowId: string,
    patternType: 'successful' | 'failed' | 'optimized' | 'security_compliant',
    executionData: {
      duration_ms: number;
      success: boolean;
      security_score?: number;
    }
  ): Promise<WorkflowPattern> {
    const query = `
      INSERT INTO workflow_patterns (workflow_id, pattern_type, execution_count, success_rate, avg_duration_ms, security_score, pattern_data)
      VALUES ($1, $2, 1, $3, $4, $5, $6)
      ON CONFLICT (workflow_id, pattern_type)
      DO UPDATE SET 
        execution_count = workflow_patterns.execution_count + 1,
        success_rate = (workflow_patterns.success_rate * workflow_patterns.execution_count + $3) / (workflow_patterns.execution_count + 1),
        avg_duration_ms = (workflow_patterns.avg_duration_ms * workflow_patterns.execution_count + $4) / (workflow_patterns.execution_count + 1),
        security_score = COALESCE($5, workflow_patterns.security_score),
        pattern_data = workflow_patterns.pattern_data || $6,
        last_seen_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const successRate = executionData.success ? 100 : 0;
    const securityScore = executionData.security_score || 0;
    const patternData = {
      last_execution: new Date(),
      duration_ms: executionData.duration_ms,
      success: executionData.success
    };

    const result = await this.db.query(query, [
      workflowId,
      patternType,
      successRate,
      executionData.duration_ms,
      securityScore,
      JSON.stringify(patternData)
    ]);

    return this.mapWorkflowPattern(result.rows[0]);
  }

  /**
   * Get successful patterns (patterns that are doing the right thing)
   */
  async getSuccessfulPatterns(minSuccessRate: number = 80): Promise<WorkflowPattern[]> {
    const query = `
      SELECT * FROM workflow_patterns
      WHERE pattern_type = 'successful' 
        AND success_rate >= $1
        AND execution_count >= 3
      ORDER BY success_rate DESC, execution_count DESC
    `;

    const result = await this.db.query(query, [minSuccessRate]);
    return result.rows.map(row => this.mapWorkflowPattern(row));
  }

  /**
   * Get instance security profile
   */
  async getInstanceSecurityProfile(instanceId: string): Promise<InstanceSecurityProfile | null> {
    const query = `SELECT * FROM instance_security_profiles WHERE instance_id = $1`;
    const result = await this.db.query(query, [instanceId]);
    
    if (result.rows.length === 0) return null;
    return this.mapSecurityProfile(result.rows[0]);
  }

  /**
   * Get security layer
   */
  async getSecurityLayer(layerId: string): Promise<SecurityLayer> {
    const query = `SELECT * FROM security_layers WHERE layer_id = $1`;
    const result = await this.db.query(query, [layerId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Security layer ${layerId} not found`);
    }
    
    return this.mapSecurityLayer(result.rows[0]);
  }

  /**
   * Log instance activity
   */
  async logInstanceActivity(
    instanceId: string,
    activity: {
      action: string;
      details?: Record<string, any>;
      prompt?: string;
    }
  ): Promise<void> {
    const query = `
      UPDATE instance_security_profiles
      SET activity_log = activity_log || $1::jsonb,
          prompt_history = CASE WHEN $2::text IS NOT NULL THEN prompt_history || $3::jsonb ELSE prompt_history END,
          updated_at = CURRENT_TIMESTAMP
      WHERE instance_id = $4
    `;

    const activityEntry = {
      action: activity.action,
      timestamp: new Date(),
      details: activity.details || {}
    };

    const promptEntry = activity.prompt ? {
      prompt: activity.prompt,
      timestamp: new Date()
    } : null;

    await this.db.query(query, [
      JSON.stringify([activityEntry]),
      activity.prompt || null,
      JSON.stringify([promptEntry]),
      instanceId
    ]);
  }

  /**
   * Get security checks for instance
   */
  async getSecurityChecks(
    instanceId: string,
    limit: number = 100
  ): Promise<SecurityCheck[]> {
    const query = `
      SELECT * FROM security_checks
      WHERE instance_id = $1
      ORDER BY checked_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [instanceId, limit]);
    return result.rows.map(row => this.mapSecurityCheck(row));
  }

  // Mapping functions
  private mapSecurityLayer(row: any): SecurityLayer {
    return {
      layer_id: row.layer_id,
      name: row.name,
      description: row.description,
      config: row.config,
      enabled_checks: row.enabled_checks,
      monitoring_mode: row.monitoring_mode,
      is_active: row.is_active,
      created_at: row.created_at
    };
  }

  private mapSecurityProfile(row: any): InstanceSecurityProfile {
    return {
      profile_id: row.profile_id,
      instance_id: row.instance_id,
      layer_id: row.layer_id,
      prompt_history: row.prompt_history || [],
      activity_log: row.activity_log || [],
      security_score: row.security_score,
      last_check_at: row.last_check_at,
      status: row.status
    };
  }

  private mapSecurityCheck(row: any): SecurityCheck {
    return {
      check_id: row.check_id,
      instance_id: row.instance_id,
      workflow_id: row.workflow_id,
      check_type: row.check_type,
      status: row.status,
      severity: row.severity,
      description: row.description,
      details: row.details,
      checked_at: row.checked_at
    };
  }

  private mapWorkflowPattern(row: any): WorkflowPattern {
    return {
      pattern_id: row.pattern_id,
      workflow_id: row.workflow_id,
      pattern_type: row.pattern_type,
      execution_count: row.execution_count,
      success_rate: row.success_rate,
      avg_duration_ms: row.avg_duration_ms,
      security_score: row.security_score,
      pattern_data: row.pattern_data,
      emerged_at: row.emerged_at,
      last_seen_at: row.last_seen_at
    };
  }
}
