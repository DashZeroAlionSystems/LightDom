import { Logger } from '../utils/Logger';

export interface WebOTPConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface OTPMessage {
  code: string;
  timestamp: number;
  origin: string;
}

export interface OTPFormElement extends HTMLInputElement {
  autocomplete: 'one-time-code';
}

export class WebOTPService {
  private logger: Logger;
  private config: WebOTPService;
  private isSupported: boolean = false;
  private abortController: AbortController | null = null;

  constructor(config: WebOTPConfig = {}) {
    this.logger = new Logger('WebOTPService');
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
    this.checkSupport();
  }

  /**
   * Check if WebOTP API is supported
   */
  private checkSupport(): void {
    this.isSupported = !!(
      'OTPCredential' in window &&
      'OTPCredential' in window &&
      'OTPCredential' in window
    );

    if (!this.isSupported) {
      this.logger.warn('WebOTP API is not supported in this browser');
    } else {
      this.logger.info('WebOTP API is supported');
    }
  }

  /**
   * Get OTP from SMS message
   */
  async getOTPFromSMS(): Promise<string | null> {
    if (!this.isSupported) {
      throw new Error('WebOTP API is not supported');
    }

    try {
      this.logger.info('Requesting OTP from SMS');

      this.abortController = new AbortController();
      
      const otpCredential = await navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: this.abortController.signal,
      }) as OTPCredential;

      if (!otpCredential || !otpCredential.code) {
        throw new Error('No OTP received');
      }

      this.logger.info('OTP received from SMS');
      return otpCredential.code;

    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.info('OTP request aborted');
        return null;
      }
      
      this.logger.error('Failed to get OTP from SMS:', error);
      throw error;
    }
  }

  /**
   * Auto-fill OTP in form
   */
  async autoFillOTP(formSelector: string = 'form'): Promise<boolean> {
    if (!this.isSupported) {
      this.logger.warn('WebOTP API not supported, cannot auto-fill');
      return false;
    }

    try {
      this.logger.info('Setting up OTP auto-fill');

      const form = document.querySelector(formSelector) as HTMLFormElement;
      if (!form) {
        throw new Error('Form not found');
      }

      // Find OTP input field
      const otpInput = form.querySelector('input[autocomplete="one-time-code"]') as OTPFormElement;
      if (!otpInput) {
        throw new Error('OTP input field not found');
      }

      // Set up OTP credential request
      const otpCredential = await navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: this.abortController?.signal,
      }) as OTPCredential;

      if (otpCredential && otpCredential.code) {
        otpInput.value = otpCredential.code;
        
        // Trigger input event
        otpInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Trigger change event
        otpInput.dispatchEvent(new Event('change', { bubbles: true }));

        this.logger.info('OTP auto-filled successfully');
        return true;
      }

      return false;

    } catch (error) {
      this.logger.error('Failed to auto-fill OTP:', error);
      return false;
    }
  }

  /**
   * Set up OTP form with auto-fill
   */
  setupOTPForm(formSelector: string = 'form'): void {
    if (!this.isSupported) {
      this.logger.warn('WebOTP API not supported, cannot setup auto-fill');
      return;
    }

    try {
      const form = document.querySelector(formSelector) as HTMLFormElement;
      if (!form) {
        throw new Error('Form not found');
      }

      // Find or create OTP input
      let otpInput = form.querySelector('input[autocomplete="one-time-code"]') as OTPFormElement;
      
      if (!otpInput) {
        otpInput = document.createElement('input') as OTPFormElement;
        otpInput.type = 'text';
        otpInput.autocomplete = 'one-time-code';
        otpInput.placeholder = 'Enter verification code';
        otpInput.maxLength = 6;
        otpInput.pattern = '[0-9]{6}';
        otpInput.required = true;
        
        form.appendChild(otpInput);
      }

      // Add event listeners
      otpInput.addEventListener('focus', () => {
        this.logger.info('OTP input focused, attempting auto-fill');
        this.autoFillOTP(formSelector);
      });

      // Add visual indicator
      otpInput.style.border = '2px solid #4285f4';
      otpInput.style.borderRadius = '4px';
      otpInput.style.padding = '8px';

      this.logger.info('OTP form setup completed');

    } catch (error) {
      this.logger.error('Failed to setup OTP form:', error);
    }
  }

  /**
   * Send OTP request (mock implementation)
   */
  async sendOTPRequest(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.info(`Sending OTP request to ${phoneNumber}`);

      // In a real implementation, this would call your backend API
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.logger.info('OTP request sent successfully');
      return true;

    } catch (error) {
      this.logger.error('Failed to send OTP request:', error);
      return false;
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(code: string, phoneNumber: string): Promise<boolean> {
    try {
      this.logger.info(`Verifying OTP code for ${phoneNumber}`);

      // In a real implementation, this would call your backend API
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock verification - in real implementation, check against server
      const isValid = code.length === 6 && /^\d{6}$/.test(code);
      
      if (isValid) {
        this.logger.info('OTP verification successful');
      } else {
        this.logger.warn('OTP verification failed');
      }

      return isValid;

    } catch (error) {
      this.logger.error('Failed to verify OTP:', error);
      return false;
    }
  }

  /**
   * Cancel OTP request
   */
  cancelOTPRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.logger.info('OTP request cancelled');
    }
  }

  /**
   * Get support status
   */
  getSupportStatus(): {
    webOTP: boolean;
    smsTransport: boolean;
  } {
    return {
      webOTP: this.isSupported,
      smsTransport: this.isSupported,
    };
  }

  /**
   * Create OTP form HTML
   */
  createOTPFormHTML(): string {
    return `
      <form id="otp-form" class="otp-form">
        <div class="form-group">
          <label for="phone-number">Phone Number</label>
          <input 
            type="tel" 
            id="phone-number" 
            name="phoneNumber" 
            autocomplete="tel"
            placeholder="+1234567890"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="otp-code">Verification Code</label>
          <input 
            type="text" 
            id="otp-code" 
            name="otpCode" 
            autocomplete="one-time-code"
            placeholder="Enter 6-digit code"
            maxlength="6"
            pattern="[0-9]{6}"
            required
          />
          <small class="help-text">
            We'll send you a verification code via SMS
          </small>
        </div>
        
        <div class="form-actions">
          <button type="button" id="send-otp" class="btn btn-secondary">
            Send Code
          </button>
          <button type="submit" id="verify-otp" class="btn btn-primary">
            Verify Code
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Setup OTP form with event handlers
   */
  setupOTPFormWithHandlers(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }

    // Add form HTML
    container.innerHTML = this.createOTPFormHTML();

    // Setup form
    this.setupOTPForm('#otp-form');

    // Add event handlers
    const sendButton = document.getElementById('send-otp');
    const verifyButton = document.getElementById('verify-otp');
    const phoneInput = document.getElementById('phone-number') as HTMLInputElement;
    const otpInput = document.getElementById('otp-code') as HTMLInputElement;

    if (sendButton && phoneInput) {
      sendButton.addEventListener('click', async () => {
        const phoneNumber = phoneInput.value;
        if (phoneNumber) {
          const success = await this.sendOTPRequest(phoneNumber);
          if (success) {
            sendButton.textContent = 'Code Sent';
            sendButton.disabled = true;
            otpInput.focus();
          }
        }
      });
    }

    if (verifyButton && otpInput) {
      verifyButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const phoneNumber = phoneInput.value;
        const code = otpInput.value;
        
        if (phoneNumber && code) {
          const isValid = await this.verifyOTP(code, phoneNumber);
          if (isValid) {
            this.logger.info('OTP verification successful');
            // Handle successful verification
          } else {
            this.logger.warn('OTP verification failed');
            // Handle verification failure
          }
        }
      });
    }
  }
}

export default WebOTPService;
