import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { MarketGrid } from "@/components/MarketGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { SortFilter } from "@/components/SortFilter";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("volume");
  const [user, setUser] = useState<any>(null);

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
  const { data: categories } = useQuery({
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

  // Fetch markets with filters
  const { data: markets, isLoading } = useQuery({
    queryKey: ["markets", selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("markets")
        .select(`
          *,
          categories (name, color),
          market_outcomes (*)
        `)
        .eq("status", "active");

      if (selectedCategory !== "all") {
        const category = categories?.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order(
        sortBy === "volume" ? "volume" : "created_at",
        { ascending: false }
      );
      
      if (error) throw error;
      return data;
    },
    enabled: !!categories,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <HeroSection />

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex gap-4">
            <SortFilter value={sortBy} onChange={setSortBy} />
            <CategoryFilter 
              categories={categories || []}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Markets Grid */}
        <MarketGrid 
          markets={markets || []} 
          isLoading={isLoading}
          user={user}
        />
      </div>
    </div>
  );
};

export default Index;