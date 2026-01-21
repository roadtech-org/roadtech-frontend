import { useEffect, useRef, useCallback } from 'react';
import { mechanicApi } from '../api';

interface UseLocationTrackingOptions {
  enabled: boolean;
  intervalMs?: number;
  onError?: (error: GeolocationPositionError) => void;
}

export function useLocationTracking({
  enabled,
  intervalMs = 30000, // 30 seconds default
  onError,
}: UseLocationTrackingOptions) {
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendLocation = useCallback(async (position: GeolocationPosition) => {
    try {
      await mechanicApi.updateLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      return;
    }

    // Initial location send
    navigator.geolocation.getCurrentPosition(
      sendLocation,
      (error) => onError?.(error),
      { enableHighAccuracy: true }
    );

    // Set up interval for periodic updates
    intervalIdRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        sendLocation,
        (error) => onError?.(error),
        { enableHighAccuracy: true }
      );
    }, intervalMs);

    // Optional: Watch for significant position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        // Only send if moved significantly (> 50 meters)
        sendLocation(position);
      },
      (error) => onError?.(error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, intervalMs, sendLocation, onError]);
}
