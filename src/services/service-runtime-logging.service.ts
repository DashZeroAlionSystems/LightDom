import { Pool, PoolClient } from 'pg';
import {
  CreateServiceRuntimeProfileInput,
  CreateServiceSessionInput,
  CreateServiceStreamChannelInput,
  JsonValue,
  ListRuntimeProfileFilters,
  ListServiceSessionFilters,
  LogServiceSessionEventInput,
  RecordServiceSessionMetricInput,
  RecordServiceSessionStreamInput,
  ServiceRuntimeProfile,
  ServiceSessionDetail,
  ServiceSessionEventRecord,
  ServiceSessionMetricRecord,
  ServiceSessionRecord,
  ServiceSessionStreamRecord,
  ServiceStreamChannel,
  UpdateServiceRuntimeProfileInput,
  UpdateServiceSessionInput,
  UpdateServiceStreamChannelInput,
} from '../types/service-runtime';

/**
 * ServiceRuntimeLoggingService
 *
 * Persists runtime session data for backend services including:
 * - Runtime profiles (per environment/model configuration)
 * - Service sessions (start/stop + metadata)
 * - Session events, stream payloads, and metrics
 */
export class ServiceRuntimeLoggingService {
  constructor(private readonly db: Pool) {}

  /**
   * Create a new runtime profile for a service.
   */
  async createRuntimeProfile(
    input: CreateServiceRuntimeProfileInput
  ): Promise<ServiceRuntimeProfile> {
    return this.runInTransaction(async client => {
      if (input.isDefault) {
        await client.query(
          'UPDATE service_runtime_profiles SET is_default = false WHERE service_id = $1',
          [input.serviceId]
        );
      }

      const result = await client.query(
        `INSERT INTO service_runtime_profiles (
           service_id, profile_key, name, description, environment, base_url,
           auth_strategy, default_model, configuration, limits, is_default
         ) VALUES ($1, $2, $3, $4, COALESCE($5, 'development'), $6, $7, $8, $9::jsonb, $10::jsonb, COALESCE($11, false))
         RETURNING *`,
        [
          input.serviceId,
          input.profileKey,
          input.name,
          input.description ?? null,
          input.environment ?? 'development',
          input.baseUrl ?? null,
          input.authStrategy ?? null,
          input.defaultModel ?? null,
          this.toJsonString(input.configuration),
          this.toJsonString(input.limits),
          input.isDefault ?? false,
        ]
      );

      return this.mapProfile(result.rows[0]);
    });
  }

  /**
   * Update a runtime profile.
   */
  async updateRuntimeProfile(
    profileId: string,
    patch: UpdateServiceRuntimeProfileInput
  ): Promise<ServiceRuntimeProfile | null> {
    return this.runInTransaction(async client => {
      if (patch.isDefault === true) {
        const { rows } = await client.query(
          'SELECT service_id FROM service_runtime_profiles WHERE profile_id = $1',
          [profileId]
        );

        if (rows[0]) {
          await client.query(
            'UPDATE service_runtime_profiles SET is_default = false WHERE service_id = $1',
            [rows[0].service_id]
          );
        }
      }

      const fields: string[] = [];
      const values: unknown[] = [];

      if (patch.name !== undefined) {
        fields.push(`name = $${fields.length + 1}`);
        values.push(patch.name);
      }

      if (patch.description !== undefined) {
        fields.push(`description = $${fields.length + 1}`);
        values.push(patch.description);
      }

      if (patch.environment !== undefined) {
        fields.push(`environment = $${fields.length + 1}`);
        values.push(patch.environment);
      }

      if (patch.baseUrl !== undefined) {
        fields.push(`base_url = $${fields.length + 1}`);
        values.push(patch.baseUrl);
      }

      if (patch.authStrategy !== undefined) {
        fields.push(`auth_strategy = $${fields.length + 1}`);
        values.push(patch.authStrategy);
      }

      if (patch.defaultModel !== undefined) {
        fields.push(`default_model = $${fields.length + 1}`);
        values.push(patch.defaultModel);
      }

      if (patch.configuration !== undefined) {
        fields.push(`configuration = $${fields.length + 1}::jsonb`);
        values.push(this.toJsonString(patch.configuration));
      }

      if (patch.limits !== undefined) {
        fields.push(`limits = $${fields.length + 1}::jsonb`);
        values.push(this.toJsonString(patch.limits));
      }

      if (patch.isDefault !== undefined) {
        fields.push(`is_default = $${fields.length + 1}`);
        values.push(patch.isDefault);
      }

      if (fields.length === 0) {
        const { rows } = await client.query(
          'SELECT * FROM service_runtime_profiles WHERE profile_id = $1',
          [profileId]
        );
        return rows[0] ? this.mapProfile(rows[0]) : null;
      }

      values.push(profileId);

      const result = await client.query(
        `UPDATE service_runtime_profiles
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE profile_id = $${values.length}
         RETURNING *`,
        values
      );

      return result.rows[0] ? this.mapProfile(result.rows[0]) : null;
    });
  }

  /**
   * Fetch a runtime profile by ID.
   */
  async getRuntimeProfile(profileId: string): Promise<ServiceRuntimeProfile | null> {
    const result = await this.db.query(
      'SELECT * FROM service_runtime_profiles WHERE profile_id = $1',
      [profileId]
    );

    return result.rows[0] ? this.mapProfile(result.rows[0]) : null;
  }

  /**
   * List runtime profiles with optional filtering.
   */
  async listRuntimeProfiles(
    filters: ListRuntimeProfileFilters = {}
  ): Promise<ServiceRuntimeProfile[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.serviceId) {
      conditions.push(`service_id = $${values.length + 1}`);
      values.push(filters.serviceId);
    }

    if (filters.environment) {
      conditions.push(`environment = $${values.length + 1}`);
      values.push(filters.environment);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;

    const result = await this.db.query(
      `SELECT * FROM service_runtime_profiles ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1}`,
      [...values, limit]
    );

    return result.rows.map(row => this.mapProfile(row));
  }

  /**
   * Create (or ensure) a service stream channel definition.
   */
  async createStreamChannel(input: CreateServiceStreamChannelInput): Promise<ServiceStreamChannel> {
    const result = await this.db.query(
      `INSERT INTO service_stream_channels (
         service_id, name, description, channel_type, schema_definition,
         retention_policy, is_active
       ) VALUES (
         $1, $2, $3, $4, $5::jsonb, $6::jsonb, COALESCE($7, true)
       )
       ON CONFLICT (service_id, name)
       DO UPDATE SET
         description = EXCLUDED.description,
         channel_type = EXCLUDED.channel_type,
         schema_definition = EXCLUDED.schema_definition,
         retention_policy = EXCLUDED.retention_policy,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        input.serviceId,
        input.name,
        input.description ?? null,
        input.channelType,
        this.toJsonString(input.schemaDefinition),
        this.toJsonString(input.retentionPolicy),
        input.isActive ?? true,
      ]
    );

    return this.mapChannel(result.rows[0]);
  }

  /**
   * Update a service stream channel.
   */
  async updateStreamChannel(
    channelId: string,
    patch: UpdateServiceStreamChannelInput
  ): Promise<ServiceStreamChannel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (patch.name !== undefined) {
      fields.push(`name = $${fields.length + 1}`);
      values.push(patch.name);
    }

    if (patch.description !== undefined) {
      fields.push(`description = $${fields.length + 1}`);
      values.push(patch.description);
    }

    if (patch.channelType !== undefined) {
      fields.push(`channel_type = $${fields.length + 1}`);
      values.push(patch.channelType);
    }

    if (patch.schemaDefinition !== undefined) {
      fields.push(`schema_definition = $${fields.length + 1}::jsonb`);
      values.push(this.toJsonString(patch.schemaDefinition));
    }

    if (patch.retentionPolicy !== undefined) {
      fields.push(`retention_policy = $${fields.length + 1}::jsonb`);
      values.push(this.toJsonString(patch.retentionPolicy));
    }

    if (patch.isActive !== undefined) {
      fields.push(`is_active = $${fields.length + 1}`);
      values.push(patch.isActive);
    }

    if (fields.length === 0) {
      const result = await this.db.query(
        'SELECT * FROM service_stream_channels WHERE channel_id = $1',
        [channelId]
      );
      return result.rows[0] ? this.mapChannel(result.rows[0]) : null;
    }

    values.push(channelId);

    const result = await this.db.query(
      `UPDATE service_stream_channels
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE channel_id = $${values.length}
       RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapChannel(result.rows[0]) : null;
  }

  /**
   * List channels defined for a service.
   */
  async listStreamChannels(serviceId: string): Promise<ServiceStreamChannel[]> {
    const result = await this.db.query(
      `SELECT * FROM service_stream_channels
       WHERE service_id = $1
       ORDER BY name ASC`,
      [serviceId]
    );

    return result.rows.map(row => this.mapChannel(row));
  }

  /**
   * Create a new service session record.
   */
  async createServiceSession(input: CreateServiceSessionInput): Promise<ServiceSessionRecord> {
    const result = await this.db.query(
      `INSERT INTO service_sessions (
         service_id, profile_id, session_label, status, started_at,
         runtime_metadata, health_snapshot
       ) VALUES (
         $1, $2, $3, COALESCE($4, 'initializing'),
         COALESCE($5, CURRENT_TIMESTAMP),
         $6::jsonb, $7::jsonb
       ) RETURNING *`,
      [
        input.serviceId,
        input.profileId ?? null,
        input.sessionLabel ?? null,
        input.status ?? 'initializing',
        input.startedAt ?? null,
        this.toJsonString(input.runtimeMetadata),
        this.toJsonString(input.healthSnapshot),
      ]
    );

    return this.mapSession(result.rows[0]);
  }

  /**
   * Update an existing service session.
   */
  async updateServiceSession(
    sessionId: string,
    patch: UpdateServiceSessionInput
  ): Promise<ServiceSessionRecord | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (patch.status !== undefined) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(patch.status);
    }

    if (patch.endedAt !== undefined) {
      fields.push(`ended_at = $${fields.length + 1}`);
      values.push(patch.endedAt);
    }

    if (patch.runtimeMetadata !== undefined) {
      fields.push(`runtime_metadata = $${fields.length + 1}::jsonb`);
      values.push(this.toJsonString(patch.runtimeMetadata));
    }

    if (patch.healthSnapshot !== undefined) {
      fields.push(`health_snapshot = $${fields.length + 1}::jsonb`);
      values.push(this.toJsonString(patch.healthSnapshot));
    }

    if (patch.errorSummary !== undefined) {
      fields.push(`error_summary = $${fields.length + 1}`);
      values.push(patch.errorSummary);
    }

    if (fields.length === 0) {
      const result = await this.db.query(
        `SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment
         FROM service_sessions ss
         LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id
         WHERE service_session_id = $1`,
        [sessionId]
      );
      return result.rows[0] ? this.mapSession(result.rows[0]) : null;
    }

    values.push(sessionId);

    const result = await this.db.query(
      `UPDATE service_sessions
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE service_session_id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      return null;
    }

    const enriched = await this.db.query(
      `SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment
       FROM service_sessions ss
       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id
       WHERE ss.service_session_id = $1`,
      [sessionId]
    );

    return enriched.rows[0] ? this.mapSession(enriched.rows[0]) : null;
  }

  /**
   * List service sessions with optional filters.
   */
  async listServiceSessions(
    filters: ListServiceSessionFilters = {}
  ): Promise<ServiceSessionRecord[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.serviceId) {
      conditions.push(`ss.service_id = $${values.length + 1}`);
      values.push(filters.serviceId);
    }

    if (filters.status) {
      conditions.push(`ss.status = $${values.length + 1}`);
      values.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;

    const result = await this.db.query(
      `SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment
       FROM service_sessions ss
       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id
       ${whereClause}
       ORDER BY ss.started_at DESC
       LIMIT $${values.length + 1}`,
      [...values, limit]
    );

    return result.rows.map(row => this.mapSession(row));
  }

  /**
   * Fetch session details including related records.
   */
  async getServiceSessionDetails(
    sessionId: string,
    options: {
      includeEvents?: boolean;
      includeStreams?: boolean;
      includeMetrics?: boolean;
      eventLimit?: number;
      streamLimit?: number;
      metricLimit?: number;
    } = {}
  ): Promise<ServiceSessionDetail | null> {
    const base = await this.db.query(
      `SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment
       FROM service_sessions ss
       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id
       WHERE ss.service_session_id = $1`,
      [sessionId]
    );

    if (!base.rows[0]) {
      return null;
    }

    const detail: ServiceSessionDetail = this.mapSession(base.rows[0]);

    if (options.includeEvents) {
      const eventResult = await this.db.query(
        `SELECT * FROM service_session_events
         WHERE service_session_id = $1
         ORDER BY occurred_at DESC
         LIMIT $2`,
        [sessionId, options.eventLimit && options.eventLimit > 0 ? options.eventLimit : 100]
      );
      detail.events = eventResult.rows.map(row => this.mapEvent(row));
    }

    if (options.includeStreams) {
      const streamResult = await this.db.query(
        `SELECT * FROM service_session_streams
         WHERE service_session_id = $1
         ORDER BY captured_at DESC
         LIMIT $2`,
        [sessionId, options.streamLimit && options.streamLimit > 0 ? options.streamLimit : 100]
      );
      detail.streams = streamResult.rows.map(row => this.mapStream(row));
    }

    if (options.includeMetrics) {
      const metricResult = await this.db.query(
        `SELECT * FROM service_session_metrics
         WHERE service_session_id = $1
         ORDER BY recorded_at DESC
         LIMIT $2`,
        [sessionId, options.metricLimit && options.metricLimit > 0 ? options.metricLimit : 100]
      );
      detail.metrics = metricResult.rows.map(row => this.mapMetric(row));
    }

    return detail;
  }

  /**
   * Log an event for a service session.
   */
  async logServiceSessionEvent(
    input: LogServiceSessionEventInput
  ): Promise<ServiceSessionEventRecord> {
    const result = await this.db.query(
      `INSERT INTO service_session_events (
         service_session_id, event_type, event_source, severity, event_payload,
         occurred_at, metadata
       ) VALUES (
         $1, $2, $3, COALESCE($4, 'info'), $5::jsonb,
         COALESCE($6, CURRENT_TIMESTAMP), $7::jsonb
       ) RETURNING *`,
      [
        input.serviceSessionId,
        input.eventType,
        input.eventSource ?? null,
        input.severity ?? 'info',
        this.toJsonString(input.eventPayload),
        input.occurredAt ?? null,
        this.toJsonString(input.metadata),
      ]
    );

    return this.mapEvent(result.rows[0]);
  }

  /**
   * Record a stream payload for a service session.
   */
  async recordServiceSessionStream(
    input: RecordServiceSessionStreamInput
  ): Promise<ServiceSessionStreamRecord> {
    const result = await this.db.query(
      `WITH next_sequence AS (
         SELECT COALESCE(MAX(sequence_number), 0) + 1 AS seq
         FROM service_session_streams
         WHERE service_session_id = $1 AND channel_id = $2
       )
       INSERT INTO service_session_streams (
         service_session_id, channel_id, sequence_number, payload, status,
         captured_at, metadata
       ) VALUES (
         $1, $2,
         COALESCE($3, (SELECT seq FROM next_sequence)),
         $4::jsonb,
         COALESCE($5, 'captured'),
         COALESCE($6, CURRENT_TIMESTAMP),
         $7::jsonb
       ) RETURNING *`,
      [
        input.serviceSessionId,
        input.channelId,
        input.sequenceNumber ?? null,
        this.toJsonString(input.payload),
        input.status ?? 'captured',
        input.capturedAt ?? null,
        this.toJsonString(input.metadata),
      ]
    );

    return this.mapStream(result.rows[0]);
  }

  /**
   * Record a metric value for a service session.
   */
  async recordServiceSessionMetric(
    input: RecordServiceSessionMetricInput
  ): Promise<ServiceSessionMetricRecord> {
    const result = await this.db.query(
      `INSERT INTO service_session_metrics (
         service_session_id, metric_name, metric_value, unit, recorded_at, metadata
       ) VALUES (
         $1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP), $6::jsonb
       ) RETURNING *`,
      [
        input.serviceSessionId,
        input.metricName,
        input.metricValue,
        input.unit ?? null,
        input.recordedAt ?? null,
        this.toJsonString(input.metadata),
      ]
    );

    return this.mapMetric(result.rows[0]);
  }

  private async runInTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapProfile(row: any): ServiceRuntimeProfile {
    return {
      profileId: row.profile_id,
      serviceId: row.service_id,
      profileKey: row.profile_key,
      name: row.name,
      description: row.description,
      environment: row.environment,
      baseUrl: row.base_url,
      authStrategy: row.auth_strategy,
      defaultModel: row.default_model,
      configuration: this.ensureJson(row.configuration),
      limits: this.ensureJson(row.limits),
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapChannel(row: any): ServiceStreamChannel {
    return {
      channelId: row.channel_id,
      serviceId: row.service_id,
      name: row.name,
      description: row.description,
      channelType: row.channel_type,
      schemaDefinition: this.ensureJson(row.schema_definition),
      retentionPolicy: this.ensureJson(row.retention_policy),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSession(row: any): ServiceSessionRecord {
    const session: ServiceSessionRecord = {
      sessionId: row.service_session_id,
      serviceId: row.service_id,
      profileId: row.profile_id,
      sessionLabel: row.session_label,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      runtimeMetadata: this.ensureJson(row.runtime_metadata),
      healthSnapshot: this.ensureJson(row.health_snapshot),
      errorSummary: row.error_summary,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    if (row.profile_id) {
      session.profile = {
        profileId: row.profile_id,
        profileKey: row.profile_key,
        name: row.profile_name,
        environment: row.profile_environment,
      };
    }

    return session;
  }

  private mapEvent(row: any): ServiceSessionEventRecord {
    return {
      eventId: row.event_id,
      serviceSessionId: row.service_session_id,
      eventType: row.event_type,
      eventSource: row.event_source,
      severity: row.severity,
      eventPayload: this.ensureJson(row.event_payload),
      occurredAt: row.occurred_at,
      metadata: this.ensureJson(row.metadata),
    };
  }

  private mapStream(row: any): ServiceSessionStreamRecord {
    return {
      streamRecordId: row.stream_record_id,
      serviceSessionId: row.service_session_id,
      channelId: row.channel_id,
      sequenceNumber: Number(row.sequence_number),
      payload: this.ensureJson(row.payload),
      status: row.status,
      capturedAt: row.captured_at,
      metadata: this.ensureJson(row.metadata),
    };
  }

  private mapMetric(row: any): ServiceSessionMetricRecord {
    return {
      metricsId: row.metrics_id,
      serviceSessionId: row.service_session_id,
      metricName: row.metric_name,
      metricValue: Number(row.metric_value),
      unit: row.unit,
      recordedAt: row.recorded_at,
      metadata: this.ensureJson(row.metadata),
    };
  }

  private ensureJson(value: unknown): JsonValue {
    if (value === null || value === undefined) {
      return {};
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return {};
      }
    }

    if (typeof value === 'object') {
      return value as JsonValue;
    }

    return {};
  }

  private toJsonString(value: unknown, fallback: JsonValue = {}): string {
    if (value === undefined || value === null) {
      return JSON.stringify(fallback);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return JSON.stringify(fallback);
      }
      try {
        return JSON.stringify(JSON.parse(trimmed));
      } catch (error) {
        return JSON.stringify(fallback);
      }
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return JSON.stringify(value);
    }

    return JSON.stringify(value);
  }
}

export default ServiceRuntimeLoggingService;
