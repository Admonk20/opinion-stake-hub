import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  loadingDuration?: number;
}

const LoadingLink: React.FC<LoadingLinkProps> = ({ 
  to, 
  children, 
  className, 
  external = false,
  loadingDuration = 1200
}) => {
  const { startLoading, stopLoading } = useLoading();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!external && !isClicked) {
      setIsClicked(true);
      startLoading();
      
      // Add a slight delay to show the button click animation
      setTimeout(() => {
        // Stop loading after the specified duration
        setTimeout(() => {
          stopLoading();
          setIsClicked(false);
        }, loadingDuration);
      }, 100);
    }
  };

  const baseClasses = "relative transition-all duration-300 hover-scale story-link";
  const clickedClasses = isClicked ? "scale-95 opacity-80" : "";

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, className)}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={cn(baseClasses, clickedClasses, className)}
      onClick={handleClick}
    >
      <span className="flex items-center gap-2">
        {isClicked && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {children}
      </span>
    </Link>
  );
};

export default LoadingLink;