import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-3xl p-8 mb-12 animate-enter">
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6">
            Predict the future of Africa on the Blockchain
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0">
            Trade on outcomes of African politics, economy, sports, and culture. 
            Put your knowledge to work and earn from accurate predictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
            <Button size="lg" className="group hover-scale" asChild>
              <Link to="/auth">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="group hover-scale" asChild>
              <a
                href="https://tzeecoin.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join the Tzeecoin presale"
              >
                Join Presale
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="hover-scale">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Markets
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
};