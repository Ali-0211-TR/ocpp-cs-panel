import { useQuery } from '@tanstack/react-query';
import { sessionApi } from './session.api';

export const sessionKeys = {
  all: ['session'] as const,
  me: () => [...sessionKeys.all, 'me'] as const,
};

export const useCurrentUser = (enabled = true) =>
  useQuery({
    queryKey: sessionKeys.me(),
    queryFn: sessionApi.me,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
