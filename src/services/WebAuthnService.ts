import { Logger } from '../utils/Logger';

export interface WebAuthnCredential {
  id: string;
  type: 'public-key';
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
}

export interface WebAuthnUser {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
}

export interface WebAuthnConfig {
  rpId: string;
  rpName: string;
  origin: string;
  timeout?: number;
  challengeLength?: number;
}

export interface PasskeyRegistrationOptions {
  user: WebAuthnUser;
  challenge: ArrayBuffer;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
  extensions?: AuthenticationExtensionsClientInputs;
}

export interface PasskeyAuthenticationOptions {
  challenge: ArrayBuffer;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
  extensions?: AuthenticationExtensionsClientInputs;
}

export class WebAuthnService {
  private logger: Logger;
  private config: WebAuthnConfig;
  private isSupported: boolean = false;

  constructor(config: WebAuthnConfig) {
    this.logger = new Logger('WebAuthnService');
    this.config = {
      timeout: 60000,
      challengeLength: 32,
      ...config,
    };
    this.checkSupport();
  }

  /**
   * Check if WebAuthn is supported
   */
  private checkSupport(): void {
    this.isSupported = !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      window.navigator.credentials.create &&
      window.navigator.credentials.get
    );

    if (!this.isSupported) {
      this.logger.warn('WebAuthn is not supported in this browser');
    } else {
      this.logger.info('WebAuthn is supported');
    }
  }

  /**
   * Check if passkeys are supported
   */
  async isPasskeySupported(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      this.logger.info(`Passkey support: ${available}`);
      return available;
    } catch (error) {
      this.logger.error('Error checking passkey support:', error);
      return false;
    }
  }

  /**
   * Generate a random challenge
   */
  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(this.config.challengeLength!);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  /**
   * Convert ArrayBuffer to Base64URL
   */
  private arrayBufferToBase64URL(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Convert Base64URL to ArrayBuffer
   */
  private base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');

    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * Register a new passkey
   */
  async registerPasskey(user: WebAuthnUser): Promise<WebAuthnCredential | null> {
    if (!this.isSupported) {
      throw new Error('WebAuthn is not supported');
    }

    try {
      this.logger.info(`Registering passkey for user: ${user.name}`);

      const challenge = this.generateChallenge();
      const userId = new TextEncoder().encode(user.id);

      const options: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            id: this.config.rpId,
            name: this.config.rpName,
          },
          user: {
            id: userId,
            name: user.name,
            displayName: user.displayName,
            icon: user.icon,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
          },
          timeout: this.config.timeout,
          attestation: 'none',
        },
      };

      const credential = (await navigator.credentials.create(options)) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      const webAuthnCredential: WebAuthnCredential = {
        id: credential.id,
        type: credential.type,
        rawId: credential.rawId,
        response,
      };

      this.logger.info('Passkey registered successfully');
      return webAuthnCredential;
    } catch (error) {
      this.logger.error('Failed to register passkey:', error);
      throw error;
    }
  }

  /**
   * Authenticate with passkey
   */
  async authenticateWithPasskey(credentialId?: string): Promise<WebAuthnCredential | null> {
    if (!this.isSupported) {
      throw new Error('WebAuthn is not supported');
    }

    try {
      this.logger.info('Authenticating with passkey');

      const challenge = this.generateChallenge();

      const options: CredentialRequestOptions = {
        publicKey: {
          challenge,
          rpId: this.config.rpId,
          timeout: this.config.timeout,
          userVerification: 'required',
          allowCredentials: credentialId
            ? [
                {
                  type: 'public-key',
                  id: this.base64URLToArrayBuffer(credentialId),
                  transports: ['internal'],
                },
              ]
            : undefined,
        },
      };

      const credential = (await navigator.credentials.get(options)) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      const webAuthnCredential: WebAuthnCredential = {
        id: credential.id,
        type: credential.type,
        rawId: credential.rawId,
        response,
      };

      this.logger.info('Passkey authentication successful');
      return webAuthnCredential;
    } catch (error) {
      this.logger.error('Failed to authenticate with passkey:', error);
      throw error;
    }
  }

  /**
   * Get available passkeys
   */
  async getAvailablePasskeys(): Promise<PublicKeyCredentialDescriptor[]> {
    if (!this.isSupported) {
      return [];
    }

    try {
      // This would typically be stored on the server
      // For now, return empty array
      return [];
    } catch (error) {
      this.logger.error('Failed to get available passkeys:', error);
      return [];
    }
  }

  /**
   * Check if user has passkeys
   */
  async hasPasskeys(): Promise<boolean> {
    const passkeys = await this.getAvailablePasskeys();
    return passkeys.length > 0;
  }

  /**
   * Get credential info for display
   */
  getCredentialInfo(credential: WebAuthnCredential): any {
    return {
      id: credential.id,
      type: credential.type,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
  }

  /**
   * Validate credential response
   */
  validateCredentialResponse(credential: WebAuthnCredential): boolean {
    try {
      if (!credential.id || !credential.rawId || !credential.response) {
        return false;
      }

      if (credential.type !== 'public-key') {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to validate credential response:', error);
      return false;
    }
  }

  /**
   * Get support status
   */
  getSupportStatus(): {
    webAuthn: boolean;
    passkeys: boolean;
    platformAuthenticator: boolean;
  } {
    return {
      webAuthn: this.isSupported,
      passkeys: false, // Will be updated by isPasskeySupported()
      platformAuthenticator: false, // Will be updated by isPasskeySupported()
    };
  }

  /**
   * Update support status
   */
  async updateSupportStatus(): Promise<void> {
    const passkeySupported = await this.isPasskeySupported();
    this.logger.info(`Updated support status - Passkeys: ${passkeySupported}`);
  }
}

export default WebAuthnService;
