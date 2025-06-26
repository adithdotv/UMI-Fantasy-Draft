import { useState } from 'react';
import { Calendar, Trophy, Medal, Clock, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';
import { fanDraftContract } from '@/lib/contract';
import { formatChzAmount } from '@/lib/web3';
import { CountdownTimer } from './CountdownTimer';
import { DraftDetailsModal } from './DraftDetailsModal';

interface UserDraftHistory {
  draftId: number;
  totalPool: bigint;
  deadline: bigint;
  isActive: boolean;
  hasWon: boolean;
  participantCount: number;
}

export function MyHistory() {
  const { account } = useWallet();
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: userHistory = [], isLoading } = useQuery({
    queryKey: ['userHistory', account],
    queryFn: async () => {
      if (!account) return [];
      
      const history: UserDraftHistory[] = [];
      const draftCounter = await fanDraftContract.getDraftCounter();
      
      // Check each draft to see if user participated
      for (let i = 1; i <= draftCounter; i++) {
        try {
          const participants = await fanDraftContract.getParticipants(i);
          const userParticipated = participants.some(p => 
            p.toLowerCase() === account.toLowerCase()
          );
          
          if (userParticipated) {
            const draft = await fanDraftContract.getDraft(i);
            if (draft) {
              // Check if user won this draft
              let hasWon = false;
              try {
                const winner = await fanDraftContract.getDraftWinner(i);
                hasWon = winner.toLowerCase() === account.toLowerCase();
              } catch (e) {
                // Draft may not be resolved yet
              }
              
              history.push({
                draftId: i,
                totalPool: draft.totalPool,
                deadline: draft.deadline,
                isActive: draft.isActive,
                hasWon,
                participantCount: participants.length,
              });
            }
          }
        } catch (error) {
          // Skip drafts that can't be fetched
        }
      }
      
      // Sort by draft ID descending (most recent first)
      return history.sort((a, b) => b.draftId - a.draftId);
    },
    enabled: !!account,
    refetchInterval: 30000,
  });

  const handleViewDraft = (draftId: number) => {
    setSelectedDraftId(draftId);
    setIsDetailsModalOpen(true);
  };

  const getStatusBadge = (draft: UserDraftHistory) => {
    if (draft.hasWon) {
      return <Badge className="bg-green-600 text-white">Won</Badge>;
    }
    if (draft.isActive) {
      return <Badge className="bg-blue-600 text-white">Active</Badge>;
    }
    return <Badge variant="secondary">Completed</Badge>;
  };

  if (!account) {
    return (
      <section className="mb-12" id='history'>
        <h2 className="text-2xl font-bold text-slate-50 mb-6 flex items-center space-x-2">
          <Medal className="h-6 w-6 text-accent-green" />
          <span>My History</span>
        </h2>
        <Card className="bg-secondary-dark border-slate-700">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Connect your wallet to view your draft history</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-50 mb-6 flex items-center space-x-2">
          <Medal className="h-6 w-6 text-accent-green" />
          <span>My History</span>
        </h2>
        <Card className="bg-secondary-dark border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your draft history...</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <>
      <section className="mb-12" id='history'>
        <h2 className="text-2xl font-bold text-slate-50 mb-6 flex items-center space-x-2">
          <Medal className="h-6 w-6 text-accent-green" />
          <span>My History</span>
        </h2>

        {userHistory.length === 0 ? (
          <Card className="bg-secondary-dark border-slate-700">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">No Draft History</h3>
              <p className="text-slate-400">You haven't participated in any drafts yet</p>
              <p className="text-slate-500 text-sm mt-2">Join an active draft to start building your history</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userHistory.map((draft) => (
              <Card key={draft.draftId} className="bg-secondary-dark border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-50">Premier League Week {draft.draftId}</CardTitle>
                    {getStatusBadge(draft)}
                  </div>
                  <CardDescription>Fantasy Tournament</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Prize Pool</p>
                      <p className="text-lg font-semibold text-slate-50">
                        {parseFloat(formatChzAmount(draft.totalPool.toString())).toFixed(2)} CHZ
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Participants</p>
                      <p className="text-lg font-semibold text-slate-50">{draft.participantCount}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    {draft.isActive ? (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <CountdownTimer deadline={draft.deadline} className="text-blue-400" />
                      </div>
                    ) : draft.hasWon ? (
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-green-500" />
                        <span className="text-green-400 font-medium">You won this draft!</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Medal className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-400">Draft completed</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleViewDraft(draft.draftId)}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <DraftDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        draftId={selectedDraftId}
        totalPool={userHistory.find(d => d.draftId === selectedDraftId)?.totalPool}
      />
    </>
  );
}