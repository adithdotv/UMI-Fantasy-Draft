import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fanDraftContract, ContractDraft } from '@/lib/contract';
import { useWallet } from './useWallet';

export function useActiveDrafts() {
  return useQuery({
    queryKey: ['/api/drafts/active'],
    queryFn: async () => {
      return await fanDraftContract.getActiveDrafts();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useDraft(draftId: number) {
  return useQuery({
    queryKey: ['/api/drafts', draftId],
    queryFn: async () => {
      return await fanDraftContract.getDraft(draftId);
    },
    enabled: !!draftId,
  });
}

export function useJoinDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ draftId, playerIds, entryFee }: {
      draftId: number;
      playerIds: number[];
      entryFee: string;
    }) => {
      return await fanDraftContract.joinDraft(draftId, playerIds, entryFee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
    },
  });
}

export function useDraftParticipants(draftId: number) {
  return useQuery({
    queryKey: ['/api/drafts', draftId, 'participants'],
    queryFn: async () => {
      return await fanDraftContract.getParticipants(draftId);
    },
    enabled: !!draftId,
  });
}

export function usePlayerSelection(draftId: number, userAddress: string) {
  return useQuery({
    queryKey: ['/api/drafts', draftId, 'selection', userAddress],
    queryFn: async () => {
      return await fanDraftContract.getPlayerSelection(draftId, userAddress);
    },
    enabled: !!draftId && !!userAddress,
  });
}

export function useUserWins() {
  const { account } = useWallet();
  
  return useQuery({
    queryKey: ['/api/user/wins', account],
    queryFn: async () => {
      if (!account) return 0;
      return await fanDraftContract.getUserWins(account);
    },
    enabled: !!account,
  });
}

export function useEntryFee() {
  return useQuery({
    queryKey: ['/api/contract/entryFee'],
    queryFn: async () => {
      return await fanDraftContract.getEntryFee();
    },
  });
}
