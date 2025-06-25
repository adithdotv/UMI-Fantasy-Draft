import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { formatChzAmount } from '@/lib/web3';
import { useDraftParticipants, usePlayerSelection } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';

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
  const { account } = useWallet();
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  
  // Only call hooks when the component is actually being used
  const shouldFetchData = isOpen && draftId;
  const { data: participants = [] } = useDraftParticipants(shouldFetchData ? draftId : 0);

  const { data: players = [] } = useQuery({
    queryKey: ['/api/players'],
    queryFn: async () => {
      const response = await fetch('/api/players');
      return response.json() as Player[];
    },
    enabled: shouldFetchData,
  });

  // Sort participants to put current user first
  const sortedParticipants = [...participants].sort((a, b) => {
    if (account && a.toLowerCase() === account.toLowerCase()) return -1;
    if (account && b.toLowerCase() === account.toLowerCase()) return 1;
    return 0;
  });



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>{draftName || `Draft #${draftId}`}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View all participants in this draft
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
          <div className="max-h-96 overflow-y-auto">
            {sortedParticipants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedParticipants.map((participant, index) => (
                  <ParticipantCard
                    key={participant}
                    participant={participant}
                    index={index}
                    draftId={draftId}
                    players={players}
                    isCurrentUser={account?.toLowerCase() === participant.toLowerCase()}
                    isExpanded={expandedParticipant === participant}
                    onToggleExpand={() => setExpandedParticipant(
                      expandedParticipant === participant ? null : participant
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ParticipantCardProps {
  participant: string;
  index: number;
  draftId: number | null;
  players: Player[];
  isCurrentUser: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ParticipantCard({ 
  participant, 
  index, 
  draftId, 
  players, 
  isCurrentUser, 
  isExpanded, 
  onToggleExpand 
}: ParticipantCardProps) {
  const { data: playerSelection = [] } = usePlayerSelection(draftId || 0, participant);

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

  const positionGroups = getPlayersByPosition(playerSelection);

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs text-[#f4f4f5]">
            #{index + 1}
          </Badge>
          {isCurrentUser && (
            <Badge variant="default" className="text-xs bg-blue-600 text-white">
              You
            </Badge>
          )}
          <span className="font-medium text-sm">
            {participant.slice(0, 6)}...{participant.slice(-4)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {playerSelection.length}/11 players
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          {playerSelection.length > 0 ? (
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
        </div>
      )}
    </div>
  );
}