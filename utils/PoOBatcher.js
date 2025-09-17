const crypto = require('crypto');

/**
 * PoO Batching System for gas efficiency
 * Implements EIP-712 signing and batch submission
 */
class PoOBatcher {
  constructor(config = {}) {
    this.batchSize = config.batchSize || 10;
    this.batchTimeout = config.batchTimeout || 30000; // 30 seconds
    this.pendingBatch = [];
    this.batchTimer = null;
    this.apiUrl = config.apiUrl;
    this.privateKey = config.privateKey;
  }

  // Add PoO to batch
  addToBatch(pooData) {
    this.pendingBatch.push({
      ...pooData,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex'),
    });

    // If batch is full, submit immediately
    if (this.pendingBatch.length >= this.batchSize) {
      this.submitBatch();
    } else {
      // Start timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.submitBatch();
        }, this.batchTimeout);
      }
    }
  }

  // Submit batch of PoOs
  async submitBatch() {
    if (this.pendingBatch.length === 0) return;

    const batch = [...this.pendingBatch];
    this.pendingBatch = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      // Create EIP-712 signature for batch
      const batchHash = this.createBatchHash(batch);
      const signature = this.signBatch(batchHash);

      const payload = {
        batch: batch,
        batchHash,
        signature,
        timestamp: Date.now(),
      };

      const response = await fetch(`${this.apiUrl}/api/blockchain/submit-batch-poo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Batch submitted: ${batch.length} PoOs, tx: ${result.txHash}`);
        return result;
      } else {
        throw new Error(`Batch submission failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Batch submission error:', error);
      // Re-add failed batch items
      this.pendingBatch.unshift(...batch);
      throw error;
    }
  }

  // Create hash for batch verification
  createBatchHash(batch) {
    const batchData = batch.map(poo => ({
      crawlId: poo.crawlId,
      merkleRoot: poo.merkleRoot,
      bytesSaved: poo.bytesSaved,
      backlinksCount: poo.backlinksCount,
      artifactCID: poo.artifactCID,
      timestamp: poo.timestamp,
    }));

    return crypto.createHash('sha256').update(JSON.stringify(batchData)).digest('hex');
  }

  // Sign batch with EIP-712
  signBatch(batchHash) {
    if (!this.privateKey) {
      throw new Error('Private key required for signing');
    }

    // EIP-712 domain separator
    const domain = {
      name: 'DOMSpaceHarvester',
      version: '1',
      chainId: 1, // Will be set based on network
      verifyingContract: '0x0000000000000000000000000000000000000000', // Will be set to actual contract
    };

    // EIP-712 types
    const types = {
      BatchSubmission: [
        { name: 'batchHash', type: 'bytes32' },
        { name: 'timestamp', type: 'uint256' },
      ],
    };

    // Create message
    const message = {
      batchHash: '0x' + batchHash,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // For now, return a simple signature
    // In production, use proper EIP-712 signing
    return crypto
      .createHmac('sha256', this.privateKey)
      .update(JSON.stringify({ domain, types, message }))
      .digest('hex');
  }

  // Force submit current batch
  async forceSubmit() {
    if (this.pendingBatch.length > 0) {
      await this.submitBatch();
    }
  }

  // Get batch status
  getStatus() {
    return {
      pendingCount: this.pendingBatch.length,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout,
      hasTimer: !!this.batchTimer,
    };
  }
}

module.exports = PoOBatcher;
