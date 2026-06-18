/* =============================================================================
 * Dawikk — App catalog (single source of truth for the portfolio homepage)
 * -----------------------------------------------------------------------------
 * HOW TO EDIT:
 *   - Add / edit entries in the DAWIKK_APPS array below.
 *   - `play` / `appStore`: paste the full store URL. Leave as "" to hide that
 *     badge for an app that isn't on that platform yet.
 *   - `landing`: path to the app's own page in this repo (or "" / null to omit
 *     the "Learn more" button).
 *   - `icon`: an emoji (shown as-is) OR a path to an image, e.g.
 *     "ChessOpenings/icon.png" (anything ending in .png/.jpg/.jpeg/.svg/.webp
 *     is rendered as an <img>).
 *   - `category`: must match one of the CATEGORIES keys below.
 *   - `featured: true` highlights the card.
 *
 * The homepage (index.html) reads this file automatically — no build step.
 * ========================================================================== */

const DAWIKK_CATEGORIES = {
  chess: "Chess",
  board: "Board Games",
  puzzle: "Puzzle & Arcade",
  fitness: "Fitness",
  word: "Word & Language",
  tools: "Tools",
};

const DAWIKK_PROFILE = {
  name: "Dawikk",
  author: "Dawid Wrzesiński",
  tagline: "Mobile games & apps for iOS and Android",
  intro:
    "I design and build small, focused mobile games and utilities — from chess trainers and classic board games to fitness coaches and brain teasers. Crafted with care, available worldwide on Google Play and the App Store.",
  email: "dawikk.apps@gmail.com",
  playDeveloper: "https://play.google.com/store/apps/developer?id=Dawikk",
  appStoreDeveloper:
    "https://apps.apple.com/pl/developer/dawid-wrzesinski/id1812701337",
  github: "https://github.com/DawiQ/DawikkApps",
};

/* Store URLs left as "" are intentional placeholders — fill them in. */
const DAWIKK_APPS = [
  // ----------------------------- Chess --------------------------------------
  {
    name: "Chess Tactics — 50,000+ Puzzles",
    category: "chess",
    icon: "♟️",
    tagline: "Master your game with 50,000+ tactical puzzles.",
    description:
      "A massive collection of chess tactics puzzles to sharpen your calculation and pattern recognition, from beginner to master level.",
    landing: "ChessTacticsMixed/",
    play: "",
    appStore: "",
    featured: true,
  },
  {
    name: "Chess Opening Tactics",
    category: "chess",
    icon: "📖",
    tagline: "Unleash your opening prowess.",
    description:
      "Learn and drill the most important chess openings through interactive tactical exercises.",
    landing: "ChessOpenings/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Endgame Tactics",
    category: "chess",
    icon: "👑",
    tagline: "Win the games that matter — the endgame.",
    description:
      "Master essential endgame patterns and puzzles to convert your advantages into wins.",
    landing: "ChessEndgameTactics/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Tactics: Short Puzzles",
    category: "chess",
    icon: "⚡",
    tagline: "Sharpen your chess mind, one puzzle at a time.",
    description:
      "Bite-sized chess puzzles perfect for quick daily training sessions.",
    landing: "ChessPuzzles/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Tactics Blitz",
    category: "chess",
    icon: "🔥",
    tagline: "Train like a master, under pressure.",
    description:
      "Fast-paced tactical training that builds speed and accuracy in your calculations.",
    landing: "ChessBlitz/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Mates in 1–4 Moves",
    category: "chess",
    icon: "♚",
    tagline: "Master lightning-fast checkmates.",
    description:
      "Thousands of mate-in-1 to mate-in-4 puzzles to make finding checkmates second nature.",
    landing: "ChessMatesTrainer/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Defense Trainer",
    category: "chess",
    icon: "🛡️",
    tagline: "Master tactical defense skills.",
    description:
      "Learn to defend tough positions, spot threats, and turn defense into counterattack.",
    landing: "ChessDefenseTrainer/",
    play: "",
    appStore: "",
  },
  {
    name: "Blindfold Chess Trainer",
    category: "chess",
    icon: "🧠",
    tagline: "Master chess without seeing the board.",
    description:
      "Train your visualization and memory by playing and solving puzzles blindfolded.",
    landing: "BlindfoldChessMaster/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Analyzer",
    category: "chess",
    icon: "🔬",
    tagline: "Professional analysis powered by Stockfish 17.",
    description:
      "Analyze your games with a world-class engine, find your mistakes, and improve faster.",
    landing: "ChessEngine/",
    play: "",
    appStore: "",
  },
  {
    name: "Mini Chess Pro",
    category: "chess",
    icon: "♞",
    tagline: "Chess, distilled.",
    description: "A clean, focused chess experience for play on the go.",
    landing: "",
    play: "",
    appStore: "",
  },

  // -------------------------- Board Games -----------------------------------
  {
    name: "Checkers",
    category: "board",
    icon: "🔴",
    tagline: "The timeless strategy game, perfected for mobile.",
    description:
      "Play checkers against an adaptive AI or a friend, with helpful move guidance for all ages.",
    landing: "Checkers/",
    play: "",
    appStore: "",
    featured: true,
  },
  {
    name: "Hnefatafl",
    category: "board",
    icon: "⚔️",
    tagline: "The ancient Viking board game.",
    description:
      "An asymmetric Norse strategy game — defend your king or hunt him down.",
    landing: "Hnefatafl/",
    play: "",
    appStore: "",
  },
  {
    name: "Janggi",
    category: "board",
    icon: "🇰🇷",
    tagline: "Korean chess, beautifully rendered.",
    description: "Play the classic Korean strategy game against AI or friends.",
    landing: "",
    play: "",
    appStore: "",
  },
  {
    name: "Shogi",
    category: "board",
    icon: "🇯🇵",
    tagline: "Japanese chess with the drop rule.",
    description:
      "Master the deep and dynamic game of Shogi, where captured pieces fight for you.",
    landing: "",
    play: "",
    appStore: "",
  },
  {
    name: "Fianchetto",
    category: "board",
    icon: "♝",
    tagline: "A fresh take on chess strategy.",
    description: "A chess-inspired board game for strategy lovers.",
    landing: "",
    play: "",
    appStore: "",
  },

  // ------------------------ Puzzle & Arcade ---------------------------------
  {
    name: "6561",
    category: "puzzle",
    icon: "🔢",
    tagline: "Addictive number-merging puzzle.",
    description:
      "Slide and merge tiles to reach 6561 in this brain-bending numbers game.",
    landing: "6561/",
    play: "",
    appStore: "",
  },
  {
    name: "Hexoid",
    category: "puzzle",
    icon: "⬡",
    tagline: "Rotate, match, dominate!",
    description:
      "A fast and colorful hexagonal puzzle game that's easy to learn and hard to put down.",
    landing: "Hexoid/",
    play: "",
    appStore: "",
  },

  // ----------------------------- Fitness ------------------------------------
  {
    name: "Squats Challenge",
    category: "fitness",
    icon: "🏋️",
    tagline: "AI-powered personal squat trainer.",
    description:
      "Build strength with guided squat workouts and AI-assisted rep tracking.",
    landing: "Squats/",
    play: "",
    appStore: "",
  },
  {
    name: "Jumping Jacks Challenge",
    category: "fitness",
    icon: "🤸",
    tagline: "Your ultimate fitness companion.",
    description:
      "Stay active with progressive jumping jacks challenges and workout tracking.",
    landing: "JumpingJacksChallenge/",
    play: "",
    appStore: "",
  },

  // ------------------------ Word & Language ---------------------------------
  {
    name: "Idiomgram",
    category: "word",
    icon: "💬",
    tagline: "Learn idioms the fun way.",
    description:
      "Expand your vocabulary and master idioms through engaging word puzzles.",
    landing: "",
    play: "",
    appStore: "",
  },
  {
    name: "Słowna Fiesta",
    category: "word",
    icon: "🎉",
    tagline: "A lively Polish word game.",
    description: "Test your vocabulary and quick thinking in this party word game.",
    landing: "",
    play: "",
    appStore: "",
  },
  {
    name: "Freestyle Rap Topics & Beats",
    category: "word",
    icon: "🎤",
    tagline: "Unleash your inner MC.",
    description:
      "Random topics and beats to practice your freestyle rap skills anywhere.",
    landing: "FreestyleRapTopics/",
    play: "",
    appStore: "",
  },

  // ------------------------------ Tools -------------------------------------
  {
    name: "Cube Timer",
    category: "tools",
    icon: "⏱️",
    tagline: "Your ultimate speedcubing companion.",
    description:
      "A precise timer with statistics and scrambles for Rubik's cube solvers.",
    landing: "RubikTimer/",
    play: "",
    appStore: "",
  },
  {
    name: "StackMate",
    category: "tools",
    icon: "🥤",
    tagline: "Professional sport stacking timer.",
    description:
      "Time your sport stacking runs with precision and track your personal bests.",
    landing: "StackMate/",
    play: "",
    appStore: "",
  },
  {
    name: "Chess Clock Pro",
    category: "tools",
    icon: "⏲️",
    tagline: "Master your time on the board.",
    description:
      "A flexible, beautiful chess clock supporting all popular time controls.",
    landing: "ChessClock/",
    play: "",
    appStore: "",
  },
  {
    name: "WellNoted",
    category: "tools",
    icon: "📝",
    tagline: "Simple & powerful note-taking.",
    description:
      "Capture your thoughts quickly with a clean, distraction-free notes app.",
    landing: "WellNoted/",
    play: "",
    appStore: "",
  },
];
