import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Trivia {
  id: string;
  title: string;
  description: string;
  entry_price: number;
  support_pool: number;
  oppose_pool: number;
  support_count: number;
  oppose_count: number;
  ends_at: string;
  status: string;
}

interface TriviaCardProps {
  trivia: Trivia;
  onAnswer: (triviaId: string, answer: 'support' | 'oppose') => void;
  isWalletConnected: boolean;
  userAnswer?: string;
}

export const TriviaCard = ({ trivia, onAnswer, isWalletConnected, userAnswer }: TriviaCardProps) => {
  const [isAnswering, setIsAnswering] = useState(false);

  const totalPool = trivia.support_pool + trivia.oppose_pool;
  const supportPercentage = totalPool > 0 ? (trivia.support_pool / totalPool) * 100 : 50;
  const opposePercentage = 100 - supportPercentage;

  const handleAnswer = async (answer: 'support' | 'oppose') => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to participate.",
        variant: "destructive",
      });
      return;
    }

    if (userAnswer) {
      toast({
        title: "Already answered",
        description: "You have already answered this trivia question.",
        variant: "destructive",
      });
      return;
    }

    setIsAnswering(true);
    try {
      await onAnswer(trivia.id, answer);
      toast({
        title: "Answer submitted successfully",
        description: `You chose ${answer === 'support' ? 'Yes' : 'No'} for ${trivia.entry_price} BNB.`,
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnswering(false);
    }
  };

  const timeRemaining = Math.max(0, Math.ceil((new Date(trivia.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{trivia.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{trivia.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {trivia.support_count + trivia.oppose_count} participants
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining} days remaining
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Entry price display */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{trivia.entry_price} BNB</div>
          <div className="text-xs text-muted-foreground">Entry Price</div>
        </div>

        {/* Progress bar showing current odds */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-support">Yes {supportPercentage.toFixed(1)}%</span>
            <span className="text-oppose">No {opposePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={supportPercentage} className="h-2" />
        </div>

        {/* Total pools */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xl font-bold text-support">{trivia.support_pool.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">Yes Pool</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-oppose">{trivia.oppose_pool.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">No Pool</div>
          </div>
        </div>

        {/* Answer buttons */}
        {userAnswer ? (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">Your answer: {userAnswer === 'support' ? 'Yes' : 'No'}</div>
            <div className="text-xs text-muted-foreground">Paid: {trivia.entry_price} BNB</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="support"
              onClick={() => handleAnswer('support')}
              disabled={isAnswering || !isWalletConnected || trivia.status !== 'active'}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant="oppose"
              onClick={() => handleAnswer('oppose')}
              disabled={isAnswering || !isWalletConnected || trivia.status !== 'active'}
              className="w-full"
            >
              <TrendingDown className="h-4 w-4" />
              No
            </Button>
          </div>
        )}

        {!isWalletConnected && (
          <p className="text-xs text-muted-foreground text-center">
            Connect your wallet to participate
          </p>
        )}
      </CardContent>
    </Card>
  );
};