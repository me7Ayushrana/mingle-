import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { momentsService } from '@/services/moments.service';
import type { CreateMomentPayload, Moment } from '@/types/moment';

export const momentKeys = {
  all: ['moments'] as const,
  feed: ['moments', 'feed'] as const,
};

export function useMomentsFeed() {
  return useQuery({
    queryKey: momentKeys.feed,
    queryFn: () => momentsService.getFeed(),
  });
}

export function useCreateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMomentPayload) => momentsService.createMoment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.feed });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; isLiked?: boolean }) =>
      momentsService.toggleLike(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: momentKeys.feed });
      const previous = queryClient.getQueryData<Moment[]>(momentKeys.feed);

      if (previous) {
        queryClient.setQueryData<Moment[]>(
          momentKeys.feed,
          previous.map((moment) => {
            if (moment.id === id) {
              const currentLiked = Boolean(moment.isLiked);
              const currentLikes = typeof moment.likes === 'number' ? moment.likes : (moment.likesCount ?? 0);
              return {
                ...moment,
                isLiked: !currentLiked,
                likes: currentLikes + (currentLiked ? -1 : 1),
                likesCount: currentLikes + (currentLiked ? -1 : 1),
              };
            }
            return moment;
          })
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(momentKeys.feed, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.feed });
    },
  });
}
