import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentPosition,
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
  const hasValidManualLocation = validateManualLocation(
    activeManualLocation?.city,
    activeManualLocation?.country
  );
  const canUseAutoLocation =
    location.type === 'auto' && (locationRequested || permissionState === 'granted');

  const query = useQuery({
    queryKey: [
      'prayerTimes',
      location.type,
      activeManualLocation,
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
        const coords = await getCurrentPosition();
        if (!validateCoordinates(coords.latitude, coords.longitude)) {
          throw new Error('prayerTimesUnavailable');
        }

        const [times, resolvedLocation] = await Promise.all([
          fetchPrayerTimesByCoords(coords.latitude, coords.longitude, method, school),
          reverseGeocodeCoords(coords.latitude, coords.longitude, coords.accuracy),
        ]);

        return {
          ...times,
          resolvedLocation,
        };
      }

      throw new Error('manualLocationMissing');
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: hasValidManualLocation || canUseAutoLocation,
  });

  const requestLocation = () => {
    setManualCandidate(null);
    localStorage.setItem('sakina_location_requested', 'true');
    setLocationRequested(true);
  };

  const useManualLocation = (city: string, country: string) => {
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    if (!validateManualLocation(trimmedCity, trimmedCountry)) return;
    setManualCandidate({ city: trimmedCity, country: trimmedCountry });
  };

  return {
    ...query,
    permissionState,
    locationRequested,
    needsLocationPermission:
      !query.data &&
      ((location.type === 'auto' &&
        !query.isError &&
        !locationRequested &&
        permissionState !== 'granted') ||
        (location.type === 'manual' && !hasValidManualLocation)),
    requestLocation,
    useManualLocation,
  };
}
