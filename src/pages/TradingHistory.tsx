import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  History,
  Activity,
  Calendar,
  DollarSign
} from "lucide-react";
import { formatTZEE } from "@/lib/currency";

interface Trade {
  id: string;
  shares: number;
  price: number;
  amount: number;
  trade_type: string;
  created_at: string;
  market: {
    title: string;
    status: string;
  };
  market_outcome: {
    name: string;
    current_price: number;
  };
}

interface Position {
  id: string;
  shares: number;
  avg_price: number;
  total_cost: number;
  created_at: string;
  market: {
    title: string;
    status: string;
    end_date: string;
  };
  market_outcome: {
    name: string;
    current_price: number;
  };
}

const TradingHistory = () => {
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await loadTradingData(user.id);
    }
    setLoading(false);
  };

  const loadTradingData = async (userId: string) => {
    try {
      // Load trades
      const { data: tradesData, error: tradesError } = await supabase
        .from("trades")
        .select(`
          id,
          shares,
          price,
          amount,
          trade_type,
          created_at,
          market:markets(title, status),
          market_outcome:market_outcomes(name, current_price)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);

      // Load historical positions (including closed ones)
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select(`
          id,
          shares,
          avg_price,
          total_cost,
          created_at,
          market:markets(title, status, end_date),
          market_outcome:market_outcomes(name, current_price)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (positionsError) throw positionsError;
      setPositions(positionsData || []);
    } catch (error) {
      console.error("Error loading trading data:", error);
      toast.error("Failed to load trading history");
    }
  };

  const formatCurrency = (amount: number) => formatTZEE(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePositionPnL = (position: Position) => {
    const currentValue = position.shares * position.market_outcome.current_price;
    return currentValue - position.total_cost;
  };

  const getTradeStats = () => {
    const totalTrades = trades.length;
    const buyTrades = trades.filter(t => t.trade_type === 'buy').length;
    const sellTrades = trades.filter(t => t.trade_type === 'sell').length;
    const totalVolume = trades.reduce((sum, trade) => sum + trade.amount, 0);

    return { totalTrades, buyTrades, sellTrades, totalVolume };
  };

  const stats = getTradeStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading trading history...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your trading history.
            </p>
            <Link to="/sign-up">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold">Trading History</h1>
        </div>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Trades</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTrades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Buy Orders</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.buyTrades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Sell Orders</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{stats.sellTrades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Volume</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="positions">Position History</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  All Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trades.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No trades yet</p>
                    <Link to="/">
                      <Button>Start Trading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trades.map((trade) => (
                      <div key={trade.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{trade.market.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {trade.market_outcome.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}
                              className="mb-1"
                            >
                              {trade.trade_type.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(trade.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Shares:</span>
                            <p className="font-medium">{trade.shares}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-medium">{formatCurrency(trade.price)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <p className="font-medium">{formatCurrency(trade.amount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Price:</span>
                            <p className="font-medium">{formatCurrency(trade.market_outcome.current_price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Position History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No positions yet</p>
                    <Link to="/">
                      <Button>Start Trading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => {
                      const pnl = calculatePositionPnL(position);
                      const pnlPercentage = ((pnl / position.total_cost) * 100);
                      const isActive = position.shares > 0;
                      const isEnded = new Date(position.market.end_date) < new Date();
                      
                      return (
                        <div key={position.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{position.market.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {position.market_outcome.name}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex gap-1">
                                <Badge variant={isActive ? "default" : "secondary"}>
                                  {isActive ? "Active" : "Closed"}
                                </Badge>
                                {isEnded && (
                                  <Badge variant="outline">Ended</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(position.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Shares:</span>
                              <p className="font-medium">{position.shares}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Price:</span>
                              <p className="font-medium">{formatCurrency(position.avg_price)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost:</span>
                              <p className="font-medium">{formatCurrency(position.total_cost)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Value:</span>
                              <p className="font-medium">
                                {formatCurrency(position.shares * position.market_outcome.current_price)}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">P&L:</span>
                              <p className={`font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(pnl)} ({pnlPercentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradingHistory;