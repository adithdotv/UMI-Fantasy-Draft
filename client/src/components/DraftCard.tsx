import { ContractDraft } from '@/lib/contract';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Check, Trophy, Clock } from 'lucide-react';
import { useDraftParticipants, usePlayerSelection, useEntryFee, useContractOwner } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { formatUMIAmount } from '@/lib/web3';

interface DraftCardProps {
  draft: ContractDraft;
  onJoinDraft: (draftId: number) => void;
  onViewDraft: (draftId: number) => void;
  onEditLineup?: (draftId: number) => void;
  onResolveDraft?: (draftId: number) => void;
}

export function DraftCard({ draft, onJoinDraft, onViewDraft, onEditLineup, onResolveDraft }: DraftCardProps) {
  const { account } = useWallet();
  const { data: participants = [] } = useDraftParticipants(Number(draft.id));
  const { data: playerSelection } = usePlayerSelection(Number(draft.id), account || '');
  const { data: entryFee = '0' } = useEntryFee();
  const { data: contractOwner } = useContractOwner();
  
  const hasJoined = account && participants.includes(account);
  const prizePool = formatUMIAmount(draft.totalPool.toString());
  const isOwner = account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const isExpired = now > Number(draft.deadline);
  const canResolve = isOwner && isExpired && draft.isActive;

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive" className="bg-red-600/20 text-red-400">EXPIRED</Badge>;
    }
    if (hasJoined) {
      return <Badge variant="secondary" className="bg-slate-600 text-slate-300">JOINED</Badge>;
    }
    return <Badge variant="default" className="bg-accent-green/20 text-accent-green">ACTIVE</Badge>;
  };

  return (
    <div className="bg-secondary-dark border border-slate-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-xl font-semibold text-slate-50">Premier League Week {Number(draft.id)}</h4>
          <p className="text-slate-400 text-sm">Fantasy Tournament</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-slate-400 text-sm">Entry Fee</p>
          <p className="text-lg font-semibold text-slate-50">{entryFee} UMI</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Prize Pool</p>
          <p className="text-lg font-semibold text-yellow-500">{prizePool} UMI</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Participants</p>
          <p className="text-lg font-semibold text-slate-50">{participants.length}/100</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Time Left</p>
          <CountdownTimer 
            deadline={draft.deadline} 
            className="text-lg font-semibold"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        {canResolve ? (
          <Button 
            onClick={() => onResolveDraft && onResolveDraft(Number(draft.id))}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Resolve Draft
          </Button>
        ) : hasJoined ? (
          <>
            <Button 
              variant="secondary" 
              className="flex-1 bg-slate-700 text-slate-300 cursor-not-allowed"
              disabled
            >
              <Check className="mr-2 h-4 w-4" />
              Already Joined
            </Button>
            {onEditLineup && !isExpired && (
              <Button 
                onClick={() => onEditLineup(Number(draft.id))}
                className="bg-accent-blue hover:bg-blue-600 text-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : isExpired ? (
          <Button 
            variant="secondary" 
            className="flex-1 bg-slate-700 text-slate-300 cursor-not-allowed"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            Draft Expired
          </Button>
        ) : (
          <Button 
            onClick={() => onJoinDraft(Number(draft.id))}
            className="flex-1 bg-accent-green hover:bg-emerald-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Join Draft
          </Button>
        )}
        
        <Button 
          onClick={() => onViewDraft(Number(draft.id))}
          variant="secondary"
          className="bg-slate-700 hover:bg-slate-600 text-slate-300"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
