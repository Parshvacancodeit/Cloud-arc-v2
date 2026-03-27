import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — Generic hook for GET requests
 * @param {Function} fetchFn - async function that returns data
 * @param {Array} deps - dependencies to re-fetch on change
 */
export const useApi = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

/**
 * useRestaurantId — Reads restaurant_id from localStorage
 */
export const useRestaurantId = () => {
  return localStorage.getItem('restaurant_id');
};
