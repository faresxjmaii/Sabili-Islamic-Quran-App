import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentPosition,
  reverseGeocodeCoords,
} from '../services/prayerService';
import { useSettings } from '../app/useSettings';

export function usePrayerTimes() {
  const { settings } = useSettings();
  const { location, calculationMethod, madhab } = settings;
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown' | 'unsupported'>('unknown');
  const [locationRequested, setLocationRequested] = useState(() => {
    if (location.type !== 'auto') return true;
    return localStorage.getItem('sakina_location_requested') === 'true';
  });

  useEffect(() => {
    if (location.type !== 'auto') {
      return;
    }

    if (!navigator.permissions?.query) {
      window.setTimeout(() => setPermissionState('unsupported'), 0);
      return;
    }

    let mounted = true;
    let status: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (!mounted) return;
        status = result;
        setPermissionState(result.state);
        if (result.state === 'granted') {
          localStorage.setItem('sakina_location_requested', 'true');
          setLocationRequested(true);
        }

        result.onchange = () => {
          setPermissionState(result.state);
          if (result.state === 'granted') {
            localStorage.setItem('sakina_location_requested', 'true');
            setLocationRequested(true);
          }
        };
      })
      .catch(() => window.setTimeout(() => setPermissionState('unsupported'), 0));

    return () => {
      mounted = false;
      if (status) status.onchange = null;
    };
  }, [location.type]);

  const query = useQuery({
    queryKey: ['prayerTimes', location, calculationMethod, madhab],
    queryFn: async () => {
      if (location.type === 'auto') {
        const coords = await getCurrentPosition();
        const [times, resolvedLocation] = await Promise.all([
          fetchPrayerTimesByCoords(coords.latitude, coords.longitude, calculationMethod, madhab),
          reverseGeocodeCoords(coords.latitude, coords.longitude, coords.accuracy),
        ]);

        return {
          ...times,
          resolvedLocation,
        };
      }

      if (!location.city || !location.country) {
        throw new Error('Please set a city and country in Settings.');
      }

      const times = await fetchPrayerTimesByCity(
        location.city,
        location.country,
        calculationMethod,
        madhab
      );

      return {
        ...times,
        resolvedLocation: {
          city: location.city,
          country: location.country,
          displayName: `${location.city}, ${location.country}`,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
    },
    staleTime: 10 * 60 * 1000,
    enabled: location.type !== 'auto' || locationRequested || permissionState === 'granted',
  });

  const requestLocation = () => {
    localStorage.setItem('sakina_location_requested', 'true');
    setLocationRequested(true);
  };

  return {
    ...query,
    permissionState,
    locationRequested,
    needsLocationPermission:
      location.type === 'auto' &&
      !query.data &&
      !query.isError &&
      !locationRequested &&
      permissionState !== 'granted',
    requestLocation,
  };
}
