<?php
require_once __DIR__ . '/../src/Operations.php';
require_once __DIR__ . '/../src/Storage.php';

$storage = new Storage();
$operations = new Operations();

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    switch ($action) {
        case 'getOperation':
            echo json_encode($operations->getRandomOperation());
            break;
            
        case 'checkAnswer':
            $result = $operations->checkAnswer(
                $data['userAnswer'] ?? '',
                $data['expectedAnswer'] ?? ''
            );
            echo json_encode(['correct' => $result]);
            break;
            
        case 'storeLike':
            $key = $data['key'] ?? '';
            if (!empty($key)) {
                // Use increment for like counts, which is more robust.
                $newCount = $storage->increment($key);
                echo json_encode(['success' => true, 'newCount' => $newCount]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Key not provided']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apocalypse Calculus</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <h1>Apocalypse Calculus</h1>
    <canvas id="geom-canvas" width="800" height="200"></canvas>
    <div id="animation-container" aria-live="polite"></div>
    <div id="countdown">Next in: <span id="countdown-num">30</span>s</div>
    <div id="interaction-section">
        <div id="challenge" role="status" aria-live="polite"></div>
        <input type="text" id="user-answer" placeholder="Your answer" aria-label="Answer input">
        <button id="submit-answer" aria-label="Submit answer">Submit</button>
        <button id="hint-button" aria-label="Show hint">Hint</button>
        
        <button id="social-toggle" class="social-toggle" aria-expanded="false" aria-controls="social-panel">
            <span class="social-icon">👥</span>
        </button>
        
        <div id="social-panel" class="social-panel" aria-hidden="true">
            <div class="social-header">
                <h3>Share & Connect</h3>
                <button class="close-panel" aria-label="Close social panel">×</button>
            </div>
            <div class="social-content">
                <div class="social-stats">
                    <button id="like-button" class="social-action" title="Like this challenge">
                        <span class="icon">♥</span>
                        <span id="like-count">0</span>
                    </button>
                    <button id="follow-button" class="social-action" title="Follow the author">
                        <span class="icon">👤</span>
                        <span>Follow</span>
                    </button>
                </div>
                <div id="author-name" class="author-info"></div>
                <div class="share-section">
                    <h4>Share</h4>
                    <div class="share-buttons">
                        <button id="share-x" class="share-button" title="Share to X">𝕏</button>
                        <button id="share-fb" class="share-button" title="Share to Facebook">f</button>
                        <button id="share-copy" class="share-button" title="Copy link">📋</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="feedback"></div>
        <div class="nav-buttons">
            <button id="prev-btn" aria-label="Previous">◀</button>
            <button id="next-btn" aria-label="Next">▶</button>
        </div>
        <div id="score">Score: 0</div>
        <div id="level">Level: 1</div>
        <div id="streak">Streak: 0</div>
        <div class="mode-toggle">
            <button id="hard-mode" aria-pressed="false">Hard: Off</button>
        </div>
        <div id="progress-bar"><div id="progress-fill"></div></div>
    </div>
    
    <footer>
        by Kevin Marville, 
        <a href="https://github.com/kvnbbg" target="_blank">https://github.com/kvnbbg</a>, 
        <a href="https://instagram.com/techandstream" target="_blank">https://instagram.com/techandstream</a>
    </footer>

    <div id="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
        <div>We use likes/follows storage to improve experience. Accept cookies to store preferences in cookies (shared across sessions), or decline to keep data in localStorage (browser-only).</div>
        <div class="consent-buttons">
            <button id="cookie-decline">Decline</button>
            <button id="cookie-accept">Accept</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js"></script>
    <script src="/assets/js/app.js"></script>
</body>
</html>