/**
 * useDataStream Hook
 * React hook for managing real-time data streams
 */

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export interface DataStream {
  id: string;
  name: string;
  type: string;
  source: string;
  frequency: number;
  active: boolean;
  lastUpdate?: string;
  data?: any[];
}

export interface StreamMetrics {
  totalDataPoints: number;
  avgProcessingTime: number;
  errorRate: number;
}

export const useDataStream = () => {
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [metrics, setMetrics] = useState<StreamMetrics>({
    totalDataPoints: 0,
    avgProcessingTime: 0,
    errorRate: 0,
  });

  const fetchStreams = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/streams`);
      setStreams(response.data);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/streams/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
    fetchMetrics();

    const interval = setInterval(() => {
      fetchStreams();
      fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchStreams, fetchMetrics]);

  return {
    streams,
    metrics,
    refresh: () => {
      fetchStreams();
      fetchMetrics();
    },
  };
};

export default useDataStream;
