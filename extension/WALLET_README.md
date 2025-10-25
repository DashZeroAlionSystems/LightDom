# LightDom Wallet - User Guide

## Overview

The LightDom Wallet is a secure, browser-based cryptocurrency wallet integrated into the LightDom Chrome Extension. It provides easy authentication and wallet management for blockchain interactions within the LightDom ecosystem.

## Features

### 🔐 Secure Wallet Creation
- **Generate New Wallets**: Create a new wallet with a unique address, private key, and 12-word recovery phrase
- **Password Encryption**: All wallet data is encrypted with AES-256-GCM encryption using your password
- **Local Storage**: Encrypted wallet is stored securely in Chrome's local storage

### 🔑 Import Existing Wallets
- **Recovery Phrase Import**: Import wallets using 12-word mnemonic phrases
- **Private Key Import**: Import wallets directly using private keys
- **Password Protection**: Set a new password when importing to secure your wallet

### 👁️ Secret Management
- **Masked Display**: Recovery phrases and private keys are masked by default
- **Toggle Visibility**: Show/hide sensitive information with one click
- **Copy to Clipboard**: Easy copying of addresses, recovery phrases, and private keys
- **Security Warnings**: Clear warnings about protecting your sensitive information

### 📱 QR Code Generation
- **Visual Wallet Address**: Your wallet address is automatically displayed as a QR code
- **Easy Sharing**: Share your wallet address by scanning the QR code
- **Instant Generation**: QR code is generated in real-time when wallet is unlocked

## How to Use

### Creating a New Wallet

1. **Open the Wallet**:
   - Click the LightDom extension icon
   - Click the "👛 Wallet" button
   - OR use keyboard shortcut: `Ctrl+Shift+W` (Windows/Linux) or `Cmd+Shift+W` (Mac)

2. **Create Wallet Tab**:
   - Enter a strong password (minimum 8 characters)
   - Confirm your password
   - Click "Create Wallet"

3. **Save Your Recovery Information**:
   - ⚠️ **IMPORTANT**: Click "👁️ Show" to reveal your recovery phrase and private key
   - Write down your 12-word recovery phrase on paper (DO NOT save digitally)
   - Store it in a safe, secure location
   - Anyone with this phrase can access your wallet!

### Importing an Existing Wallet

1. **Open the Wallet** (same as above)

2. **Import Wallet Tab**:
   - Click the "Import Wallet" tab
   - Enter your 12-word recovery phrase OR private key
   - Set a new password for encryption
   - Click "Import Wallet"

### Using Your Wallet

1. **Unlock Your Wallet**:
   - Open the wallet page
   - Enter your password
   - Click "Unlock Wallet"

2. **View Your Address**:
   - Your wallet address is displayed at the top
   - Click "📋 Copy" to copy to clipboard
   - QR code is automatically generated for easy sharing

3. **Access Recovery Information**:
   - Click "👁️ Show" under "Recovery Information"
   - Click "👁️ Unmask" to reveal the actual text
   - Click "📋 Copy" buttons to copy recovery phrase or private key
   - Click "🔒 Mask" to hide sensitive information again

4. **Lock Your Wallet**:
   - Click "🔒 Lock" to secure your wallet
   - Wallet data is removed from memory
   - Requires password to unlock again

## Security Best Practices

### ✅ DO:
- ✅ Use a strong, unique password for your wallet
- ✅ Write down your recovery phrase on paper
- ✅ Store your recovery phrase in a secure location (safe, vault, etc.)
- ✅ Keep multiple backup copies in different secure locations
- ✅ Lock your wallet when not in use
- ✅ Verify your wallet address before sharing

### ❌ DON'T:
- ❌ Share your recovery phrase with anyone
- ❌ Store your recovery phrase digitally (email, cloud, screenshots)
- ❌ Use a weak or common password
- ❌ Take photos of your recovery phrase
- ❌ Share your private key with anyone
- ❌ Use the same password as other accounts

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Open Wallet | `Ctrl+Shift+W` | `Cmd+Shift+W` |
| Toggle Mining | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Open Dashboard | `Ctrl+Shift+D` | `Cmd+Shift+D` |

## Technical Details

### Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Hash Function**: SHA-256

### Wallet Generation
- **Private Key**: 256-bit (32 bytes) random key
- **Address Format**: Ethereum-compatible (0x + 40 hex characters)
- **Mnemonic**: 12-word BIP39-style recovery phrase

### Storage
- **Location**: Chrome Local Storage (encrypted)
- **Data Stored**:
  - Encrypted wallet (private key, recovery phrase)
  - Wallet address (unencrypted for display)
  - Wallet status flag

## Troubleshooting

### "Invalid password or corrupted wallet"
- Double-check your password (case-sensitive)
- Ensure you're using the correct password
- If forgotten, you'll need to import using your recovery phrase

### "No wallet found"
- You haven't created a wallet yet
- Create a new wallet or import an existing one

### "Failed to create wallet"
- Check browser console for errors
- Ensure Chrome has sufficient permissions
- Try closing and reopening the extension

### Wallet not showing in popup
- Wallet must be unlocked first
- Open the wallet page and unlock with your password
- Address will appear in popup after unlocking

## Integration with LightDom

### Mining Authentication
- Your wallet address is used as your miner identity
- Mining rewards are associated with your wallet address
- Address is sent with DOM optimization submissions

### Dashboard Access
- Click "📊 Dashboard" from the wallet page
- Opens the LightDom side panel with mining stats
- View your mining performance and rewards

## Support & Feedback

For issues, questions, or feedback:
- Report bugs on GitHub: [LightDom Issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- Check documentation: [LightDom Docs](https://github.com/DashZeroAlionSystems/LightDom)

## Version History

### v1.0.0 (Current)
- Initial wallet implementation
- Wallet creation and import
- Password encryption
- QR code generation
- Masked secret display
- Chrome extension integration

---

**⚠️ SECURITY REMINDER**: Your recovery phrase is the ONLY way to recover your wallet if you forget your password. Keep it safe and private!
