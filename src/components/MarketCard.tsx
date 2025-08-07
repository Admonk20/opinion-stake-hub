import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { formatTZEE } from "@/lib/currency";

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

interface MarketCardProps {
  market: Market;
  user: any;
}

export const MarketCard = ({ market, user }: MarketCardProps) => {
  const yesOutcome = market.market_outcomes.find(o => o.slug === 'yes');
  const noOutcome = market.market_outcomes.find(o => o.slug === 'no');
  
  const yesPrice = yesOutcome?.current_price || 0.5;
  const noPrice = noOutcome?.current_price || 0.5;

  const formatCurrency = (amount: number) => formatTZEE(amount);

  const formatPercentage = (price: number) => {
    return `${Math.round(price * 100)}%`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardHeader className="space-y-3">
        {market.categories && (
          <Badge 
            variant="outline" 
            className="w-fit text-xs"
            style={{ borderColor: market.categories.color }}
          >
            {market.categories.name}
          </Badge>
        )}
        
        <div className="space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {market.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {market.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(market.volume)} Vol.</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(market.end_date), 'MMM d')}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outcomes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-600">Yes</span>
              <span className="font-mono">{formatPercentage(yesPrice)}</span>
            </div>
            <Button 
              className="w-full h-8 bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={!user}
              asChild
            >
              <Link to={`/market/${market.id}`}>Buy Yes</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-red-600">No</span>
              <span className="font-mono">{formatPercentage(noPrice)}</span>
            </div>
            <Button 
              variant="outline"
              className="w-full h-8 border-red-600 text-red-600 hover:bg-red-50"
              size="sm"
              disabled={!user}
              asChild
            >
              <Link to={`/market/${market.id}`}>Buy No</Link>
            </Button>
          </div>
        </div>

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            Sign in to trade
          </p>
        )}
      </CardContent>
    </Card>
  );
};