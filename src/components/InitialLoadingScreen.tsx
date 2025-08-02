import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Gamepad2, Zap, Target, Crown, Trophy, Coins } from 'lucide-react';

interface InitialLoadingScreenProps {
  onLoadingComplete: () => void;
}

const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState("Initializing Battle Arena...");

  const loadingTexts = [
    "Initializing Battle Arena...",
    "Loading Memecoin Data...",
    "Preparing Battle Tokens...",
    "Setting Up Predictions...",
    "Almost Ready to Battle!"
  ];

  useEffect(() => {
    const duration = 3000; // 3 seconds total loading time
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const progressStep = 100 / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * progressStep, 100);
      setProgress(newProgress);

      // Update text based on progress
      const textIndex = Math.min(
        Math.floor((newProgress / 100) * loadingTexts.length),
        loadingTexts.length - 1
      );
      setCurrentText(loadingTexts[textIndex]);

      if (newProgress >= 100) {
        clearInterval(timer);
        // Small delay before calling completion
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-background",
      "flex flex-col items-center justify-center",
      "animate-fade-in"
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 animate-pulse">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse" style={{ animationDelay: '2s' }}>
          <Coins className="w-7 h-7 text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Target className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo/Brand Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-muted rounded-full animate-spin border-t-primary shadow-2xl"></div>
            <div className="absolute inset-2 w-20 h-20 border-2 border-transparent rounded-full animate-pulse border-t-primary/60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-primary animate-pulse-glow" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Memecoin Battles
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              The Ultimate Prediction Platform
            </p>
          </div>
        </div>

        {/* Animated Icons */}
        <div className="flex space-x-6">
          <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
            <Target className="w-8 h-8 text-primary/60" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '200ms' }}>
            <Zap className="w-8 h-8 text-primary/80" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '400ms' }}>
            <Crown className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        {/* Loading Progress */}
        <div className="w-full space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium text-primary animate-pulse">
              {currentText}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300 ease-out shadow-glow"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-loading-dots" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;