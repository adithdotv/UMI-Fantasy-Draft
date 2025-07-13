import { Calendar, Trophy, Medal, Users, DollarSign } from 'lucide-react';
import { useActiveDrafts, useUserWins, usePlatformRevenue, useTotalUniqueParticipants, useContractOwner } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { formatUMIAmount } from '@/lib/web3';

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
    const poolInUMI = parseFloat(formatUMIAmount(draft.totalPool.toString()));
    return sum + poolInUMI;
  }, 0);

  return (
    <section className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6 mb-16`}>
      <div className="stat-card p-6 rounded-2xl hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-green-400 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-50">{activeDrafts.length}</p>
            <div className="w-8 h-1 bg-gradient-to-r from-accent-green to-green-400 rounded-full ml-auto"></div>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Active Drafts</p>
          <p className="text-xs text-accent-green font-semibold">Live tournaments</p>
        </div>
      </div>
      
      <div className="stat-card p-6 rounded-2xl hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center animate-glow">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-50">{totalPrizePool.toFixed(1)}</p>
            <div className="w-8 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full ml-auto"></div>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Total Prize Pool</p>
          <p className="text-xs text-yellow-500 font-semibold">UMI rewards</p>
        </div>
      </div>
      
      <div className="stat-card p-6 rounded-2xl hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Medal className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-50">{userWins}</p>
            <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full ml-auto"></div>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Your Victories</p>
          <p className="text-xs text-green-500 font-semibold">Personal wins</p>
        </div>
      </div>
      
      <div className="stat-card p-6 rounded-2xl hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-blue-500 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-50">{totalParticipants}</p>
            <div className="w-8 h-1 bg-gradient-to-r from-accent-blue to-blue-500 rounded-full ml-auto"></div>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Total Players</p>
          <p className="text-xs text-accent-blue font-semibold">Global community</p>
        </div>
      </div>
      
      {isOwner && (
        <div className="stat-card p-6 rounded-2xl hover-lift pulse-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-purple-600 rounded-xl flex items-center justify-center animate-glow">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-50">
                {parseFloat(platformRevenue).toFixed(1)}
              </p>
              <div className="w-8 h-1 bg-gradient-to-r from-accent-purple to-purple-600 rounded-full ml-auto"></div>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Platform Revenue</p>
            <p className="text-xs text-accent-purple font-semibold">UMI earnings</p>
          </div>
        </div>
      )}
    </section>
  );
}
