import { useQuery } from '@tanstack/react-query';

import { discoverService } from '@/services/discover.service';

export const discoverKeys = {
  suggested: ['discover', 'suggested'] as const,
};

export function useSuggestedPeople() {
  return useQuery({
    queryKey: discoverKeys.suggested,
    queryFn: discoverService.getSuggested,
    staleTime: 60_000,
  });
}
