import { ethers } from 'ethers';
import { getSigner, getProvider } from './web3';

export const CONTRACT_ADDRESS = '0xFA81A5b5a9e0ebe9194d45b47ad553EE05AeEBD7';

export const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function draftCounter() view returns (uint256)",
  "function entryFee() view returns (uint256)",
  "function platformRevenue() view returns (uint256)",
  "function drafts(uint256) view returns (uint256 id, string name, bool isActive, uint256 totalPool, uint256 deadline)",
  "function totalWins(address) view returns (uint256)",
  "function createDraft(string memory draftName, uint256 durationSeconds)",
  "function joinDraft(uint256 draftId, uint256[] memory selectedPlayers) payable",
  "function resolveDraft(uint256 draftId, address[] memory winnerAddresses, uint256[] memory scores)",
  "function getParticipants(uint256 draftId) view returns (address[])",
  "function getPlayerSelection(uint256 draftId, address user) view returns (uint256[])",
  "function getDraftWinners(uint256 draftId) view returns (address[])",
  "function withdrawRevenue()",
  "function changeEntryFee(uint256 newFee)",
  "event DraftResolved(uint256 indexed draftId, address[] winners, uint256[] scores)"
];

export interface ContractDraft {
  id: bigint;
  name: string;
  isActive: boolean;
  totalPool: bigint;
  deadline: bigint;
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
      const draft = await contract.drafts(draftId);
      
      return {
        id: draft.id,
        name: draft.name,
        isActive: draft.isActive,
        totalPool: draft.totalPool,
        deadline: draft.deadline,
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

  async getDraftWinners(draftId: number): Promise<string[]> {
    const contract = await this.getContract();
    return await contract.getDraftWinners(draftId);
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

  async resolveDraft(draftId: number, winnerAddresses: string[], scores: number[]): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.resolveDraft(draftId, winnerAddresses, scores);
    await tx.wait();
    return tx.hash;
  }

  async changeEntryFee(newFeeInChz: string): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.changeEntryFee(ethers.parseEther(newFeeInChz));
    await tx.wait();
    return tx.hash;
  }

  async withdrawRevenue(): Promise<string> {
    const contract = await this.getContract(true);
    const tx = await contract.withdrawRevenue();
    await tx.wait();
    return tx.hash;
  }
}

export const fanDraftContract = new FanDraftContract();
