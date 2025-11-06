// SSO / SAML / OAuth related types
export interface SSOConfiguration {
  enabled: boolean;
  providers: SSOProvider[];
  defaultProvider?: string;
  sessionTimeout: number;
  maxConcurrentSessions: number;
  attributeMappings: SSOAttributeMapping[];
  groupMappings: SSOGroupMapping[];
  healthCheckInterval: number;
  cleanupInterval: number;
  refreshTokenExpiry?: number;
  autoProvisionUsers?: boolean;
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc' | 'ldap' | 'adfs';
  enabled: boolean;
  isActive?: boolean;
  configuration: {
    saml?: any;
    oauth?: any;
    oidc?: any;
    ldap?: any;
    adfs?: any;
  };
  config: Record<string, any>;
  metadata?: Record<string, any>;
  certificate?: string;
  privateKey?: string;
  endpoints: {
    login: string;
    logout: string;
    metadata?: string;
  };
}

export interface EnterpriseUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  title?: string;
  manager?: string;
  groups: string[];
  attributes: Record<string, any>;
  ssoProvider: string;
  lastLogin?: Date;
  accountStatus: 'active' | 'inactive' | 'suspended';
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  domain: string;
  ssoProvider: string;
  users: string[];
  groups: string[];
  settings: Record<string, any>;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId?: string;
  ssoProviderId?: string; // backward-compatible alias many callers use
  enterpriseId?: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date | string;
  createdAt: Date | string;
  lastActivity: Date | string;
  // alias used by some callers
  lastActivityAt?: Date | string;
  ipAddress: string;
  userAgent: string;
  attributes: Record<string, any>;
  isActive?: boolean;
  sessionToken?: string;
  updatedAt?: Date | string;
}

export interface SSOAttributeMapping {
  provider: string;
  source: string;
  target: string;
  transform?: 'none' | 'lowercase' | 'uppercase' | 'trim';
  required: boolean;
}

export interface SSOGroupMapping {
  provider: string;
  sourceGroup: string;
  targetGroup: string;
  role: string;
}

export interface SSOEvent {
  id: string;
  type: 'login' | 'logout' | 'session_expired' | 'auth_failed' | 'user_created' | 'user_updated';
  userId?: string;
  providerId?: string;
  ssoProviderId?: string; // Alias for backward compatibility
  enterpriseId?: string;
  timestamp: Date | string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
  details?: Record<string, any>;
}

export interface SSOError {
  code: string;
  message: string;
  provider?: string;
  userId?: string;
  details?: any;
  type?: string;
  timestamp?: Date | string;
}

export interface SSOHealth {
  provider?: string;
  providerId?: string;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'degraded';
  lastCheck: Date | string;
  responseTime?: number;
  error?: string;
  errorRate?: number;
  issues?: string[];
}

export interface SSOAnalytics {
  provider: string;
  period: string;
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  averageResponseTime: number;
  activeUsers: number;
  newUsers: number;
}

export interface SSOUserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  roles?: string[];
  enterprise?: {
    id: string;
    name?: string;
    domain?: string;
  };
  ssoProvider?: {
    id: string;
    name?: string;
    type?: string;
  };
  permissions?: string[];
  groups?: string[];
  attributes?: Record<string, any>;
  lastLogin?: Date | string;
  loginCount?: number;
  createdAt?: Date | string;
}

export interface SSOLoginRequest {
  provider: string;
  returnUrl?: string;
  state?: string;
  scope?: string[];
  prompt?: string;
}

export interface SSOLoginResponse {
  success: boolean;
  user?: SSOUserProfile;
  token?: string;
  sessionToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: Date | string;
  error?: SSOError | string;
}

export interface SSOTokenValidation {
  valid: boolean;
  user?: SSOUserProfile;
  userId?: string;
  enterpriseId?: string;
  ssoProviderId?: string;
  expiresAt?: Date | string;
  error?: SSOError | string;
  permissions?: string[];
}

export interface SSOEvents {
  login: (user: SSOUserProfile) => void;
  logout: (userId: string) => void;
  sessionExpired: (sessionId: string) => void;
  authFailed: (error: SSOError) => void;
  userCreated: (user: SSOUserProfile) => void;
  userUpdated: (user: SSOUserProfile) => void;
}

export type SamlLib = any;
