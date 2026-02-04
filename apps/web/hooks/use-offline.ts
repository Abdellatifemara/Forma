'use client';

import { useState, useEffect, useCallback } from 'react';

interface PendingWorkout {
  id: string;
  data: any;
  timestamp: number;
}

// IndexedDB helper
const DB_NAME = 'forma-offline';
const DB_VERSION = 1;
const PENDING_WORKOUTS_STORE = 'pending-workouts';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PENDING_WORKOUTS_STORE)) {
        db.createObjectStore(PENDING_WORKOUTS_STORE, { keyPath: 'id' });
      }
    };
  });
}

// Hook to track online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook to manage offline workout storage
export function useOfflineWorkouts() {
  const [pendingCount, setPendingCount] = useState(0);
  const isOnline = useOnlineStatus();

  // Load pending count on mount
  useEffect(() => {
    loadPendingCount();
  }, []);

  // Try to sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncPendingWorkouts();
    }
  }, [isOnline]);

  const loadPendingCount = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_WORKOUTS_STORE, 'readonly');
      const store = tx.objectStore(PENDING_WORKOUTS_STORE);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        setPendingCount(countRequest.result);
      };
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  };

  // Save workout for offline sync
  const saveWorkoutOffline = useCallback(async (workoutData: any) => {
    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_WORKOUTS_STORE, 'readwrite');
      const store = tx.objectStore(PENDING_WORKOUTS_STORE);

      const pendingWorkout: PendingWorkout = {
        id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: workoutData,
        timestamp: Date.now(),
      };

      store.add(pendingWorkout);

      tx.oncomplete = () => {
        setPendingCount((prev) => prev + 1);
        // Request background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            (registration as any).sync.register('sync-workouts');
          });
        }
      };

      return { success: true, id: pendingWorkout.id };
    } catch (error) {
      console.error('Failed to save workout offline:', error);
      return { success: false, error };
    }
  }, []);

  // Sync pending workouts
  const syncPendingWorkouts = useCallback(async () => {
    if (!isOnline) return { synced: 0, failed: 0 };

    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_WORKOUTS_STORE, 'readonly');
      const store = tx.objectStore(PENDING_WORKOUTS_STORE);

      return new Promise<{ synced: number; failed: number }>((resolve) => {
        const request = store.getAll();

        request.onsuccess = async () => {
          const pendingWorkouts: PendingWorkout[] = request.result;
          let synced = 0;
          let failed = 0;

          for (const workout of pendingWorkouts) {
            try {
              // Get auth token from cookie
              const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('forma-token='))
                ?.split('=')[1];

              const response = await fetch('/api/workouts/log', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(workout.data),
              });

              if (response.ok) {
                // Delete from IndexedDB
                const deleteTx = db.transaction(PENDING_WORKOUTS_STORE, 'readwrite');
                deleteTx.objectStore(PENDING_WORKOUTS_STORE).delete(workout.id);
                synced++;
              } else {
                failed++;
              }
            } catch (error) {
              console.error('Failed to sync workout:', error);
              failed++;
            }
          }

          setPendingCount(failed);
          resolve({ synced, failed });
        };
      });
    } catch (error) {
      console.error('Failed to sync workouts:', error);
      return { synced: 0, failed: 0 };
    }
  }, [isOnline]);

  // Get all pending workouts
  const getPendingWorkouts = useCallback(async (): Promise<PendingWorkout[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_WORKOUTS_STORE, 'readonly');
      const store = tx.objectStore(PENDING_WORKOUTS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get pending workouts:', error);
      return [];
    }
  }, []);

  return {
    isOnline,
    pendingCount,
    saveWorkoutOffline,
    syncPendingWorkouts,
    getPendingWorkouts,
  };
}

// Hook to register service worker
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setIsRegistered(true);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          window.location.reload();
        });
      });
    }
  }, []);

  return {
    isRegistered,
    updateAvailable,
    updateApp,
  };
}

// Push notification permission hook
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      setIsSubscribed(true);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, []);

  return {
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
  };
}

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
