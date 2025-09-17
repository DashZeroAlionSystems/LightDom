import crypto from 'crypto';

/**
 * Simple Merkle Tree implementation for DOM optimization proofs
 */
class MerkleTree {
  constructor(leaves, hashFunction = 'sha256') {
    this.leaves = leaves.map(leaf => this.hash(leaf, hashFunction));
    this.hashFunction = hashFunction;
    this.tree = this.buildTree();
  }

  hash(data, algorithm = this.hashFunction) {
    if (typeof data === 'string') {
      return crypto.createHash(algorithm).update(data).digest('hex');
    }
    return crypto.createHash(algorithm).update(JSON.stringify(data)).digest('hex');
  }

  buildTree() {
    if (this.leaves.length === 0) return [];
    
    let currentLevel = [...this.leaves];
    const tree = [currentLevel];
    
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(this.hash(left + right));
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }
    
    return tree;
  }

  getRoot() {
    return this.tree[this.tree.length - 1][0];
  }

  getProof(index) {
    if (index >= this.leaves.length) {
      throw new Error('Index out of bounds');
    }

    const proof = [];
    let currentIndex = index;
    
    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelNodes = this.tree[level];
      const isLeft = currentIndex % 2 === 0;
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
      
      if (siblingIndex < levelNodes.length) {
        proof.push({
          data: levelNodes[siblingIndex],
          left: isLeft
        });
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }

  verifyProof(leaf, proof, root) {
    let hash = this.hash(leaf);
    
    for (const proofElement of proof) {
      if (proofElement.left) {
        hash = this.hash(hash + proofElement.data);
      } else {
        hash = this.hash(proofElement.data + hash);
      }
    }
    
    return hash === root;
  }

  static verifyProof(leaf, proof, root, hashFunction = 'sha256') {
    const tree = new MerkleTree([leaf], hashFunction);
    return tree.verifyProof(leaf, proof, root);
  }
}

export default MerkleTree;
