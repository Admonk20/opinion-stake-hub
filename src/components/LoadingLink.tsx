import React from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';

interface LoadingLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const LoadingLink: React.FC<LoadingLinkProps> = ({ to, children, className, external = false }) => {
  const { startLoading, stopLoading } = useLoading();

  const handleClick = () => {
    if (!external) {
      startLoading();
      // Stop loading after a short delay to simulate page transition
      setTimeout(() => {
        stopLoading();
      }, 800);
    }
  };

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("transition-all duration-200 hover-scale", className)}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={cn("transition-all duration-200 hover-scale", className)}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default LoadingLink;