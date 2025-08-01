import React from 'react';
import { cn } from '@/lib/utils';
import { Gamepad2, Zap, Target } from 'lucide-react';

interface LoadingScreenProps {
  show: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/95 backdrop-blur-md",
      "flex items-center justify-center",
      "animate-fade-in"
    )}>
      <div className="flex flex-col items-center space-y-6">
        {/* Main Loading Animation */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-20 h-20 border-4 border-muted rounded-full animate-spin border-t-primary shadow-lg"></div>
          {/* Inner pulsing ring */}
          <div className="absolute inset-2 w-16 h-16 border-2 border-transparent rounded-full animate-pulse border-t-primary/60"></div>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Animated Icons */}
        <div className="flex space-x-4">
          <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
            <Target className="w-6 h-6 text-primary/60" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
            <Zap className="w-6 h-6 text-primary/80" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
            <Gamepad2 className="w-6 h-6 text-primary/60" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-primary animate-pulse">Loading Battle Arena</h3>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Preparing your experience</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;