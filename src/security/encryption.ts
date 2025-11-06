/**
 * Encryption Utilities for LightDom Platform
 * 
 * Provides enterprise-grade encryption for:
 * - SEO campaign strategies and configurations
 * - Rich snippet schemas and templates
 * - Client proprietary data
 * - API keys and sensitive credentials
 */

import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt?: string;
}

interface EncryptionOptions {
  useDerivation?: boolean;
  metadata?: Record<string, any>;
}

/**
 * SEO Campaign Encryption Service
 * Handles encryption of sensitive SEO strategies and configurations
 */
export class SEOEncryptionService {
  private masterKey: Buffer;
  
  constructor(masterKeyHex?: string) {
    if (masterKeyHex) {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
      if (this.masterKey.length !== KEY_LENGTH) {
        throw new Error(`Master key must be ${KEY_LENGTH} bytes (64 hex characters)`);
      }
    } else {
      // Generate from environment or create new
      const envKey = process.env.ENCRYPTION_MASTER_KEY;
      if (envKey) {
        this.masterKey = Buffer.from(envKey, 'hex');
      } else {
        console.warn('No master key provided - generating temporary key. Set ENCRYPTION_MASTER_KEY in production!');
        this.masterKey = crypto.randomBytes(KEY_LENGTH);
      }
    }
  }

  /**
   * Generate a cryptographically secure encryption key
   */
  static generateKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }

  /**
   * Derive a key from a password using PBKDF2
   */
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  }

  /**
   * Encrypt SEO campaign data
   * 
   * @param data - The data to encrypt (object will be JSON stringified)
   * @param options - Encryption options
   * @returns Encrypted data object
   */
  encrypt(data: any, options: EncryptionOptions = {}): EncryptedData {
    const { useDerivation = false } = options;
    
    // Convert data to string if it's an object
    const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Determine encryption key
    let encryptionKey = this.masterKey;
    let salt: Buffer | undefined;
    
    if (useDerivation) {
      // Use key derivation for additional security layer
      salt = crypto.randomBytes(SALT_LENGTH);
      encryptionKey = this.deriveKey(this.masterKey.toString('hex'), salt);
    }
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    const result: EncryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
    
    if (salt) {
      result.salt = salt.toString('hex');
    }
    
    return result;
  }

  /**
   * Decrypt SEO campaign data
   * 
   * @param encryptedData - The encrypted data object
   * @param parseJSON - Whether to parse result as JSON
   * @returns Decrypted data
   */
  decrypt(encryptedData: EncryptedData, parseJSON: boolean = true): any {
    const { encrypted, iv, tag, salt } = encryptedData;
    
    // Determine decryption key
    let decryptionKey = this.masterKey;
    
    if (salt) {
      // Use key derivation if salt is present
      decryptionKey = this.deriveKey(
        this.masterKey.toString('hex'),
        Buffer.from(salt, 'hex')
      );
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      decryptionKey,
      Buffer.from(iv, 'hex')
    );
    
    // Set authentication tag
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Parse JSON if requested
    if (parseJSON) {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        // Return as string if not valid JSON
        return decrypted;
      }
    }
    
    return decrypted;
  }

  /**
   * Encrypt a complete SEO campaign configuration
   * This includes strategies that should remain proprietary
   */
  encryptCampaign(campaign: {
    schemas: any[];
    metaTags: any;
    keywords: string[];
    contentStrategy: any;
    linkBuildingStrategy?: any;
    competitorAnalysis?: any;
  }): EncryptedData {
    // Remove sensitive fields before encryption
    const campaignCopy = { ...campaign };
    
    return this.encrypt(campaignCopy, { useDerivation: true });
  }

  /**
   * Encrypt rich snippet schema templates
   * These are proprietary templates that give competitive advantage
   */
  encryptSchemaTemplate(schema: any): EncryptedData {
    return this.encrypt(schema, { useDerivation: true });
  }

  /**
   * Hash API keys for secure storage
   */
  hashApiKey(apiKey: string): string {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(prefix: string = 'ld'): string {
    const randomPart = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomPart}`;
  }

  /**
   * Create a one-way hash for data fingerprinting
   * Used to detect if campaign data has been copied
   */
  createFingerprint(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  /**
   * Obfuscate data for client display
   * Shows partial information without revealing proprietary details
   */
  obfuscateForDisplay(data: any, fieldsToShow: string[] = []): any {
    if (typeof data !== 'object' || data === null) {
      return '[Protected]';
    }

    const obfuscated: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (fieldsToShow.includes(key)) {
        // Show allowed fields
        obfuscated[key] = value;
      } else if (typeof value === 'string') {
        // Show partial string
        obfuscated[key] = value.length > 3 
          ? `${value.substring(0, 3)}...` 
          : '***';
      } else if (typeof value === 'number') {
        // Show rounded numbers
        obfuscated[key] = Math.round(value as number);
      } else if (Array.isArray(value)) {
        // Show count only
        obfuscated[key] = `[${value.length} items]`;
      } else {
        obfuscated[key] = '[Protected]';
      }
    }
    
    return obfuscated;
  }
}

/**
 * Singleton instance for application-wide use
 */
let encryptionServiceInstance: SEOEncryptionService | null = null;

export function getEncryptionService(): SEOEncryptionService {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new SEOEncryptionService();
  }
  return encryptionServiceInstance;
}

/**
 * Initialize encryption service with a specific key
 */
export function initializeEncryptionService(masterKey: string): void {
  encryptionServiceInstance = new SEOEncryptionService(masterKey);
}

export default SEOEncryptionService;
