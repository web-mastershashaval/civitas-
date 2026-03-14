import { useState, useEffect } from 'react';

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            alert("Push notifications are not supported in this browser.");
            return;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Here we would eventually subscribe the user via the service worker
                // const registration = await navigator.serviceWorker.ready;
                // const subscription = await registration.pushManager.subscribe(...)
                console.log("Notification permission granted.");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
    };

    return {
        permission,
        isSupported,
        requestPermission
    };
}
