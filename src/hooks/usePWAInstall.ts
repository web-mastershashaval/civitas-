import { useState, useEffect } from 'react';

/**
 * Hook to handle PWA installation logic.
 * Listens for 'beforeinstallprompt' and provides a trigger function.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        console.log("PWA Hook: Initializing...");

        const handler = (e: any) => {
            console.log("PWA Hook: 'beforeinstallprompt' captured!", e);
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            console.log("PWA Hook: App is already installed/standalone.");
            setShowInstallPrompt(false);
        }

        // Diagnostic: Log current service worker state
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                console.log("PWA Hook: Service Worker registration state:", reg ? "Found" : "Missing");
            });
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    return {
        showInstallPrompt,
        installApp
    };
}
