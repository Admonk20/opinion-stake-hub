import React from "react";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, User, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user: any;
}

export const Navbar = ({ user }: NavbarProps) => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AfricaMarket</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Markets
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Leaderboard
            </Link>
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How it works
            </a>
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Wallet className="h-4 w-4 mr-2" />
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trading History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};