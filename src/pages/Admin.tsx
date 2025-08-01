import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Crown, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Trivia {
  id: string;
  title: string;
  description: string;
  correct_answer: string;
  status: string;
  ends_at: string;
  support_pool: number;
  oppose_pool: number;
  support_count: number;
  oppose_count: number;
  created_at: string;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [minBattleTokens, setMinBattleTokens] = useState(1);

  useEffect(() => {
    checkAdminStatus();
    loadTrivias();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrivias = async () => {
    try {
      const { data, error } = await supabase
        .from('trivias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrivias(data || []);
    } catch (error) {
      console.error('Error loading trivias:', error);
      toast({
        title: "Error",
        description: "Failed to load trivias",
        variant: "destructive",
      });
    }
  };

  const handleCreateTrivia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('trivias')
        .insert({
          title,
          description,
          correct_answer: correctAnswer,
          ends_at: new Date(endsAt).toISOString(),
          min_battle_tokens: minBattleTokens,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trivia created successfully!",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCorrectAnswer('');
      setEndsAt('');
      setMinBattleTokens(1);
      setShowCreateForm(false);
      
      // Reload trivias
      loadTrivias();
    } catch (error: any) {
      console.error('Error creating trivia:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create trivia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrivia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trivia?')) return;

    try {
      const { error } = await supabase
        .from('trivias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trivia deleted successfully!",
      });

      loadTrivias();
    } catch (error: any) {
      console.error('Error deleting trivia:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete trivia",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-8 w-8 text-destructive mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Manage trivias and battle settings</p>
          </div>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Back to Home
          </Button>
        </div>

        {/* Create Trivia Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trivia Management</CardTitle>
                <CardDescription>Create and manage trivia battles</CardDescription>
              </div>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Trivia
              </Button>
            </div>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateTrivia} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter trivia title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ends-at">End Date & Time</Label>
                    <Input
                      id="ends-at"
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter trivia description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correct-answer">Correct Answer</Label>
                    <Select value={correctAnswer} onValueChange={setCorrectAnswer} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="oppose">Oppose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-tokens">Minimum Battle Tokens</Label>
                    <Input
                      id="min-tokens"
                      type="number"
                      min="1"
                      value={minBattleTokens}
                      onChange={(e) => setMinBattleTokens(parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Trivia'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Existing Trivias */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Trivias ({trivias.length})</CardTitle>
            <CardDescription>Manage your trivia battles</CardDescription>
          </CardHeader>
          <CardContent>
            {trivias.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No trivias created yet. Create your first trivia battle!
              </p>
            ) : (
              <div className="space-y-4">
                {trivias.map((trivia) => (
                  <div key={trivia.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{trivia.title}</h3>
                        <p className="text-sm text-muted-foreground">{trivia.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>Status: <span className="font-medium">{trivia.status}</span></span>
                          <span>Correct Answer: <span className="font-medium">{trivia.correct_answer}</span></span>
                          <span>Ends: <span className="font-medium">{format(new Date(trivia.ends_at), 'PPp')}</span></span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>Support Pool: <span className="font-medium">{trivia.support_pool} ({trivia.support_count} votes)</span></span>
                          <span>Oppose Pool: <span className="font-medium">{trivia.oppose_pool} ({trivia.oppose_count} votes)</span></span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTrivia(trivia.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
