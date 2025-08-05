import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface TradingInterfaceProps {
  market: any;
  user: any;
  onTradeComplete?: () => void;
}

export const TradingInterface = ({ market, user, onTradeComplete }: TradingInterfaceProps) => {
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  const [shares, setShares] = useState<string>("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const calculateCost = () => {
    if (!selectedOutcome || !shares) return 0;
    const outcome = market.market_outcomes.find((o: any) => o.id === selectedOutcome);
    if (!outcome) return 0;
    return parseFloat(shares) * outcome.current_price;
  };

  const handleTrade = async () => {
    if (!user) {
      toast.error("Please sign in to trade");
      return;
    }

    if (!selectedOutcome || !shares || parseFloat(shares) <= 0) {
      toast.error("Please enter valid trade details");
      return;
    }

    setLoading(true);
    try {
      const outcome = market.market_outcomes.find((o: any) => o.id === selectedOutcome);
      const shareAmount = parseFloat(shares);
      const totalCost = shareAmount * outcome.current_price;

      // Check if user has sufficient balance for buy orders
      if (tradeType === "buy") {
        const { data: balance } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", user.id)
          .single();

        if (!balance || balance.balance < totalCost) {
          toast.error("Insufficient balance");
          setLoading(false);
          return;
        }
      }

      // Execute trade
      const { error: tradeError } = await supabase
        .from("trades")
        .insert({
          market_id: market.id,
          outcome_id: selectedOutcome,
          buyer_id: tradeType === "buy" ? user.id : null,
          seller_id: tradeType === "sell" ? user.id : null,
          shares: shareAmount,
          price: outcome.current_price,
          amount: totalCost,
          trade_type: tradeType,
        });

      if (tradeError) throw tradeError;

      // Update user balance
      const balanceChange = tradeType === "buy" ? -totalCost : totalCost;
      const { error: balanceError } = await supabase
        .from("user_balances")
        .upsert({
          user_id: user.id,
          balance: (await supabase.from("user_balances").select("balance").eq("user_id", user.id).single()).data?.balance + balanceChange || balanceChange,
        }, {
          onConflict: "user_id"
        });

      if (balanceError) throw balanceError;

      // Update or create position
      const { data: existingPosition } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("market_id", market.id)
        .eq("outcome_id", selectedOutcome)
        .single();

      if (existingPosition) {
        const newShares = tradeType === "buy" 
          ? existingPosition.shares + shareAmount 
          : existingPosition.shares - shareAmount;
        
        const newTotalCost = tradeType === "buy"
          ? existingPosition.total_cost + totalCost
          : existingPosition.total_cost - (existingPosition.avg_price * shareAmount);

        const newAvgPrice = newShares > 0 ? newTotalCost / newShares : 0;

        const { error: positionError } = await supabase
          .from("positions")
          .update({
            shares: newShares,
            avg_price: newAvgPrice,
            total_cost: newTotalCost,
          })
          .eq("id", existingPosition.id);

        if (positionError) throw positionError;
      } else if (tradeType === "buy") {
        const { error: positionError } = await supabase
          .from("positions")
          .insert({
            user_id: user.id,
            market_id: market.id,
            outcome_id: selectedOutcome,
            shares: shareAmount,
            avg_price: outcome.current_price,
            total_cost: totalCost,
          });

        if (positionError) throw positionError;
      }

      toast.success(`${tradeType === "buy" ? "Bought" : "Sold"} ${shares} shares successfully!`);
      setShares("");
      setSelectedOutcome("");
      onTradeComplete?.();
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Failed to execute trade");
    } finally {
      setLoading(false);
    }
  };

  if (!market.market_outcomes?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No trading options available for this market.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Outcome</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {market.market_outcomes.map((outcome: any) => (
                  <button
                    key={outcome.id}
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedOutcome === outcome.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{outcome.name}</span>
                      <Badge variant="secondary">
                        {formatPercentage(outcome.current_price)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(outcome.current_price)} per share
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Number of Shares</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Enter number of shares"
                className="mt-1"
              />
            </div>

            {shares && selectedOutcome && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Cost:</span>
                  <span className="font-semibold">{formatCurrency(calculateCost())}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleTrade}
              disabled={loading || !shares || !selectedOutcome || !user}
              className="w-full"
            >
              {loading ? "Processing..." : `Buy ${shares || "0"} Shares`}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Outcome</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {market.market_outcomes.map((outcome: any) => (
                  <button
                    key={outcome.id}
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedOutcome === outcome.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{outcome.name}</span>
                      <Badge variant="secondary">
                        {formatPercentage(outcome.current_price)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(outcome.current_price)} per share
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Number of Shares</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Enter number of shares"
                className="mt-1"
              />
            </div>

            {shares && selectedOutcome && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">You'll Receive:</span>
                  <span className="font-semibold">{formatCurrency(calculateCost())}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleTrade}
              disabled={loading || !shares || !selectedOutcome || !user}
              className="w-full"
              variant="destructive"
            >
              {loading ? "Processing..." : `Sell ${shares || "0"} Shares`}
            </Button>
          </TabsContent>
        </Tabs>

        {!user && (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to start trading
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};