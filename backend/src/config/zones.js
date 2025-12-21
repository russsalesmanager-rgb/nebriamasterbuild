/*
 * Nebria Zone Constants
 * 
 * Centralized definition of all platform zones.
 */

const ZONES = {
  HOME: 'home',
  YOU: 'you',
  PIN: 'pin',
  PIX: 'pix',
  THREAD: 'thread',
  X: 'x',
  VR: 'vr',
  AI: 'ai'
};

const ZONE_KEYS = Object.values(ZONES);

module.exports = {
  ZONES,
  ZONE_KEYS
};
