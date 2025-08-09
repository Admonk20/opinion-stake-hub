import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CURRENCY } from "@/lib/currency";

export function DepositVerifier({ onVerified }: { onVerified?: () => void }) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch config (deposit address)
    supabase.functions
      .invoke("verify-deposit", { body: { action: "config" } })
      .then((res) => {
        if (res.error) throw res.error;
        setDepositAddress((res.data as any)?.depositAddress || "");
      })
      .catch((e) => console.error("Config fetch failed", e));
  }, []);

  const connectWallet = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        toast.error("No wallet detected. Please install MetaMask.");
        return;
      }
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect wallet");
    }
  };

  const verifyDeposit = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    setLoading(true);
    try {
      const minAmount = amount ? parseFloat(amount) : undefined;
      const { data, error } = await supabase.functions.invoke("verify-deposit", {
        body: { fromAddress: walletAddress, minAmount },
      });
      if (error) throw error;

      const newlyCredited = (data as any)?.newlyCredited || 0;
      if (newlyCredited > 0) {
        toast.success(`Credited ${newlyCredited} ${CURRENCY.symbol} from on-chain deposits`);
        onVerified?.();
      } else {
        toast.info("No new deposits found yet. Try again in a minute.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Deposit (TZEE)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">1) Connect your BSC wallet</div>
          <div className="flex items-center gap-2">
            <Button onClick={connectWallet} variant="outline">
              {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </Button>
            {walletAddress && (
              <span className="text-xs text-muted-foreground break-all">{walletAddress}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">2) Send TZEE to deposit address</div>
          <div className="flex items-center gap-2">
            <Input readOnly value={depositAddress} placeholder="Deposit address loading..." />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!depositAddress) return;
                navigator.clipboard.writeText(depositAddress);
                toast.success("Deposit address copied");
              }}
            >
              Copy
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">Token: {CURRENCY.symbol} • Network: BSC Mainnet</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">3) Verify deposit</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.0001"
              placeholder={`Optional minimum ${CURRENCY.symbol}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={verifyDeposit} disabled={loading} className="min-w-[140px]">
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ≈ {(parseFloat(amount || "0") || 0).toLocaleString()} USDT • 1 {CURRENCY.symbol} = 1 USDT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
