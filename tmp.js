class T {
  async method() {

          bytesSaved,
          backlinksCount,
          timestamp: Date.now(),
        });

        res.json({
          success: true,
          txHash: tx.hash,
          crawlId,
          bytesSaved,
          backlinksCount,
        });
      } catch (error) {
        console.error('PoO submission failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get PoO status
    this.app.get('/api/blockchain/poo/:crawlId', async (req, res) => {
      try {
        const { crawlId } = req.params;

        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        const proof = await this.pooContract.getProof(crawlId);

        res.json({
          crawlId,
          submitter: proof.submitter,
          merkleRoot: proof.merkleRoot,
          bytesSaved: proof.bytesSaved.toString(),
          backlinksCount: proof.backlinksCount.toString(),
          artifactCID: proof.artifactCID,
          submittedAt: proof.submittedAt.toString(),
          challengeWindowEnds: proof.challengeWindowEnds.toString(),
          finalized: proof.finalized,
          slashed: proof.slashed,
        });
      } catch (error) {
        console.error('Failed to get PoO status:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Challenge PoO
    this.app.post('/api/blockchain/challenge-poo', async (req, res) => {
      try {
        const { crawlId, merkleProof, leafData } = req.body;

        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        const tx = await this.pooContract.challengePoO(crawlId, merkleProof, leafData);
        await tx.wait();

        res.json({
          success: true,
          txHash: tx.hash,
          crawlId,
        });
      } catch (error) {
        console.error('PoO challenge failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Submit batch of PoOs
    this.app.post('/api/blockchain/submit-batch-poo', async (req, res) => {
      try {
        const { batch, batchHash, signature, timestamp } = req.body;

        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        // Verify batch signature (simplified for now)
        if (!this.verifyBatchSignature(batch, batchHash, signature)) {
          return res.status(400).json({ error: 'Invalid batch signature' });
        }

        // Submit batch to blockchain
        const tx = await this.pooContract.submitBatchPoO(
          batch.map(poo => ({
            crawlId: poo.crawlId,
            merkleRoot: poo.merkleRoot,
            bytesSaved: poo.bytesSaved,
            backlinksCount: poo.backlinksCount,
            artifactCID: poo.artifactCID,
          })),
          batchHash,
          signature
        );

        await tx.wait();

        // Emit real-time update
        this.io.emit('blockchain_update', {
          type: 'batch_poo_submitted',
          batchSize: batch.length,
          txHash: tx.hash,
          timestamp: Date.now(),
        });

        res.json({
          success: true,
          txHash: tx.hash,
          batchSize: batch.length,
        });
      } catch (error) {
        console.error('Batch PoO submission failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get blockchain statistics
    this.app.get('/api/blockchain/stats', async (req, res) => {
  }
}
export default T;

