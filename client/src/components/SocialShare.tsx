import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Share2, Twitter, Copy, Check, Trophy, Medal, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayerStats {
  userAddress: string;
  totalWins: number;
  totalEarnings: number;
  gamesPlayed: number;
  winRate: number;
  rank?: number;
}

interface SocialShareProps {
  playerStats: PlayerStats;
  children?: React.ReactNode;
}

export function SocialShare({ playerStats, children }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateShareText = () => {
    const rank = playerStats.rank ? `#${playerStats.rank} on` : 'Playing on';
    return `🏆 ${rank} FanDraft leaderboard!
⚽ ${playerStats.totalWins} wins in ${playerStats.gamesPlayed} games
💰 ${playerStats.totalEarnings.toFixed(2)} CHZ earned
📈 ${playerStats.winRate}% win rate

Join me in Premier League fantasy tournaments on the Chiliz blockchain! 
#FanDraft #SportFi #Chiliz #FantasyFootball`;
  };

  const shareData = {
    title: 'My FanDraft Stats',
    text: generateShareText(),
    url: window.location.origin,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Native sharing cancelled');
      }
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm"
            className="border-accent-green/30 text-accent-green hover:bg-accent-green/10 hover:border-accent-green/50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Stats
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="stat-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-slate-50">
            <Share2 className="h-5 w-5 text-accent-green" />
            <span>Share Your Stats</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Show off your FanDraft achievements to the world!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Preview Card */}
          <div className="draft-card p-6 rounded-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-50 mb-2">
                🏆 FanDraft Champion
              </h3>
              <p className="text-slate-400 text-sm">
                Wallet: {formatAddress(playerStats.userAddress)}
              </p>
              {playerStats.rank && (
                <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Rank #{playerStats.rank}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card p-4 rounded-xl text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-50">{playerStats.totalWins}</div>
                <div className="text-xs text-slate-400">Victories</div>
              </div>
              
              <div className="stat-card p-4 rounded-xl text-center">
                <DollarSign className="h-6 w-6 text-accent-green mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-50">{playerStats.totalEarnings.toFixed(1)}</div>
                <div className="text-xs text-slate-400">CHZ Earned</div>
              </div>
              
              <div className="stat-card p-4 rounded-xl text-center">
                <Users className="h-6 w-6 text-accent-blue mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-50">{playerStats.gamesPlayed}</div>
                <div className="text-xs text-slate-400">Games</div>
              </div>
              
              <div className="stat-card p-4 rounded-xl text-center">
                <Medal className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-50">{playerStats.winRate}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                🔥 SportFi on Chiliz Blockchain
              </p>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Share via:</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full bg-gradient-to-r from-accent-green to-accent-blue text-white hover:opacity-90"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}

              <Button
                onClick={handleTwitterShare}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-accent-green" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}