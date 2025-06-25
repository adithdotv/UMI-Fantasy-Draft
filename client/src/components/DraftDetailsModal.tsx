import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Trophy } from 'lucide-react';
import { formatChzAmount } from '@/lib/web3';
import { useDraftParticipants } from '@/hooks/useContract';

interface DraftDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: number | null;
  draftName?: string;
  totalPool?: bigint;
}

export function DraftDetailsModal({ isOpen, onClose, draftId, draftName, totalPool }: DraftDetailsModalProps) {
  // Only call hooks when the component is actually being used
  const shouldFetchData = isOpen && draftId;
  const { data: participants = [] } = useDraftParticipants(shouldFetchData ? draftId : 0);



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
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={participant} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs text-[#f4f4f5]">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium text-sm">
                          {participant.slice(0, 6)}...{participant.slice(-4)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Joined
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}