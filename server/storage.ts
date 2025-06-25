import { 
  users, 
  players, 
  drafts, 
  draftEntries, 
  leaderboard,
  type User, 
  type InsertUser, 
  type Player, 
  type InsertPlayer,
  type Draft,
  type InsertDraft,
  type DraftEntry,
  type InsertDraftEntry,
  type LeaderboardEntry,
  type InsertLeaderboard 
} from "@shared/schema";
import { mockPlayers } from "./data/players";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getAllPlayers(): Promise<Player[]>;
  getPlayersByPosition(position: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  // Draft methods
  getAllDrafts(): Promise<Draft[]>;
  getActiveDrafts(): Promise<Draft[]>;
  getDraft(id: number): Promise<Draft | undefined>;
  createDraft(draft: InsertDraft): Promise<Draft>;
  updateDraft(id: number, updates: Partial<Draft>): Promise<Draft | undefined>;

  // Draft entry methods
  getDraftEntries(draftId: number): Promise<DraftEntry[]>;
  getUserDraftEntry(draftId: number, userAddress: string): Promise<DraftEntry | undefined>;
  createDraftEntry(entry: InsertDraftEntry): Promise<DraftEntry>;

  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  updateLeaderboard(entry: InsertLeaderboard): Promise<LeaderboardEntry>;

  // Stats methods
  getStats(): Promise<{
    totalPlayers: number;
    activeDrafts: number;
    totalPrizePool: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private drafts: Map<number, Draft>;
  private draftEntries: Map<string, DraftEntry>; // key: `${draftId}-${userAddress}`
  private leaderboardMap: Map<string, LeaderboardEntry>;
  private currentId: number;
  private playerCurrentId: number;
  private draftCurrentId: number;
  private entryCurrentId: number;
  private leaderboardCurrentId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.drafts = new Map();
    this.draftEntries = new Map();
    this.leaderboardMap = new Map();
    this.currentId = 1;
    this.playerCurrentId = 1;
    this.draftCurrentId = 1;
    this.entryCurrentId = 1;
    this.leaderboardCurrentId = 1;

    // Initialize with mock players
    this.initializePlayers();
    // Initialize with sample drafts
    this.initializeSampleDrafts();
    // Initialize with sample leaderboard
    this.initializeSampleLeaderboard();
  }

  private initializePlayers() {
    mockPlayers.forEach(player => {
      const id = this.playerCurrentId++;
      this.players.set(id, { ...player, id });
    });
  }

  private initializeSampleDrafts() {
    // Create sample active drafts
    const sampleDrafts = [
      {
        contractId: 1,
        name: "Champions League Fantasy",
        description: "Pick your dream team for the Champions League knockout stage",
        entryFee: "25",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        isActive: true,
        totalPool: "250",
        participants: 10,
        maxParticipants: 100,
      },
      {
        contractId: 2,
        name: "Premier League Elite",
        description: "Elite fantasy league for Premier League matchday",
        entryFee: "25",
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        isActive: true,
        totalPool: "500",
        participants: 20,
        maxParticipants: 100,
      },
      {
        contractId: 3,
        name: "Weekend Warriors",
        description: "Quick draft for weekend matches",
        entryFee: "25",
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        isActive: true,
        totalPool: "150",
        participants: 6,
        maxParticipants: 50,
      }
    ];

    sampleDrafts.forEach(draft => {
      const id = this.draftCurrentId++;
      this.drafts.set(id, { ...draft, id });
    });
  }

  private initializeSampleLeaderboard() {
    // Create sample leaderboard entries
    const sampleLeaderboard = [
      {
        userAddress: "0x742d35Cc6634C0532925a3b8d8f89c7C7b265f9e",
        totalWins: 15,
        totalEarnings: "1250",
        gamesPlayed: 28,
      },
      {
        userAddress: "0x8ba1f109551bD432803012645Hac136c22C3B8C2",
        totalWins: 12,
        totalEarnings: "980",
        gamesPlayed: 25,
      },
      {
        userAddress: "0x123456789abcdef123456789abcdef123456789a",
        totalWins: 10,
        totalEarnings: "750",
        gamesPlayed: 22,
      },
      {
        userAddress: "0x987654321fedcba987654321fedcba987654321f",
        totalWins: 8,
        totalEarnings: "600",
        gamesPlayed: 18,
      },
      {
        userAddress: "0xabcdef123456789abcdef123456789abcdef123456",
        totalWins: 6,
        totalEarnings: "450",
        gamesPlayed: 15,
      }
    ];

    sampleLeaderboard.forEach(entry => {
      const id = this.leaderboardCurrentId++;
      this.leaderboardMap.set(entry.userAddress, { ...entry, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: insertUser.walletAddress || null 
    };
    this.users.set(id, user);
    return user;
  }

  // Player methods
  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayersByPosition(position: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(p => p.position === position);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerCurrentId++;
    const player: Player = { 
      ...insertPlayer, 
      id,
      points: insertPlayer.points || 0,
      imageUrl: insertPlayer.imageUrl || null
    };
    this.players.set(id, player);
    return player;
  }

  // Draft methods
  async getAllDrafts(): Promise<Draft[]> {
    return Array.from(this.drafts.values());
  }

  async getActiveDrafts(): Promise<Draft[]> {
    return Array.from(this.drafts.values()).filter(d => d.isActive);
  }

  async getDraft(id: number): Promise<Draft | undefined> {
    return this.drafts.get(id);
  }

  async createDraft(insertDraft: InsertDraft): Promise<Draft> {
    const id = this.draftCurrentId++;
    const draft: Draft = { 
      ...insertDraft, 
      id,
      description: insertDraft.description || null,
      isActive: insertDraft.isActive ?? true,
      totalPool: insertDraft.totalPool || "0",
      participants: insertDraft.participants || 0,
      maxParticipants: insertDraft.maxParticipants || 100
    };
    this.drafts.set(id, draft);
    return draft;
  }

  async updateDraft(id: number, updates: Partial<Draft>): Promise<Draft | undefined> {
    const draft = this.drafts.get(id);
    if (!draft) return undefined;
    
    const updatedDraft = { ...draft, ...updates };
    this.drafts.set(id, updatedDraft);
    return updatedDraft;
  }

  // Draft entry methods
  async getDraftEntries(draftId: number): Promise<DraftEntry[]> {
    return Array.from(this.draftEntries.values()).filter(e => e.draftId === draftId);
  }

  async getUserDraftEntry(draftId: number, userAddress: string): Promise<DraftEntry | undefined> {
    const key = `${draftId}-${userAddress}`;
    return this.draftEntries.get(key);
  }

  async createDraftEntry(insertEntry: InsertDraftEntry): Promise<DraftEntry> {
    const id = this.entryCurrentId++;
    const entry: DraftEntry = { 
      ...insertEntry, 
      id,
      playerIds: insertEntry.playerIds || null,
      score: insertEntry.score || 0,
      txHash: insertEntry.txHash || null
    };
    const key = `${entry.draftId}-${entry.userAddress}`;
    this.draftEntries.set(key, entry);
    return entry;
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardMap.values())
      .sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0))
      .slice(0, 10);
  }

  async updateLeaderboard(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const existing = this.leaderboardMap.get(entry.userAddress);
    if (existing) {
      const updated = { 
        ...existing, 
        totalWins: entry.totalWins || existing.totalWins,
        totalEarnings: entry.totalEarnings || existing.totalEarnings,
        gamesPlayed: entry.gamesPlayed || existing.gamesPlayed,
      };
      this.leaderboardMap.set(entry.userAddress, updated);
      return updated;
    } else {
      const id = this.leaderboardCurrentId++;
      const newEntry: LeaderboardEntry = { 
        ...entry, 
        id,
        totalWins: entry.totalWins || 0,
        totalEarnings: entry.totalEarnings || "0",
        gamesPlayed: entry.gamesPlayed || 0
      };
      this.leaderboardMap.set(entry.userAddress, newEntry);
      return newEntry;
    }
  }

  // Stats methods
  async getStats(): Promise<{
    totalPlayers: number;
    activeDrafts: number;
    totalPrizePool: string;
  }> {
    const activeDrafts = await this.getActiveDrafts();
    const totalPrizePool = activeDrafts.reduce((sum, draft) => {
      return sum + parseFloat(draft.totalPool || '0');
    }, 0);

    return {
      totalPlayers: this.leaderboardMap.size,
      activeDrafts: activeDrafts.length,
      totalPrizePool: totalPrizePool.toString(),
    };
  }
}

export const storage = new MemStorage();
