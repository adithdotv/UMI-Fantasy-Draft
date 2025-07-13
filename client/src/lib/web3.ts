import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Umi_TESTNET_CONFIG = {
  chainId: '0x15b32', // 88882 in hex
  chainName: 'UMI Devnet',
  nativeCurrency: {
    name: 'UMI',
    symbol: 'UMI',
    decimals: 18,
  },
  rpcUrls: ['https://spicy-rpc.Umi.com/'],
  blockExplorerUrls: ['https://testnet.chiliscan.com/'],
};

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }

  try {
    // Request account access first
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    // Check current network
    const currentChainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    // If not on UMI Devnet, try to switch
    if (currentChainId !== Umi_TESTNET_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Umi_TESTNET_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Chain not added to MetaMask (error code 4902)
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [Umi_TESTNET_CONFIG],
            });
          } catch (addError: any) {
            console.error('Failed to add UMI Devnet:', addError);
            throw new Error('Failed to add UMI Devnet to MetaMask. Please add it manually.');
          }
        } else if (switchError.code === 4001) {
          // User rejected the request
          throw new Error('Please switch to UMI Devnet to continue.');
        } else {
          console.error('Failed to switch network:', switchError);
          throw new Error('Failed to switch to UMI Devnet. Please switch manually.');
        }
      }
    }

    return accounts[0];
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please accept the connection request.');
    }
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

export function formatUMIAmount(wei: string): string {
  return parseFloat(ethers.formatEther(wei)).toFixed(2);
}

export function parseUMIAmount(UMI: string): bigint {
  return ethers.parseEther(UMI);
}
