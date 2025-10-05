// Enterprise SSO Types for LightDom Platform

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc' | 'ldap' | 'adfs';
  displayName: string;
  description: string;
  iconUrl?: string;
  isActive: boolean;
  configuration: SSOConfiguration;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SSOConfiguration {
  // SAML Configuration
  saml?: {
    entityId: string;
    ssoUrl: string;
    sloUrl?: string;
    certificate: string;
    privateKey?: string;
    nameIdFormat: string;
    assertionConsumerServiceUrl: string;
    audience: string;
    issuer: string;
    signatureAlgorithm: string;
    digestAlgorithm: string;
    encryptionAlgorithm?: string;
    encryptionKey?: string;
  };

  // OAuth 2.0 Configuration
  oauth?: {
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scope: string[];
    redirectUri: string;
    responseType: string;
    grantType: string;
  };

  // OpenID Connect Configuration
  oidc?: {
    clientId: string;
    clientSecret: string;
    issuer: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint: string;
    jwksUri: string;
    scope: string[];
    redirectUri: string;
    responseType: string;
    responseMode: string;
  };

  // LDAP Configuration
  ldap?: {
    serverUrl: string;
    bindDn: string;
    bindPassword: string;
    baseDn: string;
    userSearchBase: string;
    userSearchFilter: string;
    groupSearchBase?: string;
    groupSearchFilter?: string;
    attributes: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      groups: string;
    };
  };

  // ADFS Configuration
  adfs?: {
    serverUrl: string;
    realm: string;
    certificate: string;
    entityId: string;
    assertionConsumerServiceUrl: string;
  };
}

export interface EnterpriseUser {
  id: string;
  userId: string;
  enterpriseId: string;
  ssoProviderId: string;
  externalId: string; // External system user ID
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  groups: string[];
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  domain: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  ssoProviders: string[];
  defaultSsoProvider?: string;
  settings: EnterpriseSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface EnterpriseSettings {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // Days
  };
  sessionSettings: {
    timeout: number; // Minutes
    maxConcurrentSessions: number;
    requireReauthForSensitive: boolean;
  };
  securitySettings: {
    requireMFA: boolean;
    allowedMfaMethods: string[];
    ipWhitelist: string[];
    geoRestrictions: string[];
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss?: string;
  };
}

export interface SSOSession {
  id: string;
  userId: string;
  enterpriseId: string;
  ssoProviderId: string;
  sessionToken: string;
  refreshToken?: string;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface SSOAttributeMapping {
  id: string;
  ssoProviderId: string;
  externalAttribute: string;
  internalAttribute: string;
  isRequired: boolean;
  defaultValue?: string;
  transform?: {
    type: 'regex' | 'function' | 'lookup';
    value: string;
  };
}

export interface SSOGroupMapping {
  id: string;
  ssoProviderId: string;
  externalGroup: string;
  internalRole: string;
  permissions: string[];
  isActive: boolean;
}

export interface SSOEvent {
  id: string;
  type: 'login' | 'logout' | 'token_refresh' | 'user_created' | 'user_updated' | 'user_deleted' | 'group_sync' | 'error';
  userId?: string;
  enterpriseId: string;
  ssoProviderId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata: Record<string, any>;
}

export interface SSOConfiguration {
  providers: SSOProvider[];
  defaultProvider?: string;
  fallbackToLocalAuth: boolean;
  autoProvisionUsers: boolean;
  syncGroupsOnLogin: boolean;
  sessionTimeout: number;
  refreshTokenExpiry: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export interface SSOError {
  code: string;
  message: string;
  type: 'authentication' | 'authorization' | 'configuration' | 'network' | 'validation' | 'system';
  details?: Record<string, any>;
  timestamp: string;
}

export interface SSOHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  issues: string[];
}

export interface SSOAnalytics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topProviders: Array<{
    providerId: string;
    providerName: string;
    loginCount: number;
    successRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    logins: number;
    uniqueUsers: number;
    averageSessionDuration: number;
  }>;
  errorStats: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
}

export interface SSOUserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
  groups: string[];
  permissions: string[];
  enterprise: {
    id: string;
    name: string;
    domain: string;
  };
  ssoProvider: {
    id: string;
    name: string;
    type: string;
  };
  lastLoginAt?: string;
  createdAt: string;
}

export interface SSOLoginRequest {
  providerId: string;
  redirectUrl?: string;
  state?: string;
  nonce?: string;
  prompt?: string;
  maxAge?: number;
  uiLocales?: string[];
}

export interface SSOLoginResponse {
  success: boolean;
  sessionToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: SSOUserProfile;
  redirectUrl?: string;
  error?: string;
}

export interface SSOTokenValidation {
  valid: boolean;
  userId?: string;
  enterpriseId?: string;
  ssoProviderId?: string;
  expiresAt?: string;
  permissions?: string[];
  error?: string;
}

// Event types
export interface SSOEvents {
  'userLogin': (user: SSOUserProfile, session: SSOSession) => void;
  'userLogout': (userId: string, sessionId: string) => void;
  'userCreated': (user: EnterpriseUser) => void;
  'userUpdated': (user: EnterpriseUser) => void;
  'userDeleted': (userId: string) => void;
  'groupSynced': (userId: string, groups: string[]) => void;
  'sessionExpired': (sessionId: string) => void;
  'loginFailed': (providerId: string, error: SSOError) => void;
  'providerHealthChanged': (providerId: string, health: SSOHealth) => void;
  'error': (error: SSOError) => void;
}

// Utility types
export type SSOEventType = keyof SSOEvents;
export type SSOProviderType = 'saml' | 'oauth' | 'oidc' | 'ldap' | 'adfs';
export type SSOEventTypeEnum = 'login' | 'logout' | 'token_refresh' | 'user_created' | 'user_updated' | 'user_deleted' | 'group_sync' | 'error';
export type SSOHealthStatus = 'healthy' | 'degraded' | 'down';
export type SSOErrorType = 'authentication' | 'authorization' | 'configuration' | 'network' | 'validation' | 'system';