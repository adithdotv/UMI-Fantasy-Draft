import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  Star, 
  Gift,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Gamepad2,
  Crown
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  reward?: {
    type: 'xp' | 'badge' | 'title';
    value: string;
    points: number;
  };
  completed: boolean;
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTutorial({ isOpen, onClose }: OnboardingTutorialProps) {
  const { account, isConnected } = useWallet();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);

  const initialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to FanDraft SportFi!",
      description: "You're about to enter the future of fantasy football on the blockchain. Let's get you started with some epic rewards!",
      icon: <Sparkles className="h-8 w-8 text-accent-green" />,
      reward: { type: 'xp', value: 'Welcome Bonus', points: 100 },
      completed: false
    },
    {
      id: 2,
      title: "Connect Your Wallet",
      description: "Link your MetaMask wallet to start your SportFi journey. This is your key to the decentralized fantasy world!",
      icon: <Wallet className="h-8 w-8 text-accent-blue" />,
      action: 'connect_wallet',
      reward: { type: 'badge', value: 'Wallet Warrior', points: 150 },
      completed: false
    },
    {
      id: 3,
      title: "Explore Active Drafts",
      description: "Browse the Premier League Week tournaments. Each draft is a new adventure with real CHZ rewards!",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      action: 'view_drafts',
      reward: { type: 'xp', value: 'Scout Explorer', points: 75 },
      completed: false
    },
    {
      id: 4,
      title: "Join Your First Draft",
      description: "Select 11 players and enter the competition. Your strategic choices determine your victory!",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      action: 'join_draft',
      reward: { type: 'badge', value: 'Draft Master', points: 200 },
      completed: false
    },
    {
      id: 5,
      title: "Check the Leaderboard",
      description: "See how you rank against other champions. Climb to the top and earn legendary status!",
      icon: <Target className="h-8 w-8 text-red-500" />,
      action: 'view_leaderboard',
      reward: { type: 'title', value: 'Rising Champion', points: 100 },
      completed: false
    },
    {
      id: 6,
      title: "Share Your Stats",
      description: "Show off your achievements on social media and invite friends to join the revolution!",
      icon: <Star className="h-8 w-8 text-accent-green" />,
      action: 'share_stats',
      reward: { type: 'badge', value: 'Social Legend', points: 125 },
      completed: false
    }
  ];

  const [steps, setSteps] = useState(initialSteps);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(userXP / 200) + 1;
    setUserLevel(newLevel);
  }, [userXP]);

  // Check wallet connection status
  useEffect(() => {
    if (isConnected && account) {
      completeStep(2);
    }
  }, [isConnected, account]);

  const completeStep = (stepId: number) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId && !step.completed) {
        const reward = step.reward;
        if (reward) {
          setUserXP(prevXP => prevXP + reward.points);
          
          if (reward.type === 'badge') {
            setEarnedBadges(prev => [...prev, reward.value]);
          }
          
          setShowReward(true);
          toast({
            title: "Achievement Unlocked! 🎉",
            description: `+${reward.points} XP • ${reward.value}`,
          });
          
          setTimeout(() => setShowReward(false), 3000);
        }
        
        return { ...step, completed: true };
      }
      return step;
    }));
  };

  const handleStepAction = (action: string, stepId: number) => {
    switch (action) {
      case 'connect_wallet':
        // This will be handled by the useEffect when wallet connects
        break;
      case 'view_drafts':
        completeStep(stepId);
        document.getElementById('active-drafts')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'join_draft':
        completeStep(stepId);
        break;
      case 'view_leaderboard':
        completeStep(stepId);
        document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'share_stats':
        completeStep(stepId);
        break;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 border-accent-green/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <Gamepad2 className="h-7 w-7 text-accent-green" />
            <span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
              SportFi Academy
            </span>
            <Badge className="bg-gradient-to-r from-accent-green to-accent-blue text-white">
              Level {userLevel}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tutorial Progress</span>
              <span className="text-accent-green font-semibold">{completedSteps}/{steps.length}</span>
            </div>
            <Progress value={progress} className="h-3 bg-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-accent-green to-accent-blue transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>

          {/* XP and Level Display */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-400">Experience Points</p>
                <p className="text-xl font-bold text-accent-green">{userXP} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Badges Earned</p>
              <p className="text-xl font-bold text-accent-blue">{earnedBadges.length}</p>
            </div>
          </div>

          {/* Current Step */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-slate-700/50 rounded-xl">
                  {currentStepData.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-50">
                      {currentStepData.title}
                    </h3>
                    {currentStepData.completed && (
                      <CheckCircle className="h-5 w-5 text-accent-green" />
                    )}
                  </div>
                  <p className="text-slate-400 mb-4">{currentStepData.description}</p>
                  
                  {currentStepData.reward && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Gift className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-400">
                        Reward: +{currentStepData.reward.points} XP • {currentStepData.reward.value}
                      </span>
                    </div>
                  )}

                  {currentStepData.action && !currentStepData.completed && (
                    <Button
                      onClick={() => handleStepAction(currentStepData.action!, currentStepData.id)}
                      className="bg-gradient-to-r from-accent-green to-accent-blue text-white hover:opacity-90"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Complete Challenge
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-400">Earned Badges</h4>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map((badge, index) => (
                  <Badge 
                    key={index}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-accent-green to-accent-blue text-white hover:opacity-90"
                >
                  Start Playing!
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-accent-green to-accent-blue text-white hover:opacity-90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reward Animation */}
        {showReward && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              🎉 Achievement Unlocked! 🎉
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}