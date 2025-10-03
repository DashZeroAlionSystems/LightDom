# Decentralized Storage Platform

A comprehensive decentralized storage platform similar to Sia.tech, built with modern web technologies and blockchain integration.

## 🚀 Features

### Core Functionality
- **Decentralized Storage**: Store files across multiple hosts without central authority
- **Data Encryption**: End-to-end encryption with automatic sharding
- **Smart Contracts**: Automated storage agreements and payments
- **Host Management**: Comprehensive host registration and reputation system
- **File Management**: Advanced file operations with sharing and access control
- **Governance**: Decentralized decision-making and platform management
- **Token Economy**: Native token for payments and incentives

### Technical Features
- **Blockchain Integration**: Ethereum-compatible smart contracts
- **Modern Frontend**: React 18 with TypeScript and Tailwind CSS
- **RESTful API**: Express.js backend with comprehensive endpoints
- **Real-time Updates**: WebSocket integration for live updates
- **Progressive Web App**: PWA support with offline capabilities
- **Responsive Design**: Mobile-first approach with modern UI/UX

## 🏗️ Architecture

### Smart Contracts
- **StorageToken**: ERC20 token for payments and governance
- **StorageContract**: Core storage agreement management
- **StorageGovernance**: Decentralized platform governance
- **DataEncryption**: File encryption and sharding logic
- **HostManager**: Host registration and reputation system
- **FileManager**: File metadata and access control

### Backend Services
- **API Server**: Express.js with TypeScript
- **Database**: PostgreSQL for data persistence
- **Cache**: Redis for performance optimization
- **Blockchain**: Ethereum integration with ethers.js
- **Encryption**: Advanced cryptographic operations
- **Storage**: File upload and management
- **Notifications**: Real-time user notifications

### Frontend Application
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions
- **PWA**: Progressive Web App capabilities

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 13+
- Redis 6+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd decentralized-storage-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install smart contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=decentralized_storage
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DB_MAX_CONNECTIONS=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key
STORAGE_TOKEN_ADDRESS=
STORAGE_CONTRACT_ADDRESS=
STORAGE_GOVERNANCE_ADDRESS=
DATA_ENCRYPTION_ADDRESS=
HOST_MANAGER_ADDRESS=
FILE_MANAGER_ADDRESS=

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Encryption
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY_LENGTH=32

# Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_MIME_TYPES=image/*,video/*,audio/*,application/pdf,text/*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_BLOCKCHAIN_RPC_URL=http://localhost:8545
VITE_CONTRACT_ADDRESSES={"storageToken":"","storageContract":"","storageGovernance":"","dataEncryption":"","hostManager":"","fileManager":""}
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb decentralized_storage

# Run migrations (if available)
cd backend
npm run migrate
```

### 5. Smart Contract Deployment
```bash
# Compile contracts
cd contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### 6. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :3001
```

## 📚 Usage

### For Users (Renters)
1. **Connect Wallet**: Connect your Ethereum wallet
2. **Upload Files**: Drag and drop files to upload
3. **Manage Storage**: View and manage your stored files
4. **Share Files**: Share files with other users
5. **Monitor Contracts**: Track storage agreements and payments

### For Hosts
1. **Register as Host**: Complete host registration process
2. **Set Pricing**: Configure storage pricing and capacity
3. **Manage Storage**: Monitor available storage space
4. **Track Performance**: View reputation and metrics
5. **Earn Tokens**: Receive payments for storage services

### For Governance
1. **Create Proposals**: Submit governance proposals
2. **Vote on Proposals**: Participate in platform decisions
3. **Monitor Platform**: Track platform metrics and health
4. **Manage Parameters**: Update platform parameters

## 🔧 Development

### Smart Contracts
```bash
cd contracts

# Compile
npx hardhat compile

# Test
npx hardhat test

# Coverage
npx hardhat coverage

# Deploy
npx hardhat run scripts/deploy.js
```

### Backend API
```bash
cd backend

# Development
npm run dev

# Build
npm run build

# Start
npm start

# Test
npm test

# Lint
npm run lint
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Test
npm test

# Lint
npm run lint
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
# Build all components
npm run build

# Start production servers
npm start
```

### Docker Deployment
```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Backend**: Deploy to AWS EC2, Google Cloud, or Azure
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Blockchain**: Deploy to Ethereum mainnet or testnets

## 📖 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Files
- `GET /api/files` - List user files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file details
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/share` - Share file

### Hosts
- `GET /api/hosts` - List hosts
- `POST /api/hosts/register` - Register as host
- `PUT /api/hosts/:id` - Update host info
- `GET /api/hosts/:id` - Get host details

### Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts/create` - Create contract
- `GET /api/contracts/:id` - Get contract details
- `PUT /api/contracts/:id` - Update contract

### Governance
- `GET /api/governance/proposals` - List proposals
- `POST /api/governance/proposals` - Create proposal
- `POST /api/governance/vote` - Vote on proposal
- `GET /api/governance/parameters` - Get platform parameters

## 🔒 Security

### Smart Contract Security
- OpenZeppelin libraries for security patterns
- Reentrancy guards and access controls
- Comprehensive testing and auditing
- Formal verification where applicable

### API Security
- JWT authentication and authorization
- Rate limiting and CORS protection
- Input validation and sanitization
- SQL injection prevention

### Frontend Security
- XSS protection and content security policy
- Secure token storage and handling
- Input validation and sanitization
- HTTPS enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow ESLint rules
- Write comprehensive tests
- Document your code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sia.tech](https://sia.tech/) for inspiration
- [OpenZeppelin](https://openzeppelin.com/) for smart contract libraries
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation
- Contact the development team

## 🔮 Roadmap

### Phase 1: Core Platform (Current)
- [x] Smart contract development
- [x] Basic API backend
- [x] React frontend
- [x] File upload and storage
- [x] Host management

### Phase 2: Advanced Features
- [ ] Mobile applications
- [ ] Advanced file sharing
- [ ] Content delivery network
- [ ] Advanced analytics
- [ ] Multi-chain support

### Phase 3: Enterprise Features
- [ ] Enterprise dashboard
- [ ] Advanced security features
- [ ] Compliance tools
- [ ] Advanced monitoring
- [ ] Custom integrations

---

**Built with ❤️ for the decentralized future**