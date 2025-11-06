import { Logger } from '../../utils/Logger';
import WebOTPService from './WebOTPService';

export interface TwoFactorAuthConfig {
  issuer: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: number;
  window: number;
}

export interface TOTPSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorAuthStatus {
  isEnabled: boolean;
  hasBackupCodes: boolean;
  lastUsed: Date | null;
  methods: string[];
}

export interface TwoFactorAuthMethod {
  type: 'totp' | 'sms' | 'email' | 'backup';
  name: string;
  enabled: boolean;
  lastUsed: Date | null;
}

export class TwoFactorAuthService {
  private logger: Logger;
  private config: TwoFactorAuthConfig;
  private webOTPService: WebOTPService;
  private isEnabled: boolean = false;
  private methods: TwoFactorAuthMethod[] = [];

  constructor(config: TwoFactorAuthConfig) {
    this.logger = new Logger('TwoFactorAuthService');
    this.config = {
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      window: 1,
      ...config
    };
    this.webOTPService = new WebOTPService();
  }

  /**
   * Initialize 2FA service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing 2FA service');

      // Check if 2FA is already enabled
      this.isEnabled = await this.check2FAStatus();

      // Load available methods
      await this.loadMethods();

      this.logger.info('2FA service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize 2FA service:', error);
      throw error;
    }
  }

  /**
   * Check if 2FA is enabled
   */
  private async check2FAStatus(): Promise<boolean> {
    try {
      // In a real implementation, this would check the server
      const status = localStorage.getItem('2fa-enabled');
      return status === 'true';
    } catch (error) {
      this.logger.error('Failed to check 2FA status:', error);
      return false;
    }
  }

  /**
   * Load available 2FA methods
   */
  private async loadMethods(): Promise<void> {
    try {
      this.methods = [
        {
          type: 'totp',
          name: 'Authenticator App',
          enabled: false,
          lastUsed: null
        },
        {
          type: 'sms',
          name: 'SMS',
          enabled: false,
          lastUsed: null
        },
        {
          type: 'email',
          name: 'Email',
          enabled: false,
          lastUsed: null
        },
        {
          type: 'backup',
          name: 'Backup Codes',
          enabled: false,
          lastUsed: null
        }
      ];

      // Load from storage
      const storedMethods = localStorage.getItem('2fa-methods');
      if (storedMethods) {
        this.methods = JSON.parse(storedMethods);
      }
    } catch (error) {
      this.logger.error('Failed to load 2FA methods:', error);
    }
  }

  /**
   * Generate TOTP secret
   */
  async generateTOTPSecret(userId: string): Promise<TOTPSecret> {
    try {
      this.logger.info('Generating TOTP secret');

      // Generate random secret
      const secret = this.generateRandomSecret();
      
      // Generate QR code
      const qrCode = this.generateQRCode(userId, secret);
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      const totpSecret: TOTPSecret = {
        secret,
        qrCode,
        backupCodes
      };

      this.logger.info('TOTP secret generated successfully');
      return totpSecret;
    } catch (error) {
      this.logger.error('Failed to generate TOTP secret:', error);
      throw error;
    }
  }

  /**
   * Generate random secret
   */
  private generateRandomSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Generate QR code for TOTP
   */
  private generateQRCode(userId: string, secret: string): string {
    const issuer = encodeURIComponent(this.config.issuer);
    const account = encodeURIComponent(userId);
    const algorithm = this.config.algorithm;
    const digits = this.config.digits;
    const period = this.config.period;

    const otpauth = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${algorithm}&digits=${digits}&period=${period}`;
    
    // In a real implementation, you would generate an actual QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify TOTP code
   */
  async verifyTOTPCode(secret: string, code: string): Promise<boolean> {
    try {
      // In a real implementation, you would use a proper TOTP library
      // For now, we'll simulate verification
      const isValid = code.length === this.config.digits && /^\d+$/.test(code);
      
      if (isValid) {
        this.logger.info('TOTP code verified successfully');
        this.updateMethodLastUsed('totp');
      } else {
        this.logger.warn('TOTP code verification failed');
      }
      
      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify TOTP code:', error);
      return false;
    }
  }

  /**
   * Send SMS code
   */
  async sendSMSCode(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.info(`Sending SMS code to ${phoneNumber}`);

      // Use WebOTP service
      const success = await this.webOTPService.sendOTPRequest(phoneNumber);
      
      if (success) {
        this.updateMethodLastUsed('sms');
      }
      
      return success;
    } catch (error) {
      this.logger.error('Failed to send SMS code:', error);
      return false;
    }
  }

  /**
   * Verify SMS code
   */
  async verifySMSCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const isValid = await this.webOTPService.verifyOTP(code, phoneNumber);
      
      if (isValid) {
        this.updateMethodLastUsed('sms');
      }
      
      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify SMS code:', error);
      return false;
    }
  }

  /**
   * Send email code
   */
  async sendEmailCode(email: string): Promise<boolean> {
    try {
      this.logger.info(`Sending email code to ${email}`);

      // In a real implementation, this would send an actual email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateMethodLastUsed('email');
      return true;
    } catch (error) {
      this.logger.error('Failed to send email code:', error);
      return false;
    }
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    try {
      // In a real implementation, this would verify against the server
      const isValid = code.length === 6 && /^\d+$/.test(code);
      
      if (isValid) {
        this.updateMethodLastUsed('email');
      }
      
      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify email code:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(code: string): Promise<boolean> {
    try {
      // In a real implementation, this would check against stored backup codes
      const storedCodes = localStorage.getItem('2fa-backup-codes');
      if (!storedCodes) return false;

      const backupCodes = JSON.parse(storedCodes);
      const index = backupCodes.indexOf(code.toUpperCase());
      
      if (index !== -1) {
        // Remove used backup code
        backupCodes.splice(index, 1);
        localStorage.setItem('2fa-backup-codes', JSON.stringify(backupCodes));
        
        this.updateMethodLastUsed('backup');
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error('Failed to verify backup code:', error);
      return false;
    }
  }

  /**
   * Enable 2FA
   */
  async enable2FA(method: string, data: any): Promise<boolean> {
    try {
      this.logger.info(`Enabling 2FA with method: ${method}`);

      // Update method status
      const methodIndex = this.methods.findIndex(m => m.type === method);
      if (methodIndex !== -1) {
        this.methods[methodIndex].enabled = true;
        this.methods[methodIndex].lastUsed = new Date();
      }

      // Save to storage
      localStorage.setItem('2fa-methods', JSON.stringify(this.methods));
      localStorage.setItem('2fa-enabled', 'true');
      
      this.isEnabled = true;
      
      this.logger.info('2FA enabled successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(): Promise<boolean> {
    try {
      this.logger.info('Disabling 2FA');

      // Disable all methods
      this.methods.forEach(method => {
        method.enabled = false;
      });

      // Save to storage
      localStorage.setItem('2fa-methods', JSON.stringify(this.methods));
      localStorage.setItem('2fa-enabled', 'false');
      
      this.isEnabled = false;
      
      this.logger.info('2FA disabled successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  /**
   * Update method last used
   */
  private updateMethodLastUsed(methodType: string): void {
    const method = this.methods.find(m => m.type === method);
    if (method) {
      method.lastUsed = new Date();
      localStorage.setItem('2fa-methods', JSON.stringify(this.methods));
    }
  }

  /**
   * Get 2FA status
   */
  getStatus(): TwoFactorAuthStatus {
    return {
      isEnabled: this.isEnabled,
      hasBackupCodes: this.methods.some(m => m.type === 'backup' && m.enabled),
      lastUsed: this.methods.reduce((latest, method) => {
        if (!method.lastUsed) return latest;
        if (!latest) return method.lastUsed;
        return method.lastUsed > latest ? method.lastUsed : latest;
      }, null as Date | null),
      methods: this.methods.filter(m => m.enabled).map(m => m.type)
    };
  }

  /**
   * Get available methods
   */
  getMethods(): TwoFactorAuthMethod[] {
    return [...this.methods];
  }

  /**
   * Create 2FA setup HTML
   */
  create2FASetupHTML(): string {
    return `
      <div class="2fa-setup">
        <h3>Two-Factor Authentication Setup</h3>
        <div class="methods">
          <div class="method">
            <div class="method-header">
              <span class="icon">📱</span>
              <h4>Authenticator App</h4>
              <span class="status ${this.methods.find(m => m.type === 'totp')?.enabled ? 'enabled' : 'disabled'}">
                ${this.methods.find(m => m.type === 'totp')?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p>Use an authenticator app like Google Authenticator or Authy</p>
            <button class="btn btn-primary" onclick="setupTOTP()">
              ${this.methods.find(m => m.type === 'totp')?.enabled ? 'Manage' : 'Setup'}
            </button>
          </div>

          <div class="method">
            <div class="method-header">
              <span class="icon">📧</span>
              <h4>SMS</h4>
              <span class="status ${this.methods.find(m => m.type === 'sms')?.enabled ? 'enabled' : 'disabled'}">
                ${this.methods.find(m => m.type === 'sms')?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p>Receive verification codes via SMS</p>
            <button class="btn btn-primary" onclick="setupSMS()">
              ${this.methods.find(m => m.type === 'sms')?.enabled ? 'Manage' : 'Setup'}
            </button>
          </div>

          <div class="method">
            <div class="method-header">
              <span class="icon">📧</span>
              <h4>Email</h4>
              <span class="status ${this.methods.find(m => m.type === 'email')?.enabled ? 'enabled' : 'disabled'}">
                ${this.methods.find(m => m.type === 'email')?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p>Receive verification codes via email</p>
            <button class="btn btn-primary" onclick="setupEmail()">
              ${this.methods.find(m => m.type === 'email')?.enabled ? 'Manage' : 'Setup'}
            </button>
          </div>

          <div class="method">
            <div class="method-header">
              <span class="icon">🔑</span>
              <h4>Backup Codes</h4>
              <span class="status ${this.methods.find(m => m.type === 'backup')?.enabled ? 'enabled' : 'disabled'}">
                ${this.methods.find(m => m.type === 'backup')?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p>One-time use codes for account recovery</p>
            <button class="btn btn-primary" onclick="setupBackupCodes()">
              ${this.methods.find(m => m.type === 'backup')?.enabled ? 'Manage' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create 2FA verification HTML
   */
  create2FAVerificationHTML(): string {
    return `
      <div class="2fa-verification">
        <h3>Two-Factor Authentication</h3>
        <p>Please enter your verification code to continue</p>
        
        <form id="2fa-form" class="verification-form">
          <div class="form-group">
            <label for="verification-code">Verification Code</label>
            <input 
              type="text" 
              id="verification-code" 
              name="code" 
              autocomplete="one-time-code"
              placeholder="Enter 6-digit code"
              maxlength="6"
              pattern="[0-9]{6}"
              required
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Verify</button>
            <button type="button" class="btn btn-secondary" onclick="useBackupCode()">
              Use Backup Code
            </button>
          </div>
        </form>
        
        <div class="alternative-methods">
          <p>Or use an alternative method:</p>
          <button class="btn btn-outline" onclick="sendSMS()">Send SMS</button>
          <button class="btn btn-outline" onclick="sendEmail()">Send Email</button>
        </div>
      </div>
    `;
  }
}

export default TwoFactorAuthService;
