import { ethers } from 'ethers';
import { getSigner, getProvider } from './web3';

export const CONTRACT_ADDRESS = '0xBc4F353FfdC4677f7A9CE157c35bf341d343aACa';

export const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function draftCounter() view returns (uint256)",
  "function entryFee() view returns (uint256)",
  "function platformRevenue() view returns (uint256)",
  "function drafts(uint256) view returns (uint256 id, bool isActive, address winner, uint256 totalPool, uint256 deadline)",
  "function getDraft(uint256 draftId) view returns (uint256 id, bool isActive, uint256 totalPool, uint256 deadline)",
  "function getDraftName(uint256 draftId) view returns (string)",
  "function getAllDraftNames() view returns (string[])",
  "function totalWins(address) view returns (uint256)",
  "function createDraft(string memory draftName, uint256 durationSeconds)",
  "function joinDraft(uint256 draftId, uint256[] memory selectedPlayers) payable",
  "function resolveDraft(uint256 draftId, address winner, uint256 score)",
  "function getParticipants(uint256 draftId) view returns (address[])",
  "function getPlayerSelection(uint256 draftId, address user) view returns (uint256[])",
  "function getDraftWinner(uint256 draftId) view returns (address)",
  "function withdrawRevenue()",
  "function changeEntryFee(uint256 newFee)",
  "function getLeaderboard(address player) view returns (uint256 totalGames, uint256 wins, uint256 totalWinnings, uint256 winRate)",
  "event DraftResolved(uint256 indexed draftId, address winner, uint256 score)"
];

export interface ContractDraft {
  id: bigint;
  isActive: boolean;
  totalPool: bigint;
  deadline: bigint;
  participants?: string[];
  winners?: string[];
}

export class FanDraftContract {
  private contract: ethers.Contract | null = null;

  async getContract(withSigner = false): Promise<ethers.Contract> {
    if (withSigner) {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } else {
      const provider = getProvider();
      if (!provider) throw new Error('No provider available');
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }
    return this.contract;
  }

  async getDraftCounter(): Promise<number> {
    const contract = await this.getContract();
    const counter = await contract.draftCounter();
    return Number(counter);
  }

  async getEntryFee(): Promise<string> {
    const contract = await this.getContract();
    const fee = await contract.entryFee();
    return ethers.formatEther(fee);
  }

  async getDraft(draftId: number): Promise<ContractDraft | null> {
    try {
      const contract = await this.getContract();
      const draft = await contract.getDraft(draftId);
      
      // Fetch additional data with error handling
      let participants: string[] = [];
      let winners: string[] = [];
      
      try {
        participants = await contract.getParticipants(draftId);
      } catch (e) {
        console.warn('Could not fetch participants for draft', draftId);
      }
      
      try {
        const winner = await contract.getDraftWinner(draftId);
        winners = winner && winner !== '0x0000000000000000000000000000000000000000' ? [winner] : [];
      } catch (e) {
        console.warn('Could not fetch winner for draft', draftId);
      }
      
      return {
        id: draft[0],
        isActive: draft[1],
        totalPool: draft[2],
        deadline: draft[3],
        participants: participants,
        winners: winners,
      };
    } catch (error) {
      console.error('Error fetching draft:', error);
      return null;
    }
  }

  async getActiveDrafts(): Promise<ContractDraft[]> {
    const counter = await this.getDraftCounter();
    const drafts: ContractDraft[] = [];

    for (let i = 1; i <= counter; i++) {
      const draft = await this.getDraft(i);
      if (draft && draft.isActive) {
        drafts.push(draft);
      }
    }

    return drafts;
  }

  async joinDraft(draftId: number, playerIds: number[], entryFee: string): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.joinDraft(draftId, playerIds, {
      value: ethers.parseEther(entryFee)
    });
    await tx.wait();
    return tx.hash;
  }

  async getParticipants(draftId: number): Promise<string[]> {
    const contract = await this.getContract();
    return await contract.getParticipants(draftId);
  }

  async getPlayerSelection(draftId: number, userAddress: string): Promise<number[]> {
    const contract = await this.getContract();
    const selection = await contract.getPlayerSelection(draftId, userAddress);
    return selection.map((id: bigint) => Number(id));
  }

  async getDraftWinner(draftId: number): Promise<string> {
    const contract = await this.getContract();
    return await contract.getDraftWinner(draftId);
  }

  async getUserWins(address: string): Promise<number> {
    const contract = await this.getContract();
    const wins = await contract.totalWins(address);
    return Number(wins);
  }

  async getOwner(): Promise<string> {
    const contract = await this.getContract();
    return await contract.owner();
  }

  async createDraft(name: string, durationHours: number): Promise<string> {
    const contract = await this.getContract(true);
    const durationSeconds = durationHours * 3600; // Convert hours to seconds
    const tx = await contract.createDraft(name, durationSeconds);
    await tx.wait();
    return tx.hash;
  }

  async resolveDraft(draftId: number, winnerAddress: string, score: number): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.resolveDraft(draftId, winnerAddress, score);
    await tx.wait();
    return tx.hash;
  }

  async changeEntryFee(newFeeInUMI: string): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.changeEntryFee(ethers.parseEther(newFeeInUMI));
    await tx.wait();
    return tx.hash;
  }

  async withdrawRevenue(): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.withdrawRevenue();
    await tx.wait();
    return tx.hash;
  }

  async getPlatformRevenue(): Promise<string> {
    const provider = getProvider();
    if (!provider) throw new Error('No provider available');
    
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    return ethers.formatEther(balance);
  }

  async getPlayerLeaderboardStats(address: string): Promise<{
    totalGames: number;
    wins: number;
    totalWinnings: string;
    winRate: number;
  }> {
    try {
      const contract = await this.getContract();
      const [totalGames, wins, totalWinnings, winRate] = await contract.getLeaderboard(address);
      
      return {
        totalGames: Number(totalGames),
        wins: Number(wins),
        totalWinnings: ethers.formatEther(totalWinnings),
        winRate: Number(winRate),
      };
    } catch (error) {
      console.error('Error getting player leaderboard stats:', error);
      return {
        totalGames: 0,
        wins: 0,
        totalWinnings: '0',
        winRate: 0,
      };
    }
  }
}

export const fanDraftContract = new FanDraftContract();
