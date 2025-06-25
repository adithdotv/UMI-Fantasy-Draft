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

export function useContractOwner() {
  return useQuery({
    queryKey: ['/api/contract-owner'],
    queryFn: async () => {
      const owner = await fanDraftContract.getOwner();
      return owner;
    },
    staleTime: 5 * 60 * 1000, // Owner doesn't change often
  });
}

export function useBlockchainLeaderboard() {
  return useQuery({
    queryKey: ['blockchainLeaderboard'],
    queryFn: async () => {
      try {
        // Get all drafts to find unique participants
        const activeDrafts = await fanDraftContract.getActiveDrafts();
        const allParticipants = new Set<string>();
        
        // Collect all participants from all drafts
        for (const draft of activeDrafts) {
          try {
            const participants = await fanDraftContract.getParticipants(Number(draft.id));
            participants.forEach(p => allParticipants.add(p));
          } catch (e) {
            console.warn('Could not fetch participants for draft', draft.id);
          }
        }
        
        // Get win counts for each participant
        const leaderboardData = await Promise.all(
          Array.from(allParticipants).map(async (address) => {
            try {
              const wins = await fanDraftContract.getUserWins(address);
              return {
                userAddress: address,
                totalWins: wins,
                totalEarnings: wins * 10, // Approximate earnings based on wins
                gamesPlayed: Math.max(wins, 1), // Minimum 1 to avoid division by zero
              };
            } catch (e) {
              return {
                userAddress: address,
                totalWins: 0,
                totalEarnings: 0,
                gamesPlayed: 1,
              };
            }
          })
        );
        
        // Sort by wins descending, then filter out users with 0 wins
        return leaderboardData
          .filter(player => player.totalWins > 0)
          .sort((a, b) => b.totalWins - a.totalWins);
      } catch (error) {
        console.error('Error fetching blockchain leaderboard:', error);
        return [];
      }
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function usePlatformRevenue() {
  return useQuery({
    queryKey: ['platformRevenue'],
    queryFn: async () => {
      return await fanDraftContract.getPlatformRevenue();
    },
    staleTime: 15000, // Cache for 15 seconds
  });
}
