import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertDraftSchema, insertDraftEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all players
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Get players by position
  app.get("/api/players/position/:position", async (req, res) => {
    try {
      const { position } = req.params;
      const players = await storage.getPlayersByPosition(position);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players by position" });
    }
  });

  // Create a new player (admin only)
  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Invalid player data" });
    }
  });

  // Get all drafts
  app.get("/api/drafts", async (req, res) => {
    try {
      const drafts = await storage.getAllDrafts();
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  });

  // Get active drafts
  app.get("/api/drafts/active", async (req, res) => {
    try {
      const drafts = await storage.getActiveDrafts();
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active drafts" });
    }
  });

  // Get draft by ID
  app.get("/api/drafts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.getDraft(id);
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.json(draft);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch draft" });
    }
  });

  // Create a new draft (admin only)
  app.post("/api/drafts", async (req, res) => {
    try {
      const validatedData = insertDraftSchema.parse(req.body);
      const draft = await storage.createDraft(validatedData);
      res.json(draft);
    } catch (error) {
      res.status(400).json({ error: "Invalid draft data" });
    }
  });

  // Get draft entries for a specific draft
  app.get("/api/drafts/:id/entries", async (req, res) => {
    try {
      const draftId = parseInt(req.params.id);
      const entries = await storage.getDraftEntries(draftId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch draft entries" });
    }
  });

  // Create a draft entry
  app.post("/api/drafts/:id/entries", async (req, res) => {
    try {
      const draftId = parseInt(req.params.id);
      const validatedData = insertDraftEntrySchema.parse({
        ...req.body,
        draftId,
      });
      
      // Check if user already has an entry for this draft
      const existingEntry = await storage.getUserDraftEntry(draftId, validatedData.userAddress);
      if (existingEntry) {
        return res.status(400).json({ error: "User already has an entry for this draft" });
      }

      const entry = await storage.createDraftEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid draft entry data" });
    }
  });

  // Get user's draft entry for a specific draft
  app.get("/api/drafts/:id/entries/:userAddress", async (req, res) => {
    try {
      const draftId = parseInt(req.params.id);
      const { userAddress } = req.params;
      const entry = await storage.getUserDraftEntry(draftId, userAddress);
      
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch draft entry" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Update leaderboard entry
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { userAddress, totalWins, totalEarnings, gamesPlayed } = req.body;
      
      if (!userAddress) {
        return res.status(400).json({ error: "User address is required" });
      }

      const entry = await storage.updateLeaderboard({
        userAddress,
        totalWins: totalWins || 0,
        totalEarnings: totalEarnings || "0",
        gamesPlayed: gamesPlayed || 0,
      });
      
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid leaderboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
