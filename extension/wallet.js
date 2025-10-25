// LightDom Wallet UI Controller
class WalletUI {
  constructor() {
    this.walletManager = new WalletManager();
    this.qrGenerator = new QRCodeGenerator();
    this.currentWallet = null;
    this.secretsVisible = false;

    this.init();
  }

  async init() {
    console.log('LightDom Wallet UI loaded');

    // Setup event listeners
    this.setupEventListeners();

    // Check if wallet exists
    await this.checkWalletStatus();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Password visibility toggles
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
      btn.addEventListener('click', (e) => this.togglePasswordVisibility(e.target.dataset.target));
    });

    // Create wallet
    document.getElementById('createWalletBtn')?.addEventListener('click', () => this.createWallet());

    // Import wallet
    document.getElementById('importWalletBtn')?.addEventListener('click', () => this.importWallet());

    // Unlock wallet
    document.getElementById('unlockWalletBtn')?.addEventListener('click', () => this.unlockWallet());

    // Lock wallet
    document.getElementById('lockWalletBtn')?.addEventListener('click', () => this.lockWallet());

    // Copy buttons
    document.getElementById('copyAddressBtn')?.addEventListener('click', () => this.copyAddress());
    document.getElementById('copyMnemonicBtn')?.addEventListener('click', () => this.copyMnemonic());
    document.getElementById('copyPrivateKeyBtn')?.addEventListener('click', () => this.copyPrivateKey());

    // Secret visibility
    document.getElementById('toggleSecretBtn')?.addEventListener('click', () => this.toggleSecretSection());
    document.getElementById('unmaskSecretsBtn')?.addEventListener('click', () => this.unmaskSecrets());
    document.getElementById('maskSecretsBtn')?.addEventListener('click', () => this.maskSecrets());

    // Open dashboard
    document.getElementById('openDashboardBtn')?.addEventListener('click', () => this.openDashboard());

    // Enter key handlers
    document.getElementById('unlockPassword')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.unlockWallet();
    });

    document.getElementById('createPassword')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.createWallet();
    });
  }

  async checkWalletStatus() {
    try {
      const hasWallet = await this.walletManager.hasWallet();

      this.hideScreen('initialScreen');

      if (hasWallet) {
        this.showScreen('unlockScreen');
      } else {
        this.showScreen('noWalletScreen');
      }
    } catch (error) {
      console.error('Failed to check wallet status:', error);
      this.showError('Failed to check wallet status');
      this.showScreen('noWalletScreen');
    }
  }

  async createWallet() {
    try {
      const password = document.getElementById('createPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validation
      if (!password || password.length < 8) {
        this.showError('Password must be at least 8 characters');
        return;
      }

      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return;
      }

      // Show loading
      const btn = document.getElementById('createWalletBtn');
      btn.disabled = true;
      btn.textContent = 'Creating Wallet...';

      // Generate wallet
      const wallet = await this.walletManager.generateWallet();
      console.log('Wallet generated:', wallet.address);

      // Save encrypted wallet
      await this.walletManager.saveWallet(password);

      // Update background service
      await chrome.runtime.sendMessage({
        type: 'SET_USER_ADDRESS',
        address: wallet.address
      });

      // Show wallet
      this.currentWallet = wallet;
      this.displayWallet(wallet);
      this.showSuccess('Wallet created successfully!');

      // Clear inputs
      document.getElementById('createPassword').value = '';
      document.getElementById('confirmPassword').value = '';

    } catch (error) {
      console.error('Failed to create wallet:', error);
      this.showError('Failed to create wallet: ' + error.message);
    } finally {
      const btn = document.getElementById('createWalletBtn');
      btn.disabled = false;
      btn.textContent = 'Create Wallet';
    }
  }

  async importWallet() {
    try {
      const secret = document.getElementById('importSecret').value;
      const password = document.getElementById('importPassword').value;

      // Validation
      if (!secret || secret.trim().length === 0) {
        this.showError('Please enter your recovery phrase or private key');
        return;
      }

      if (!password || password.length < 8) {
        this.showError('Password must be at least 8 characters');
        return;
      }

      // Show loading
      const btn = document.getElementById('importWalletBtn');
      btn.disabled = true;
      btn.textContent = 'Importing Wallet...';

      // Import wallet
      const wallet = await this.walletManager.importWallet(secret);
      console.log('Wallet imported:', wallet.address);

      // Save encrypted wallet
      await this.walletManager.saveWallet(password);

      // Update background service
      await chrome.runtime.sendMessage({
        type: 'SET_USER_ADDRESS',
        address: wallet.address
      });

      // Show wallet
      this.currentWallet = wallet;
      this.displayWallet(wallet);
      this.showSuccess('Wallet imported successfully!');

      // Clear inputs
      document.getElementById('importSecret').value = '';
      document.getElementById('importPassword').value = '';

    } catch (error) {
      console.error('Failed to import wallet:', error);
      this.showError('Failed to import wallet: ' + error.message);
    } finally {
      const btn = document.getElementById('importWalletBtn');
      btn.disabled = false;
      btn.textContent = 'Import Wallet';
    }
  }

  async unlockWallet() {
    try {
      const password = document.getElementById('unlockPassword').value;

      if (!password) {
        this.showError('Please enter your password');
        return;
      }

      // Show loading
      const btn = document.getElementById('unlockWalletBtn');
      btn.disabled = true;
      btn.textContent = 'Unlocking...';

      // Load and decrypt wallet
      const wallet = await this.walletManager.loadWallet(password);
      console.log('Wallet unlocked:', wallet.address);

      // Update background service
      await chrome.runtime.sendMessage({
        type: 'SET_USER_ADDRESS',
        address: wallet.address
      });

      // Show wallet
      this.currentWallet = wallet;
      this.displayWallet(wallet);
      this.showSuccess('Wallet unlocked successfully!');

      // Clear input
      document.getElementById('unlockPassword').value = '';

    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      this.showError('Invalid password or corrupted wallet');
    } finally {
      const btn = document.getElementById('unlockWalletBtn');
      btn.disabled = false;
      btn.textContent = 'Unlock Wallet';
    }
  }

  lockWallet() {
    this.walletManager.lockWallet();
    this.currentWallet = null;
    this.hideScreen('walletScreen');
    this.showScreen('unlockScreen');
    this.showSuccess('Wallet locked');
  }

  displayWallet(wallet) {
    // Hide other screens
    this.hideScreen('noWalletScreen');
    this.hideScreen('unlockScreen');

    // Show wallet screen
    this.showScreen('walletScreen');

    // Display address
    document.getElementById('displayAddress').textContent = wallet.address;

    // Generate QR code
    const canvas = document.getElementById('qrCanvas');
    this.qrGenerator.generate(wallet.address, canvas);

    // Display secrets (masked by default)
    document.getElementById('mnemonicText').textContent = wallet.mnemonic || 'Not available (imported from private key)';
    document.getElementById('privateKeyText').textContent = wallet.privateKey;

    // Reset secret visibility
    this.secretsVisible = false;
    this.maskSecrets();
    document.getElementById('secretContainer').classList.add('hidden');
  }

  toggleSecretSection() {
    const container = document.getElementById('secretContainer');
    const btn = document.getElementById('secretBtnText');

    if (container.classList.contains('hidden')) {
      container.classList.remove('hidden');
      btn.textContent = '👁️ Hide';
    } else {
      container.classList.add('hidden');
      btn.textContent = '👁️ Show';
      this.maskSecrets(); // Always mask when hiding
    }
  }

  unmaskSecrets() {
    document.getElementById('mnemonicDisplay').classList.remove('masked');
    document.getElementById('privateKeyDisplay').classList.remove('masked');
    this.secretsVisible = true;
  }

  maskSecrets() {
    document.getElementById('mnemonicDisplay').classList.add('masked');
    document.getElementById('privateKeyDisplay').classList.add('masked');
    this.secretsVisible = false;
  }

  async copyAddress() {
    if (!this.currentWallet) return;

    try {
      await navigator.clipboard.writeText(this.currentWallet.address);
      this.showSuccess('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
      this.showError('Failed to copy address');
    }
  }

  async copyMnemonic() {
    if (!this.currentWallet || !this.currentWallet.mnemonic) {
      this.showError('No recovery phrase available');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentWallet.mnemonic);
      this.showSuccess('Recovery phrase copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy mnemonic:', error);
      this.showError('Failed to copy recovery phrase');
    }
  }

  async copyPrivateKey() {
    if (!this.currentWallet) return;

    try {
      await navigator.clipboard.writeText(this.currentWallet.privateKey);
      this.showSuccess('Private key copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy private key:', error);
      this.showError('Failed to copy private key');
    }
  }

  async openDashboard() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        window.close();
      }
    } catch (error) {
      console.error('Failed to open dashboard:', error);
      this.showError('Failed to open dashboard');
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    document.getElementById(tabName + 'Tab')?.classList.add('active');
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }

  showScreen(screenId) {
    document.getElementById(screenId)?.classList.remove('hidden');
  }

  hideScreen(screenId) {
    document.getElementById(screenId)?.classList.add('hidden');
  }

  showSuccess(message) {
    const el = document.getElementById('successMessage');
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }
  }

  showError(message) {
    const el = document.getElementById('errorMessage');
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 5000);
    }
  }
}

// Initialize wallet UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WalletUI();
});
