/**
 * Extension Bridge API
 * Connects the Chrome extension to the main application
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Store for extension sessions
const extensionSessions = new Map();

// Validate extension ID
function validateExtension(extensionId, token) {
  // In production, validate against a whitelist of allowed extensions
  const allowedExtensions = process.env.ALLOWED_EXTENSIONS?.split(',') || [];
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extensionId)) {
    return false;
  }
  
  // Validate token if provided
  if (token && process.env.EXTENSION_SECRET) {
    const expectedToken = crypto
      .createHmac('sha256', process.env.EXTENSION_SECRET)
      .update(extensionId)
      .digest('hex');
    return token === expectedToken;
  }
  
  return true;
}

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Extension authentication
router.post('/auth', async (req, res) => {
  try {
    const { extensionId, token } = req.body;
    
    if (!extensionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Extension ID required' 
      });
    }
    
    // Validate extension
    const isValid = validateExtension(extensionId, token);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid extension credentials' 
      });
    }
    
    // Generate session token
    const sessionToken = generateToken();
    const sessionData = {
      extensionId,
      token: sessionToken,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    extensionSessions.set(sessionToken, sessionData);
    
    res.json({ 
      success: true,
      valid: true, 
      sessionToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error('Extension auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
});

// Middleware to validate session
function validateSession(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No session token provided' 
    });
  }
  
  const session = extensionSessions.get(token);
  if (!session) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid session' 
    });
  }
  
  // Check session expiry (1 hour)
  const sessionAge = Date.now() - session.createdAt.getTime();
  if (sessionAge > 3600000) {
    extensionSessions.delete(token);
    return res.status(401).json({ 
      success: false, 
      error: 'Session expired' 
    });
  }
  
  // Update last activity
  session.lastActivity = new Date();
  req.extensionSession = session;
  next();
}

// DOM optimization requests from extension
router.post('/optimize', validateSession, async (req, res) => {
  try {
    const { url, dom, metrics } = req.body;
    
    if (!url || !dom) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and DOM data required' 
      });
    }
    
    // Calculate optimization (simplified version)
    const optimization = {
      url,
      originalSize: dom.length,
      optimizedSize: Math.floor(dom.length * 0.7), // Mock 30% reduction
      savings: Math.floor(dom.length * 0.3),
      optimizations: [
        { type: 'unused-css', savings: Math.floor(dom.length * 0.15) },
        { type: 'redundant-js', savings: Math.floor(dom.length * 0.1) },
        { type: 'dom-cleanup', savings: Math.floor(dom.length * 0.05) }
      ],
      metrics: metrics || {}
    };
    
    // Calculate reward based on savings
    const reward = Math.floor(optimization.savings / 1000); // 1 token per KB saved
    
    res.json({ 
      success: true,
      optimization, 
      reward,
      extensionId: req.extensionSession.extensionId
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Optimization failed' 
    });
  }
});

// Mining notifications from extension
router.post('/mining-update', validateSession, async (req, res) => {
  try {
    const { blockData, proof } = req.body;
    
    if (!blockData || !proof) {
      return res.status(400).json({ 
        success: false, 
        error: 'Block data and proof required' 
      });
    }
    
    // Process mining update
    console.log(`Mining update from extension ${req.extensionSession.extensionId}`);
    console.log('Block data:', blockData);
    console.log('Proof:', proof);
    
    // In production, this would validate the proof and update blockchain
    
    res.json({ 
      success: true,
      message: 'Mining update received',
      extensionId: req.extensionSession.extensionId
    });
  } catch (error) {
    console.error('Mining update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Mining update failed' 
    });
  }
});

// Get extension statistics
router.get('/stats', validateSession, async (req, res) => {
  try {
    const extensionId = req.extensionSession.extensionId;
    
    // Mock statistics - in production, fetch from database
    const stats = {
      extensionId,
      totalOptimizations: 42,
      totalSavings: 1048576, // 1MB
      tokensEarned: 250,
      sitesAnalyzed: 15,
      lastActivity: req.extensionSession.lastActivity
    };
    
    res.json({ 
      success: true,
      stats 
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get stats' 
    });
  }
});

// Disconnect extension
router.post('/disconnect', validateSession, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    extensionSessions.delete(token);
    
    res.json({ 
      success: true,
      message: 'Extension disconnected' 
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Disconnect failed' 
    });
  }
});

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of extensionSessions.entries()) {
    const sessionAge = now - session.createdAt.getTime();
    if (sessionAge > 3600000) { // 1 hour
      extensionSessions.delete(token);
      console.log(`Cleaned up expired session for extension ${session.extensionId}`);
    }
  }
}, 600000); // Clean up every 10 minutes

module.exports = router;


