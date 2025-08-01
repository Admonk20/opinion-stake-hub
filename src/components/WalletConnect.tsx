import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

export interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect?.(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Switch to BSC network
      await switchToBSC();
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect?.(accounts[0]);
        toast({
          title: "Wallet connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x38',
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add BSC network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    onConnect?.('');
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-gradient-card rounded-md border border-border">
          <span className="text-sm text-muted-foreground">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="wallet" 
      onClick={connectWallet} 
      disabled={isConnecting}
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}