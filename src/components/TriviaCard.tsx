import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Clock, Users, Coins } from 'lucide-react';

export interface Trivia {
  id: string;
  title: string;
  description: string;
  min_battle_tokens: number;
  support_pool: number;
  oppose_pool: number;
  support_count: number;
  oppose_count: number;
  status: string;
  ends_at: string;
}

interface TriviaCardProps {
  trivia: Trivia;
  onAnswer: (triviaId: string, answer: 'support' | 'oppose', amount: number) => void;
  isWalletConnected: boolean;
  userAnswer?: { answer: string; amount: number };
  battleTokens: number;
}

export const TriviaCard = ({ trivia, onAnswer, isWalletConnected, userAnswer, battleTokens }: TriviaCardProps) => {
  const [stakeAmount, setStakeAmount] = useState(trivia.min_battle_tokens);

  const totalParticipants = trivia.support_count + trivia.oppose_count;
  const hasAnswered = !!userAnswer;
  const supportPercentage = totalParticipants > 0 ? (trivia.support_count / totalParticipants) * 100 : 50;
  const opposePercentage = totalParticipants > 0 ? (trivia.oppose_count / totalParticipants) * 100 : 50;

  const handleStakeChange = (value: string) => {
    const numValue = parseInt(value) || trivia.min_battle_tokens;
    setStakeAmount(Math.max(trivia.min_battle_tokens, numValue));
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{trivia.title}</CardTitle>
            <CardDescription>{trivia.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Ends Friday
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalParticipants} battlers
          </div>
          <div className="text-primary font-semibold flex items-center gap-1">
            <Coins className="h-4 w-4" />
            Min: {trivia.min_battle_tokens} tokens
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-support">{trivia.support_pool}</div>
              <div className="text-muted-foreground">Yes Pool (Tokens)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-oppose">{trivia.oppose_pool}</div>
              <div className="text-muted-foreground">No Pool (Tokens)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-support">Yes ({supportPercentage.toFixed(0)}%)</span>
              <span className="text-oppose">No ({opposePercentage.toFixed(0)}%)</span>
            </div>
            <Progress value={supportPercentage} className="h-2 bg-muted">
              <div 
                className="h-full bg-gradient-support rounded-l transition-all"
                style={{ width: `${supportPercentage}%` }}
              />
            </Progress>
          </div>

          {!hasAnswered && isWalletConnected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Battle Tokens to Stake</label>
                <Input
                  type="number"
                  min={trivia.min_battle_tokens}
                  max={battleTokens}
                  value={stakeAmount}
                  onChange={(e) => handleStakeChange(e.target.value)}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Available: {battleTokens} tokens • Min: {trivia.min_battle_tokens} tokens
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="support"
                  onClick={() => onAnswer(trivia.id, 'support', stakeAmount)}
                  className="flex-1"
                  disabled={stakeAmount > battleTokens}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Yes ({supportPercentage.toFixed(0)}%)
                </Button>
                <Button
                  variant="oppose"
                  onClick={() => onAnswer(trivia.id, 'oppose', stakeAmount)}
                  className="flex-1"
                  disabled={stakeAmount > battleTokens}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  No ({opposePercentage.toFixed(0)}%)
                </Button>
              </div>
            </div>
          ) : !isWalletConnected ? (
            <Button variant="outline" disabled className="w-full">
              Connect wallet to battle
            </Button>
          ) : (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You staked <span className="font-semibold text-primary">{userAnswer?.amount} tokens</span> on{' '}
                <span className="font-semibold text-foreground">
                  {userAnswer?.answer === 'support' ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};