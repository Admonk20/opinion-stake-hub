import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Market {
  id: string;
  title: string;
  description: string;
  question: string;
  category_id: string;
  creator_id: string;
  end_date: string;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Admin = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    question: "",
    category_id: "",
    end_date: "",
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      toast.error("Please sign in to access admin panel");
    }
  };

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load markets
      const { data: marketsData, error: marketsError } = await supabase
        .from("markets")
        .select("*")
        .order("created_at", { ascending: false });

      if (marketsError) throw marketsError;
      setMarkets(marketsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: market, error: marketError } = await supabase
        .from("markets")
        .insert({
          title: formData.title,
          description: formData.description,
          question: formData.question,
          category_id: formData.category_id,
          creator_id: user.id,
          end_date: formData.end_date,
          status: "active",
        })
        .select()
        .single();

      if (marketError) throw marketError;

      // Create Yes/No outcomes
      const { error: outcomesError } = await supabase
        .from("market_outcomes")
        .insert([
          {
            market_id: market.id,
            name: "Yes",
            slug: "yes",
            current_price: 0.5,
          },
          {
            market_id: market.id,
            name: "No",
            slug: "no",
            current_price: 0.5,
          },
        ]);

      if (outcomesError) throw outcomesError;

      toast.success("Market created successfully!");
      setFormData({
        title: "",
        description: "",
        question: "",
        category_id: "",
        end_date: "",
      });
      loadData();
    } catch (error) {
      console.error("Error creating market:", error);
      toast.error("Failed to create market");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access the admin panel.
            </p>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Market Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Market title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Market description"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Input
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="Yes/No question"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Market
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Markets List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {markets.slice(0, 10).map((market) => (
                  <div
                    key={market.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <h3 className="font-semibold">{market.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {market.description}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2 py-1 bg-primary/10 rounded">
                        {market.status}
                      </span>
                      <span>{new Date(market.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;