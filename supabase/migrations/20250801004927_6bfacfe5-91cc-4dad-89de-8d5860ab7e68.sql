-- Create trivias table for weekly quiz questions
CREATE TABLE public.trivias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- 'support' or 'oppose'
  entry_price DECIMAL(10,4) NOT NULL DEFAULT 0.01, -- Fixed BNB price
  support_pool DECIMAL(15,8) NOT NULL DEFAULT 0,
  oppose_pool DECIMAL(15,8) NOT NULL DEFAULT 0,
  support_count INTEGER NOT NULL DEFAULT 0,
  oppose_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled'))
);

-- Create user_answers table to track user participation
CREATE TABLE public.user_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trivia_id UUID NOT NULL REFERENCES public.trivias(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (answer IN ('support', 'oppose')),
  amount_paid DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trivia_id) -- One answer per user per trivia
);

-- Create user_balances table to track winnings and withdrawals
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_winnings DECIMAL(15,8) NOT NULL DEFAULT 0,
  available_balance DECIMAL(15,8) NOT NULL DEFAULT 0,
  total_withdrawn DECIMAL(15,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payouts table to track individual winnings
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trivia_id UUID NOT NULL REFERENCES public.trivias(id) ON DELETE CASCADE,
  amount DECIMAL(15,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawals table to track withdrawal requests
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(15,8) NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.trivias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trivias (public read, admin write)
CREATE POLICY "Anyone can view active trivias" 
ON public.trivias 
FOR SELECT 
USING (true);

-- RLS Policies for user_answers
CREATE POLICY "Users can view their own answers" 
ON public.user_answers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own answers" 
ON public.user_answers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_balances
CREATE POLICY "Users can view their own balance" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
ON public.user_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own balance" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payouts
CREATE POLICY "Users can view their own payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" 
ON public.withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_balances_updated_at
BEFORE UPDATE ON public.user_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample weekly trivia
INSERT INTO public.trivias (title, description, correct_answer, entry_price, ends_at) VALUES
('Will Bitcoin reach $100,000 by Friday?', 'Bitcoin has been showing strong momentum this week. Will it break the $100k barrier before this Friday''s payout?', 'support', 0.05, '2024-02-02 18:00:00+00'),
('Will Tesla stock drop below $200 this week?', 'Tesla earnings are coming up and there''s uncertainty in the market. Will TSLA close below $200 before Friday?', 'oppose', 0.03, '2024-02-02 18:00:00+00'),
('Will Ethereum gas fees exceed 100 gwei this week?', 'Network activity has been increasing. Will average gas fees spike above 100 gwei before Friday?', 'support', 0.02, '2024-02-02 18:00:00+00');