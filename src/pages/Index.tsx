import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { TriviaCard, Trivia } from '@/components/TriviaCard';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Zap, Shield, User, Home, Coins, Trophy, Star, Target, Gamepad2, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, { answer: string; amount: number }>>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [battleTokens, setBattleTokens] = useState(0);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadTrivias();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // After successful sign-up, automatically show dashboard with active battles
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserAnswers();
      loadBattleTokens();
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
        .select('trivia_id, answer, battle_tokens_used')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const answersMap = (data || []).reduce((acc: Record<string, { answer: string; amount: number }>, answer) => {
        acc[answer.trivia_id] = { 
          answer: answer.answer, 
          amount: answer.battle_tokens_used 
        };
        return acc;
      }, {});
      
      setUserAnswers(answersMap);
    } catch (error) {
      console.error('Error loading user answers:', error);
    }
  };

  const loadBattleTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_battle_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBattleTokens(data?.balance || 0);
    } catch (error) {
      console.error('Error loading battle tokens:', error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedAccount(address);
  };

  const handleAnswer = async (triviaId: string, answer: 'support' | 'oppose', amount: number) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to participate in battles.",
        variant: "destructive",
      });
      return;
    }

    if (amount > battleTokens) {
      toast({
        title: "Insufficient Battle Tokens",
        description: "You don't have enough battle tokens for this battle.",
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
          battle_tokens_used: amount,
        });

      if (answerError) throw answerError;

      // Update battle tokens balance
      const { error: balanceError } = await supabase
        .from('user_battle_tokens')
        .update({
          balance: battleTokens - amount,
          total_spent: battleTokens + amount,
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Update trivia pools and counts
      const newSupportPool = answer === 'support' ? trivia.support_pool + amount : trivia.support_pool;
      const newOpposePool = answer === 'oppose' ? trivia.oppose_pool + amount : trivia.oppose_pool;
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

      setUserAnswers(prev => ({ ...prev, [triviaId]: { answer, amount } }));
      setBattleTokens(prev => prev - amount);

      toast({
        title: "Battle entered!",
        description: `You staked ${amount} battle tokens on ${answer === 'support' ? 'Yes' : 'No'}.`,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to enter the battle. Please try again.",
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
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Memecoin Battles
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
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Memecoin Battles
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect onConnect={handleWalletConnect} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Memecoin Battles
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Battle with your predictions using Battle Tokens. Winners get double their stake minus 20% fee. Every Friday payouts!
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {user && connectedAccount && (
              <Button variant="battle" size="lg" onClick={() => setCurrentView('dashboard')}>
                <User className="h-5 w-5" />
                View Dashboard
              </Button>
            )}
          </div>
          
          {user && connectedAccount && (
            <div className="flex items-center justify-center gap-2 bg-gradient-battle rounded-lg px-6 py-3 border border-battle-token/30 shadow-gold">
              <Coins className="h-5 w-5 text-battle-token-foreground" />
              <span className="text-lg font-semibold text-battle-token-foreground">
                {battleTokens} Battle Tokens
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {trivias.reduce((sum, t) => sum + t.support_pool + t.oppose_pool, 0)}
              </div>
              <div className="text-muted-foreground">Total Battle Tokens</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {trivias.reduce((sum, t) => sum + t.support_count + t.oppose_count, 0)}
              </div>
              <div className="text-muted-foreground">Active Battles</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">2x</div>
              <div className="text-muted-foreground">Winner Multiplier</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">Every Friday</div>
              <div className="text-muted-foreground">Battle Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-gold bg-clip-text text-transparent">How Battle Tokens Work</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Each Battle Token equals $1 USD. Exchange BNB for tokens and battle your way to victory!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto">
                <Coins className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Buy Battle Tokens</h3>
              <p className="text-muted-foreground">
                Exchange BNB for Battle Tokens at $1 USD each. No minimum purchase required.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
              <div className="w-16 h-16 bg-gradient-support rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-support-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Choose Your Battle</h3>
              <p className="text-muted-foreground">
                Pick Yes or No and stake any amount of Battle Tokens. The more you stake, the more you can win.
              </p>
            </div>
            <div className="text-center space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
              <div className="w-16 h-16 bg-gradient-oppose rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-oppose-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Win Big</h3>
              <p className="text-muted-foreground">
                Winners get double their stake minus 20% platform fee. Payouts happen every Friday!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Battle Mechanics */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">Battle Mechanics</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding the rules will help you maximize your winnings and become a Battle Token champion.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Fair Battles</h3>
                  <p className="text-muted-foreground">Every battle has a minimum stake requirement, but you can wager any amount above that minimum.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Double or Nothing</h3>
                  <p className="text-muted-foreground">If you're on the winning side, you get double your original stake back.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Platform Fee</h3>
                  <p className="text-muted-foreground">20% of all winnings go to platform maintenance and development.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Weekly Payouts</h3>
                  <p className="text-muted-foreground">All battles resolve and winners are paid every Friday at 6 PM UTC.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card p-8 rounded-xl border border-border shadow-card">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-gold bg-clip-text text-transparent">Example Battle</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">Your Stake:</span>
                  <span className="font-semibold">100 Battle Tokens</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">If You Win:</span>
                  <span className="font-semibold text-support">200 Battle Tokens</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">Platform Fee (20%):</span>
                  <span className="font-semibold text-oppose">-40 Battle Tokens</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-gold/20 rounded-lg">
                    <span className="font-semibold">Net Winnings:</span>
                    <span className="font-bold text-xl text-primary">160 Battle Tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">Why Battle With Us?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've built the most exciting and fair prediction platform in the memecoin space.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Transparent</h3>
              <p className="text-muted-foreground">Built on BNB Smart Chain with full transparency and security.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Instant Battles</h3>
              <p className="text-muted-foreground">Enter battles instantly with just a few clicks.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Fair Mechanics</h3>
              <p className="text-muted-foreground">Everyone has equal chances to win based on their predictions.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Be the Champion</h3>
              <p className="text-muted-foreground">Climb the leaderboards and become a Battle Token legend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Battles */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-gold bg-clip-text text-transparent">Active Battles</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose your side and stake your Battle Tokens. Remember: winners get double their stake!
          </p>
          {loading ? (
            <div className="text-center">Loading battles...</div>
          ) : trivias.length === 0 ? (
            <div className="text-center text-muted-foreground">No active battles at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trivias.map((trivia) => (
                <TriviaCard
                  key={trivia.id}
                  trivia={trivia}
                  onAnswer={handleAnswer}
                  isWalletConnected={!!connectedAccount && !!user}
                  userAnswer={userAnswers[trivia.id]}
                  battleTokens={battleTokens}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold bg-gradient-gold bg-clip-text text-transparent">
                  Memecoin Battles
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                The ultimate prediction platform for memecoin enthusiasts. Battle with confidence!
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Community</h3>
               <div className="space-y-2 text-sm text-muted-foreground">
                 <a href="https://discord.gg/memecoinbattles" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground transition-colors">Discord</a>
                 <a href="https://t.me/memecoinbattles" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground transition-colors">Telegram</a>
                 <a href="https://twitter.com/memecoinbattles" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground transition-colors">Twitter</a>
                 <Link to="/leaderboard" className="block hover:text-foreground transition-colors">Leaderboard</Link>
               </div>
             </div>
             <div className="space-y-4">
               <h3 className="font-semibold">Support</h3>
               <div className="space-y-2 text-sm text-muted-foreground">
                 <Link to="/help" className="block hover:text-foreground transition-colors">Help Center</Link>
                 <a href="mailto:support@memecoinbattles.com" className="block hover:text-foreground transition-colors">Contact Us</a>
                 <Link to="/terms" className="block hover:text-foreground transition-colors">Terms of Service</Link>
                 <Link to="/privacy" className="block hover:text-foreground transition-colors">Privacy Policy</Link>
               </div>
             </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2025 Memecoin Battles. Battle responsibly. May the best predictions win!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;