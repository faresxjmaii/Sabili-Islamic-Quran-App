import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentPosition,
  LocationAccessError,
  normalizeCalculationMethod,
  normalizeMadhab,
  reverseGeocodeCoords,
  validateCoordinates,
  validateManualLocation,
} from '../services/prayerService';
import { useSettings } from '../app/useSettings';

export function usePrayerTimes() {
  const { settings, setCalculationMethod, setLocation } = useSettings();
  const { location, calculationMethod, madhab } = settings;
  const [manualCandidate, setManualCandidate] = useState<{ city: string; country: string } | null>(null);
  const [gpsCandidate, setGpsCandidate] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAccessError, setLocationAccessError] = useState(false);
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

  useEffect(() => {
    const normalizedMethod = normalizeCalculationMethod(calculationMethod);
    if (normalizedMethod !== calculationMethod) {
      setCalculationMethod(normalizedMethod);
    }
  }, [calculationMethod, setCalculationMethod]);

  const activeManualLocation =
    manualCandidate ??
    (location.type === 'manual'
      ? {
          city: location.city?.trim() ?? '',
          country: location.country?.trim() ?? '',
        }
      : null);
  const activeGpsLocation =
    gpsCandidate ??
    (location.type === 'auto' && validateCoordinates(location.latitude, location.longitude)
      ? {
          latitude: location.latitude as number,
          longitude: location.longitude as number,
          accuracy: location.accuracy,
        }
      : null);
  const hasValidManualLocation = validateManualLocation(
    activeManualLocation?.city,
    activeManualLocation?.country
  );
  const canUseAutoLocation =
    location.type === 'auto' &&
    (Boolean(activeGpsLocation) || (locationRequested && permissionState === 'granted'));

  const query = useQuery({
    queryKey: [
      'prayerTimes',
      location.type,
      activeManualLocation,
      activeGpsLocation,
      normalizeCalculationMethod(calculationMethod),
      normalizeMadhab(madhab),
      canUseAutoLocation,
    ],
    queryFn: async () => {
      const method = normalizeCalculationMethod(calculationMethod);
      const school = normalizeMadhab(madhab);

      if (activeManualLocation && hasValidManualLocation) {
        const city = activeManualLocation.city.trim();
        const country = activeManualLocation.country.trim();
        const times = await fetchPrayerTimesByCity(city, country, method, school);

        if (manualCandidate) {
          setLocation({ type: 'manual', city, country });
          setManualCandidate(null);
        }

        return {
          ...times,
          resolvedLocation: {
            city,
            country,
            displayName: `${city}, ${country}`,
          },
        };
      }

      if (location.type === 'auto') {
        const coords = activeGpsLocation ?? (await getCurrentPosition());
        if (!validateCoordinates(coords.latitude, coords.longitude)) {
          throw new Error('prayerTimesUnavailable');
        }

        const [times, resolvedLocation] = await Promise.all([
          fetchPrayerTimesByCoords(coords.latitude, coords.longitude, method, school),
          reverseGeocodeCoords(coords.latitude, coords.longitude, coords.accuracy),
        ]);
        const displayName = resolvedLocation.displayName || location.displayName || 'Current GPS location';

        if (gpsCandidate || !location.latitude || !location.longitude) {
          setLocation({
            type: 'auto',
            city: resolvedLocation.city,
            country: resolvedLocation.country,
            displayName,
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          });
          setGpsCandidate(null);
        }

        return {
          ...times,
          resolvedLocation: {
            ...resolvedLocation,
            displayName,
          },
        };
      }

      throw new Error('manualLocationMissing');
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: hasValidManualLocation || (canUseAutoLocation && !isLocating),
  });

  const refreshPermissionState = async () => {
    if (!navigator.permissions?.query) return;
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionState(result.state);
      if (import.meta.env.DEV) {
        console.debug('[location] permission state', result.state);
      }
    } catch {
      setPermissionState('unsupported');
    }
  };

  const requestLocation = async () => {
    setManualCandidate(null);
    setLocationAccessError(false);
    setIsLocating(true);
    localStorage.setItem('sakina_location_requested', 'true');
    setLocationRequested(true);

    await refreshPermissionState();

    try {
      const coords = await getCurrentPosition();
      if (!validateCoordinates(coords.latitude, coords.longitude)) {
        throw new LocationAccessError('invalid');
      }
      setGpsCandidate({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });
      setPermissionState('granted');
    } catch {
      setLocationAccessError(true);
    } finally {
      setIsLocating(false);
    }
  };

  const useManualLocation = (city: string, country: string) => {
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    if (!validateManualLocation(trimmedCity, trimmedCountry)) return;
    setLocationAccessError(false);
    setGpsCandidate(null);
    setManualCandidate({ city: trimmedCity, country: trimmedCountry });
  };

  return {
    ...query,
    permissionState,
    locationRequested,
    isLocating,
    needsLocationPermission:
      !query.data &&
      ((location.type === 'auto' &&
        !activeGpsLocation &&
        !query.isError &&
        !canUseAutoLocation) ||
        (location.type === 'manual' && !hasValidManualLocation)),
    requestLocation,
    useManualLocation,
    locationAccessError,
  };
}
