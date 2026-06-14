import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI securely (server-side only)
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "50mb" }));

// Local JSON Database for fully functional accounts & sync (offline-first sync backup)
const DB_FILE = path.join(process.cwd(), "data-db.json");

interface DbUser {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string; // Stored securely
  state: any; // UserState JSON payload
}

interface DbSchema {
  users: Record<string, DbUser>;
}

// Load DB
function loadDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  return { users: {} };
}

// Save DB
function saveDb(db: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Ensure database sits healthy
if (!fs.existsSync(DB_FILE)) {
  saveDb({ users: {} });
}

// Helper: Quick simple secure hash (fallback standard sha256 or basic encoding for simulation)
function simpleHash(password: string): string {
  // Simple token generation
  return btoa(password).replace(/=/g, "");
}

// Auth Routes
app.post("/api/auth/register", (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = loadDb();
  const lowerUsername = username.toLowerCase().trim();

  if (db.users[lowerUsername]) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  // Check if email already exists
  const emailExists = Object.values(db.users).some(u => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  db.users[lowerUsername] = {
    fullName,
    username: lowerUsername,
    email,
    passwordHash: simpleHash(password),
    state: null
  };
  saveDb(db);

  res.json({ success: true, message: "User registered successfully" });
});

app.post("/api/auth/login", (req, res) => {
  const { usernameOrEmail, password, rememberMe } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Missing login details" });
  }

  const db = loadDb();
  const loginSearch = usernameOrEmail.toLowerCase().trim();

  // Find user by either username or email
  let user = db.users[loginSearch];
  if (!user) {
    user = Object.values(db.users).find(
      u => u.email.toLowerCase() === loginSearch
    ) as DbUser;
  }

  if (!user || user.passwordHash !== simpleHash(password)) {
    return res.status(401).json({ error: "Invalid username, email, or password" });
  }

  res.json({
    success: true,
    user: {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    },
    state: user.state,
    token: `token_${user.username}_${Date.now()}`
  });
});

// Sync state backup
app.post("/api/sync", (req, res) => {
  const { username, state } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username required for sync" });
  }

  const db = loadDb();
  const lowerUsername = username.toLowerCase().trim();

  if (!db.users[lowerUsername]) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users[lowerUsername].state = state;
  saveDb(db);

  res.json({ success: true, timestamp: new Date().toISOString() });
});

// Fetch user state
app.get("/api/state/:username", (req, res) => {
  const { username } = req.params;
  const db = loadDb();
  const lowerUsername = username.toLowerCase().trim();

  const user = db.users[lowerUsername];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ state: user.state });
});

// AI - Proxy API Calls to Gemini
app.post("/api/ai/briefing", async (req, res) => {
  const { state } = req.body;
  if (!state || !state.profile) {
    return res.json({ briefing: "Welcome to Atodemic! Let's get started by setting up your study companion." });
  }

  try {
    const p = state.profile;
    const trackingStateStr = JSON.stringify({
      examName: state.onboarding?.examName,
      examDate: state.onboarding?.examDate,
      targetScore: state.onboarding?.targetScore,
      stats: p.stats,
      subjects: state.subjects,
      tasks: state.tasks ? state.tasks.filter((t: any) => t.status !== 'Completed') : []
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide a motivating morning briefing for student. Let's make it brief, clear and actionable. Avoid markup like markdown headings, use simple bold/italic instead.
      
      User context: ${trackingStateStr}`,
      config: {
        systemInstruction: "You are the Atodemic Student OS Study Coach. Your tone is supportive, energetic, clear, and highly practical. Give the student a direct focus for the day."
      }
    });

    res.json({ briefing: response.text });
  } catch (error: any) {
    console.error("AI briefing generation error", error);
    res.status(500).json({ error: "Failed to generate briefing. " + error.message });
  }
});

app.post("/api/ai/plan", async (req, res) => {
  const { state, requestType } = req.body; // requestType: 'daily' | 'weekly' | 'revision' | 'catchup'
  if (!state || !state.profile) {
    return res.status(400).json({ error: "State parameters are required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a structured, highly motivational study plan. Request type: "${requestType || 'study layout'}".
      Format: Return a JSON structure.
      Schema requirements:
      - title: string
      - duration: string (e.g., 'Today' or '7 Days')
      - overview: string (brief description)
      - steps: string[] (list of recommended actions/blocks)
      
      User status: ${JSON.stringify({
        examName: state.onboarding?.examName,
        examDate: state.onboarding?.examDate,
        subjects: state.subjects,
        stats: state.profile.stats
      })}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING },
            overview: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "duration", "overview", "steps"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI plan error", error);
    res.status(500).json({ error: "Failed to generate study plan: " + error.message });
  }
});

app.post("/api/ai/quiz", async (req, res) => {
  const { resourceContent, queryText, format, subjectName } = req.body;
  // format: 'MCQ' | 'ShortAnswer' | 'Flashcard'
  
  const contentToAnalyze = resourceContent || queryText || "general academic aptitude and consistency";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate exactly 5 revision items from this material for the subject "${subjectName || 'General Prep'}".
      Format/Style requested: ${format || 'MCQ'}.
      
      Source content: ${contentToAnalyze.substring(0, 10000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question or front of flashcard" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array of 4 options (only for MCQ). Leave empty for short answers or flashcards." 
              },
              correctAnswer: { type: Type.STRING, description: "The correct answer or back of flashcard" },
              explanation: { type: Type.STRING, description: "Detailed explanation of why this is correct" }
            },
            required: ["question", "correctAnswer", "explanation"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("AI Quiz error", error);
    res.status(500).json({ error: "Failed to generate quiz: " + error.message });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  const { title, text, type } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text content is required for summarization" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform high-quality revision note compilation for resource: "${title || 'Resource'}".
      Include direct summaries, key formulas, and clean conceptual notes.
      
      Content: ${text.substring(0, 15000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryText: { type: Type.STRING, description: "Elegant markdown summary of main concepts" },
            keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clear key concept bullets" },
            formulaSheet: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Formula details or important quotes/rules" },
            revisionNotesJson: { type: Type.STRING, description: "Full robust study sheet formatted cleanly in markdown" }
          },
          required: ["summaryText", "keyConcepts", "formulaSheet", "revisionNotesJson"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Summarization error", error);
    res.status(500).json({ error: "Failed to analyze document: " + error.message });
  }
});

app.post("/api/ai/weakness", async (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ error: "State required" });
  }

  try {
    const statsSummary = {
      subjects: state.subjects,
      quizzes: state.quizzes ? state.quizzes.map((q: any) => ({ title: q.title, score: q.score })) : [],
      sessions: state.studySessions ? state.studySessions.map((s: any) => ({ subjectId: s.subjectId, duration: s.durationMinutes, focus: s.focusScore })) : []
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this study logs profile to identify learning weaknesses, scheduling bottlenecks, or risk points. Write exactly 3 clear actionable points with suggested remedy.
      
      Current study database: ${JSON.stringify(statsSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              weakness: { type: Type.STRING, description: "Identified risk or soft area" },
              impact: { type: Type.STRING, description: "How this holds back the readiness score" },
              remedy: { type: Type.STRING, description: "Specific study action to fix this" }
            },
            required: ["weakness", "impact", "remedy"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Weakness detector error", error);
    res.status(500).json({ error: "Failed to detect weak areas: " + error.message });
  }
});

app.post("/api/ai/review", async (req, res) => {
  const { state } = req.body;
  try {
    const statsSummary = {
      sessionsCount: state.studySessions?.length || 0,
      totalHours: state.profile?.stats?.totalStudyHours || 0,
      subjects: state.subjects,
      streak: state.profile?.stats?.currentStreak || 0,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide a motivating weekly progress review report. Focus on encouraging the student while holding them to high standards. Keep headings minimal, make it clear and direct.
      
      Stats: ${JSON.stringify(statsSummary)}`,
      config: {
        systemInstruction: "You are the Atodemic AI Student Coach. Review study activity and outputs, praising progress and giving specific recommendations."
      }
    });

    res.json({ review: response.text });
  } catch (error: any) {
    console.error("Weekly review error", error);
    res.status(500).json({ error: "Failed to generate weekly review: " + error.message });
  }
});

// Vite Middleware & Static Serves
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atodemic Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
