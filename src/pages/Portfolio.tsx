import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus,
  History,
  PieChart
} from "lucide-react";
import { formatTZEE, CURRENCY } from "@/lib/currency";
import { DepositVerifier } from "@/components/DepositVerifier";


interface Position {
  id: string;
  shares: number;
  avg_price: number;
  total_cost: number;
  market: {
    title: string;
    status: string;
  };
  market_outcome: {
    name: string;
    current_price: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

interface UserBalance {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_pnl: number;
}

const Portfolio = () => {
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [chain, setChain] = useState("BSC");
  const [profile, setProfile] = useState<{ username?: string | null; display_name?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

const checkAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  setUser(user);
  if (user) {
    await loadUserProfile(user.id);
    await loadPortfolioData(user.id);
  }
  setLoading(false);
};

  const loadPortfolioData = async (userId: string) => {
    try {
      // Load user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (balanceError && balanceError.code !== "PGRST116") {
        throw balanceError;
      }

      setUserBalance(balanceData || {
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        total_pnl: 0,
      });

      // Load positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select(`
          id,
          shares,
          avg_price,
          total_cost,
          market:markets(title, status),
          market_outcome:market_outcomes(name, current_price)
        `)
        .eq("user_id", userId)
        .gt("shares", 0);

      if (positionsError) throw positionsError;
      setPositions(positionsData || []);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading portfolio data:", error);
      toast.error("Failed to load portfolio data");
    }
  };
  
  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", userId)
        .single();
      if (data) setProfile(data);
    } catch (e) {
      console.error("Error loading profile:", e);
    }
  };
  
  const handleDeposit = async () => {
    if (!user || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    setActionLoading(true);
    try {
      const amount = parseFloat(depositAmount);

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          amount,
          type: "deposit",
          description: `Deposit of ${amount}`,
          status: "completed",
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const currentBalance = userBalance?.balance || 0;
      const currentDeposited = userBalance?.total_deposited || 0;

      const { error: balanceError } = await supabase
        .from("user_balances")
        .upsert({
          user_id: user.id,
          balance: currentBalance + amount,
          total_deposited: currentDeposited + amount,
        }, {
          onConflict: "user_id"
        });

      if (balanceError) throw balanceError;

      toast.success(`Successfully deposited ${formatCurrency(amount)}`);
      setDepositAmount("");
      await loadPortfolioData(user.id);
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to process deposit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const currentBalance = userBalance?.balance || 0;

    if (amount > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setActionLoading(true);
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          amount: -amount,
          type: "withdrawal",
          description: `Withdrawal of ${amount}`,
          status: "completed",
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const currentWithdrawn = userBalance?.total_withdrawn || 0;

      const { error: balanceError } = await supabase
        .from("user_balances")
        .upsert({
          user_id: user.id,
          balance: currentBalance - amount,
          total_withdrawn: currentWithdrawn + amount,
        }, {
          onConflict: "user_id"
        });

      if (balanceError) throw balanceError;

      toast.success(`Successfully withdrew ${formatCurrency(amount)}`);
      setWithdrawAmount("");
      await loadPortfolioData(user.id);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to process withdrawal");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleWithdrawRequest = async () => {
    if (!user || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const currentBalance = userBalance?.balance || 0;

    if (amount > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!walletAddress) {
      toast.error("Please enter your BNB wallet address");
      return;
    }

    setActionLoading(true);
    try {
      const username =
        (profile?.username || profile?.display_name || (user as any)?.email || "unknown") ?? "unknown";

      const { error: insertError } = await supabase.from("withdrawal_requests").insert({
        user_id: user.id,
        username,
        wallet_address: walletAddress,
        chain,
        amount,
      });
      if (insertError) throw insertError;

      try {
        await supabase.functions.invoke("send-withdrawal", {
          body: { user_id: user.id, username, wallet_address: walletAddress, chain, amount },
        });
      } catch (e) {
        console.warn("Email notification failed (request saved):", e);
      }

      toast.success("Withdrawal request submitted. Payouts are processed every Friday.");
      setWithdrawAmount("");
      setWalletAddress("");
      setChain("BSC");
    } catch (error) {
      console.error("Withdraw request error:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setActionLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => formatTZEE(amount);

  const calculatePositionValue = (position: Position) => {
    return position.shares * position.market_outcome.current_price;
  };

  const calculatePositionPnL = (position: Position) => {
    const currentValue = calculatePositionValue(position);
    return currentValue - position.total_cost;
  };

  const getTotalPortfolioValue = () => {
    const positionsValue = positions.reduce((total, position) => 
      total + calculatePositionValue(position), 0);
    const cash = userBalance?.balance || 0;
    return positionsValue + cash;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading portfolio...</div>
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
              Please sign in to view your portfolio.
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
          <h1 className="text-3xl font-bold">Portfolio</h1>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Cash Balance</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(userBalance?.balance || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Portfolio</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(getTotalPortfolioValue())}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Total P&L</span>
              </div>
              <p className={`text-2xl font-bold ${(userBalance?.total_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(userBalance?.total_pnl || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Deposited</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(userBalance?.total_deposited || 0)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Active Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active positions</p>
                    <Link to="/">
                      <Button>Start Trading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => {
                      const pnl = calculatePositionPnL(position);
                      const pnlPercentage = ((pnl / position.total_cost) * 100);
                      
                      return (
                        <div key={position.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{position.market.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {position.market_outcome.name} • {position.shares} shares
                              </p>
                            </div>
                            <Badge variant={position.market.status === "active" ? "default" : "secondary"}>
                              {position.market.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Avg Price:</span>
                              <p className="font-medium">{formatCurrency(position.avg_price)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Price:</span>
                              <p className="font-medium">{formatCurrency(position.market_outcome.current_price)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Market Value:</span>
                              <p className="font-medium">{formatCurrency(calculatePositionValue(position))}</p>
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

          <TabsContent value="wallet">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Deposit Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Amount ({CURRENCY.symbol})</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={`Enter amount to deposit in ${CURRENCY.symbol}`}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {(parseFloat(depositAmount || "0") || 0).toLocaleString()} USDT • 1 {CURRENCY.symbol} = 1 USDT
                    </p>
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    disabled={actionLoading || !depositAmount}
                    className="w-full"
                  >
                    {actionLoading ? "Processing..." : "Deposit"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Withdraw Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manual cashouts weekly — every Friday is payday. Withdrawals are processed manually during presale.
                  </p>
                  <div>
                    <label className="text-sm font-medium">Amount ({CURRENCY.symbol})</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      max={userBalance?.balance || 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Enter amount to withdraw in ${CURRENCY.symbol}`}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {formatCurrency(userBalance?.balance || 0)} • ≈ {(parseFloat(withdrawAmount || "0") || 0).toLocaleString()} USDT
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">BNB Wallet Address (BSC)</label>
                    <Input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your BNB (BSC) wallet address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Wallet Chain</label>
                    <Select value={chain} onValueChange={setChain}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BSC">BSC (BNB Chain)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleWithdrawRequest}
                    disabled={
                      actionLoading ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) > (userBalance?.balance || 0) ||
                      !walletAddress
                    }
                    variant="outline"
                    className="w-full"
                  >
                    {actionLoading ? "Submitting..." : "Request Withdrawal"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* On-chain TZEE deposit verifier */}
            <div className="mt-6">
              {/* ... keep existing code (other wallet helpers) */}
              {/* New component to verify on-chain deposits */}
              {/* We refresh data on success */}
              <DepositVerifier onVerified={() => loadPortfolioData(user.id)} />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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

export default Portfolio;