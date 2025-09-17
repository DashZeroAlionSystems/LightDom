import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Artifact Storage System
 * Handles IPFS/Filecoin storage and on-chain CID anchoring
 */
class ArtifactStorage {
  constructor(config = {}) {
    this.storageType = config.storageType || 'local'; // 'local', 'ipfs', 'filecoin'
    this.localPath = config.localPath || './artifacts';
    this.ipfsEndpoint = config.ipfsEndpoint || 'http://localhost:5001';
    this.filecoinEndpoint = config.filecoinEndpoint || 'http://localhost:1234';
    this.ensureLocalPath();
  }

  async ensureLocalPath() {
    try {
      await fs.mkdir(this.localPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create artifacts directory:', error);
    }
  }

  // Store optimization artifact
  async storeArtifact(artifactData) {
    try {
      const artifact = {
        id: artifactData.crawlId,
        url: artifactData.url,
        timestamp: new Date().toISOString(),
        spaceSaved: artifactData.spaceSaved,
        optimizations: artifactData.optimizations,
        domStats: artifactData.domStats,
        performance: artifactData.performance,
        merkleRoot: artifactData.merkleRoot,
        backlinks: artifactData.backlinks || [],
        schemas: artifactData.schemas || [],
      };

      const cid = await this.storeToStorage(artifact);

      return {
        cid,
        size: JSON.stringify(artifact).length,
        type: this.storageType,
      };
    } catch (error) {
      console.error('Failed to store artifact:', error);
      throw error;
    }
  }

  // Store to appropriate storage backend
  async storeToStorage(artifact) {
    switch (this.storageType) {
      case 'ipfs':
        return await this.storeToIPFS(artifact);
      case 'filecoin':
        return await this.storeToFilecoin(artifact);
      case 'local':
      default:
        return await this.storeLocally(artifact);
    }
  }

  // Store locally with content addressing
  async storeLocally(artifact) {
    try {
      const content = JSON.stringify(artifact, null, 2);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const cid = `local:${hash}`;

      const filePath = path.join(this.localPath, `${hash}.json`);
      await fs.writeFile(filePath, content);

      console.log(`📁 Artifact stored locally: ${cid}`);
      return cid;
    } catch (error) {
      console.error('Local storage failed:', error);
      throw error;
    }
  }

  // Store to IPFS (mock implementation)
  async storeToIPFS(artifact) {
    try {
      const content = JSON.stringify(artifact, null, 2);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const cid = `ipfs://${hash}`;

      // In production, use actual IPFS client
      // const ipfs = await IPFS.create();
      // const result = await ipfs.add(content);
      // return `ipfs://${result.cid}`;

      console.log(`🌐 Artifact stored to IPFS: ${cid}`);
      return cid;
    } catch (error) {
      console.error('IPFS storage failed:', error);
      throw error;
    }
  }

  // Store to Filecoin (mock implementation)
  async storeToFilecoin(artifact) {
    try {
      const content = JSON.stringify(artifact, null, 2);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const cid = `filecoin://${hash}`;

      // In production, use actual Filecoin client
      // const filecoin = new FilecoinClient(this.filecoinEndpoint);
      // const result = await filecoin.store(content);
      // return `filecoin://${result.cid}`;

      console.log(`💎 Artifact stored to Filecoin: ${cid}`);
      return cid;
    } catch (error) {
      console.error('Filecoin storage failed:', error);
      throw error;
    }
  }

  // Retrieve artifact by CID
  async retrieveArtifact(cid) {
    try {
      switch (this.storageType) {
        case 'ipfs':
          return await this.retrieveFromIPFS(cid);
        case 'filecoin':
          return await this.retrieveFromFilecoin(cid);
        case 'local':
        default:
          return await this.retrieveLocally(cid);
      }
    } catch (error) {
      console.error('Failed to retrieve artifact:', error);
      throw error;
    }
  }

  // Retrieve from local storage
  async retrieveLocally(cid) {
    try {
      const hash = cid.replace('local:', '');
      const filePath = path.join(this.localPath, `${hash}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Local retrieval failed:', error);
      throw error;
    }
  }

  // Retrieve from IPFS (mock implementation)
  async retrieveFromIPFS(cid) {
    try {
      // In production, use actual IPFS client
      // const ipfs = await IPFS.create();
      // const result = await ipfs.cat(cid.replace('ipfs://', ''));
      // return JSON.parse(result.toString());

      throw new Error('IPFS retrieval not implemented');
    } catch (error) {
      console.error('IPFS retrieval failed:', error);
      throw error;
    }
  }

  // Retrieve from Filecoin (mock implementation)
  async retrieveFromFilecoin(cid) {
    try {
      // In production, use actual Filecoin client
      // const filecoin = new FilecoinClient(this.filecoinEndpoint);
      // const result = await filecoin.retrieve(cid.replace('filecoin://', ''));
      // return JSON.parse(result);

      throw new Error('Filecoin retrieval not implemented');
    } catch (error) {
      console.error('Filecoin retrieval failed:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStats() {
    try {
      const files = await fs.readdir(this.localPath);
      const totalSize = await this.calculateDirectorySize(this.localPath);

      return {
        type: this.storageType,
        totalArtifacts: files.length,
        totalSize,
        path: this.localPath,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        type: this.storageType,
        totalArtifacts: 0,
        totalSize: 0,
        path: this.localPath,
      };
    }
  }

  // Calculate directory size
  async calculateDirectorySize(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }
}

export default ArtifactStorage;
