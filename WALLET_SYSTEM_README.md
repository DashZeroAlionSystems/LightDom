# LightDom Wallet System

A comprehensive cryptocurrency wallet system for the LightDom Space Harvester platform, enabling users to buy items and services using LightDom coins (LDC).

## 🚀 Features

### Core Wallet Functionality
- **Multi-Currency Support**: LightDom Coins (LDC), USD, Bitcoin (BTC), Ethereum (ETH)
- **Real-time Balance**: Live balance updates with multiple currency conversions
- **Transaction History**: Complete transaction log with filtering and search
- **Secure Storage**: Encrypted wallet data with backup and recovery options

### Purchase System
- **Marketplace Integration**: Browse and purchase items directly from the wallet
- **Secure Checkout**: Multi-step purchase confirmation with security validation
- **Payment Methods**: Support for LightDom coins, crypto, and fiat payments
- **Quantity Selection**: Buy multiple items with bulk pricing

### Security Features
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Biometric Security**: Fingerprint and face recognition support
- **Auto-Lock**: Configurable auto-lock timer for inactivity
- **Security Monitoring**: Real-time security event tracking
- **Backup Codes**: One-time recovery codes for account access
- **IP Whitelisting**: Restrict access to specific IP addresses
- **Device Management**: Manage trusted devices

### User Experience
- **Modern UI**: Discord-inspired design with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark theme with proper contrast
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Real-time Updates**: Live data updates without page refresh

## 📁 File Structure

```
src/components/ui/wallet/
├── WalletDashboard.tsx      # Main wallet interface
├── PurchaseModal.tsx        # Purchase confirmation modal
├── WalletIntegration.tsx    # Marketplace integration
└── WalletSecurity.tsx       # Security settings and monitoring

src/services/
└── WalletService.ts         # API service layer

api-server-express.js        # Backend API endpoints
```

## 🛠️ Technical Implementation

### Frontend Components

#### WalletDashboard.tsx
The main wallet interface featuring:
- Balance display with multiple currencies
- Transaction history with filtering
- Quick action buttons (Send, Receive, Purchase, QR Code)
- Tabbed navigation (Overview, Transactions, Purchase, Settings)
- Real-time data updates

#### PurchaseModal.tsx
Enhanced purchase flow with:
- Item details and quantity selection
- Payment method selection
- Security code validation
- Terms and conditions agreement
- Price breakdown and balance checking

#### WalletIntegration.tsx
Marketplace integration featuring:
- Item browsing with category filtering
- Economy statistics dashboard
- Popularity and rating display
- Featured items highlighting

#### WalletSecurity.tsx
Comprehensive security management:
- Security status overview
- Settings configuration
- Security event monitoring
- Backup code management
- Device and IP whitelisting

### Backend API Endpoints

#### Wallet Management
- `GET /api/wallet/balance` - Get user wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `GET /api/wallet/address` - Get wallet address and QR code
- `GET /api/wallet/stats` - Get wallet statistics

#### Purchase System
- `GET /api/wallet/items` - Get available purchase items
- `POST /api/wallet/purchase` - Process item purchase
- `GET /api/wallet/exchange-rates` - Get current exchange rates

#### Security Features
- `GET /api/wallet/security` - Get security settings
- `PUT /api/wallet/security` - Update security settings
- `POST /api/wallet/backup` - Generate backup codes
- `GET /api/wallet/export` - Export wallet data

#### Transfer System
- `POST /api/wallet/transfer` - Transfer funds to another wallet
- `POST /api/wallet/validate-address` - Validate wallet address

### Database Schema

The wallet system integrates with the existing PostgreSQL database:

#### user_economy Table
```sql
CREATE TABLE user_economy (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'credit' or 'debit'
  amount DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL, -- 'LDC', 'USD', 'BTC', 'ETH'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'purchase', 'transfer', 'mining', 'reward'
  amount DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'completed', 'pending', 'failed'
  transaction_hash VARCHAR(255),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### marketplace_items Table
```sql
CREATE TABLE marketplace_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  discount_percentage INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Design System Integration

The wallet system fully integrates with the LightDom design system:

### Design Tokens
- **Colors**: Primary blue (#5865f2), success green (#3ba55c), danger red (#ed4245)
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px-based spacing system
- **Shadows**: Elevation system for cards and modals

### Component Classes
- **Layout**: `ld-container`, `ld-grid`, `ld-flex`
- **Cards**: `ld-card`, `ld-card--elevated`, `ld-card--interactive`
- **Buttons**: `ld-btn`, `ld-btn--primary`, `ld-btn--secondary`
- **Animations**: `ld-animate-fade-in`, `ld-hover-lift`, `ld-hover-glow`

### Animation System
- **Entrance**: Fade in, slide up, scale in effects
- **Hover**: Lift, glow, scale, rotate effects
- **Loading**: Spinner animations and shimmer effects
- **Transitions**: Smooth 0.2s ease-out transitions

## 🔒 Security Implementation

### Frontend Security
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Sanitized input handling
- **CSRF Protection**: Token-based request validation
- **Secure Storage**: Encrypted local storage for sensitive data

### Backend Security
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Sanitization**: Server-side input validation
- **SQL Injection Prevention**: Parameterized queries

### Database Security
- **Encryption**: Sensitive data encryption at rest
- **Access Control**: Database user permissions
- **Audit Logging**: Complete transaction audit trail
- **Backup Security**: Encrypted backup files

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 13+
- LightDom Space Harvester application

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Populate sample data
   npm run db:populate-metaverse
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Configure database connection
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dom_space_harvester
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Start Development Servers**
   ```bash
   # Start API server
   npm run dev:api
   
   # Start frontend (in another terminal)
   npm run dev
   ```

### Usage

1. **Access Wallet**
   - Navigate to `/wallet` in the application
   - View balance and transaction history
   - Access marketplace and security settings

2. **Make Purchases**
   - Browse available items in the marketplace
   - Select quantity and payment method
   - Complete secure checkout process

3. **Manage Security**
   - Enable two-factor authentication
   - Configure auto-lock settings
   - Monitor security events
   - Generate backup codes

## 📊 API Documentation

### Authentication
All API requests require authentication via the `x-user-id` header:
```javascript
headers: {
  'x-user-id': 'user123',
  'Content-Type': 'application/json'
}
```

### Example API Calls

#### Get Wallet Balance
```javascript
const response = await fetch('/api/wallet/balance', {
  headers: { 'x-user-id': 'user123' }
});
const data = await response.json();
```

#### Purchase Item
```javascript
const response = await fetch('/api/wallet/purchase', {
  method: 'POST',
  headers: {
    'x-user-id': 'user123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemId: '1',
    quantity: 2,
    paymentMethod: 'lightdom'
  })
});
```

#### Transfer Funds
```javascript
const response = await fetch('/api/wallet/transfer', {
  method: 'POST',
  headers: {
    'x-user-id': 'user123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'ld_user456_abc123',
    amount: 50.00,
    currency: 'LDC',
    description: 'Payment for services'
  })
});
```

## 🧪 Testing

### Frontend Testing
```bash
# Run component tests
npm run test:components

# Run wallet-specific tests
npm run test:wallet
```

### Backend Testing
```bash
# Run API tests
npm run test:api

# Run wallet API tests
npm run test:wallet-api
```

### Integration Testing
```bash
# Run full integration tests
npm run test:integration
```

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of wallet components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large transaction lists
- **Image Optimization**: WebP format for item images

### Backend Optimizations
- **Database Indexing**: Optimized queries for wallet operations
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevent API abuse

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# API
API_PORT=3001
FRONTEND_URL=http://localhost:3000

# Wallet
WALLET_AUTO_LOCK=15
WALLET_SESSION_TIMEOUT=60
WALLET_MAX_ATTEMPTS=5
```

### Feature Flags
```javascript
// Enable/disable wallet features
const WALLET_FEATURES = {
  TWO_FACTOR_AUTH: true,
  BIOMETRIC_AUTH: true,
  CRYPTO_PAYMENTS: true,
  FIAT_PAYMENTS: false,
  MARKETPLACE: true,
  TRANSFERS: true
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Balance Not Updating**
   - Check API connection
   - Verify user authentication
   - Clear browser cache

2. **Purchase Fails**
   - Verify sufficient balance
   - Check item availability
   - Validate payment method

3. **Security Issues**
   - Enable two-factor authentication
   - Check security event logs
   - Verify IP whitelist settings

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('wallet-debug', 'true');

// View debug information
console.log('Wallet Debug Info:', window.walletDebug);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow the existing design system patterns
- Use TypeScript for type safety
- Write comprehensive tests
- Document new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

*Built with ❤️ for the LightDom Space Harvester platform*
