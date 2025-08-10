import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AnnouncementBarProps {
  presaleUrl: string;
  contractUrl?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ presaleUrl, contractUrl }) => {
  return (
    <section aria-label="Presale announcement" className="mb-6 animate-fade-in">
      <div className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
        <p className="text-sm md:text-base text-center md:text-left">
          Manual cashouts weekly — every Friday is payday. Withdrawals are manual during presale.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center sm:justify-start">
          <Button size="sm" asChild>
            <a
              href={presaleUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the Tzeecoin presale"
            >
              Join Presale
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          {contractUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View token contract"
              >
                View Token Contract
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
