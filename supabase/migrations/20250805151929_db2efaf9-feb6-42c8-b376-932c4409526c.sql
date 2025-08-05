-- Create comments table for social features
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comment_votes table for voting on comments
CREATE TABLE public.comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_votes
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comment_votes
CREATE POLICY "Comment votes are viewable by everyone" 
ON public.comment_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own votes" 
ON public.comment_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.comment_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.comment_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create market_follows table for following markets
CREATE TABLE public.market_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(market_id, user_id)
);

-- Enable RLS on market_follows
ALTER TABLE public.market_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for market_follows
CREATE POLICY "Users can view their own follows" 
ON public.market_follows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follows" 
ON public.market_follows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows" 
ON public.market_follows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE market_follows;

-- Set replica identity
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE comment_votes REPLICA IDENTITY FULL;
ALTER TABLE market_follows REPLICA IDENTITY FULL;