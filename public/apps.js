/* =============================================================================
 * Dawikk — App catalog (single source of truth)
 * -----------------------------------------------------------------------------
 * Used by:
 *   - index.html        → renders the public showcase / command center
 *   - scripts/generate.js → generates each app's legal + landing subpages
 *
 * HOW TO EDIT:
 *   - Add / edit entries in DAWIKK_APPS below.
 *   - `slug`     : folder name under public/ (also the app's home URL).
 *   - `play` / `appStore`: full store URL. Leave "" to hide that badge.
 *   - `icon`     : an emoji, OR a path to an image (png/jpg/svg/webp → <img>).
 *   - `category` : must be a key in DAWIKK_CATEGORIES.
 *   - `hasAccounts`: true if the app has user accounts / cloud data
 *                    (affects the wording of the Delete Account page).
 *   - `hasAds`   : true if the app shows ads (affects Privacy Policy wording).
 *   - `effectiveDate`: date shown on legal pages (YYYY-MM-DD).
 *   - `featured` : true highlights the card on the homepage.
 *   - `verified` : false marks an app whose metadata still needs confirming
 *                  (shown only as a small dev hint, never to end users).
 *
 * After editing, run:  node scripts/generate.js
 * ========================================================================== */

const DAWIKK_CATEGORIES = {
  chess: "Chess",
  board: "Board Games",
  puzzle: "Puzzle & Arcade",
  fitness: "Fitness",
  word: "Word & Language",
  tools: "Tools & Utilities",
  lifestyle: "Lifestyle & Fun",
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

const DAWIKK_DEFAULT_EFFECTIVE_DATE = "2025-01-01";

const DAWIKK_APPS = [
  // ============================ Chess =======================================
  { slug: "ChessTacticsMixed", name: "Chess Tactics — 50,000+ Puzzles", category: "chess", icon: "♟️",
    tagline: "Master your game with 50,000+ tactical puzzles.",
    description: "A massive collection of chess tactics puzzles to sharpen your calculation and pattern recognition, from beginner to master level.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, featured: true },

  { slug: "ChessOpenings", name: "Chess Opening Tactics", category: "chess", icon: "📖",
    tagline: "Unleash your opening prowess.",
    description: "Learn and drill the most important chess openings through interactive tactical exercises.",
    play: "", appStore: "", hasAccounts: true, hasAds: true, effectiveDate: "2024-07-10" },

  { slug: "ChessEndgameTactics", name: "Chess Endgame Tactics", category: "chess", icon: "👑",
    tagline: "Win the games that matter — the endgame.",
    description: "Master essential endgame patterns and puzzles to convert your advantages into wins.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "ChessPuzzles", name: "Chess Tactics: Short Puzzles", category: "chess", icon: "⚡",
    tagline: "Sharpen your chess mind, one puzzle at a time.",
    description: "Bite-sized chess puzzles perfect for quick daily training sessions.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "ChessBlitz", name: "Chess Tactics Blitz", category: "chess", icon: "🔥",
    tagline: "Train like a master, under pressure.",
    description: "Fast-paced tactical training that builds speed and accuracy in your calculations.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "ChessMatesTrainer", name: "Chess Mates in 1–4 Moves", category: "chess", icon: "♚",
    tagline: "Master lightning-fast checkmates.",
    description: "Thousands of mate-in-1 to mate-in-4 puzzles to make finding checkmates second nature.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "ChessDefenseTrainer", name: "Chess Defense Trainer", category: "chess", icon: "🛡️",
    tagline: "Master tactical defense skills.",
    description: "Learn to defend tough positions, spot threats, and turn defense into counterattack.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "BlindfoldChessMaster", name: "Blindfold Chess Trainer", category: "chess", icon: "🧠",
    tagline: "Master chess without seeing the board.",
    description: "Train your visualization and memory by playing and solving puzzles blindfolded.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "ChessEngine", name: "Chess Analyzer", category: "chess", icon: "🔬",
    tagline: "Professional analysis powered by Stockfish 17.",
    description: "Analyze your games with a world-class engine, find your mistakes, and improve faster.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "MiniChessPro", name: "Mini Chess Pro", category: "chess", icon: "♞",
    tagline: "Chess, distilled.",
    description: "A clean, focused chess experience for play on the go.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "Fianchetto", name: "Fianchetto", category: "chess", icon: "♝",
    tagline: "A fresh take on chess strategy.",
    description: "A chess-inspired strategy game for players who love the royal game.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "ChessMaze", name: "Chess Maze", category: "chess", icon: "🌀",
    tagline: "Navigate the board like never before.",
    description: "Guide your piece through clever chess mazes that train movement and board vision.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "ChessShorts", name: "Chess Shorts", category: "chess", icon: "🎯",
    tagline: "Quick chess puzzles for busy minds.",
    description: "Short, snackable chess puzzles you can solve in seconds.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "DeepMove", name: "Deep Move", category: "chess", icon: "♟",
    tagline: "Go deeper into every position.",
    description: "An interactive chess training companion for serious improvers.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ========================= Board Games ====================================
  { slug: "Checkers", name: "Checkers", category: "board", icon: "🔴",
    tagline: "The timeless strategy game, perfected for mobile.",
    description: "Play checkers against an adaptive AI or a friend, with helpful move guidance for all ages.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, featured: true },

  { slug: "Hnefatafl", name: "Hnefatafl", category: "board", icon: "⚔️",
    tagline: "The ancient Viking board game.",
    description: "An asymmetric Norse strategy game — defend your king or hunt him down.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "Janggi", name: "Janggi", category: "board", icon: "🏯",
    tagline: "Korean chess, beautifully rendered.",
    description: "Play the classic Korean strategy game against AI or friends.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "Shogi", name: "Shogi", category: "board", icon: "🎴",
    tagline: "Japanese chess with the drop rule.",
    description: "Master the deep and dynamic game of Shogi, where captured pieces fight for you.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ======================= Puzzle & Arcade ==================================
  { slug: "6561", name: "6561", category: "puzzle", icon: "🔢",
    tagline: "Addictive number-merging puzzle.",
    description: "Slide and merge tiles to reach 6561 in this brain-bending numbers game.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "Hexoid", name: "Hexoid", category: "puzzle", icon: "⬡",
    tagline: "Rotate, match, dominate!",
    description: "A fast and colorful hexagonal puzzle game that's easy to learn and hard to put down.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "Encircle", name: "Encircle", category: "puzzle", icon: "⭕",
    tagline: "Surround, capture, conquer.",
    description: "A minimalist strategy puzzle about encircling your opponent.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "FlappyV", name: "Flappy V", category: "puzzle", icon: "🐤",
    tagline: "One tap. Endless challenge.",
    description: "A fast, addictive arcade flyer — how far can you go?",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "NinjaWarrior", name: "Ninja Warrior", category: "puzzle", icon: "🥷",
    tagline: "Run, jump, and survive the course.",
    description: "A reflex-testing arcade runner full of obstacles and challenges.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ============================ Fitness =====================================
  { slug: "Squats", name: "Squats Challenge", category: "fitness", icon: "🏋️",
    tagline: "AI-powered personal squat trainer.",
    description: "Build strength with guided squat workouts and AI-assisted rep tracking.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "JumpingJacksChallenge", name: "Jumping Jacks Challenge", category: "fitness", icon: "🤸",
    tagline: "Your ultimate fitness companion.",
    description: "Stay active with progressive jumping jacks challenges and workout tracking.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "Plank", name: "Plank Challenge", category: "fitness", icon: "🧘",
    tagline: "Build core strength with timed planks.",
    description: "A progressive plank training program to strengthen your core anywhere.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "PlankForWomen", name: "Plank for Women", category: "fitness", icon: "🧘‍♀️",
    tagline: "Core workouts designed for women.",
    description: "Guided plank challenges tailored to a women's fitness journey.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "Pushups", name: "Push-ups Challenge", category: "fitness", icon: "💪",
    tagline: "Push-up training that grows with you.",
    description: "Increase your strength with a structured push-up workout plan.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ======================== Word & Language =================================
  { slug: "Idiomgram", name: "Idiomgram", category: "word", icon: "💬",
    tagline: "Learn idioms the fun way.",
    description: "Expand your vocabulary and master idioms through engaging word puzzles.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "SlownaFiesta", name: "Słowna Fiesta", category: "word", icon: "🎉",
    tagline: "A lively word game (Polish).",
    description: "Test your vocabulary and quick thinking in this colorful word party game.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "FreestyleRapTopics", name: "Freestyle Rap Topics & Beats", category: "word", icon: "🎤",
    tagline: "Unleash your inner MC.",
    description: "Random topics and beats to practice your freestyle rap skills anywhere.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "Temator", name: "Temator", category: "word", icon: "💡",
    tagline: "Endless topics for talk and writing.",
    description: "A generator of fresh topics for conversation, writing prompts and games.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "YourDictionary", name: "Your Dictionary", category: "word", icon: "📚",
    tagline: "Your personal vocabulary companion.",
    description: "Build and review your own word lists to grow your vocabulary.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ======================= Tools & Utilities ================================
  { slug: "RubikTimer", name: "Cube Timer", category: "tools", icon: "⏱️",
    tagline: "Your ultimate speedcubing companion.",
    description: "A precise timer with statistics and scrambles for Rubik's cube solvers.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "StackMate", name: "StackMate", category: "tools", icon: "🥤",
    tagline: "Professional sport stacking timer.",
    description: "Time your sport stacking runs with precision and track your personal bests.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "ChessClock", name: "Chess Clock Pro", category: "tools", icon: "⏲️",
    tagline: "Master your time on the board.",
    description: "A flexible, beautiful chess clock supporting all popular time controls.",
    play: "", appStore: "", hasAccounts: false, hasAds: true },

  { slug: "WellNoted", name: "WellNoted", category: "tools", icon: "📝",
    tagline: "Simple & powerful note-taking.",
    description: "Capture your thoughts quickly with a clean, distraction-free notes app.",
    play: "", appStore: "", hasAccounts: true, hasAds: true },

  { slug: "BudgetTracker", name: "Budget Tracker", category: "tools", icon: "💰",
    tagline: "Take control of your spending.",
    description: "Track expenses and income to understand and improve your budget.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  // ======================== Lifestyle & Fun =================================
  { slug: "Restie", name: "Restie", category: "lifestyle", icon: "🍽️",
    tagline: "Decide where to eat, fast.",
    description: "Can't decide where to eat? Let Restie help you pick your next meal.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "ConaWieszaku", name: "Co na wieszaku?", category: "lifestyle", icon: "👗",
    tagline: "Plan your outfits with ease (Polish).",
    description: "Organize your wardrobe and plan what to wear, stress-free.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },

  { slug: "TruthOrDare", name: "Truth or Dare", category: "lifestyle", icon: "😈",
    tagline: "The classic party game, reinvented.",
    description: "Fun truth-or-dare prompts to liven up any gathering.",
    play: "", appStore: "", hasAccounts: false, hasAds: true, verified: false },
];
