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
  }

  private initializePlayers() {
    mockPlayers.forEach(player => {
      const id = this.playerCurrentId++;
      this.players.set(id, { ...player, id });
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
    const user: User = { ...insertUser, id };
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
    const player: Player = { ...insertPlayer, id };
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
    const draft: Draft = { ...insertDraft, id };
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
    const entry: DraftEntry = { ...insertEntry, id };
    const key = `${entry.draftId}-${entry.userAddress}`;
    this.draftEntries.set(key, entry);
    return entry;
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardMap.values())
      .sort((a, b) => b.totalWins - a.totalWins)
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
      const newEntry: LeaderboardEntry = { ...entry, id };
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
