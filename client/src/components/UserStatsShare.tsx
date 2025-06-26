import { useWallet } from '@/hooks/useWallet';
import { useBlockchainLeaderboard } from '@/hooks/useContract';
import { SocialShare } from './SocialShare';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Share2 } from 'lucide-react';

export function UserStatsShare() {
  const { account } = useWallet();
  const { data: leaderboard = [] } = useBlockchainLeaderboard();

  if (!account) {
    return null;
  }

  // Find current user's stats
  const userStats = leaderboard.find(player => 
    player.userAddress.toLowerCase() === account.toLowerCase()
  );

  // Get user's rank
  const userRank = leaderboard.findIndex(player => 
    player.userAddress.toLowerCase() === account.toLowerCase()
  ) + 1;

  if (!userStats) {
    return null;
  }

  const playerStatsWithRank = {
    ...userStats,
    rank: userRank > 0 ? userRank : undefined,
  };

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-50">
          <Trophy className="h-5 w-5 text-accent-green" />
          <span>Your Performance</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Share your FanDraft achievements with friends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-50">{userStats.totalWins}</div>
              <div className="text-xs text-slate-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-50">{userStats.totalEarnings.toFixed(1)}</div>
              <div className="text-xs text-slate-400">CHZ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-50">{userStats.gamesPlayed}</div>
              <div className="text-xs text-slate-400">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-50">{userStats.winRate || 0}%</div>
              <div className="text-xs text-slate-400">Win Rate</div>
            </div>
          </div>
          
          <div className="ml-4">
            <SocialShare 
              playerStats={playerStatsWithRank}
            >
              <div className="hover-lift p-3 rounded-xl bg-gradient-to-r from-accent-green/20 to-accent-blue/20 border border-accent-green/30 cursor-pointer">
                <Share2 className="h-5 w-5 text-accent-green" />
              </div>
            </SocialShare>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}