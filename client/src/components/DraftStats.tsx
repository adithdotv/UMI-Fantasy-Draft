import { Calendar, Trophy, Medal, Users, DollarSign } from 'lucide-react';
import { useActiveDrafts, useUserWins, usePlatformRevenue, useTotalUniqueParticipants, useContractOwner } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { formatChzAmount } from '@/lib/web3';

export function DraftStats() {
  const { account, isConnected } = useWallet();
  const { data: activeDrafts = [] } = useActiveDrafts();
  const { data: userWins = 0 } = useUserWins();
  const { data: platformRevenue = '0' } = usePlatformRevenue();
  const { data: totalParticipants = 0 } = useTotalUniqueParticipants();
  const { data: contractOwner } = useContractOwner();
  
  const isOwner = isConnected && account && contractOwner && 
    account.toLowerCase() === contractOwner.toLowerCase();

  const totalPrizePool = activeDrafts.reduce((sum, draft) => {
    const poolInChz = parseFloat(formatChzAmount(draft.totalPool.toString()));
    return sum + poolInChz;
  }, 0);

  return (
    <section className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6 mb-12`}>
      <div className="bg-secondary-dark p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Active Drafts</p>
            <p className="text-2xl font-bold text-slate-50">{activeDrafts.length}</p>
          </div>
          <Calendar className="h-8 w-8 text-accent-green" />
        </div>
      </div>
      
      <div className="bg-secondary-dark p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Prize Pool</p>
            <p className="text-2xl font-bold text-slate-50">
              {totalPrizePool.toFixed(2)} CHZ
            </p>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
      
      <div className="bg-secondary-dark p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Your Wins</p>
            <p className="text-2xl font-bold text-slate-50">{userWins}</p>
          </div>
          <Medal className="h-8 w-8 text-accent-green" />
        </div>
      </div>
      
      <div className="bg-secondary-dark p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Players</p>
            <p className="text-2xl font-bold text-slate-50">{totalParticipants}</p>
          </div>
          <Users className="h-8 w-8 text-accent-blue" />
        </div>
      </div>
      
      {isOwner && (
        <div className="bg-secondary-dark p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Platform Revenue</p>
              <p className="text-2xl font-bold text-slate-50">
                {parseFloat(platformRevenue).toFixed(2)} CHZ
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      )}
    </section>
  );
}
