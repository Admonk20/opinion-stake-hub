import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, User, Wallet, Menu, X } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavbarProps {
  user: any;
}

export const MobileNavbar = ({ user }: MobileNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
    setIsOpen(false);
  };

  const NavigationLinks = () => (
    <div className="flex flex-col space-y-4 p-4">
      <Link 
        to="/" 
        className="text-lg font-medium transition-colors hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        Markets
      </Link>
      <Link 
        to="/leaderboard" 
        className="text-lg font-medium transition-colors hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        Leaderboard
      </Link>
      <Link 
        to="/portfolio" 
        className="text-lg font-medium transition-colors hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        Portfolio
      </Link>
      <a 
        href="#" 
        className="text-lg font-medium transition-colors hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        How it works
      </a>
      <a 
        href="#" 
        className="text-lg font-medium transition-colors hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        About
      </a>
    </div>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AfricaMarket</span>
          </Link>

          {/* Desktop Navigation */}
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
            <Link 
              to="/portfolio" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Portfolio
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
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        {user.email?.split('@')[0]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/portfolio">
                          <Wallet className="h-4 w-4 mr-2" />
                          Portfolio
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/trading-history">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Trading History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                      <div className="flex flex-col space-y-4 mt-8">
                        <div className="border-b pb-4">
                          <p className="font-semibold">{user.email?.split('@')[0]}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        
                        <NavigationLinks />
                        
                        <div className="border-t pt-4 space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setIsOpen(false)}
                            asChild
                          >
                            <Link to="/profile">
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={handleSignOut}
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-2">
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

                {/* Mobile Auth */}
                <div className="md:hidden">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                      <div className="flex flex-col space-y-4 mt-8">
                        <NavigationLinks />
                        
                        <div className="border-t pt-4 space-y-2">
                          <Button asChild className="w-full">
                            <Link to="/auth" onClick={() => setIsOpen(false)}>
                              Sign Up
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link to="/auth" onClick={() => setIsOpen(false)}>
                              Log In
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};