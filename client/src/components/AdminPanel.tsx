import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fanDraftContract } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Settings, DollarSign, Download, Wallet } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlatformRevenue } from '@/hooks/useContract';

export function AdminPanel() {
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: platformRevenue = '0' } = usePlatformRevenue();
  
  const [draftDuration, setDraftDuration] = useState('24');
  const [newEntryFee, setNewEntryFee] = useState('');

  const createDraftMutation = useMutation({
    mutationFn: async ({ duration }: { duration: number }) => {
      return await fanDraftContract.createDraft('', duration);
    },
    onSuccess: () => {
      toast({
        title: "Draft Created",
        description: "New draft has been created successfully",
      });
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
        description: `Successfully withdrew ${parseFloat(platformRevenue).toFixed(2)} CHZ`,
      });
      queryClient.invalidateQueries({ queryKey: ['platformRevenue'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Withdraw Revenue",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = parseInt(draftDuration);
    if (duration < 1 || duration > 168) { // Max 1 week
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 1 and 168 hours",
        variant: "destructive",
      });
      return;
    }

    createDraftMutation.mutate({ duration });
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

      {/* Platform Revenue */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-4 w-4" />
            <span>Platform Revenue</span>
          </CardTitle>
          <CardDescription>View and withdraw accumulated platform revenue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Available Revenue</p>
                <p className="text-2xl font-bold text-slate-50">
                  {parseFloat(platformRevenue).toFixed(2)} CHZ
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <Button 
            onClick={handleWithdrawRevenue}
            disabled={withdrawRevenueMutation.isPending || parseFloat(platformRevenue) <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {withdrawRevenueMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Withdraw All Revenue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}