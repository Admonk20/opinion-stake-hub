-- Update trivias table to support battle tokens instead of fixed BNB prices
ALTER TABLE public.trivias 
DROP COLUMN entry_price,
ADD COLUMN min_battle_tokens integer NOT NULL DEFAULT 1;

-- Update user_answers table to store battle tokens amount
ALTER TABLE public.user_answers 
DROP COLUMN amount_paid,
ADD COLUMN battle_tokens_used integer NOT NULL DEFAULT 1;

-- Add battle tokens balance table
CREATE TABLE public.user_battle_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  total_purchased integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_battle_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for battle tokens
CREATE POLICY "Users can create their own battle tokens balance" 
ON public.user_battle_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own battle tokens balance" 
ON public.user_battle_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own battle tokens balance" 
ON public.user_battle_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_battle_tokens_updated_at
BEFORE UPDATE ON public.user_battle_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update sample trivias to use battle tokens
UPDATE public.trivias 
SET min_battle_tokens = 50 
WHERE title = 'Will Bitcoin reach $100,000 by Friday?';

UPDATE public.trivias 
SET min_battle_tokens = 30 
WHERE title = 'Will Tesla stock drop below $200 this week?';

UPDATE public.trivias 
SET min_battle_tokens = 20 
WHERE title = 'Will Ethereum gas fees exceed 100 gwei this week?';