import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Flag,
  Star,
  Bell,
  BellOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  user_id: string;
  parent_id?: string;
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface MarketSocialProps {
  marketId: string;
  user: any;
}

export const MarketSocial = ({ marketId, user }: MarketSocialProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    if (user) {
      checkFollowStatus();
    }
  }, [marketId, user]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          upvotes,
          downvotes,
          user_id,
          parent_id,
          profiles:user_id(display_name, username, avatar_url)
        `)
        .eq("market_id", marketId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("market_follows")
        .select("id")
        .eq("market_id", marketId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          market_id: marketId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: replyingTo,
        });

      if (error) throw error;

      setNewComment("");
      setReplyingTo(null);
      await loadComments();
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (commentId: string, voteType: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("comment_votes")
        .select("vote_type")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from("comment_votes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", user.id);
        } else {
          // Update vote type
          await supabase
            .from("comment_votes")
            .update({ vote_type: voteType })
            .eq("comment_id", commentId)
            .eq("user_id", user.id);
        }
      } else {
        // Create new vote
        await supabase
          .from("comment_votes")
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType,
          });
      }

      await loadComments();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow markets");
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("market_follows")
          .delete()
          .eq("market_id", marketId)
          .eq("user_id", user.id);
        setIsFollowing(false);
        toast.success("Unfollowed market");
      } else {
        await supabase
          .from("market_follows")
          .insert({
            market_id: marketId,
            user_id: user.id,
          });
        setIsFollowing(true);
        toast.success("Following market");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = (comment: Comment) => {
    return comment.profiles?.display_name || 
           comment.profiles?.username || 
           `User ${comment.user_id.slice(0, 8)}`;
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="space-y-6">
      {/* Follow Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion ({comments.length})
        </h3>
        <Button
          variant={isFollowing ? "default" : "outline"}
          size="sm"
          onClick={toggleFollow}
          disabled={!user}
        >
          {isFollowing ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>

      {/* Comment Form */}
      {user ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {replyingTo && (
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm text-muted-foreground">
                    Replying to comment
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <Textarea
                placeholder="Share your thoughts on this market..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleComment}
                  disabled={loading || !newComment.trim()}
                >
                  {loading ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Please sign in to join the discussion
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Comment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {getDisplayName(comment).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getDisplayName(comment)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Comment Content */}
                <p className="text-sm">{comment.content}</p>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, "upvote")}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {comment.upvotes}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment.id, "downvote")}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {comment.downvotes}
                  </Button>

                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                      className="flex items-center gap-1"
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  )}
                </div>

                {/* Replies */}
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="ml-6 pl-4 border-l border-border">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.profiles?.avatar_url} />
                          <AvatarFallback>
                            {getDisplayName(reply).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs">{getDisplayName(reply)}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(reply.id, "upvote")}
                          className="h-6 px-2"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {reply.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(reply.id, "downvote")}
                          className="h-6 px-2"
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          {reply.downvotes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {comments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};