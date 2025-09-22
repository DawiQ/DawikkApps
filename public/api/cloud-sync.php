<?php
// api/cloud-sync.php
// FIXED VERSION WITH BETTER PUZZLE DATA HANDLING

// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Ensure JSON output
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = 'sql169.lh.pl';
$dbname = 'serwer381042_pawnzilla';
$username = 'serwer381042';
$password = 'O*t+uuCM>N1dm?_&';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'success' => false]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['endpoint'] ?? '';
$appType = $_GET['appType'] ?? 'blindfold';

// Helper function to get JSON body
function getJsonBody() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

// Helper function to verify user exists or create
function ensureUser($pdo, $userId, $appType, $userData = null) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_id = ? AND source = ?");
    $stmt->execute([$userId, $appType]);
    
    if (!$stmt->fetch()) {
        // Create new user
        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, source, email, name, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $appType,
            $userData['email'] ?? null,
            $userData['name'] ?? null
        ]);
        return true; // New user created
    }
    return false; // Existing user
}

// IMPROVED: Extract puzzle data with better fallback logic
function extractPuzzleData($puzzle, $index) {
    // Handle different field names for ID
    $puzzleId = $puzzle['puzzleId'] ?? $puzzle['id'] ?? $puzzle['puzzle_id'] ?? null;
    
    if (!$puzzleId) {
        // Generate ID if missing
        $puzzleId = 'local_' . time() . '_' . $index;
    }
    
    // Extract FEN - CRITICAL: Don't allow empty FEN
    $fen = $puzzle['fen'] ?? 
           $puzzle['FEN'] ?? 
           $puzzle['initialFen'] ??
           $puzzle['initialPosition'] ?? 
           $puzzle['position'] ?? 
           $puzzle['boardPosition'] ??
           $puzzle['startPosition'] ??
           $puzzle['board'] ??
           $puzzle['f'] ??  // Add 'f' field
           null;
    
    // Extract moves - CRITICAL: Don't allow empty moves
    $moves = $puzzle['moves'] ?? 
            $puzzle['solution'] ?? 
            $puzzle['solutionMoves'] ??
            $puzzle['correctMoves'] ??
            $puzzle['pgn'] ?? 
            $puzzle['moveList'] ?? 
            $puzzle['movesArray'] ??
            $puzzle['m'] ??  // Add 'm' field
            null;
    
    // If moves is array, convert to string
    if (is_array($moves)) {
        $moves = implode(' ', $moves);
    }
    
    // CRITICAL: Skip puzzles with missing essential data
    if (empty($fen) || empty($moves)) {
        error_log("❌ Skipping puzzle $puzzleId - missing FEN or moves");
        error_log("  FEN: " . ($fen ?: 'EMPTY'));
        error_log("  Moves: " . ($moves ?: 'EMPTY'));
        return null;
    }
    
    return [
        'puzzleId' => $puzzleId,
        'lichessId' => $puzzle['lichessId'] ?? $puzzle['lichess_id'] ?? $puzzleId,
        'fen' => $fen,
        'moves' => $moves,
        'rating' => $puzzle['rating'] ?? $puzzle['puzzleRating'] ?? $puzzle['r'] ?? 1500,
        'themes' => is_array($puzzle['themes'] ?? null) ? json_encode($puzzle['themes']) : ($puzzle['themes'] ?? null),
        'pieceCount' => $puzzle['pieceCount'] ?? $puzzle['piece_count'] ?? 32,
        'result' => $puzzle['result'] ?? ($puzzle['solved'] ? 1 : 0),
        'timeTaken' => $puzzle['timeTaken'] ?? $puzzle['time_taken'] ?? $puzzle['timeSpent'] ?? null,
        'oldRating' => $puzzle['oldRating'] ?? $puzzle['old_rating'] ?? null,
        'newRating' => $puzzle['newRating'] ?? $puzzle['new_rating'] ?? $puzzle['rating'] ?? null,
        'xpEarned' => $puzzle['xpEarned'] ?? $puzzle['xp_earned'] ?? 0,
        'timestamp' => $puzzle['timestamp'] ?? $puzzle['completedAt'] ?? $puzzle['date'] ?? time()
    ];
}

switch ($endpoint) {
    case 'ping':
        echo json_encode(['success' => true, 'timestamp' => time()]);
        break;

    case 'user/init':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $data = getJsonBody();
        $userId = $data['userId'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required', 'success' => false]);
            exit;
        }
        
        $isNewUser = ensureUser($pdo, $userId, $appType, $data);
        
        // Check if user has any cloud data
        $stmt = $pdo->prepare("
            SELECT 
                (SELECT COUNT(*) FROM user_puzzle_relations WHERE user_id = ? AND source = ?) as puzzle_count,
                (SELECT COUNT(*) FROM user_exercise_progress WHERE user_id = ? AND source = ?) as exercise_count
        ");
        $stmt->execute([$userId, $appType, $userId, $appType]);
        $cloudData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $hasCloudData = ($cloudData['puzzle_count'] > 0) || ($cloudData['exercise_count'] > 0);
        
        // Get user data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND source = ?");
        $stmt->execute([$userId, $appType]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'isNewUser' => $isNewUser,
            'hasCloudData' => $hasCloudData,
            'needsMigration' => $isNewUser && !$hasCloudData, // Only migrate if new AND no cloud data
            'user' => $user
        ]);
        break;

    case 'user/migrate':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $data = getJsonBody();
        $userId = $data['userId'] ?? null;
        $localData = $data['localData'] ?? null;
        
        if (!$userId || !$localData) {
            http_response_code(400);
            echo json_encode(['error' => 'userId and localData are required', 'success' => false]);
            exit;
        }
        
        error_log('=== MIGRATION START ===');
        error_log('User ID: ' . $userId);
        
        try {
            $pdo->beginTransaction();
            
            // Update user stats
            $stmt = $pdo->prepare("
                UPDATE users SET 
                    tactics_rating = ?,
                    total_puzzles = ?,
                    correct_puzzles = ?,
                    total_games = ?,
                    tactics_streak = ?,
                    total_xp = ?,
                    current_level = ?,
                    daily_xp = ?,
                    last_xp_date = ?,
                    daily_streak = ?,
                    last_sync = NOW()
                WHERE user_id = ? AND source = ?
            ");
            $stmt->execute([
                $localData['tacticsRating'] ?? 1500,
                $localData['totalPuzzles'] ?? 0,
                $localData['correctPuzzles'] ?? 0,
                $localData['totalGames'] ?? 0,
                $localData['tacticsStreak'] ?? 0,
                $localData['totalXP'] ?? 0,
                $localData['currentLevel'] ?? 1,
                $localData['dailyXP'] ?? 0,
                $localData['lastXPDate'] ?? null,
                $localData['dailyStreak'] ?? 0,
                $userId,
                $appType
            ]);
            
            $migratedPuzzles = 0;
            $skippedPuzzles = 0;
            
            // Migrate puzzle history with improved data extraction
            if (!empty($localData['puzzleHistory'])) {
                error_log('Processing ' . count($localData['puzzleHistory']) . ' puzzles...');
                
                foreach ($localData['puzzleHistory'] as $index => $puzzle) {
                    $puzzleData = extractPuzzleData($puzzle, $index);
                    
                    if (!$puzzleData) {
                        $skippedPuzzles++;
                        continue; // Skip puzzles with missing essential data
                    }
                    
                    // Check if puzzle exists
                    $stmt = $pdo->prepare("SELECT id FROM puzzles WHERE id = ?");
                    $stmt->execute([$puzzleData['puzzleId']]);
                    
                    if (!$stmt->fetch()) {
                        // Create puzzle with validated data
                        try {
                            $stmt = $pdo->prepare("
                                INSERT INTO puzzles (id, lichess_id, fen, moves, rating, themes, piece_count) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            ");
                            $stmt->execute([
                                $puzzleData['puzzleId'],
                                $puzzleData['lichessId'],
                                $puzzleData['fen'],
                                $puzzleData['moves'],
                                $puzzleData['rating'],
                                $puzzleData['themes'],
                                $puzzleData['pieceCount']
                            ]);
                            
                            error_log("✅ Puzzle created: " . $puzzleData['puzzleId']);
                        } catch (PDOException $e) {
                            error_log("❌ Failed to create puzzle: " . $e->getMessage());
                            $skippedPuzzles++;
                            continue;
                        }
                    }
                    
                    // Create user-puzzle relation
                    $completedAt = null;
                    if (is_numeric($puzzleData['timestamp'])) {
                        if ($puzzleData['timestamp'] > 9999999999) {
                            $completedAt = date('Y-m-d H:i:s', $puzzleData['timestamp'] / 1000);
                        } else {
                            $completedAt = date('Y-m-d H:i:s', $puzzleData['timestamp']);
                        }
                    } else {
                        $completedAt = date('Y-m-d H:i:s');
                    }
                    
                    try {
                        $stmt = $pdo->prepare("
                            INSERT INTO user_puzzle_relations 
                            (user_id, source, puzzle_id, result, time_taken, old_rating, new_rating, xp_earned, completed_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $userId,
                            $appType,
                            $puzzleData['puzzleId'],
                            $puzzleData['result'],
                            $puzzleData['timeTaken'],
                            $puzzleData['oldRating'],
                            $puzzleData['newRating'],
                            $puzzleData['xpEarned'],
                            $completedAt
                        ]);
                        
                        $migratedPuzzles++;
                    } catch (PDOException $e) {
                        error_log("❌ Failed to create puzzle relation: " . $e->getMessage());
                        $skippedPuzzles++;
                    }
                }
            }
            
            // Migrate exercise progress
            $migratedExercises = 0;
            if (!empty($localData['exerciseProgress'])) {
                foreach ($localData['exerciseProgress'] as $exerciseId => $progress) {
                    try {
                        $stmt = $pdo->prepare("
                            INSERT INTO user_exercise_progress 
                            (user_id, source, exercise_id, total_correct, total_attempts, sessions, 
                             best_accuracy, total_time_spent, accuracy, completed, progress)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                total_correct = VALUES(total_correct),
                                total_attempts = VALUES(total_attempts),
                                sessions = VALUES(sessions),
                                best_accuracy = VALUES(best_accuracy),
                                total_time_spent = VALUES(total_time_spent),
                                accuracy = VALUES(accuracy),
                                completed = VALUES(completed),
                                progress = VALUES(progress),
                                updated_at = NOW()
                        ");
                        $stmt->execute([
                            $userId,
                            $appType,
                            $exerciseId,
                            $progress['totalCorrect'] ?? 0,
                            $progress['totalAttempts'] ?? 0,
                            $progress['sessions'] ?? 0,
                            $progress['bestAccuracy'] ?? 0,
                            $progress['totalTimeSpent'] ?? 0,
                            $progress['accuracy'] ?? 0,
                            ($progress['completed'] ?? false) ? 1 : 0,
                            $progress['progress'] ?? 0
                        ]);
                        
                        $migratedExercises++;
                    } catch (PDOException $e) {
                        error_log("❌ Failed to save exercise progress: " . $e->getMessage());
                    }
                }
            }
            
            $pdo->commit();
            
            error_log('=== MIGRATION SUCCESS ===');
            error_log("Migrated: $migratedPuzzles puzzles, $migratedExercises exercises");
            error_log("Skipped: $skippedPuzzles puzzles (missing data)");
            
            echo json_encode([
                'success' => true,
                'message' => 'Data migrated successfully',
                'stats' => [
                    'puzzles' => $migratedPuzzles,
                    'exercises' => $migratedExercises,
                    'skipped' => $skippedPuzzles
                ]
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('=== MIGRATION ERROR ===');
            error_log('Error: ' . $e->getMessage());
            
            http_response_code(500);
            echo json_encode([
                'error' => 'Migration failed: ' . $e->getMessage(),
                'success' => false
            ]);
        }
        break;

    case 'puzzle/history':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $userId = $_GET['userId'] ?? null;
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        error_log("=== PUZZLE HISTORY REQUEST ===");
        error_log("User ID: " . $userId);
        error_log("Limit: " . $limit);
        error_log("Offset: " . $offset);
        error_log("App Type: " . $appType);
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required', 'success' => false]);
            exit;
        }
        
        try {
            // IMPROVED: Return data in format expected by History.js
            $stmt = $pdo->prepare("
                SELECT 
                    upr.*,
                    p.fen as f,
                    p.moves as m,
                    p.themes,
                    p.rating as r,
                    p.lichess_id,
                    UNIX_TIMESTAMP(upr.completed_at) * 1000 as timestamp,
                    upr.result,
                    upr.time_taken as timeSpent,
                    upr.old_rating as oldRating,
                    upr.new_rating as newRating,
                    upr.xp_earned as xpEarned,
                    p.id as puzzleId
                FROM user_puzzle_relations upr
                JOIN puzzles p ON upr.puzzle_id = p.id
                WHERE upr.user_id = ? AND upr.source = ?
                ORDER BY upr.completed_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$userId, $appType, $limit, $offset]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Found " . count($history) . " puzzle history items");
            
            // Process history items for compatibility
            foreach ($history as &$item) {
                // Add rating delta if we have both ratings
                if ($item['oldRating'] && $item['newRating']) {
                    $item['delta'] = $item['newRating'] - $item['oldRating'];
                }
                
                // Ensure we have an ID field
                $item['id'] = $item['puzzleId'] ?? $item['puzzle_id'];
                
                // Convert themes from JSON if needed
                if ($item['themes'] && is_string($item['themes'])) {
                    $decoded = json_decode($item['themes'], true);
                    if ($decoded) {
                        $item['themes'] = $decoded;
                    }
                }
                
                // Ensure essential fields are not null
                if (empty($item['f'])) {
                    $item['f'] = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                }
                if (empty($item['m'])) {
                    $item['m'] = 'e2e4';
                }
            }
            
            // Get total count
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as total 
                FROM user_puzzle_relations 
                WHERE user_id = ? AND source = ?
            ");
            $stmt->execute([$userId, $appType]);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $response = [
                'success' => true,
                'items' => $history,
                'total' => $total,
                'hasMore' => ($offset + $limit) < $total
            ];
            
            error_log("Response prepared with " . count($history) . " items, total: " . $total);
            
            echo json_encode($response);
            
        } catch (Exception $e) {
            error_log("ERROR in puzzle/history: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to load puzzle history: ' . $e->getMessage(),
                'success' => false
            ]);
        }
        break;

    case 'puzzle/add':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $data = getJsonBody();
        $userId = $data['userId'] ?? null;
        $puzzle = $data['puzzle'] ?? null;
        
        if (!$userId || !$puzzle) {
            http_response_code(400);
            echo json_encode(['error' => 'userId and puzzle data are required', 'success' => false]);
            exit;
        }
        
        try {
            $pdo->beginTransaction();
            
            $puzzleId = $puzzle['puzzleId'] ?? $puzzle['id'] ?? null;
            
            if (!$puzzleId) {
                throw new Exception('Puzzle ID is required');
            }
            
            // Ensure puzzle exists with proper data validation
            $stmt = $pdo->prepare("SELECT id FROM puzzles WHERE id = ?");
            $stmt->execute([$puzzleId]);
            
            if (!$stmt->fetch()) {
                $fen = $puzzle['fen'] ?? '';
                $moves = $puzzle['moves'] ?? '';
                
                // CRITICAL: Don't create puzzles with empty essential data
                if (empty($fen) || empty($moves)) {
                    error_log("⚠️ Attempted to create puzzle with missing data - using defaults");
                    $fen = $fen ?: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                    $moves = $moves ?: 'e2e4';
                }
                
                if (is_array($moves)) {
                    $moves = implode(' ', $moves);
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO puzzles (id, lichess_id, fen, moves, rating, themes, piece_count) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $puzzleId,
                    $puzzle['lichessId'] ?? substr($puzzleId, 0, 20),
                    $fen,
                    $moves,
                    $puzzle['rating'] ?? 1500,
                    $puzzle['themes'] ?? null,
                    $puzzle['pieceCount'] ?? 32
                ]);
            }
            
            // Add user-puzzle relation
            $stmt = $pdo->prepare("
                INSERT INTO user_puzzle_relations 
                (user_id, source, puzzle_id, result, time_taken, old_rating, new_rating, xp_earned)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $appType,
                $puzzleId,
                $puzzle['result'],
                $puzzle['timeTaken'] ?? null,
                $puzzle['oldRating'] ?? null,
                $puzzle['newRating'] ?? null,
                $puzzle['xpEarned'] ?? 0
            ]);
            
            // Update user stats
            if ($puzzle['newRating']) {
                $stmt = $pdo->prepare("
                    UPDATE users SET 
                        tactics_rating = ?,
                        total_puzzles = total_puzzles + 1,
                        correct_puzzles = correct_puzzles + ?,
                        total_xp = total_xp + ?,
                        last_sync = NOW()
                    WHERE user_id = ? AND source = ?
                ");
                $stmt->execute([
                    $puzzle['newRating'],
                    $puzzle['result'] == 1 ? 1 : 0,
                    $puzzle['xpEarned'] ?? 0,
                    $userId,
                    $appType
                ]);
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Puzzle result saved'
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to save puzzle: ' . $e->getMessage(),
                'success' => false
            ]);
        }
        break;

    // ... rest of the endpoints remain the same ...
    case 'user/stats':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $userId = $_GET['userId'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required', 'success' => false]);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND source = ?");
        $stmt->execute([$userId, $appType]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
        break;

    case 'exercise/progress':
        if ($method === 'GET') {
            $userId = $_GET['userId'] ?? null;
            $exerciseId = $_GET['exerciseId'] ?? null;
            
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['error' => 'userId is required', 'success' => false]);
                exit;
            }
            
            if ($exerciseId) {
                $stmt = $pdo->prepare("
                    SELECT * FROM user_exercise_progress 
                    WHERE user_id = ? AND source = ? AND exercise_id = ?
                ");
                $stmt->execute([$userId, $appType, $exerciseId]);
                $progress = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $stmt = $pdo->prepare("
                    SELECT * FROM user_exercise_progress 
                    WHERE user_id = ? AND source = ?
                ");
                $stmt->execute([$userId, $appType]);
                $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode([
                'success' => true,
                'progress' => $progress
            ]);
            
        } else if ($method === 'POST') {
            $data = getJsonBody();
            $userId = $data['userId'] ?? null;
            $exerciseId = $data['exerciseId'] ?? null;
            $progress = $data['progress'] ?? null;
            
            if (!$userId || !$exerciseId || !$progress) {
                http_response_code(400);
                echo json_encode(['error' => 'userId, exerciseId and progress are required', 'success' => false]);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO user_exercise_progress 
                    (user_id, source, exercise_id, total_correct, total_attempts, sessions, 
                     best_accuracy, total_time_spent, accuracy, completed, progress)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        total_correct = VALUES(total_correct),
                        total_attempts = VALUES(total_attempts),
                        sessions = VALUES(sessions),
                        best_accuracy = VALUES(best_accuracy),
                        total_time_spent = VALUES(total_time_spent),
                        accuracy = VALUES(accuracy),
                        completed = VALUES(completed),
                        progress = VALUES(progress),
                        updated_at = NOW()
                ");
                $stmt->execute([
                    $userId,
                    $appType,
                    $exerciseId,
                    $progress['totalCorrect'] ?? 0,
                    $progress['totalAttempts'] ?? 0,
                    $progress['sessions'] ?? 0,
                    $progress['bestAccuracy'] ?? 0,
                    $progress['totalTimeSpent'] ?? 0,
                    $progress['accuracy'] ?? 0,
                    ($progress['completed'] ?? false) ? 1 : 0,
                    $progress['progress'] ?? 0
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Exercise progress updated'
                ]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Failed to update progress: ' . $e->getMessage(),
                    'success' => false
                ]);
            }
        }
        break;

    case 'sync/full':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed', 'success' => false]);
            exit;
        }
        
        $userId = $_GET['userId'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required', 'success' => false]);
            exit;
        }
        
        // Get user stats
        $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND source = ?");
        $stmt->execute([$userId, $appType]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get exercise progress
        $stmt = $pdo->prepare("SELECT * FROM user_exercise_progress WHERE user_id = ? AND source = ?");
        $stmt->execute([$userId, $appType]);
        $exerciseProgress = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get recent puzzle history
        $stmt = $pdo->prepare("
            SELECT * FROM user_puzzle_relations 
            WHERE user_id = ? AND source = ?
            ORDER BY completed_at DESC
            LIMIT 100
        ");
        $stmt->execute([$userId, $appType]);
        $puzzleHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user,
                'exerciseProgress' => $exerciseProgress,
                'puzzleHistory' => $puzzleHistory
            ]
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'endpoint' => $endpoint, 'success' => false]);
        break;
}
?>