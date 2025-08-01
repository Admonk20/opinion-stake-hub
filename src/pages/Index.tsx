import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { TriviaCard, Trivia } from '@/components/TriviaCard';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Zap, Shield, User, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadTrivias();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserAnswers();
    }
  }, [user]);

  const loadTrivias = async () => {
    try {
      const { data, error } = await supabase
        .from('trivias')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrivias(data || []);
    } catch (error) {
      console.error('Error loading trivias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAnswers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select('trivia_id, answer')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const answersMap = (data || []).reduce((acc: Record<string, string>, answer) => {
        acc[answer.trivia_id] = answer.answer;
        return acc;
      }, {});
      
      setUserAnswers(answersMap);
    } catch (error) {
      console.error('Error loading user answers:', error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedAccount(address);
  };

  const handleAnswer = async (triviaId: string, answer: 'support' | 'oppose') => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to participate in trivias.",
        variant: "destructive",
      });
      return;
    }

    try {
      const trivia = trivias.find(t => t.id === triviaId);
      if (!trivia) return;

      // Insert user answer
      const { error: answerError } = await supabase
        .from('user_answers')
        .insert({
          user_id: user.id,
          trivia_id: triviaId,
          answer,
          amount_paid: trivia.entry_price,
        });

      if (answerError) throw answerError;

      // Update trivia pools and counts
      const newSupportPool = answer === 'support' ? trivia.support_pool + trivia.entry_price : trivia.support_pool;
      const newOpposePool = answer === 'oppose' ? trivia.oppose_pool + trivia.entry_price : trivia.oppose_pool;
      const newSupportCount = answer === 'support' ? trivia.support_count + 1 : trivia.support_count;
      const newOpposeCount = answer === 'oppose' ? trivia.oppose_count + 1 : trivia.oppose_count;

      const { error: updateError } = await supabase
        .from('trivias')
        .update({
          support_pool: newSupportPool,
          oppose_pool: newOpposePool,
          support_count: newSupportCount,
          oppose_count: newOpposeCount,
        })
        .eq('id', triviaId);

      if (updateError) throw updateError;

      // Update local state
      setTrivias(prev => prev.map(t => 
        t.id === triviaId 
          ? { 
              ...t, 
              support_pool: newSupportPool,
              oppose_pool: newOpposePool,
              support_count: newSupportCount,
              oppose_count: newOpposeCount,
            }
          : t
      ));

      setUserAnswers(prev => ({ ...prev, [triviaId]: answer }));

      toast({
        title: "Answer submitted!",
        description: `You answered ${answer === 'support' ? 'Yes' : 'No'} for ${trivia.entry_price} BNB.`,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (currentView === 'dashboard' && user && connectedAccount) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Weekly Trivia Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setCurrentView('home')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <WalletConnect onConnect={handleWalletConnect} />
            </div>
          </div>
        </nav>

        <Dashboard walletAddress={connectedAccount} userId={user.id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Weekly Trivia Hub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && connectedAccount && (
              <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            <WalletConnect onConnect={handleWalletConnect} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Weekly Trivia Challenge
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Answer weekly trivia questions and earn BNB rewards. Fixed entry prices, Friday payouts for winners.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="wallet" size="lg">
              <Zap className="h-5 w-5" />
              Start Playing
            </Button>
            {user && connectedAccount && (
              <Button variant="prediction" size="lg" onClick={() => setCurrentView('dashboard')}>
                <User className="h-5 w-5" />
                View Dashboard
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {trivias.reduce((sum, t) => sum + t.support_pool + t.oppose_pool, 0).toFixed(2)}
              </div>
              <div className="text-muted-foreground">Total BNB Pool</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {trivias.reduce((sum, t) => sum + t.support_count + t.oppose_count, 0)}
              </div>
              <div className="text-muted-foreground">Total Participants</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">Every Friday</div>
              <div className="text-muted-foreground">Payout Schedule</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your MetaMask wallet to the BNB Smart Chain and start participating.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-support rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-support-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Answer Questions</h3>
              <p className="text-muted-foreground">
                Choose Yes or No for weekly trivia questions with fixed entry prices.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-oppose rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-oppose-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Win Rewards</h3>
              <p className="text-muted-foreground">
                Get your share of the losing side's pool every Friday if you're correct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Trivias */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">This Week's Questions</h2>
          {loading ? (
            <div className="text-center">Loading trivias...</div>
          ) : trivias.length === 0 ? (
            <div className="text-center text-muted-foreground">No active trivias at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trivias.map((trivia) => (
                <TriviaCard
                  key={trivia.id}
                  trivia={trivia}
                  onAnswer={handleAnswer}
                  isWalletConnected={!!connectedAccount && !!user}
                  userAnswer={userAnswers[trivia.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Weekly Trivia Hub. Play responsibly.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;