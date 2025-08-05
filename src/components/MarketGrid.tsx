import React from "react";
import { MarketCard } from "./MarketCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Market {
  id: string;
  title: string;
  description: string;
  question: string;
  image_url?: string;
  volume: number;
  end_date: string;
  categories?: {
    name: string;
    color: string;
  };
  market_outcomes: Array<{
    id: string;
    name: string;
    slug: string;
    current_price: number;
    volume: number;
  }>;
}

interface MarketGridProps {
  markets: Market[];
  isLoading: boolean;
  user: any;
}

export const MarketGrid = ({ markets, isLoading, user }: MarketGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No markets found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new markets.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard 
          key={market.id} 
          market={market} 
          user={user}
        />
      ))}
    </div>
  );
};