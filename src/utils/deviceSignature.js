// Generates and stores a persistent, anonymous ID for this browser so
// we can recognize "the same person reporting the same thing again"
// without requiring any login system.
//
// Limitation: this is a soft fingerprint, not real identity — clearing
// site data, using a different browser, or incognito mode resets it.
// That's an acceptable trade-off for this use case (no login friction),
// but worth knowing if you ever need hard anti-spam guarantees.

const STORAGE_KEY = 'lightup_device_id';

export function getDeviceId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'dev-' + Math.random().toString(36).slice(2) + '-' + Date.now();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (err) {
    // localStorage can be unavailable (private browsing, storage full,
    // etc.) — fall back to a session-only id so reporting still works.
    console.warn('localStorage unavailable, using a session-only device id', err);
    return 'session-' + Math.random().toString(36).slice(2);
  }
}

/**
 * Builds a signature that uniquely identifies "this device reporting
 * this status for this zone". Used as the Firebase key under
 * `signatures/{signature}` to detect and block repeat reports.
 */
export function buildReportSignature(deviceId, zoneId, type) {
  return `${deviceId}_${zoneId}_${type}`;
}