import { useCallback, useEffect, useState } from 'react';
import api from '../api/client.js';

/** Small fetch helper: { data, loading, error, reload } */
export default function useApi(path, { deps = [], skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get(path);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, reload: load };
}
