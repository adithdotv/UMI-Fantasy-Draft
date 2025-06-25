import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { DraftStats } from '@/components/DraftStats';
import { ActiveDrafts } from '@/components/ActiveDrafts';
import { MyHistory } from '@/components/MyHistory';
import { Leaderboard } from '@/components/Leaderboard';
import { AdminPanel } from '@/components/AdminPanel';
import { useWallet } from '@/hooks/useWallet';
import { useContractOwner } from '@/hooks/useContract';
import { Separator } from '@/components/ui/separator';

export function Dashboard() {
  const { account, isConnected } = useWallet();
  const { data: contractOwner } = useContractOwner();
  
  const isOwner = isConnected && account && contractOwner && 
    account.toLowerCase() === contractOwner.toLowerCase();

  return (
    <div className="min-h-screen bg-primary-dark text-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        <DraftStats />
        
        {isOwner && (
          <>
            <AdminPanel />
            <Separator className="bg-gray-700 my-8" />
          </>
        )}
        
        <ActiveDrafts />
        <MyHistory />
        <Leaderboard />
      </main>

      <footer className="bg-secondary-dark border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-futbol text-accent-green text-xl"></i>
                <span className="text-xl font-bold text-slate-50">FanDraft</span>
              </div>
              <p className="text-slate-400 text-sm">
                Decentralized fantasy football on Chiliz blockchain. Fair, transparent, and rewarding.
              </p>
            </div>
            <div>
              <h4 className="text-slate-50 font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">How it Works</a></li>
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">Smart Contract</a></li>
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-50 font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">Discord</a></li>
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">Twitter</a></li>
                <li><a href="#" className="text-slate-400 hover:text-accent-green transition-colors">Telegram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-50 font-semibold mb-3">Contract Info</h4>
              <div className="text-sm">
                <p className="text-slate-400 mb-2">Chiliz Testnet</p>
                <p className="text-xs bg-slate-800 p-2 rounded font-mono text-slate-300 break-all">
                  0x7388FfE07dd833a65f6b1D38B9bF398612e96d0c
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-6 text-center">
            <p className="text-slate-400 text-sm">© 2024 FanDraft. Built on Chiliz blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
