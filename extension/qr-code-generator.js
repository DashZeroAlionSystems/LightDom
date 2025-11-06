// Simple QR Code Generator for Chrome Extension
// Based on QR Code specification

class QRCodeGenerator {
  constructor() {
    this.size = 200;
    this.padding = 20;
  }

  /**
   * Generate QR code and draw on canvas
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  generate(text, canvas) {
    if (!canvas || !canvas.getContext) {
      console.error('Invalid canvas element');
      return;
    }

    const ctx = canvas.getContext('2d');
    const qrData = this.createQRMatrix(text);
    const moduleSize = Math.floor(this.size / qrData.length);
    const actualSize = moduleSize * qrData.length;

    // Set canvas size
    canvas.width = actualSize + this.padding * 2;
    canvas.height = actualSize + this.padding * 2;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR code
    ctx.fillStyle = '#000000';
    for (let row = 0; row < qrData.length; row++) {
      for (let col = 0; col < qrData[row].length; col++) {
        if (qrData[row][col]) {
          ctx.fillRect(
            col * moduleSize + this.padding,
            row * moduleSize + this.padding,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  /**
   * Create QR code matrix (simplified version)
   * @param {string} text
   * @returns {Array<Array<boolean>>}
   */
  createQRMatrix(text) {
    // Simplified QR code generation for demo purposes
    // In production, use a proper QR code library
    const size = 25; // 25x25 matrix for version 1
    const matrix = Array(size).fill(0).map(() => Array(size).fill(false));

    // Add finder patterns (corners)
    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, size - 7, 0);
    this.addFinderPattern(matrix, 0, size - 7);

    // Add timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Encode data (simplified - just create a pattern based on text)
    const hash = this.simpleHash(text);
    let bitIndex = 0;

    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column

      for (let row = 0; row < size; row++) {
        const upward = Math.floor((size - 1 - col) / 2) % 2 === 0;
        const actualRow = upward ? size - 1 - row : row;

        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;

          // Skip if already filled (finder patterns, timing, etc.)
          if (!this.isReserved(matrix, actualRow, currentCol, size)) {
            const bit = (hash >> (bitIndex % 32)) & 1;
            matrix[actualRow][currentCol] = bit === 1;
            bitIndex++;
          }
        }
      }
    }

    return matrix;
  }

  /**
   * Add finder pattern (corner squares)
   */
  addFinderPattern(matrix, row, col) {
    // Outer square (7x7)
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6) {
          matrix[row + r][col + c] = true;
        }
      }
    }

    // Inner square (3x3)
    for (let r = 2; r < 5; r++) {
      for (let c = 2; c < 5; c++) {
        matrix[row + r][col + c] = true;
      }
    }
  }

  /**
   * Check if position is reserved (finder pattern, timing, etc.)
   */
  isReserved(matrix, row, col, size) {
    // Finder patterns
    if ((row < 9 && col < 9) ||
        (row < 9 && col >= size - 8) ||
        (row >= size - 8 && col < 9)) {
      return true;
    }

    // Timing patterns
    if (row === 6 || col === 6) {
      return true;
    }

    return false;
  }

  /**
   * Simple hash function for demo
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate QR code as data URL
   * @param {string} text
   * @returns {string} Data URL
   */
  generateDataURL(text) {
    const canvas = document.createElement('canvas');
    this.generate(text, canvas);
    return canvas.toDataURL('image/png');
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.QRCodeGenerator = QRCodeGenerator;
}
