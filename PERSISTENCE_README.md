# LightDom Persistence System

A comprehensive persistence system that maintains blockchain data across browser refreshes, syncs to PostgreSQL, and provides configurable file upload limits based on Chrome browser capabilities.

## Features

### 🔄 Browser Refresh Persistence

- **IndexedDB Storage**: Persistent storage using IndexedDB for large data sets
- **localStorage Backup**: Cross-tab synchronization using localStorage
- **Automatic Save**: Data is automatically saved before page unload
- **State Restoration**: Application state is restored on page load

### 🔗 Blockchain Integration

- **Smart Contract Sync**: Optimizations and data are synced to blockchain
- **Transaction Tracking**: All blockchain transactions are tracked and stored
- **Gas Optimization**: Efficient storage and retrieval of blockchain data
- **Error Recovery**: Automatic retry mechanisms for failed blockchain operations

### 🗄️ PostgreSQL Synchronization

- **Real-time Sync**: Data is synchronized to PostgreSQL database
- **Batch Operations**: Efficient batch processing for large data sets
- **Conflict Resolution**: Handles data conflicts between local and remote storage
- **Backup & Recovery**: Full backup and recovery capabilities

### 📁 File Upload Management

- **Chrome Limits Detection**: Automatically detects Chrome browser file upload limits
- **Configurable Limits**: Users can set their preferred file upload size
- **Format Support**: Supports all Chrome-compatible file formats
- **Size Validation**: Real-time validation of file sizes and types

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LightDom Persistence System              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   IndexedDB     │  │   localStorage  │  │   Memory     │ │
│  │   (Primary)     │  │   (Backup)      │  │   (Cache)    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                    │       │
│           └─────────────────────┼────────────────────┘       │
│                                 │                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Blockchain    │  │   PostgreSQL    │  │   File API   │ │
│  │   (Sync)        │  │   (Database)    │  │   (Upload)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Core Components

#### 1. PersistentBlockchainStorage

- **Location**: `src/core/PersistentBlockchainStorage.ts`
- **Purpose**: Main persistence layer using IndexedDB
- **Features**:
  - Chrome upload limits detection
  - Automatic data compression
  - Encryption support
  - Storage statistics

#### 2. BrowserRefreshHandler

- **Location**: `src/scripts/BrowserRefreshHandler.ts`
- **Purpose**: Handles browser refresh events
- **Features**:
  - Page visibility detection
  - Before unload handling
  - Cross-tab synchronization
  - Error recovery

#### 3. LightDomStorageAPI

- **Location**: `src/api/LightDomStorageAPI.ts`
- **Purpose**: File upload and storage API
- **Features**:
  - File upload with size validation
  - Base64 encoding for files
  - Type detection and validation
  - Storage management

### Integration Components

#### 4. BlockchainPersistenceIntegration

- **Location**: `src/scripts/BlockchainPersistenceIntegration.ts`
- **Purpose**: Main integration orchestrator
- **Features**:
  - System initialization
  - Error handling
  - Performance monitoring
  - Data export/import

#### 5. PersistenceInitializer

- **Location**: `src/scripts/InitializePersistence.ts`
- **Purpose**: System startup initialization
- **Features**:
  - Component initialization
  - Error handling setup
  - Performance monitoring
  - Health checks

## Chrome File Upload Limits

Based on research, Chrome browser has the following limits:

| Limit Type        | Value | Description                           |
| ----------------- | ----- | ------------------------------------- |
| Max File Size     | 2GB   | Maximum size for a single file        |
| Max Files         | 1,000 | Maximum number of files in one upload |
| Max Total Size    | 20GB  | Maximum total size for all files      |
| Supported Formats | All   | All standard web formats              |

### Dynamic Limits Detection

The system automatically detects Chrome version and adjusts limits accordingly:

```typescript
const chromeLimits = {
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  maxFiles: 1000,
  maxTotalSize: 20 * 1024 * 1024 * 1024, // 20GB
  supportedFormats: ['image/*', 'video/*', 'audio/*', 'text/*', 'application/*'],
  browserVersion: 'Chrome 120',
};
```

## Usage

### Basic Setup

```typescript
import { persistenceInitializer } from './scripts/InitializePersistence';

// Initialize the persistence system
await persistenceInitializer.initialize();
```

### Storing Data

```typescript
import { persistentBlockchainStorage } from './core/PersistentBlockchainStorage';

// Store optimization data
await persistentBlockchainStorage.saveCurrentState();

// Sync to blockchain and PostgreSQL
await persistentBlockchainStorage.syncToBlockchain();
```

### File Upload

```typescript
import { lightDomStorageAPI } from './api/LightDomStorageAPI';

// Upload a file
const file = document.getElementById('fileInput').files[0];
const result = await lightDomStorageAPI.uploadFile(file);

// Set custom file size limit
await lightDomStorageAPI.setMaxFileUploadSize(100 * 1024 * 1024); // 100MB
```

### Browser Refresh Handling

```typescript
import { browserRefreshHandler } from './scripts/BrowserRefreshHandler';

// Force save all data
await browserRefreshHandler.forceSave();

// Force restore all data
await browserRefreshHandler.forceRestore();
```

## Configuration

### Environment Variables

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=lightdom
POSTGRES_USER=lightdom_user
POSTGRES_PASSWORD=your_password

# Blockchain Configuration
ETHEREUM_RPC_URL=http://localhost:8545
ADMIN_PRIVATE_KEY=your_private_key
MODEL_STORAGE_CONTRACT_ADDRESS=0x...

# Storage Configuration
MAX_FILE_SIZE=2147483648  # 2GB in bytes
MAX_FILES=1000
MAX_TOTAL_SIZE=21474836480  # 20GB in bytes
```

### User Settings

Users can configure their preferred file upload size through the UI:

```typescript
// Get current Chrome limits
const limits = lightDomStorageAPI.getChromeLimits();

// Set custom limit (must be <= Chrome limit)
await lightDomStorageAPI.setMaxFileUploadSize(500 * 1024 * 1024); // 500MB
```

## API Endpoints

### PostgreSQL Sync

- `POST /api/sync-to-postgresql` - Sync data to PostgreSQL
- `GET /api/sync-status` - Get sync status
- `POST /api/force-sync` - Force manual sync

### File Upload

- `POST /api/upload` - Upload file with size validation
- `GET /api/upload-limits` - Get current upload limits
- `PUT /api/upload-limits` - Update upload limits

## Error Handling

The system includes comprehensive error handling:

1. **Storage Errors**: Automatic retry with exponential backoff
2. **Network Errors**: Offline mode with sync when online
3. **Validation Errors**: Clear error messages for users
4. **Recovery**: Automatic data recovery from backups

## Performance Monitoring

The system monitors:

- **Memory Usage**: JavaScript heap size and limits
- **Storage Usage**: IndexedDB and localStorage usage
- **Sync Performance**: Blockchain and database sync times
- **Error Rates**: Error frequency and types

## Security

- **Data Encryption**: Optional encryption for sensitive data
- **Input Validation**: All inputs are validated and sanitized
- **Access Control**: Proper authentication and authorization
- **Audit Logging**: All operations are logged for audit

## Troubleshooting

### Common Issues

1. **Storage Quota Exceeded**
   - Clear old data: `await persistentBlockchainStorage.clearAllData()`
   - Check storage usage: `await persistentBlockchainStorage.getStorageStats()`

2. **Sync Failures**
   - Check network connection
   - Verify database credentials
   - Check blockchain node status

3. **File Upload Errors**
   - Verify file size is within limits
   - Check file type is supported
   - Ensure browser is Chrome

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('lightdom_debug', 'true');
```

## Future Enhancements

- [ ] Web Workers for background processing
- [ ] Service Worker for offline support
- [ ] Advanced compression algorithms
- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Multi-browser support
- [ ] Cloud storage integration

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.
