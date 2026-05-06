import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToPageTop } from '../utils/routeScroll';

type LocationState = {
  targetVerseKey?: string;
};

export default function RouteScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPathRef = useRef(location.pathname);
  const hasHandledInitialRouteRef = useRef(false);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (hasHandledInitialRouteRef.current) return;
    hasHandledInitialRouteRef.current = true;

    if (initialPathRef.current !== '/') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.targetVerseKey) return;

    scrollToPageTop();
  }, [location.pathname, location.search, location.state]);

  return null;
}
