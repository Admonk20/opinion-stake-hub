import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Zap, TrendingUp } from 'lucide-react';

interface TokenPurchaseProps {
  userWalletAddress?: string;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
}

const TokenPurchase: React.FC<TokenPurchaseProps> = ({ 
  userWalletAddress, 
  isWalletConnected, 
  onConnectWallet 
}) => {
  const [bnbAmount, setBnbAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const { toast } = useToast();

  // Token exchange rate: 1 BNB = 1000 Battle Tokens
  const TOKENS_PER_BNB = 1000;
  const tokensToReceive = bnbAmount ? parseFloat(bnbAmount) * TOKENS_PER_BNB : 0;

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('user_battle_tokens')
        .select('balance')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching balance:', error);
        return;
      }

      setCurrentBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePurchase = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid BNB amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual smart contract interaction
      await simulateTokenPurchase();
      
      toast({
        title: "Purchase Successful!",
        description: `You received ${tokensToReceive.toLocaleString()} Battle Tokens`,
      });
      
      setBnbAmount('');
      fetchCurrentBalance();
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate the token purchase flow (replace with real contract call)
  const simulateTokenPurchase = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const { data: user } = await supabase.auth.getUser();
          if (!user.user) throw new Error('Not authenticated');

          // Update user's battle token balance
          const { error } = await supabase
            .from('user_battle_tokens')
            .upsert({
              user_id: user.user.id,
              balance: currentBalance + tokensToReceive,
              total_purchased: tokensToReceive,
            });

          if (error) throw error;
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 2000); // Simulate network delay
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Buy Battle Tokens
        </CardTitle>
        <CardDescription>
          Purchase tokens with BNB to participate in trivia battles
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Balance Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold">{currentBalance.toLocaleString()} Tokens</span>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bnb-amount">BNB Amount</Label>
            <Input
              id="bnb-amount"
              type="number"
              placeholder="0.1"
              step="0.001"
              min="0"
              value={bnbAmount}
              onChange={(e) => setBnbAmount(e.target.value)}
              disabled={!isWalletConnected}
            />
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-primary/10 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exchange Rate:</span>
              <span className="font-medium">1 BNB = {TOKENS_PER_BNB.toLocaleString()} Tokens</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>You will receive:</span>
              <span className="font-semibold text-primary">
                {tokensToReceive.toLocaleString()} Tokens
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isWalletConnected ? (
          <Button onClick={onConnectWallet} className="w-full" size="lg">
            Connect Wallet
          </Button>
        ) : (
          <Button 
            onClick={handlePurchase} 
            disabled={isLoading || !bnbAmount || parseFloat(bnbAmount) <= 0}
            className="w-full" 
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Buy ${tokensToReceive.toLocaleString()} Tokens`
            )}
          </Button>
        )}

        {/* Wallet Info */}
        {isWalletConnected && userWalletAddress && (
          <div className="text-xs text-muted-foreground text-center">
            Connected: {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenPurchase;