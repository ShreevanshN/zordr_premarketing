/**
 * Detects the user's operating system / device platform (Apple vs Android vs Desktop)
 * @returns {'ios' | 'android' | 'desktop'}
 */
export function detectDevicePlatform() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // Apple device detection (iPhone, iPad, iPod, Mac touch devices)
  const isApple =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ||
    (/Macintosh|Mac OS X/i.test(ua) && !/Android/i.test(ua));

  // Android device detection
  const isAndroid = /Android/i.test(ua);

  if (isApple) return 'ios';
  if (isAndroid) return 'android';

  // Desktop OS fallback
  if (/Mac/i.test(navigator.platform)) return 'ios';
  return 'android';
}

/**
 * Validates device and opens the correct App Store or Google Play Store link.
 * @param {object} [links] - Optional custom app store links object { ios, android }
 */
export function handleDownloadNow(links = {}) {
  const platform = detectDevicePlatform();

  const iosUrl = links.ios || 'https://apps.apple.com/app/zordr/id000000000';
  const androidUrl = links.android || 'https://play.google.com/store/apps/details?id=in.zordr.app';

  if (platform === 'ios') {
    window.open(iosUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.open(androidUrl, '_blank', 'noopener,noreferrer');
  }
}
