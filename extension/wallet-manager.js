// LightDom Wallet Manager v1.0
// Handles wallet creation, encryption, and authentication

class WalletManager {
  constructor() {
    this.wallet = null;
    this.isUnlocked = false;
  }

  /**
   * Generate a new wallet with address and private key
   * @returns {Object} { address, privateKey, mnemonic }
   */
  async generateWallet() {
    try {
      // Generate random bytes for private key (32 bytes = 256 bits)
      const privateKeyBytes = new Uint8Array(32);
      crypto.getRandomValues(privateKeyBytes);

      // Convert to hex string
      const privateKey = this.bytesToHex(privateKeyBytes);

      // Generate address from private key (simplified Ethereum-style)
      const address = await this.generateAddress(privateKeyBytes);

      // Generate mnemonic (12 word seed phrase)
      const mnemonic = await this.generateMnemonic();

      const wallet = {
        address,
        privateKey,
        mnemonic,
        createdAt: Date.now()
      };

      this.wallet = wallet;

      return wallet;
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      throw new Error('Wallet generation failed');
    }
  }

  /**
   * Generate Ethereum-style address from private key
   * @param {Uint8Array} privateKeyBytes
   * @returns {string} Ethereum address
   */
  async generateAddress(privateKeyBytes) {
    // Import the private key for signing
    const key = await crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Export as JWK to get coordinates
    const jwk = await crypto.subtle.exportKey('jwk', key);

    // Create address from key coordinates (simplified)
    const addressBytes = new Uint8Array(20);
    crypto.getRandomValues(addressBytes);

    // Use first 20 bytes of hash for address (Ethereum-style)
    const hashBuffer = await crypto.subtle.digest('SHA-256', privateKeyBytes);
    const hashArray = new Uint8Array(hashBuffer);
    const address = '0x' + this.bytesToHex(hashArray.slice(12, 32));

    return address;
  }

  /**
   * Generate a 12-word mnemonic phrase
   * @returns {string} Space-separated mnemonic words
   */
  async generateMnemonic() {
    // Simple word list (BIP39 subset for demo)
    const wordList = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
      'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
      'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
      'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
      'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
      'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
      'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
      'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
      'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
      'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
      'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
      'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
      'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
      'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
      'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
      'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
      'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
      'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
      'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
      'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
      'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
      'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
      'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
      'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
      'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
      'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
      'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
      'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable',
      'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can'
    ];

    const words = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      words.push(wordList[randomIndex]);
    }

    return words.join(' ');
  }

  /**
   * Import wallet from private key or mnemonic
   * @param {string} secret - Private key or mnemonic phrase
   * @returns {Object} Wallet object
   */
  async importWallet(secret) {
    try {
      secret = secret.trim();

      // Check if it's a mnemonic (multiple words) or private key (hex)
      const isMnemonic = secret.split(' ').length >= 12;

      if (isMnemonic) {
        return await this.importFromMnemonic(secret);
      } else {
        return await this.importFromPrivateKey(secret);
      }
    } catch (error) {
      console.error('Failed to import wallet:', error);
      throw new Error('Invalid wallet credentials');
    }
  }

  /**
   * Import from mnemonic phrase
   * @param {string} mnemonic
   * @returns {Object} Wallet object
   */
  async importFromMnemonic(mnemonic) {
    // In a real implementation, we'd derive the private key from mnemonic using BIP39
    // For now, generate a deterministic key from the mnemonic hash
    const encoder = new TextEncoder();
    const data = encoder.encode(mnemonic);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);

    const privateKey = this.bytesToHex(hashArray);
    const address = await this.generateAddress(hashArray);

    const wallet = {
      address,
      privateKey,
      mnemonic,
      createdAt: Date.now()
    };

    this.wallet = wallet;
    return wallet;
  }

  /**
   * Import from private key
   * @param {string} privateKey
   * @returns {Object} Wallet object
   */
  async importFromPrivateKey(privateKey) {
    // Remove 0x prefix if present
    privateKey = privateKey.replace(/^0x/, '');

    // Validate hex string
    if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error('Invalid private key format');
    }

    const privateKeyBytes = this.hexToBytes(privateKey);
    const address = await this.generateAddress(privateKeyBytes);

    const wallet = {
      address,
      privateKey: '0x' + privateKey,
      mnemonic: '', // No mnemonic when importing from private key
      createdAt: Date.now()
    };

    this.wallet = wallet;
    return wallet;
  }

  /**
   * Encrypt wallet with password
   * @param {Object} wallet
   * @param {string} password
   * @returns {string} Encrypted wallet JSON
   */
  async encryptWallet(wallet, password) {
    try {
      // Derive key from password
      const passwordKey = await this.deriveKeyFromPassword(password);

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt wallet data
      const encoder = new TextEncoder();
      const walletJson = JSON.stringify(wallet);
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        passwordKey,
        encoder.encode(walletJson)
      );

      // Combine IV and encrypted data
      const encryptedWallet = {
        iv: this.bytesToHex(iv),
        data: this.bytesToHex(new Uint8Array(encryptedData)),
        version: 1
      };

      return JSON.stringify(encryptedWallet);
    } catch (error) {
      console.error('Failed to encrypt wallet:', error);
      throw new Error('Wallet encryption failed');
    }
  }

  /**
   * Decrypt wallet with password
   * @param {string} encryptedWalletJson
   * @param {string} password
   * @returns {Object} Decrypted wallet
   */
  async decryptWallet(encryptedWalletJson, password) {
    try {
      const encryptedWallet = JSON.parse(encryptedWalletJson);

      // Derive key from password
      const passwordKey = await this.deriveKeyFromPassword(password);

      // Decrypt data
      const iv = this.hexToBytes(encryptedWallet.iv);
      const encryptedData = this.hexToBytes(encryptedWallet.data);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        passwordKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const walletJson = decoder.decode(decryptedData);
      const wallet = JSON.parse(walletJson);

      this.wallet = wallet;
      this.isUnlocked = true;

      return wallet;
    } catch (error) {
      console.error('Failed to decrypt wallet:', error);
      throw new Error('Invalid password or corrupted wallet');
    }
  }

  /**
   * Derive encryption key from password
   * @param {string} password
   * @returns {CryptoKey}
   */
  async deriveKeyFromPassword(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2
    const salt = encoder.encode('lightdom-wallet-salt'); // In production, use random salt
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  }

  /**
   * Save wallet to Chrome storage (encrypted)
   * @param {string} password
   */
  async saveWallet(password) {
    try {
      const encryptedWallet = await this.encryptWallet(this.wallet, password);

      await chrome.storage.local.set({
        encryptedWallet,
        walletAddress: this.wallet.address,
        hasWallet: true
      });

      return true;
    } catch (error) {
      console.error('Failed to save wallet:', error);
      throw new Error('Failed to save wallet');
    }
  }

  /**
   * Load wallet from Chrome storage
   * @param {string} password
   */
  async loadWallet(password) {
    try {
      const result = await chrome.storage.local.get(['encryptedWallet']);

      if (!result.encryptedWallet) {
        throw new Error('No wallet found');
      }

      const wallet = await this.decryptWallet(result.encryptedWallet, password);
      return wallet;
    } catch (error) {
      console.error('Failed to load wallet:', error);
      throw error;
    }
  }

  /**
   * Check if wallet exists in storage
   */
  async hasWallet() {
    try {
      const result = await chrome.storage.local.get(['hasWallet']);
      return !!result.hasWallet;
    } catch (error) {
      console.error('Failed to check wallet:', error);
      return false;
    }
  }

  /**
   * Sign message with wallet
   * @param {string} message
   * @returns {string} Signature
   */
  async signMessage(message) {
    if (!this.wallet || !this.isUnlocked) {
      throw new Error('Wallet is locked');
    }

    // Simple signature using SHA-256 (in production, use proper ECDSA)
    const encoder = new TextEncoder();
    const data = encoder.encode(message + this.wallet.privateKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return '0x' + this.bytesToHex(new Uint8Array(hashBuffer));
  }

  /**
   * Lock wallet (clear from memory)
   */
  lockWallet() {
    this.wallet = null;
    this.isUnlocked = false;
  }

  // Helper methods
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalletManager;
}
