-- Drop existing tables that won't be needed
DROP TABLE IF EXISTS public.correction_exercises CASCADE;
DROP TABLE IF EXISTS public.neural_patterns CASCADE;
DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.trivias CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.user_answers CASCADE;
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.user_balances CASCADE;
DROP TABLE IF EXISTS public.user_battle_tokens CASCADE;

-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories for organizing markets
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create markets table (prediction events)
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  question TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  creator_id UUID NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  volume NUMERIC NOT NULL DEFAULT 0,
  liquidity NUMERIC NOT NULL DEFAULT 0,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved', 'cancelled')),
  resolution TEXT, -- 'yes', 'no', or 'invalid'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market outcomes table (yes/no for binary markets)
CREATE TABLE public.market_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Yes' or 'No'
  slug TEXT NOT NULL, -- 'yes' or 'no'
  current_price NUMERIC NOT NULL DEFAULT 0.5 CHECK (current_price >= 0 AND current_price <= 1),
  volume NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(market_id, slug)
);

-- Create user positions table (user bets)
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES public.market_outcomes(id) ON DELETE CASCADE,
  shares NUMERIC NOT NULL DEFAULT 0,
  avg_price NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, market_id, outcome_id)
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES public.market_outcomes(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID,
  shares NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user balances table
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  total_deposited NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'payout', 'fee')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_id UUID, -- links to trade_id, market_id, etc.
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Markets
CREATE POLICY "Markets are viewable by everyone" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Only admins can manage markets" ON public.markets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Market outcomes
CREATE POLICY "Market outcomes are viewable by everyone" ON public.market_outcomes FOR SELECT USING (true);
CREATE POLICY "Only admins can manage market outcomes" ON public.market_outcomes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Positions
CREATE POLICY "Users can view their own positions" ON public.positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own positions" ON public.positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own positions" ON public.positions FOR UPDATE USING (auth.uid() = user_id);

-- Trades
CREATE POLICY "Trades are viewable by everyone" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Users can create trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- User balances
CREATE POLICY "Users can view their own balance" ON public.user_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own balance" ON public.user_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own balance" ON public.user_balances FOR UPDATE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_outcomes_updated_at BEFORE UPDATE ON public.market_outcomes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON public.user_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories for African markets
INSERT INTO public.categories (name, slug, description, color) VALUES
('African Politics', 'african-politics', 'Political events and elections across Africa', '#3B82F6'),
('Economy', 'economy', 'Economic indicators and financial events', '#10B981'),
('Sports', 'sports', 'Sports events and competitions', '#F59E0B'),
('Technology', 'technology', 'Tech developments and innovations in Africa', '#8B5CF6'),
('Culture', 'culture', 'Cultural events and entertainment', '#EF4444'),
('Climate', 'climate', 'Weather and environmental predictions', '#06B6D4');