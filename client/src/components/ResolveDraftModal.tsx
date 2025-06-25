import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fanDraftContract } from '@/lib/contract';
import { useDraftParticipants } from '@/hooks/useContract';

interface ResolveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: number | null;
}

export function ResolveDraftModal({ isOpen, onClose, draftId }: ResolveDraftModalProps) {
  const [winner, setWinner] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants = [] } = useDraftParticipants(draftId || 0);

  const resolveDraftMutation = useMutation({
    mutationFn: async ({ draftId, winner, score }: { draftId: number; winner: string; score: number }) => {
      return await fanDraftContract.resolveDraft(draftId, winner, score);
    },
    onSuccess: () => {
      toast({
        title: "Draft Resolved Successfully",
        description: "Prize has been distributed to the winner",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error resolving draft:', error);
      toast({
        title: "Failed to Resolve Draft",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setWinner('');
    setScore('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!draftId) return;

    // Validate winner
    if (!winner.trim()) {
      toast({
        title: "Invalid Winner",
        description: "Please select a winner",
        variant: "destructive",
      });
      return;
    }

    // Validate score
    const scoreValue = parseInt(score);
    if (isNaN(scoreValue) || scoreValue < 0) {
      toast({
        title: "Invalid Score",
        description: "Please enter a valid score",
        variant: "destructive",
      });
      return;
    }

    resolveDraftMutation.mutate({ 
      draftId, 
      winner: winner.trim(), 
      score: scoreValue 
    });
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
            Select the winner and their score to distribute the prize.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 p-4 border border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-400">
              🏆 Winner
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="winner" className="text-xs text-gray-400">
                  Participant
                </Label>
                <Select 
                  value={winner} 
                  onValueChange={setWinner}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {participants.map((participant, idx) => (
                      <SelectItem 
                        key={idx} 
                        value={participant}
                        className="text-white hover:bg-gray-700"
                      >
                        {participant.slice(0, 6)}...{participant.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="score" className="text-xs text-gray-400">
                  Score
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  placeholder="Enter score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={resolveDraftMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
            >
              {resolveDraftMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                'Resolve Draft'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}