import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const CHILIZ_TESTNET_CONFIG = {
  chainId: '0x15B3A', // 88250 in hex
  chainName: 'Chiliz Testnet',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: ['https://spicy-rpc.chiliz.com/'],
  blockExplorerUrls: ['https://testnet.chiliscan.com/'],
};

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch to Chiliz testnet
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHILIZ_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHILIZ_TESTNET_CONFIG],
        });
      } else {
        throw switchError;
      }
    }

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

export function getProvider(): ethers.BrowserProvider | null {
  if (!window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

export function getSigner(): Promise<ethers.JsonRpcSigner> | null {
  const provider = getProvider();
  if (!provider) return null;
  return provider.getSigner();
}

export async function getBalance(address: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');
  
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

export function formatChzAmount(wei: string): string {
  return parseFloat(ethers.formatEther(wei)).toFixed(2);
}

export function parseChzAmount(chz: string): bigint {
  return ethers.parseEther(chz);
}
