import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Memecoin Battles</h3>
            <p className="text-muted-foreground text-sm">
              The ultimate prediction market for meme coin trading and community battles.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/leaderboard" className="hover:text-foreground transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="/portfolio" className="hover:text-foreground transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="/trading-history" className="hover:text-foreground transition-colors">
                  Trading History
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Memecoin Battles. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2 sm:mt-0">
            Made with <Heart className="h-4 w-4 text-red-500" /> by the community
          </div>
        </div>
      </div>
    </footer>
  );
};