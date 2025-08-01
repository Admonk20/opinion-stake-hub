import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { OpinionCard, Opinion } from '@/components/OpinionCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Zap, Shield } from 'lucide-react';

const Index = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [opinions, setOpinions] = useState<Opinion[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockOpinions: Opinion[] = [
      {
        id: '1',
        title: 'Bitcoin will reach $100,000 by end of 2024',
        description: 'With increasing institutional adoption and upcoming halving, Bitcoin is positioned for significant growth.',
        supportAmount: 45.7,
        opposeAmount: 23.2,
        supportCount: 156,
        opposeCount: 89,
        expiresAt: new Date('2024-12-31')
      },
      {
        id: '2',
        title: 'AI will replace 50% of jobs in the next 10 years',
        description: 'Rapid advancement in AI technology suggests significant job displacement across various industries.',
        supportAmount: 32.1,
        opposeAmount: 41.8,
        supportCount: 203,
        opposeCount: 287,
        expiresAt: new Date('2034-01-01')
      },
      {
        id: '3',
        title: 'Tesla will become the world\'s most valuable company',
        description: 'With expansion into energy, AI, and robotics, Tesla could surpass current market leaders.',
        supportAmount: 28.9,
        opposeAmount: 35.6,
        supportCount: 124,
        opposeCount: 178,
        expiresAt: new Date('2025-06-30')
      }
    ];
    setOpinions(mockOpinions);
  }, []);

  const handleWalletConnect = (address: string) => {
    setConnectedAccount(address);
  };

  const handleStake = async (opinionId: string, amount: number, side: 'support' | 'oppose') => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update opinion amounts (in real app, this would come from blockchain)
    setOpinions(prev => prev.map(opinion => {
      if (opinion.id === opinionId) {
        return {
          ...opinion,
          supportAmount: side === 'support' ? opinion.supportAmount + amount : opinion.supportAmount,
          opposeAmount: side === 'oppose' ? opinion.opposeAmount + amount : opinion.opposeAmount,
          supportCount: side === 'support' ? opinion.supportCount + 1 : opinion.supportCount,
          opposeCount: side === 'oppose' ? opinion.opposeCount + 1 : opinion.opposeCount,
        };
      }
      return opinion;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Opinion Stake Hub
            </h1>
          </div>
          <WalletConnect onConnect={handleWalletConnect} />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Stake Your Opinions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Put your BNB where your beliefs are. Support or oppose popular opinions and earn rewards based on prediction accuracy.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="wallet" size="lg">
              <Zap className="h-5 w-5" />
              Start Staking
            </Button>
            <Button variant="prediction" size="lg">
              View Markets
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">127.8</div>
              <div className="text-muted-foreground">Total BNB Staked</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">2,341</div>
              <div className="text-muted-foreground">Active Predictions</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">89%</div>
              <div className="text-muted-foreground">Payout Rate</div>
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
              <h3 className="text-xl font-semibold">Choose Your Side</h3>
              <p className="text-muted-foreground">
                Browse popular opinions and stake BNB to support or oppose predictions.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-oppose rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-oppose-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Earn Rewards</h3>
              <p className="text-muted-foreground">
                Win rewards based on accuracy when predictions resolve in your favor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Opinions */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Opinions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opinions.map((opinion) => (
              <OpinionCard
                key={opinion.id}
                opinion={opinion}
                onStake={handleStake}
                isWalletConnected={!!connectedAccount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Opinion Stake Hub. Stake responsibly.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;