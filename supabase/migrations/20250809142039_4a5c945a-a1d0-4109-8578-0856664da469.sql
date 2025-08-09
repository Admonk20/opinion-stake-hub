-- Create table for manual withdrawal requests (idempotent)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT,
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'BSC',
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent via conditional creation)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'withdrawal_requests' 
      AND policyname = 'Users can view their own withdrawal requests'
  ) THEN
    CREATE POLICY "Users can view their own withdrawal requests"
    ON public.withdrawal_requests
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'withdrawal_requests' 
      AND policyname = 'Users can create their own withdrawal requests'
  ) THEN
    CREATE POLICY "Users can create their own withdrawal requests"
    ON public.withdrawal_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'withdrawal_requests' 
      AND policyname = 'Admins can view all withdrawal requests'
  ) THEN
    CREATE POLICY "Admins can view all withdrawal requests"
    ON public.withdrawal_requests
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'withdrawal_requests' 
      AND policyname = 'Admins can update withdrawal request status'
  ) THEN
    CREATE POLICY "Admins can update withdrawal request status"
    ON public.withdrawal_requests
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);