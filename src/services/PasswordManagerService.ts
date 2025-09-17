import { Logger } from '../utils/Logger';

export interface PasswordManagerConfig {
  changePasswordUrl: string;
  digitalAssetLinks: DigitalAssetLink[];
  autofillSelectors: string[];
}

export interface DigitalAssetLink {
  relation: string[];
  target: {
    namespace: string;
    package_name?: string;
    sha256_cert_fingerprints?: string[];
  };
}

export interface PasswordManagerStatus {
  isSupported: boolean;
  hasCredentials: boolean;
  canAutofill: boolean;
  canSave: boolean;
}

export interface CredentialInfo {
  username: string;
  password: string;
  url: string;
  lastUsed: Date;
  isSecure: boolean;
}

export class PasswordManagerService {
  private logger: Logger;
  private config: PasswordManagerConfig;
  private isSupported: boolean = false;

  constructor(config: PasswordManagerConfig) {
    this.logger = new Logger('PasswordManagerService');
    this.config = config;
    this.checkSupport();
  }

  /**
   * Check if password manager features are supported
   */
  private checkSupport(): void {
    this.isSupported = !!(
      'credentials' in navigator &&
      'password' in HTMLInputElement.prototype
    );

    if (!this.isSupported) {
      this.logger.warn('Password manager features not fully supported');
    } else {
      this.logger.info('Password manager features supported');
    }
  }

  /**
   * Setup password change URL
   */
  setupPasswordChangeURL(): void {
    try {
      // Create .well-known/change-password endpoint
      const changePasswordUrl = this.config.changePasswordUrl;
      
      // Add meta tag for password managers
      const metaTag = document.createElement('meta');
      metaTag.name = 'password-change-url';
      metaTag.content = changePasswordUrl;
      document.head.appendChild(metaTag);

      this.logger.info(`Password change URL set to: ${changePasswordUrl}`);
    } catch (error) {
      this.logger.error('Failed to setup password change URL:', error);
    }
  }

  /**
   * Setup digital asset links for credential sharing
   */
  setupDigitalAssetLinks(): void {
    try {
      const assetLinks = this.config.digitalAssetLinks;
      
      // Create digital asset links JSON
      const assetLinksJson = {
        relation: assetLinks.flatMap(link => link.relation),
        target: assetLinks.map(link => link.target)
      };

      // Store in sessionStorage for reference
      sessionStorage.setItem('digital-asset-links', JSON.stringify(assetLinksJson));
      
      this.logger.info('Digital asset links configured');
    } catch (error) {
      this.logger.error('Failed to setup digital asset links:', error);
    }
  }

  /**
   * Setup form autofill
   */
  setupFormAutofill(): void {
    try {
      this.logger.info('Setting up form autofill');

      // Find all forms
      const forms = document.querySelectorAll('form');
      
      forms.forEach((form, index) => {
        this.setupFormAutofillForForm(form, index);
      });

      // Watch for dynamically added forms
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'FORM') {
                this.setupFormAutofillForForm(element as HTMLFormElement, Date.now());
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.logger.info('Form autofill setup completed');
    } catch (error) {
      this.logger.error('Failed to setup form autofill:', error);
    }
  }

  /**
   * Setup autofill for a specific form
   */
  private setupFormAutofillForForm(form: HTMLFormElement, index: number): void {
    try {
      // Find username/email field
      const usernameField = this.findField(form, ['username', 'email', 'user']);
      if (usernameField) {
        usernameField.setAttribute('autocomplete', 'username');
        usernameField.setAttribute('data-password-manager', 'username');
      }

      // Find password field
      const passwordField = this.findField(form, ['password', 'pass', 'pwd']);
      if (passwordField) {
        passwordField.setAttribute('autocomplete', 'current-password');
        passwordField.setAttribute('data-password-manager', 'password');
      }

      // Find new password field
      const newPasswordField = this.findField(form, ['new-password', 'newPassword', 'new_password']);
      if (newPasswordField) {
        newPasswordField.setAttribute('autocomplete', 'new-password');
        newPasswordField.setAttribute('data-password-manager', 'new-password');
      }

      // Find confirm password field
      const confirmPasswordField = this.findField(form, ['confirm-password', 'confirmPassword', 'confirm_password']);
      if (confirmPasswordField) {
        confirmPasswordField.setAttribute('autocomplete', 'new-password');
        confirmPasswordField.setAttribute('data-password-manager', 'confirm-password');
      }

      // Add form submission handler
      form.addEventListener('submit', (e) => {
        this.handleFormSubmission(form, e);
      });

      this.logger.info(`Form ${index} autofill configured`);
    } catch (error) {
      this.logger.error(`Failed to setup autofill for form ${index}:`, error);
    }
  }

  /**
   * Find field by name patterns
   */
  private findField(form: HTMLFormElement, patterns: string[]): HTMLInputElement | null {
    for (const pattern of patterns) {
      // Try by name
      let field = form.querySelector(`input[name="${pattern}"]`) as HTMLInputElement;
      if (field) return field;

      // Try by id
      field = form.querySelector(`input[id="${pattern}"]`) as HTMLInputElement;
      if (field) return field;

      // Try by placeholder
      field = form.querySelector(`input[placeholder*="${pattern}"]`) as HTMLInputElement;
      if (field) return field;

      // Try by type
      if (pattern === 'password') {
        field = form.querySelector('input[type="password"]') as HTMLInputElement;
        if (field) return field;
      }
    }
    return null;
  }

  /**
   * Handle form submission
   */
  private handleFormSubmission(form: HTMLFormElement, event: Event): void {
    try {
      const formData = new FormData(form);
      const username = formData.get('username') || formData.get('email');
      const password = formData.get('password');

      if (username && password) {
        this.logger.info('Form submitted with credentials');
        // In a real implementation, you might want to notify the password manager
        // about successful login for credential saving
      }
    } catch (error) {
      this.logger.error('Failed to handle form submission:', error);
    }
  }

  /**
   * Save credentials to password manager
   */
  async saveCredentials(credentials: CredentialInfo): Promise<boolean> {
    if (!this.isSupported) {
      this.logger.warn('Password manager not supported, cannot save credentials');
      return false;
    }

    try {
      const credential = new PasswordCredential({
        id: credentials.username,
        password: credentials.password,
        name: credentials.username,
        iconURL: `${window.location.origin}/favicon.ico`
      });

      await navigator.credentials.store(credential);
      this.logger.info('Credentials saved to password manager');
      return true;
    } catch (error) {
      this.logger.error('Failed to save credentials:', error);
      return false;
    }
  }

  /**
   * Get saved credentials
   */
  async getSavedCredentials(): Promise<CredentialInfo[]> {
    if (!this.isSupported) {
      this.logger.warn('Password manager not supported, cannot get credentials');
      return [];
    }

    try {
      const credentials = await navigator.credentials.getAll({
        password: true
      });

      return credentials.map(cred => ({
        username: cred.id,
        password: (cred as PasswordCredential).password,
        url: window.location.origin,
        lastUsed: new Date(),
        isSecure: window.location.protocol === 'https:'
      }));
    } catch (error) {
      this.logger.error('Failed to get saved credentials:', error);
      return [];
    }
  }

  /**
   * Check if credentials exist for current site
   */
  async hasCredentials(): Promise<boolean> {
    const credentials = await this.getSavedCredentials();
    return credentials.length > 0;
  }

  /**
   * Update password in password manager
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      // Get existing credentials
      const credentials = await this.getSavedCredentials();
      
      if (credentials.length === 0) {
        this.logger.warn('No existing credentials to update');
        return false;
      }

      // Update the first credential (in real implementation, you'd identify the correct one)
      const credential = credentials[0];
      credential.password = newPassword;

      // Save updated credential
      const success = await this.saveCredentials(credential);
      
      if (success) {
        this.logger.info('Password updated in password manager');
      }
      
      return success;
    } catch (error) {
      this.logger.error('Failed to update password:', error);
      return false;
    }
  }

  /**
   * Delete credentials from password manager
   */
  async deleteCredentials(): Promise<boolean> {
    if (!this.isSupported) {
      this.logger.warn('Password manager not supported, cannot delete credentials');
      return false;
    }

    try {
      // Note: There's no direct way to delete credentials via the Credential Management API
      // This would typically be handled by the password manager itself
      this.logger.info('Credentials deletion requested (handled by password manager)');
      return true;
    } catch (error) {
      this.logger.error('Failed to delete credentials:', error);
      return false;
    }
  }

  /**
   * Setup password strength indicator
   */
  setupPasswordStrengthIndicator(inputSelector: string): void {
    const passwordInput = document.querySelector(inputSelector) as HTMLInputElement;
    if (!passwordInput) return;

    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength-indicator';
    strengthIndicator.innerHTML = `
      <div class="strength-bar">
        <div class="strength-fill"></div>
      </div>
      <span class="strength-text">Password strength</span>
    `;

    passwordInput.parentNode?.insertBefore(strengthIndicator, passwordInput.nextSibling);

    passwordInput.addEventListener('input', () => {
      const strength = this.calculatePasswordStrength(passwordInput.value);
      this.updatePasswordStrengthIndicator(strengthIndicator, strength);
    });
  }

  /**
   * Calculate password strength
   */
  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  }

  /**
   * Update password strength indicator
   */
  private updatePasswordStrengthIndicator(indicator: HTMLElement, strength: number): void {
    const fill = indicator.querySelector('.strength-fill') as HTMLElement;
    const text = indicator.querySelector('.strength-text') as HTMLElement;
    
    if (!fill || !text) return;

    const percentage = (strength / 6) * 100;
    fill.style.width = `${percentage}%`;

    const colors = ['#e74c3c', '#f39c12', '#f39c12', '#27ae60', '#27ae60', '#2ecc71'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    
    fill.style.backgroundColor = colors[Math.min(strength, 5)];
    text.textContent = labels[Math.min(strength, 5)];
  }

  /**
   * Get password manager status
   */
  getStatus(): PasswordManagerStatus {
    return {
      isSupported: this.isSupported,
      hasCredentials: false, // Will be updated by hasCredentials()
      canAutofill: this.isSupported,
      canSave: this.isSupported
    };
  }

  /**
   * Update status
   */
  async updateStatus(): Promise<void> {
    const hasCreds = await this.hasCredentials();
    this.logger.info(`Password manager status updated - Has credentials: ${hasCreds}`);
  }

  /**
   * Create password manager HTML template
   */
  createPasswordManagerHTML(): string {
    return `
      <div class="password-manager-info">
        <h3>Password Manager Integration</h3>
        <div class="features">
          <div class="feature">
            <span class="icon">🔐</span>
            <span>Automatic form filling</span>
          </div>
          <div class="feature">
            <span class="icon">💾</span>
            <span>Secure credential storage</span>
          </div>
          <div class="feature">
            <span class="icon">🔄</span>
            <span>Password updates</span>
          </div>
          <div class="feature">
            <span class="icon">🔗</span>
            <span>Cross-device sync</span>
          </div>
        </div>
        <div class="actions">
          <button id="change-password-btn" class="btn btn-primary">
            Change Password
          </button>
          <button id="manage-credentials-btn" class="btn btn-secondary">
            Manage Credentials
          </button>
        </div>
      </div>
    `;
  }
}

export default PasswordManagerService;
