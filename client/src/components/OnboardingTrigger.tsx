import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Sparkles } from 'lucide-react';
import { OnboardingTutorial } from './OnboardingTutorial';

export function OnboardingTrigger() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const tutorialSeen = localStorage.getItem('fandraft-tutorial-seen');
    if (!tutorialSeen) {
      // Show tutorial automatically for first-time users
      setTimeout(() => setShowTutorial(true), 2000);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('fandraft-tutorial-seen', 'true');
    setHasSeenTutorial(true);
  };

  return (
    <>
      {/* Tutorial Trigger Button */}
      <Button
        onClick={handleOpenTutorial}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 animate-pulse"
        size="sm"
      >
        <Gamepad2 className="h-4 w-4 mr-2" />
        {hasSeenTutorial ? 'Tutorial' : 'Start Tutorial'}
        <Sparkles className="h-4 w-4 ml-2" />
      </Button>

      {/* Tutorial Modal */}
      <OnboardingTutorial 
        isOpen={showTutorial} 
        onClose={handleCloseTutorial}
      />
    </>
  );
}