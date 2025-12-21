const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Placeholder: Start a VR session
router.post('/session', authMiddleware, async (req, res) => {
  // In a real implementation this would create a VR session record and
  // return connection details for WebXR / Unity.  Here we just
  // return a mock session ID.
  const sessionId = `${req.user.id}-${Date.now()}`;
  return res.json({ sessionId });
});

module.exports = router;