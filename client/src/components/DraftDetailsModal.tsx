import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDraftParticipants } from '@/hooks/useContract';
import { useQuery } from '@tanstack/react-query';
import { fanDraftContract } from '@/lib/contract';
import { Eye, Users, Trophy } from 'lucide-react';
import { formatChzAmount } from '@/lib/web3';

interface DraftDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: number | null;
  draftName?: string;
  totalPool?: bigint;
}

interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
}

export function DraftDetailsModal({ isOpen, onClose, draftId, draftName, totalPool }: DraftDetailsModalProps) {
  const { data: participants = [] } = useDraftParticipants(draftId || 0);
  
  const { data: players = [] } = useQuery({
    queryKey: ['/api/players'],
    queryFn: async () => {
      const response = await fetch('/api/players');
      return response.json() as Player[];
    },
  });

  const { data: participantSelections = {} } = useQuery({
    queryKey: ['participant-selections', draftId, participants],
    queryFn: async () => {
      if (!draftId || participants.length === 0) return {};
      
      const selections: Record<string, number[]> = {};
      
      for (const participant of participants) {
        try {
          const playerIds = await fanDraftContract.getPlayerSelection(draftId, participant);
          selections[participant] = playerIds;
        } catch (error) {
          console.warn('Could not fetch selection for participant', participant);
          selections[participant] = [];
        }
      }
      
      return selections;
    },
    enabled: !!(draftId && participants.length > 0),
  });

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.name} (${player.position})` : `Player #${playerId}`;
  };

  const getPlayersByPosition = (playerIds: number[]) => {
    const positions = ['GK', 'DEF', 'MID', 'ATT'];
    const positionGroups: Record<string, Player[]> = {};
    
    positions.forEach(pos => {
      positionGroups[pos] = [];
    });

    playerIds.forEach(id => {
      const player = players.find(p => p.id === id);
      if (player) {
        positionGroups[player.position].push(player);
      }
    });

    return positionGroups;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>{draftName || `Draft #${draftId}`}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View all participants and their selected teams
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Draft Info */}
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-300">Participants: {participants.length}</span>
              </div>
              {totalPool && (
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-300">Pool: {formatChzAmount(totalPool.toString())} CHZ</span>
                </div>
              )}
            </div>
          </div>

          {/* Participants List */}
          <ScrollArea className="h-96">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant, index) => {
                  const playerIds = participantSelections[participant] || [];
                  const positionGroups = getPlayersByPosition(playerIds);
                  
                  return (
                    <div key={participant} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium text-sm">
                            {participant.slice(0, 6)}...{participant.slice(-4)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {playerIds.length}/11 players
                        </Badge>
                      </div>

                      {playerIds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {['GK', 'DEF', 'MID', 'ATT'].map(position => (
                            <div key={position} className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase">
                                {position} ({positionGroups[position].length})
                              </h4>
                              <div className="space-y-1">
                                {positionGroups[position].map(player => (
                                  <div 
                                    key={player.id}
                                    className="text-xs bg-gray-700 rounded px-2 py-1"
                                  >
                                    <div className="font-medium">{player.name}</div>
                                    <div className="text-gray-400">{player.team}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No team selected yet
                        </div>
                      )}
                      
                      {index < participants.length - 1 && (
                        <Separator className="mt-4 bg-gray-700" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}