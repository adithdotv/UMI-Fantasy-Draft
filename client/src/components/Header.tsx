import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
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
    <header className="bg-secondary-dark border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-futbol text-accent-green text-2xl"></i>
              <h1 className="text-2xl font-bold text-slate-50">FanDraft</h1>
            </div>
            <div className="hidden md:block">
              <span className="text-sm bg-slate-800 px-2 py-1 rounded-full text-slate-400">
                Chiliz Testnet
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#drafts" className="text-slate-300 hover:text-accent-green transition-colors">
              Drafts
            </a>
            <a href="#leaderboard" className="text-slate-300 hover:text-accent-green transition-colors">
              Leaderboard
            </a>
            <a href="#history" className="text-slate-300 hover:text-accent-green transition-colors">
              My History
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg">
                <span className="text-sm text-slate-400">Balance:</span>
                <span className="text-sm font-semibold text-accent-green">
                  {balance} CHZ
                </span>
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
                className="bg-accent-green hover:bg-emerald-600 text-white"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
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
