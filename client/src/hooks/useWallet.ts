import { useState, useEffect } from 'react';
import { connectWallet, getBalance } from '@/lib/web3';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateBalance(accounts[0]);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          setAccount(null);
          setBalance('0');
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const updateBalance = async (address: string) => {
    try {
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const address = await connectWallet();
      if (address) {
        setAccount(address);
        await updateBalance(address);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance('0');
  };

  return {
    account,
    balance: parseFloat(balance).toFixed(2),
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!account,
  };
}
