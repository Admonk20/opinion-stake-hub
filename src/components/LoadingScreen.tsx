import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  show: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      "flex items-center justify-center",
      "animate-fade-in"
    )}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-primary/30"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Loading...</h3>
          <p className="text-sm text-muted-foreground animate-pulse">Please wait while we prepare your battle</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;