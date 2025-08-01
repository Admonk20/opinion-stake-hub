import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Opinion {
  id: string;
  title: string;
  description: string;
  supportAmount: number;
  opposeAmount: number;
  supportCount: number;
  opposeCount: number;
  expiresAt: Date;
}

interface OpinionCardProps {
  opinion: Opinion;
  onStake: (opinionId: string, amount: number, side: 'support' | 'oppose') => void;
  isWalletConnected: boolean;
}

export const OpinionCard = ({ opinion, onStake, isWalletConnected }: OpinionCardProps) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  const totalAmount = opinion.supportAmount + opinion.opposeAmount;
  const supportPercentage = totalAmount > 0 ? (opinion.supportAmount / totalAmount) * 100 : 50;
  const opposePercentage = 100 - supportPercentage;

  const handleStake = async (side: 'support' | 'oppose') => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake BNB.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    try {
      await onStake(opinion.id, amount, side);
      setStakeAmount('');
      toast({
        title: "Stake placed successfully",
        description: `You staked ${amount} BNB on ${side === 'support' ? 'supporting' : 'opposing'} this opinion.`,
      });
    } catch (error) {
      toast({
        title: "Staking failed",
        description: "Failed to place your stake. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const timeRemaining = Math.max(0, Math.ceil((opinion.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{opinion.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{opinion.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {opinion.supportCount + opinion.opposeCount} participants
          </span>
          <span>{timeRemaining} days remaining</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar showing current odds */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-support">Support {supportPercentage.toFixed(1)}%</span>
            <span className="text-oppose">Oppose {opposePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={supportPercentage} className="h-2" />
        </div>

        {/* Total amounts */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-support">{opinion.supportAmount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">BNB Supporting</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-oppose">{opinion.opposeAmount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">BNB Opposing</div>
          </div>
        </div>

        {/* Stake input */}
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Enter BNB amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="support"
              onClick={() => handleStake('support')}
              disabled={isStaking || !isWalletConnected}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4" />
              Support
            </Button>
            <Button
              variant="oppose"
              onClick={() => handleStake('oppose')}
              disabled={isStaking || !isWalletConnected}
              className="w-full"
            >
              <TrendingDown className="h-4 w-4" />
              Oppose
            </Button>
          </div>
        </div>

        {!isWalletConnected && (
          <p className="text-xs text-muted-foreground text-center">
            Connect your wallet to place stakes
          </p>
        )}
      </CardContent>
    </Card>
  );
};