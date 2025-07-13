import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, AlertCircle, Zap, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { account, balance, isConnecting, connect, disconnect, isConnected, error } = useWallet();
  const { toast } = useToast();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="glass-effect border-b border-slate-700/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green via-accent-blue to-accent-purple rounded-xl flex items-center justify-center animate-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-orange rounded-full animate-pulse">
                  <Activity className="h-2 w-2 text-white m-1" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
                  FanDraft
                </h1>
                <div className="text-xs text-slate-400 font-medium">SportFi Platform</div>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-sm stat-card px-3 py-1 rounded-full text-slate-400 font-medium">
                Umi Devnet
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#drafts" className="text-slate-300 hover:text-accent-green transition-all duration-300 font-medium">
              Drafts
            </a>
            <a href="#leaderboard" className="text-slate-300 hover:text-accent-green transition-all duration-300 font-medium">
              Leaderboard
            </a>
            <a href="#history" className="text-slate-300 hover:text-accent-green transition-all duration-300 font-medium">
              History
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden md:flex items-center space-x-2 stat-card px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                <div>
                  <span className="text-xs text-slate-400">ETH Balance</span>
                  <div className="text-sm font-bold text-slate-50">
                    {balance}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {error && (
                <div className="flex items-center text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs hidden sm:block">Network Error</span>
                </div>
              )}
              <Button
                onClick={isConnected ? disconnect : handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-accent-green via-accent-blue to-accent-purple text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 hover-lift neon-glow"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-5 w-5" />
                )}
                {isConnecting 
                  ? 'Connecting...' 
                  : isConnected 
                    ? formatAddress(account!)
                    : 'Connect Wallet'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
