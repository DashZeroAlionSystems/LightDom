import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardData } from '../api/dashboardApi';

const DASHBOARD_QUERY_KEY = ['dashboard', 'overview'];

interface UseDashboardDataOptions {
  recentLimit?: number;
  refetchIntervalMs?: number;
}

export const useDashboardData = (
  options: UseDashboardDataOptions = {},
) => {
  const { recentLimit = 5, refetchIntervalMs = 5000 } = options;

  return useQuery<DashboardData, Error>({
    queryKey: [...DASHBOARD_QUERY_KEY, recentLimit],
    queryFn: () => dashboardApi.getDashboardData(recentLimit),
    refetchInterval: refetchIntervalMs,
    staleTime: refetchIntervalMs,
  });
};
