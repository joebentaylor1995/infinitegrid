/**
 * Detects if the current browser is Safari
 * Works for both desktop and mobile Safari
 */
export const isSafari = (): boolean => {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Check for Safari (but not Chrome which also contains 'safari' in user agent)
    const isSafariUA = /^((?!chrome|android).)*safari/i.test(userAgent);
    
    // Additional check for Safari on iOS
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    
    // Check for Safari-specific properties
    const hasSafariProps = 
        'safari' in window ||
        (window as any).ApplePaySession !== undefined;
    
    return isSafariUA || (isIOS && !window.chrome) || hasSafariProps;
};


