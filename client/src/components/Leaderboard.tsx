import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/leaderboard');
      return response.json();
    },
  });

  const getAvatar = (address: string) => {
    const initials = address.slice(2, 4).toUpperCase();
    const colors = [
      'from-accent-green to-accent-blue',
      'from-accent-blue to-purple-500',
      'from-red-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-purple-500 to-indigo-500'
    ];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return { initials, gradient: colors[colorIndex] };
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <section id="leaderboard" className="mb-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="leaderboard" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-50">Top Players</h3>
        <div className="flex space-x-2">
          <button className="bg-accent-green/20 text-accent-green px-3 py-2 rounded-lg text-sm font-medium">
            All Time
          </button>
          <button className="bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            This Month
          </button>
        </div>
      </div>
      
      <div className="bg-secondary-dark border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Player</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Wins</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Total Earnings</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No leaderboard data available
                  </td>
                </tr>
              ) : (
                leaderboard.map((player: any, index: number) => {
                  const avatar = getAvatar(player.userAddress);
                  const rank = index + 1;
                  const winRate = player.gamesPlayed > 0 
                    ? ((player.totalWins / player.gamesPlayed) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={player.userAddress} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getRankEmoji(rank)}</span>
                          <span className={`font-bold ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${avatar.gradient} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{avatar.initials}</span>
                          </div>
                          <span className="font-medium text-slate-50">
                            {formatAddress(player.userAddress)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-50 font-semibold">{player.totalWins}</td>
                      <td className="px-6 py-4 text-accent-green font-semibold">
                        {parseFloat(player.totalEarnings).toFixed(0)} CHZ
                      </td>
                      <td className="px-6 py-4 text-slate-50">{winRate}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
