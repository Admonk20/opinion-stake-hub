import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserBalance {
  total_winnings: number;
  available_balance: number;
  total_withdrawn: number;
}

interface UserAnswer {
  id: string;
  trivia_id: string;
  answer: string;
  amount_paid: number;
  created_at: string;
  trivias: {
    title: string;
    status: string;
    correct_answer: string;
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_hash?: string;
}

interface DashboardProps {
  walletAddress: string;
  userId: string;
}

export const Dashboard = ({ walletAddress, userId }: DashboardProps) => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      // Load user balance
      const { data: balanceData } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (balanceData) {
        setBalance(balanceData);
      } else {
        // Create initial balance record
        const { data: newBalance } = await supabase
          .from('user_balances')
          .insert({ user_id: userId })
          .select()
          .single();
        setBalance(newBalance);
      }

      // Load user answers with trivia details
      const { data: answersData } = await supabase
        .from('user_answers')
        .select(`
          *,
          trivias (
            title,
            status,
            correct_answer
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setUserAnswers(answersData || []);

      // Load withdrawal history
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setWithdrawals(withdrawalsData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (!balance || amount > balance.available_balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: userId,
          amount,
          wallet_address: walletAddress,
        });

      if (error) throw error;

      // Update available balance
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({
          available_balance: balance.available_balance - amount,
          total_withdrawn: balance.total_withdrawn + amount,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setWithdrawAmount('');
      loadUserData();
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request is being processed.",
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Withdrawal failed",
        description: "Failed to process your withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance?.total_winnings.toFixed(4) || '0.0000'} BNB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{balance?.available_balance.toFixed(4) || '0.0000'} BNB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance?.total_withdrawn.toFixed(4) || '0.0000'} BNB</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw BNB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Enter amount in BNB"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              step="0.0001"
              min="0"
              max={balance?.available_balance || 0}
            />
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              Withdraw
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Withdrawals are processed to your connected wallet address: {walletAddress}
          </p>
        </CardContent>
      </Card>

      {/* Trivia History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Trivia History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAnswers.length === 0 ? (
              <p className="text-center text-muted-foreground">No trivia participation yet.</p>
            ) : (
              userAnswers.map((answer) => (
                <div key={answer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{answer.trivias.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Your answer: {answer.answer === 'support' ? 'Yes' : 'No'}</span>
                      <span>•</span>
                      <span>Paid: {answer.amount_paid} BNB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={answer.trivias.status === 'resolved' ? 'default' : 'secondary'}>
                      {answer.trivias.status}
                    </Badge>
                    {answer.trivias.status === 'resolved' && (
                      <div className="flex items-center">
                        {answer.answer === answer.trivias.correct_answer ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground">No withdrawals yet.</p>
            ) : (
              withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{withdrawal.amount.toFixed(4)} BNB</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}>
                    {withdrawal.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};