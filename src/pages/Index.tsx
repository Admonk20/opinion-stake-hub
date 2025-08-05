import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { MarketGrid } from "@/components/MarketGrid";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { toast } from "sonner";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [filters, setFilters] = useState<{
    dateRange?: { from?: Date; to?: Date };
    volumeRange?: number;
  }>({});
  const [user, setUser] = useState<any>(null);
  
  // Real-time updates
  const realtimeData = useRealtimeUpdates();

  useEffect(() => {
    if (realtimeData.trades) {
      toast.success("New trade activity detected!");
    }
    if (realtimeData.prices) {
      toast.info("Market prices updated!");
    }
  }, [realtimeData]);

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch markets with real-time updates
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ["markets", selectedCategory, searchQuery, sortBy, filters],
    queryFn: async () => {
      let query = supabase
        .from("markets")
        .select(`
          *,
          categories(name, color),
          market_outcomes(id, name, slug, current_price, volume)
        `)
        .eq("status", "active");

      // Apply category filter
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,question.ilike.%${searchQuery}%`);
      }

      // Apply date range filter
      if (filters.dateRange?.from) {
        query = query.gte("end_date", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte("end_date", filters.dateRange.to.toISOString());
      }

      // Apply volume filter
      if (filters.volumeRange && filters.volumeRange > 0) {
        query = query.gte("volume", filters.volumeRange);
      }

      // Apply sorting
      if (sortBy === "volume") {
        query = query.order("volume", { ascending: false });
      } else if (sortBy === "end_date") {
        query = query.order("end_date", { ascending: true });
      } else if (sortBy === "activity") {
        query = query.order("volume", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!categories.length,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        
        <div className="mb-8">
          <EnhancedSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFiltersChange={setFilters}
          />
        </div>

        <MarketGrid 
          markets={markets} 
          isLoading={isLoading} 
          user={user}
        />
      </main>
    </div>
  );
};

export default Index;