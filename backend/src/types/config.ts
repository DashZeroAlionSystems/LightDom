export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  blockchain: BlockchainConfig;
  jwt: JWTConfig;
  encryption: EncryptionConfig;
  storage: StorageConfig;
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
}

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddresses: ContractAddresses;
}

export interface ContractAddresses {
  storageToken: string;
  storageContract: string;
  storageGovernance: string;
  dataEncryption: string;
  hostManager: string;
  fileManager: string;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
}

export interface StorageConfig {
  uploadPath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}