import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AnnouncementBarProps {
  presaleUrl: string;
  contractUrl: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ presaleUrl, contractUrl }) => {
  return (
    <section aria-label="Presale announcement" className="mb-6">
      <div className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-sm md:text-base">
          Manual cashouts weekly — every Friday is payday. Withdrawals are manual during presale.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
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
          <Button variant="outline" size="sm" asChild>
            <a
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View BSC contract on BscScan"
            >
              View BSC Contract
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
