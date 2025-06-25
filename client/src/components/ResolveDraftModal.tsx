import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fanDraftContract } from '@/lib/contract';
import { Loader2, Trophy } from 'lucide-react';
import { useDraftParticipants } from '@/hooks/useContract';

interface ResolveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: number | null;
}

export function ResolveDraftModal({ isOpen, onClose, draftId }: ResolveDraftModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: participants = [] } = useDraftParticipants(draftId || 0);
  
  const [winners, setWinners] = useState<string[]>(['', '', '']);
  const [scores, setScores] = useState<string[]>(['', '', '']);

  const resolveDraftMutation = useMutation({
    mutationFn: async ({ draftId, winners, scores }: { draftId: number; winners: string[]; scores: number[] }) => {
      return await fanDraftContract.resolveDraft(draftId, winners, scores);
    },
    onSuccess: () => {
      toast({
        title: "Draft Resolved",
        description: "Draft has been resolved and prizes distributed",
      });
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['/api/active-drafts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Resolve Draft",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setWinners(['', '', '']);
    setScores(['', '', '']);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!draftId) return;

    // Validate winners
    const validWinners = winners.filter(w => w.trim() !== '');
    if (validWinners.length !== 3) {
      toast({
        title: "Invalid Winners",
        description: "Please select exactly 3 winners",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate winners
    if (new Set(validWinners).size !== 3) {
      toast({
        title: "Duplicate Winners",
        description: "Each winner must be different",
        variant: "destructive",
      });
      return;
    }

    // Validate scores
    const validScores = scores.map(s => parseInt(s)).filter(s => !isNaN(s) && s >= 0);
    if (validScores.length !== 3) {
      toast({
        title: "Invalid Scores",
        description: "Please enter valid scores for all winners",
        variant: "destructive",
      });
      return;
    }

    resolveDraftMutation.mutate({ 
      draftId, 
      winners: validWinners, 
      scores: validScores 
    });
  };

  const updateWinner = (position: number, address: string) => {
    const newWinners = [...winners];
    newWinners[position] = address;
    setWinners(newWinners);
  };

  const updateScore = (position: number, score: string) => {
    const newScores = [...scores];
    newScores[position] = score;
    setScores(newScores);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Resolve Draft #{draftId}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select the top 3 participants and their scores to distribute prizes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            <p>Prize Distribution:</p>
            <p>• 1st Place: 60% of prize pool</p>
            <p>• 2nd Place: 25% of prize pool</p>
            <p>• 3rd Place: 15% of prize pool</p>
          </div>

          {[0, 1, 2].map((position) => (
            <div key={position} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-300">
                {position === 0 ? '1st' : position === 1 ? '2nd' : '3rd'} Place Winner
              </Label>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={winners[position]} onValueChange={(value) => updateWinner(position, value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {participants.map((participant) => (
                      <SelectItem 
                        key={participant} 
                        value={participant}
                        className="text-white hover:bg-gray-700"
                      >
                        {participant.slice(0, 6)}...{participant.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="0"
                  value={scores[position]}
                  onChange={(e) => updateScore(position, e.target.value)}
                  placeholder="Score"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          ))}

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={resolveDraftMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {resolveDraftMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trophy className="mr-2 h-4 w-4" />
              )}
              Resolve & Distribute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}