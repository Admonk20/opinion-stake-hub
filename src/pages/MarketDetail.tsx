import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingInterface } from "@/components/TradingInterface";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  Tag
} from "lucide-react";

interface Market {
  id: string;
  title: string;
  description: string;
  question: string;
  image_url?: string;
  volume: number;
  liquidity: number;
  end_date: string;
  status: string;
  created_at: string;
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

interface Trade {
  id: string;
  shares: number;
  price: number;
  amount: number;
  created_at: string;
  trade_type: string;
  market_outcome: {
    name: string;
  };
}

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    if (id) {
      loadMarketData(id);
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadMarketData = async (marketId: string) => {
    try {
      setLoading(true);
      
      // Load market details
      const { data: marketData, error: marketError } = await supabase
        .from("markets")
        .select(`
          *,
          categories(name, color),
          market_outcomes(id, name, slug, current_price, volume)
        `)
        .eq("id", marketId)
        .single();

      if (marketError) throw marketError;
      setMarket(marketData);

      // Load recent trades
      const { data: tradesData, error: tradesError } = await supabase
        .from("trades")
        .select(`
          id,
          shares,
          price,
          amount,
          created_at,
          trade_type,
          market_outcome:market_outcomes(name)
        `)
        .eq("market_id", marketId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (tradesError) throw tradesError;
      setRecentTrades(tradesData || []);
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load market details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilEnd = () => {
    if (!market) return "";
    const endTime = new Date(market.end_date).getTime();
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return "Market ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours left`;
    return `${hours} hours left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Markets
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Markets
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Market Not Found</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                The market you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button>Browse Markets</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Market Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {market.categories && (
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: market.categories.color + "20", color: market.categories.color }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {market.categories.name}
                        </Badge>
                      )}
                      <Badge variant={market.status === "active" ? "default" : "secondary"}>
                        {market.status}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{market.title}</h2>
                    <p className="text-muted-foreground mb-4">{market.description}</p>
                    <div className="text-lg font-semibold text-primary">
                      "{market.question}"
                    </div>
                  </div>
                  
                  {market.image_url && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={market.image_url} 
                        alt={market.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Volume</span>
                    </div>
                    <p className="font-semibold">{formatCurrency(market.volume)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Liquidity</span>
                    </div>
                    <p className="font-semibold">{formatCurrency(market.liquidity)}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Time Left</span>
                    </div>
                    <p className="font-semibold text-sm">{getTimeUntilEnd()}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">End Date</span>
                    </div>
                    <p className="font-semibold text-sm">
                      {new Date(market.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Prices */}
            <Card>
              <CardHeader>
                <CardTitle>Current Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {market.market_outcomes.map((outcome) => (
                    <div key={outcome.id} className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{outcome.name}</h3>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {formatPercentage(outcome.current_price)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Price: {formatCurrency(outcome.current_price)}</span>
                        <span>Volume: {formatCurrency(outcome.volume)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No trading activity yet. Be the first to trade!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.map((trade) => (
                      <div key={trade.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className={`font-medium ${trade.trade_type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.trade_type.toUpperCase()}
                          </span>
                          <span className="ml-2">{trade.market_outcome.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{trade.shares} shares @ {formatCurrency(trade.price)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(trade.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trading Interface */}
            <TradingInterface 
              market={market} 
              user={user}
              onTradeComplete={() => loadMarketData(market.id)}
            />

            {/* Market Info */}
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <p className="font-medium">{formatDate(market.created_at)}</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">End Date:</span>
                  <p className="font-medium">{formatDate(market.end_date)}</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{market.status}</p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Total Volume:</span>
                  <p className="font-medium">{formatCurrency(market.volume)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;