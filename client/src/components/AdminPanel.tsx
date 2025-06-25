import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fanDraftContract } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Settings, DollarSign, Download, Trophy, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveDrafts } from '@/hooks/useContract';

export function AdminPanel() {
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: activeDrafts = [] } = useActiveDrafts();
  
  const [draftName, setDraftName] = useState('');
  const [draftDuration, setDraftDuration] = useState('24');
  const [newEntryFee, setNewEntryFee] = useState('');
  const [resolveDraftId, setResolveDraftId] = useState('');
  const [winnerAddresses, setWinnerAddresses] = useState(['', '', '']);
  const [winnerScores, setWinnerScores] = useState(['', '', '']);

  const createDraftMutation = useMutation({
    mutationFn: async ({ name, duration }: { name: string; duration: number }) => {
      return await fanDraftContract.createDraft(name, duration);
    },
    onSuccess: () => {
      toast({
        title: "Draft Created",
        description: "New draft has been created successfully",
      });
      setDraftName('');
      setDraftDuration('24');
      queryClient.invalidateQueries({ queryKey: ['/api/active-drafts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Draft",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const changeEntryFeeMutation = useMutation({
    mutationFn: async (newFee: string) => {
      return await fanDraftContract.changeEntryFee(newFee);
    },
    onSuccess: () => {
      toast({
        title: "Entry Fee Updated",
        description: "Entry fee has been changed successfully",
      });
      setNewEntryFee('');
      queryClient.invalidateQueries({ queryKey: ['/api/entry-fee'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Entry Fee",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const withdrawRevenueMutation = useMutation({
    mutationFn: async () => {
      return await fanDraftContract.withdrawRevenue();
    },
    onSuccess: () => {
      toast({
        title: "Revenue Withdrawn",
        description: "Platform revenue has been withdrawn successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Withdraw Revenue",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const resolveDraftMutation = useMutation({
    mutationFn: async ({ draftId, winners, scores }: { draftId: number; winners: string[]; scores: number[] }) => {
      return await fanDraftContract.resolveDraft(draftId, winners, scores);
    },
    onSuccess: () => {
      toast({
        title: "Draft Resolved",
        description: "Draft has been resolved and prizes distributed",
      });
      setResolveDraftId('');
      setWinnerAddresses(['', '', '']);
      setWinnerScores(['', '', '']);
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

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a draft name",
        variant: "destructive",
      });
      return;
    }
    
    const duration = parseInt(draftDuration);
    if (duration < 1 || duration > 168) { // Max 1 week
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 1 and 168 hours",
        variant: "destructive",
      });
      return;
    }

    createDraftMutation.mutate({ name: draftName, duration });
  };

  const handleChangeEntryFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryFee || parseFloat(newEntryFee) < 0) {
      toast({
        title: "Invalid Entry Fee",
        description: "Please enter a valid entry fee",
        variant: "destructive",
      });
      return;
    }

    changeEntryFeeMutation.mutate(newEntryFee);
  };

  const handleWithdrawRevenue = () => {
    withdrawRevenueMutation.mutate();
  };

  const handleResolveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    
    const draftId = parseInt(resolveDraftId);
    if (!draftId || draftId < 1) {
      toast({
        title: "Invalid Draft ID",
        description: "Please enter a valid draft ID",
        variant: "destructive",
      });
      return;
    }

    // Validate winner addresses
    const winners = winnerAddresses.filter(addr => addr.trim() !== '');
    if (winners.length !== 3) {
      toast({
        title: "Invalid Winners",
        description: "Please enter exactly 3 winner addresses",
        variant: "destructive",
      });
      return;
    }

    // Validate scores
    const scores = winnerScores.map(score => parseInt(score)).filter(score => !isNaN(score));
    if (scores.length !== 3) {
      toast({
        title: "Invalid Scores", 
        description: "Please enter exactly 3 valid scores",
        variant: "destructive",
      });
      return;
    }

    // Check if draft exists and is expired
    const draft = activeDrafts.find(d => Number(d.id) === draftId);
    if (!draft) {
      toast({
        title: "Draft Not Found",
        description: "Could not find draft with the specified ID",
        variant: "destructive",
      });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(draft.deadline);
    if (now <= deadline) {
      toast({
        title: "Draft Still Active",
        description: "Can only resolve drafts that have passed their deadline",
        variant: "destructive",
      });
      return;
    }

    resolveDraftMutation.mutate({ draftId, winners, scores });
  };

  const updateWinnerAddress = (index: number, value: string) => {
    const newAddresses = [...winnerAddresses];
    newAddresses[index] = value;
    setWinnerAddresses(newAddresses);
  };

  const updateWinnerScore = (index: number, value: string) => {
    const newScores = [...winnerScores];
    newScores[index] = value;
    setWinnerScores(newScores);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-accent-green" />
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Draft */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Plus className="h-4 w-4" />
              <span>Create New Draft</span>
            </CardTitle>
            <CardDescription>Create a new fantasy draft for users to participate in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div>
                <Label htmlFor="draftName" className="text-gray-300">Draft Name</Label>
                <Input
                  id="draftName"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g., Premier League Gameweek 15"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="draftDuration" className="text-gray-300">Duration (hours)</Label>
                <Input
                  id="draftDuration"
                  type="number"
                  min="1"
                  max="168"
                  value={draftDuration}
                  onChange={(e) => setDraftDuration(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button 
                type="submit" 
                disabled={createDraftMutation.isPending}
                className="w-full bg-accent-green hover:bg-emerald-600"
              >
                {createDraftMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Draft
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entry Fee Management */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <DollarSign className="h-4 w-4" />
              <span>Manage Entry Fee</span>
            </CardTitle>
            <CardDescription>Change the entry fee for new drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeEntryFee} className="space-y-4">
              <div>
                <Label htmlFor="newEntryFee" className="text-gray-300">New Entry Fee (CHZ)</Label>
                <Input
                  id="newEntryFee"
                  type="number"
                  step="0.001"
                  min="0"
                  value={newEntryFee}
                  onChange={(e) => setNewEntryFee(e.target.value)}
                  placeholder="e.g., 0.1"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button 
                type="submit" 
                disabled={changeEntryFeeMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {changeEntryFeeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                Update Entry Fee
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-gray-700" />

      {/* Resolve Draft */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Trophy className="h-4 w-4" />
            <span>Resolve Draft</span>
          </CardTitle>
          <CardDescription>Resolve expired drafts and distribute prizes to winners</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResolveDraft} className="space-y-4">
            <div>
              <Label htmlFor="resolveDraftId" className="text-gray-300">Draft ID</Label>
              <Input
                id="resolveDraftId"
                type="number"
                min="1"
                value={resolveDraftId}
                onChange={(e) => setResolveDraftId(e.target.value)}
                placeholder="Enter draft ID to resolve"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-gray-300">Winner Addresses & Scores (1st, 2nd, 3rd)</Label>
              {[0, 1, 2].map((index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    value={winnerAddresses[index]}
                    onChange={(e) => updateWinnerAddress(index, e.target.value)}
                    placeholder={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} place wallet address`}
                    className="bg-gray-700 border-gray-600 text-white text-xs"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={winnerScores[index]}
                    onChange={(e) => updateWinnerScore(index, e.target.value)}
                    placeholder={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} place score`}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              ))}
            </div>
            
            <Button 
              type="submit" 
              disabled={resolveDraftMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {resolveDraftMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trophy className="mr-2 h-4 w-4" />
              )}
              Resolve Draft & Distribute Prizes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="bg-gray-700" />

      {/* Revenue Management */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Download className="h-4 w-4" />
            <span>Revenue Management</span>
          </CardTitle>
          <CardDescription>Withdraw accumulated platform revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWithdrawRevenue}
            disabled={withdrawRevenueMutation.isPending}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {withdrawRevenueMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Withdraw Revenue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}