import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useJoinDraft, useEntryFee } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Player } from '@shared/schema';
import { X, Check } from 'lucide-react';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: number | null;
}

export function PlayerSelectionModal({ isOpen, onClose, draftId }: PlayerSelectionModalProps) {
  const { account, isConnected } = useWallet();
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('GK');
  
  const { data: entryFee = '25' } = useEntryFee();
  const joinDraftMutation = useJoinDraft();

  const { data: players = [] } = useQuery({
    queryKey: ['/api/players'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/players');
      return response.json();
    },
  });

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlayers([]);
      setSelectedPosition('GK');
    }
  }, [isOpen]);

  const getPlayersByPosition = (position: string): Player[] => {
    return players.filter((player: Player) => player.position === position);
  };

  const getSelectedByPosition = (position: string): number => {
    const positionPlayers = getPlayersByPosition(position);
    return selectedPlayers.filter(id => 
      positionPlayers.some(p => p.id === id)
    ).length;
  };

  const getPositionLimits = (position: string): number => {
    switch (position) {
      case 'GK': return 1;
      case 'DEF': return 4;
      case 'MID': return 3;
      case 'FWD': return 3;
      default: return 0;
    }
  };

  const canSelectPlayer = (player: Player): boolean => {
    if (selectedPlayers.includes(player.id)) return true;
    const currentCount = getSelectedByPosition(player.position);
    const limit = getPositionLimits(player.position);
    return currentCount < limit && selectedPlayers.length < 11;
  };

  const togglePlayer = (player: Player) => {
    if (!canSelectPlayer(player) && !selectedPlayers.includes(player.id)) {
      toast({
        title: "Cannot select player",
        description: `Maximum ${getPositionLimits(player.position)} ${player.position} players allowed`,
        variant: "destructive",
      });
      return;
    }

    setSelectedPlayers(prev => 
      prev.includes(player.id)
        ? prev.filter(id => id !== player.id)
        : [...prev, player.id]
    );
  };

  const handleJoinDraft = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to join the draft",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlayers.length !== 11) {
      toast({
        title: "Invalid team selection",
        description: "You must select exactly 11 players",
        variant: "destructive",
      });
      return;
    }

    if (!draftId) return;

    try {
      const txHash = await joinDraftMutation.mutateAsync({
        draftId,
        playerIds: selectedPlayers,
        entryFee,
      });

      toast({
        title: "Successfully joined draft!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to join draft",
        description: error.message || "An error occurred while joining the draft",
        variant: "destructive",
      });
    }
  };

  const getAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const colors = [
      'from-accent-green to-accent-blue',
      'from-accent-blue to-purple-500',
      'from-red-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-purple-500 to-indigo-500'
    ];
    const colorIndex = name.length % colors.length;
    return { initials, gradient: colors[colorIndex] };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-secondary-dark border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-50">
            Select Your Team (11 Players)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formation Display */}
          <div>
            <h4 className="text-lg font-semibold text-slate-50 mb-3">
              Formation: 1-4-3-3 ({selectedPlayers.length}/11 selected)
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">GK ({getSelectedByPosition('GK')}/1)</p>
                <div className="h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-300">Goalkeeper</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">DEF ({getSelectedByPosition('DEF')}/4)</p>
                <div className="h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-300">Defenders</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">MID ({getSelectedByPosition('MID')}/3)</p>
                <div className="h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-300">Midfielders</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">FWD ({getSelectedByPosition('FWD')}/3)</p>
                <div className="h-8 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-300">Forwards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Selection Tabs */}
          <Tabs value={selectedPosition} onValueChange={setSelectedPosition}>
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="GK" className="data-[state=active]:bg-accent-green">
                Goalkeepers
              </TabsTrigger>
              <TabsTrigger value="DEF" className="data-[state=active]:bg-accent-green">
                Defenders
              </TabsTrigger>
              <TabsTrigger value="MID" className="data-[state=active]:bg-accent-green">
                Midfielders
              </TabsTrigger>
              <TabsTrigger value="FWD" className="data-[state=active]:bg-accent-green">
                Forwards
              </TabsTrigger>
            </TabsList>

            {['GK', 'DEF', 'MID', 'FWD'].map(position => (
              <TabsContent key={position} value={position} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {getPlayersByPosition(position).map((player) => {
                    const isSelected = selectedPlayers.includes(player.id);
                    const canSelect = canSelectPlayer(player);
                    const avatar = getAvatar(player.name);

                    return (
                      <div
                        key={player.id}
                        onClick={() => togglePlayer(player)}
                        className={`
                          bg-slate-800 border rounded-lg p-4 cursor-pointer transition-colors
                          ${isSelected 
                            ? 'border-accent-green bg-accent-green/10' 
                            : canSelect 
                              ? 'border-slate-600 hover:border-accent-green' 
                              : 'border-slate-600 opacity-50 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${avatar.gradient} flex items-center justify-center relative`}>
                            <span className="text-white font-bold text-sm">{avatar.initials}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-accent-green rounded-full w-5 h-5 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-50">{player.name}</h5>
                            <p className="text-sm text-slate-400">{player.team}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-accent-green/20 text-accent-green border-accent-green">
                                {player.position}
                              </Badge>
                              <span className="text-xs text-slate-400">{player.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            Selected: <span className="text-accent-green font-semibold">{selectedPlayers.length}/11</span> players
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinDraft}
              disabled={selectedPlayers.length !== 11 || joinDraftMutation.isPending}
              className="bg-accent-green hover:bg-emerald-600 text-white"
            >
              {joinDraftMutation.isPending ? 'Joining...' : `Join Draft (${entryFee} UMI)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
