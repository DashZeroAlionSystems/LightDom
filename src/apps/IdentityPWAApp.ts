import { Logger } from '../utils/Logger';
import WebAuthnService from '../services/WebAuthnService';
import WebOTPService from '../services/WebOTPService';
import PWAService from '../services/PWAService';
import PasswordManagerService from '../services/PasswordManagerService';
import TwoFactorAuthService from '../services/TwoFactorAuthService';

export interface IdentityPWAConfig {
  webAuthn: {
    rpId: string;
    rpName: string;
    origin: string;
  };
  pwa: {
    name: string;
    shortName: string;
    description: string;
    startUrl: string;
    themeColor: string;
    backgroundColor: string;
  };
  passwordManager: {
    changePasswordUrl: string;
    digitalAssetLinks: any[];
  };
  twoFactorAuth: {
    issuer: string;
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
    digits: 6 | 8;
    period: number;
    window: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
  security: SecuritySettings;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analytics: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  backupCodesGenerated: boolean;
  lastPasswordChange: Date;
  loginHistory: LoginAttempt[];
}

export interface LoginAttempt {
  timestamp: Date;
  ip: string;
  userAgent: string;
  success: boolean;
  method: 'password' | 'passkey' | 'otp' | 'backup';
}

export class IdentityPWAApp {
  private logger: Logger;
  private config: IdentityPWAConfig;
  private webAuthnService: WebAuthnService;
  private webOTPService: WebOTPService;
  private pwaService: PWAService;
  private passwordManagerService: PasswordManagerService;
  private twoFactorAuthService: TwoFactorAuthService;
  private currentUser: User | null = null;
  private isInitialized = false;

  constructor(config: IdentityPWAConfig) {
    this.logger = new Logger('IdentityPWAApp');
    this.config = config;

    // Initialize services
    this.webAuthnService = new WebAuthnService(config.webAuthn);
    this.webOTPService = new WebOTPService();
    this.pwaService = new PWAService(config.pwa, {
      cacheName: 'lightdom-cache',
      cacheVersion: '1.0.0',
      urlsToCache: ['/', '/dashboard', '/optimize', '/wallet', '/settings', '/manifest.json'],
      offlinePage: '/offline.html',
      updateInterval: 24 * 60 * 60 * 1000, // 24 hours
    });
    this.passwordManagerService = new PasswordManagerService(config.passwordManager);
    this.twoFactorAuthService = new TwoFactorAuthService(config.twoFactorAuth);
  }

  /**
   * Initialize the Identity PWA App
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Identity PWA App');

      // Initialize PWA service
      await this.pwaService.initialize();

      // Initialize 2FA service
      await this.twoFactorAuthService.initialize();

      // Setup password manager integration
      this.passwordManagerService.setupPasswordChangeURL();
      this.passwordManagerService.setupDigitalAssetLinks();
      this.passwordManagerService.setupFormAutofill();

      // Setup WebOTP
      this.webOTPService.setupOTPForm('form');

      // Load user session
      await this.loadUserSession();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      this.logger.info('Identity PWA App initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Identity PWA App:', error);
      throw error;
    }
  }

  /**
   * Load user session
   */
  private async loadUserSession(): Promise<void> {
    try {
      const userData = localStorage.getItem('user-session');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.logger.info('User session loaded');
      }
    } catch (error) {
      this.logger.error('Failed to load user session:', error);
    }
  }

  /**
   * Save user session
   */
  private saveUserSession(): void {
    if (this.currentUser) {
      localStorage.setItem('user-session', JSON.stringify(this.currentUser));
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle online/offline events
    window.addEventListener('online', () => {
      this.logger.info('App is online');
      this.showNotification('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
      this.logger.info('App is offline');
      this.showNotification('You are offline. Some features may not be available.', 'warning');
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logger.info('App hidden');
      } else {
        this.logger.info('App visible');
        this.refreshUserData();
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
      this.saveUserSession();
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      this.logger.info(`Signing in user: ${email}`);

      // In a real implementation, this would call your authentication API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const userData = await response.json();
        this.currentUser = userData.user;
        this.saveUserSession();

        // Log login attempt
        this.logLoginAttempt(email, true, 'password');

        this.logger.info('Sign in successful');
        return true;
      } else {
        this.logLoginAttempt(email, false, 'password');
        return false;
      }
    } catch (error) {
      this.logger.error('Sign in failed:', error);
      this.logLoginAttempt(email, false, 'password');
      return false;
    }
  }

  /**
   * Sign in with passkey
   */
  async signInWithPasskey(): Promise<boolean> {
    try {
      this.logger.info('Signing in with passkey');

      const credential = await this.webAuthnService.authenticateWithPasskey();
      if (!credential) {
        return false;
      }

      // In a real implementation, this would verify the credential with your server
      const response = await fetch('/api/auth/passkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (response.ok) {
        const userData = await response.json();
        this.currentUser = userData.user;
        this.saveUserSession();

        this.logLoginAttempt(userData.user.email, true, 'passkey');

        this.logger.info('Passkey sign in successful');
        return true;
      } else {
        this.logLoginAttempt('unknown', false, 'passkey');
        return false;
      }
    } catch (error) {
      this.logger.error('Passkey sign in failed:', error);
      this.logLoginAttempt('unknown', false, 'passkey');
      return false;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    marketingEmails: boolean;
  }): Promise<boolean> {
    try {
      this.logger.info(`Signing up user: ${userData.email}`);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        this.currentUser = newUser.user;
        this.saveUserSession();

        this.logger.info('Sign up successful');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error('Sign up failed:', error);
      return false;
    }
  }

  /**
   * Sign up with passkey
   */
  async signUpWithPasskey(userData: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<boolean> {
    try {
      this.logger.info(`Signing up with passkey: ${userData.email}`);

      const user = {
        id: crypto.randomUUID(),
        name: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        icon: undefined,
      };

      const credential = await this.webAuthnService.registerPasskey(user);
      if (!credential) {
        return false;
      }

      const response = await fetch('/api/auth/passkey-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userData, credential }),
      });

      if (response.ok) {
        const newUser = await response.json();
        this.currentUser = newUser.user;
        this.saveUserSession();

        this.logger.info('Passkey sign up successful');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error('Passkey sign up failed:', error);
      return false;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      this.logger.info('Signing out user');

      // Call sign out API
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear user session
      this.currentUser = null;
      localStorage.removeItem('user-session');

      this.logger.info('Sign out successful');
    } catch (error) {
      this.logger.error('Sign out failed:', error);
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(method: string, data: any): Promise<boolean> {
    try {
      this.logger.info(`Enabling 2FA with method: ${method}`);

      const success = await this.twoFactorAuthService.enable2FA(method, data);

      if (success && this.currentUser) {
        this.currentUser.security.twoFactorEnabled = true;
        this.saveUserSession();
      }

      return success;
    } catch (error) {
      this.logger.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(): Promise<boolean> {
    try {
      this.logger.info('Disabling 2FA');

      const success = await this.twoFactorAuthService.disable2FA();

      if (success && this.currentUser) {
        this.currentUser.security.twoFactorEnabled = false;
        this.saveUserSession();
      }

      return success;
    } catch (error) {
      this.logger.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  /**
   * Verify 2FA code
   */
  async verify2FACode(code: string, method: string): Promise<boolean> {
    try {
      this.logger.info(`Verifying 2FA code with method: ${method}`);

      let success = false;

      switch (method) {
        case 'totp':
          success = await this.twoFactorAuthService.verifyTOTPCode('', code);
          break;
        case 'sms':
          success = await this.twoFactorAuthService.verifySMSCode('', code);
          break;
        case 'email':
          success = await this.twoFactorAuthService.verifyEmailCode('', code);
          break;
        case 'backup':
          success = await this.twoFactorAuthService.verifyBackupCode(code);
          break;
        default:
          this.logger.error(`Unknown 2FA method: ${method}`);
          return false;
      }

      return success;
    } catch (error) {
      this.logger.error('Failed to verify 2FA code:', error);
      return false;
    }
  }

  /**
   * Log login attempt
   */
  private logLoginAttempt(email: string, success: boolean, method: string): void {
    if (!this.currentUser) return;

    const attempt: LoginAttempt = {
      timestamp: new Date(),
      ip: 'unknown', // In real implementation, get from request
      userAgent: navigator.userAgent,
      success,
      method: method as any,
    };

    this.currentUser.security.loginHistory.unshift(attempt);

    // Keep only last 10 attempts
    if (this.currentUser.security.loginHistory.length > 10) {
      this.currentUser.security.loginHistory = this.currentUser.security.loginHistory.slice(0, 10);
    }

    this.saveUserSession();
  }

  /**
   * Refresh user data
   */
  private async refreshUserData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        this.currentUser = { ...this.currentUser, ...userData };
        this.saveUserSession();
      }
    } catch (error) {
      this.logger.error('Failed to refresh user data:', error);
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    // In real implementation, get from secure storage
    return localStorage.getItem('auth-token') || '';
  }

  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    // In real implementation, use a proper notification system
    console.log(`Notification (${type}): ${message}`);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get app status
   */
  getAppStatus(): {
    isInitialized: boolean;
    isAuthenticated: boolean;
    pwaStatus: any;
    webAuthnStatus: any;
    twoFactorStatus: any;
    passwordManagerStatus: any;
  } {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated(),
      pwaStatus: this.pwaService.getPWAStatus(),
      webAuthnStatus: this.webAuthnService.getSupportStatus(),
      twoFactorStatus: this.twoFactorAuthService.getStatus(),
      passwordManagerStatus: this.passwordManagerService.getStatus(),
    };
  }

  /**
   * Create identity PWA HTML
   */
  createIdentityPWAHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="${this.config.pwa.themeColor}">
        <meta name="description" content="${this.config.pwa.description}">
        
        <title>${this.config.pwa.name}</title>
        
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
        
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${this.config.pwa.backgroundColor};
            color: #333;
          }
          
          .app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            background: ${this.config.pwa.themeColor};
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .main-content {
            flex: 1;
            padding: 2rem;
          }
          
          .auth-container {
            max-width: 400px;
            margin: 0 auto;
          }
          
          .pwa-install-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${this.config.pwa.themeColor};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            display: none;
            z-index: 1000;
          }
          
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <header class="header">
            <h1>${this.config.pwa.name}</h1>
            <div id="user-info"></div>
          </header>
          
          <main class="main-content">
            <div id="app-content">
              <div class="auth-container">
                <h2>Welcome to LightDom</h2>
                <p>Advanced web optimization with secure identity management</p>
                
                <div id="auth-forms"></div>
              </div>
            </div>
          </main>
        </div>
        
        <button id="pwa-install-button" class="pwa-install-button">
          Install App
        </button>
        
        <script>
          // Identity PWA App will be initialized here
          console.log('Identity PWA App loaded');
        </script>
      </body>
      </html>
    `;
  }
}

export default IdentityPWAApp;
