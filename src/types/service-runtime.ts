export type JsonValue = Record<string, unknown> | unknown[];

export interface ServiceRuntimeProfile {
  profileId: string;
  serviceId: string;
  profileKey: string;
  name: string;
  description?: string | null;
  environment: string;
  baseUrl?: string | null;
  authStrategy?: string | null;
  defaultModel?: string | null;
  configuration: JsonValue;
  limits: JsonValue;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRuntimeProfileInput {
  serviceId: string;
  profileKey: string;
  name: string;
  description?: string;
  environment?: string;
  baseUrl?: string;
  authStrategy?: string;
  defaultModel?: string;
  configuration?: JsonValue;
  limits?: JsonValue;
  isDefault?: boolean;
}

export interface UpdateServiceRuntimeProfileInput {
  name?: string;
  description?: string | null;
  environment?: string;
  baseUrl?: string | null;
  authStrategy?: string | null;
  defaultModel?: string | null;
  configuration?: JsonValue | null;
  limits?: JsonValue | null;
  isDefault?: boolean;
}

export interface ServiceStreamChannel {
  channelId: string;
  serviceId: string;
  name: string;
  description?: string | null;
  channelType: string;
  schemaDefinition: JsonValue;
  retentionPolicy: JsonValue;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceStreamChannelInput {
  serviceId: string;
  name: string;
  description?: string;
  channelType: string;
  schemaDefinition?: JsonValue;
  retentionPolicy?: JsonValue;
  isActive?: boolean;
}

export interface UpdateServiceStreamChannelInput {
  name?: string;
  description?: string | null;
  channelType?: string;
  schemaDefinition?: JsonValue | null;
  retentionPolicy?: JsonValue | null;
  isActive?: boolean;
}

export interface ServiceSessionRecord {
  sessionId: string;
  serviceId: string;
  profileId?: string | null;
  sessionLabel?: string | null;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  runtimeMetadata: JsonValue;
  healthSnapshot: JsonValue;
  errorSummary?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: Pick<ServiceRuntimeProfile, 'profileId' | 'profileKey' | 'name' | 'environment'>;
}

export interface CreateServiceSessionInput {
  serviceId: string;
  profileId?: string;
  sessionLabel?: string;
  status?: string;
  startedAt?: string;
  runtimeMetadata?: JsonValue;
  healthSnapshot?: JsonValue;
}

export interface UpdateServiceSessionInput {
  status?: string;
  endedAt?: string | null;
  runtimeMetadata?: JsonValue | null;
  healthSnapshot?: JsonValue | null;
  errorSummary?: string | null;
}

export interface ServiceSessionEventRecord {
  eventId: string;
  serviceSessionId: string;
  eventType: string;
  eventSource?: string | null;
  severity: string;
  eventPayload: JsonValue;
  occurredAt: string;
  metadata: JsonValue;
}

export interface LogServiceSessionEventInput {
  serviceSessionId: string;
  eventType: string;
  eventSource?: string;
  severity?: string;
  eventPayload?: JsonValue;
  occurredAt?: string;
  metadata?: JsonValue;
}

export interface ServiceSessionStreamRecord {
  streamRecordId: string;
  serviceSessionId: string;
  channelId: string;
  sequenceNumber: number;
  payload: JsonValue;
  status: string;
  capturedAt: string;
  metadata: JsonValue;
}

export interface RecordServiceSessionStreamInput {
  serviceSessionId: string;
  channelId: string;
  sequenceNumber?: number;
  payload?: JsonValue;
  status?: string;
  capturedAt?: string;
  metadata?: JsonValue;
}

export interface ServiceSessionMetricRecord {
  metricsId: string;
  serviceSessionId: string;
  metricName: string;
  metricValue: number;
  unit?: string | null;
  recordedAt: string;
  metadata: JsonValue;
}

export interface RecordServiceSessionMetricInput {
  serviceSessionId: string;
  metricName: string;
  metricValue: number;
  unit?: string;
  recordedAt?: string;
  metadata?: JsonValue;
}

export interface ServiceSessionDetail extends ServiceSessionRecord {
  events?: ServiceSessionEventRecord[];
  streams?: ServiceSessionStreamRecord[];
  metrics?: ServiceSessionMetricRecord[];
}

export interface ListServiceSessionFilters {
  serviceId?: string;
  status?: string;
  limit?: number;
}

export interface ListRuntimeProfileFilters {
  serviceId?: string;
  environment?: string;
  limit?: number;
}
