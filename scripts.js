 (function(){
        'use strict';

        const animationContainer = document.getElementById('animation-container');
        const challenge = document.getElementById('challenge');
        const userAnswer = document.getElementById('user-answer');
        const submitButton = document.getElementById('submit-answer');
        const hintButton = document.getElementById('hint-button');
        const feedback = document.getElementById('feedback');
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const streakElement = document.getElementById('streak');
        const progressFill = document.getElementById('progress-fill');
        const likeButton = document.getElementById('like-button');
        const likeCountEl = document.getElementById('like-count');
        const followButton = document.getElementById('follow-button');
        const authorNameEl = document.getElementById('author-name');
        const shareX = document.getElementById('share-x');
        const shareFb = document.getElementById('share-fb');
        const shareCopy = document.getElementById('share-copy');
    const cookieConsentEl = document.getElementById('cookie-consent');
        const cookieAcceptBtn = document.getElementById('cookie-accept');
        const cookieDeclineBtn = document.getElementById('cookie-decline');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const hardModeBtn = document.getElementById('hard-mode');
    const countdownNum = document.getElementById('countdown-num');
    const geomCanvas = document.getElementById('geom-canvas');
    const gctx = geomCanvas.getContext && geomCanvas.getContext('2d');
    const hardModeToggle = document.createElement('button');
    hardModeToggle.id = 'hard-mode-toggle';
    hardModeToggle.textContent = 'Hard: Off';
    hardModeToggle.setAttribute('aria-pressed', 'false');
    hardModeToggle.style.marginLeft = '8px';
        let score = 0;
        let streak = 0;
        let currentChallenge = null;
        let autoTimeout = null;
        let revealTimeout = null; // after incorrect submit
        let hintUsed = false;

        const encouragementMessages = [
            "Great job!",
            "Awesome!",
            "You're on fire!",
            "Keep it up!",
            "Brilliant!",
            "Excellent!",
            "Well done!",
            "Superb!",
            "Fantastic!",
            "You're a math wizard!"
        ];

        // Function to get level
        function getLevel() {
            // Hard mode increases effective level
            const base = Math.floor(score / 10) + 1;
            return hardModeBtn && hardModeBtn.getAttribute('aria-pressed') === 'true' ? base + 2 : base;
        }

        // Ensure consistent result formatting (string) for comparisons and display
        function formatResultValue(val) {
            if (typeof val === 'number') {
                return Number.isInteger(val) ? String(val) : String(Number(val).toFixed(2));
            }
            // keep existing strings including 'Yes'/'No' and pre-formatted toFixed strings
            return String(val);
        }

        // Cookie helpers
        function setCookie(name, value, days) {
            const expires = days ? `; expires=${new Date(Date.now()+days*864e5).toUTCString()}` : '';
            document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/`;
        }
        function getCookie(name) {
            return document.cookie.split('; ').reduce((r, v) => {
                const parts = v.split('=');
                return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
            }, '');
        }

        // Storage abstraction: use cookies if user consented, otherwise localStorage
        function storageSet(key, value) {
            const consent = getCookie('cookieConsent');
            if (consent === 'yes') {
                setCookie(key, typeof value === 'string' ? value : JSON.stringify(value), 365);
            } else {
                try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch (e) { /* fallback */ }
            }
        }
        function storageGet(key) {
            const consent = getCookie('cookieConsent');
            if (consent === 'yes') {
                return getCookie(key) || null;
            } else {
                try { return localStorage.getItem(key); } catch (e) { return null; }
            }
        }

        // Cookie consent UI
        function showCookieConsentIfNeeded() {
            const consent = getCookie('cookieConsent');
            if (!consent) {
                cookieConsentEl.style.display = 'block';
            }
        }
        cookieAcceptBtn.addEventListener('click', () => { setCookie('cookieConsent', 'yes', 365); cookieConsentEl.style.display='none'; });
        cookieDeclineBtn.addEventListener('click', () => { setCookie('cookieConsent', 'no', 365); cookieConsentEl.style.display='none'; });
        showCookieConsentIfNeeded();

        // Robust answer comparison
        function isAnswerCorrect(userAnsRaw, expectedRaw) {
            const user = (userAnsRaw || '').toString().trim();
            const expected = (expectedRaw || '').toString().trim();
            if (!expected) return false;

            // Normalize case for textual answers
            const uLower = user.toLowerCase();
            const eLower = expected.toLowerCase();

            // Yes/No handling
            if (/^yes$|^no$|^y$|^n$/i.test(eLower)) {
                if (/^yes$|^y$|^true$|^1$/i.test(uLower)) return /^yes|y|true|1/i.test(eLower);
                if (/^no$|^n$|^false$|^0$/i.test(uLower)) return /^no|n|false|0/i.test(eLower);
            }

            // Numeric tolerant comparison
            // First try symbolic equivalence using mathjs (if available)
            try {
                if (window.math) {
                    const diff = math.simplify(`(${user})-(${expected})`);
                    if (diff && String(diff) === '0') return true;
                }
            } catch (e) {
                // ignore symbolic errors
            }

            const userNum = Number(user.replace(/[^0-9eE+\-.]/g, ''));
            const expNum = Number(expected.replace(/[^0-9eE+\-.]/g, ''));
            const userIsNum = !Number.isNaN(userNum) && user !== '';
            const expIsNum = !Number.isNaN(expNum) && expected !== '';
            if (userIsNum && expIsNum) {
                const absDiff = Math.abs(userNum - expNum);
                const rel = Math.abs(absDiff / (Math.abs(expNum) + 1e-9));
                // Accept if absolute diff small or relative small
                if (absDiff <= 0.01 || rel <= 0.005) return true;
            }

            // Loose normalized string match (ignore whitespace, punctuation differences)
            const normalize = s => s.replace(/[^a-z0-9\.\^%\-]+/gi, '').toLowerCase();
            if (normalize(user) === normalize(expected)) return true;

            // Fallback: exact (case-insensitive)
            return uLower === eLower;
        }

        // Update progress bar
        function updateProgress() {
            const progress = (score % 10) * 10;
            progressFill.style.width = `${progress}%`;
            levelElement.innerHTML = `Level: ${getLevel()}`;
        }

    // Array of operation generators
        const operations = [
            // ... (all previous operations remain the same)
            // Basic addition
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                const b = Math.floor(Math.random() * 100 * level) + 1;
                return { expr: `${a} + ${b}`, result: a + b, tex: `${a} + ${b}` };
            },
            // Subtraction
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                const b = Math.floor(Math.random() * 100 * level) + 1;
                return { expr: `${Math.max(a, b)} - ${Math.min(a, b)}`, result: Math.max(a, b) - Math.min(a, b), tex: `${Math.max(a, b)} - ${Math.min(a, b)}` };
            },
            // Multiplication
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 20 * level) + 1;
                const b = Math.floor(Math.random() * 20 * level) + 1;
                return { expr: `${a} * ${b}`, result: a * b, tex: `${a} \\times ${b}` };
            },
            // Division
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 20 * level) + 1;
                const b = Math.floor(Math.random() * 10 * level) + 2;
                const product = a * b;
                return { expr: `${product} / ${b}`, result: product / b, tex: `${product} \\div ${b}` };
            },
            // Percentage
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                const b = Math.floor(Math.random() * 100 * level) + 1;
                return { expr: `${a}% of ${b}`, result: (a / 100 * b).toFixed(2), tex: `${a}\\% \\ of \\ ${b}` };
            },
            // Negative
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                return { expr: `-${a}`, result: -a, tex: `-${a}` };
            },
            // Binary
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 256 * level) + 1;
                return { expr: `Binary of ${a}`, result: a.toString(2), tex: `\\text{Binary of } ${a}` };
            },
            // Square root
            () => {
                const level = getLevel();
                const a = Math.pow(Math.floor(Math.random() * 20 * level) + 1, 2);
                return { expr: `√${a}`, result: Math.sqrt(a), tex: `\\sqrt{${a}}` };
            },
            // Circle area
            () => {
                const level = getLevel();
                const r = Math.floor(Math.random() * 10 * level) + 1;
                return { expr: `Area of circle r=${r}`, result: (Math.PI * r * r).toFixed(2), tex: `\\text{Area of circle } r=${r}` };
            },
            // Triangle area
            () => {
                const level = getLevel();
                const b = Math.floor(Math.random() * 20 * level) + 1;
                const h = Math.floor(Math.random() * 20 * level) + 1;
                return { expr: `Area of triangle base=${b} height=${h}`, result: (0.5 * b * h).toFixed(2), tex: `\\text{Area of triangle base}=${b} \\ height=${h}` };
            },
            // Even check
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                return { expr: `Is ${a} even?`, result: a % 2 === 0 ? 'Yes' : 'No', tex: `\\text{Is } ${a} \\text{ even?}` };
            },
            // Power
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 10 * level) + 1;
                const b = Math.floor(Math.random() * 4) + 2;
                return { expr: `${a}^${b}`, result: Math.pow(a, b), tex: `${a}^{${b}}` };
            },
            // Modulo
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 100 * level) + 1;
                const b = Math.floor(Math.random() * 10 * level) + 2;
                return { expr: `${a} % ${b}`, result: a % b, tex: `${a} \\mod ${b}` };
            },
            // Trigonometry
            () => {
                const angles = [0, 30, 45, 60, 90, 120, 150, 180, 270, 360];
                const func = ['sin', 'cos', 'tan'][Math.floor(Math.random() * 3)];
                let a = angles[Math.floor(Math.random() * angles.length)];
                const level = getLevel();
                a += Math.floor(Math.random() * 10 * level);
                let result;
                const rad = a * Math.PI / 180;
                if (func === 'sin') result = Math.sin(rad).toFixed(2);
                else if (func === 'cos') result = Math.cos(rad).toFixed(2);
                else {
                    if (Math.abs(Math.cos(rad)) < 0.001) return getRandomOperation();
                    result = Math.tan(rad).toFixed(2);
                }
                return { expr: `${func}(${a}°)`, result, tex: `\\${func}(${a}^\\circ)` };
            },
            // Kinetic energy
            () => {
                const level = getLevel();
                const m = Math.floor(Math.random() * 10 * level) + 1;
                const v = Math.floor(Math.random() * 10 * level) + 1;
                return { expr: `Kinetic energy m=${m} v=${v}`, result: (0.5 * m * v * v).toFixed(2), tex: `\\text{Kinetic energy } m=${m} \\ v=${v}` };
            },
            // Fall distance
            () => {
                const level = getLevel();
                const t = Math.floor(Math.random() * 5 * level) + 1;
                return { expr: `Fall distance in ${t}s (g=9.8)`, result: (0.5 * 9.8 * t * t).toFixed(2), tex: `\\text{Fall distance in } ${t}\\text{s (g=9.8)}` };
            },
            // Euclidean distance
            () => {
                const level = getLevel();
                const x1 = Math.floor(Math.random() * 10 * level);
                const y1 = Math.floor(Math.random() * 10 * level);
                const x2 = Math.floor(Math.random() * 10 * level);
                const y2 = Math.floor(Math.random() * 10 * level);
                return { expr: `Dist (${x1},${y1}) to (${x2},${y2})`, result: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(2), tex: `\\text{Dist } (${x1},${y1}) \\ to \\ (${x2},${y2})` };
            },
            // Spherical angle sum
            () => {
                return { expr: `Angle sum in spherical triangle`, result: `>180°`, tex: `\\text{Angle sum in spherical triangle}` };
            },
            // Hydrogen energy
            () => {
                const level = getLevel();
                const n = Math.floor(Math.random() * 5 * level) + 1;
                return { expr: `H atom energy n=${n} (eV)`, result: (-13.6 / (n * n)).toFixed(2), tex: `\\text{H atom energy } n=${n} \\ (eV)` };
            },
            // Log10
            () => {
                const level = getLevel();
                const a = Math.pow(10, Math.floor(Math.random() * level) + 1);
                return { expr: `log10(${a})`, result: Math.log10(a), tex: `\\log_{10}(${a})` };
            },
            // Integral (indefinite polynomial)
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 5 * level) + 1;
                const b = Math.floor(Math.random() * 4) + 1;
                // integral of a*x^b = a/(b+1) x^{b+1}
                const coeff = (a/(b+1));
                const expr = `${a}x^${b}`;
                const resTex = `${coeff}x^{${b+1}} + C`;
                return { expr: `∫ ${expr} dx`, result: `${coeff}x^${b+1} + C`, tex: `\\int ${a}x^{${b}} \\; dx`, resultTex: resTex };
            },
            // Matrix determinant 2x2
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 5 * level) + 1;
                const b = Math.floor(Math.random() * 5 * level) + 1;
                const c = Math.floor(Math.random() * 5 * level) + 1;
                const d = Math.floor(Math.random() * 5 * level) + 1;
                const det = a*d - b*c;
                return { expr: `det([[${a},${b}],[${c},${d}]])`, result: det, tex: `\\det\\begin{pmatrix}${a} & ${b}\\\\${c} & ${d}\\end{pmatrix}` };
            },
            // Matrix multiply 2x2 by 2x1
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 5 * level) + 1;
                const b = Math.floor(Math.random() * 5 * level) + 1;
                const c = Math.floor(Math.random() * 5 * level) + 1;
                const x = Math.floor(Math.random() * 5 * level) + 1;
                const y = Math.floor(Math.random() * 5 * level) + 1;
                const r1 = a*x + b*y;
                const r2 = c*x + a*y;
                return { expr: `[[${a},${b}],[${c},${a}]] * [${x},${y}]`, result: `[${r1},${r2}]`, tex: `\\begin{pmatrix}${a} & ${b}\\${c} & ${a}\\end{pmatrix}\\begin{pmatrix}${x}\\${y}\\end{pmatrix}` };
            },
            // Exponential
            () => {
                const level = getLevel();
                const a = Math.floor(Math.random() * 5 * level) + 1;
                return { expr: `e^${a}`, result: Math.exp(a).toFixed(2), tex: `e^{${a}}` };
            },
            // New: Derivative
            () => {
                const level = getLevel();
                const coeffs = [];
                const degree = Math.min(3 + Math.floor(level / 2), 5);
                for (let i = 0; i <= degree; i++) {
                    coeffs.push(Math.floor(Math.random() * 10 * level) - 5 * level); // allow negatives
                }
                let poly = coeffs.map((c, i) => c !== 0 ? `${c > 0 && i > 0 ? '+' : ''}${c === 1 && i > 0 ? '' : c === -1 && i > 0 ? '-' : c}x^{${i}}` : '').reverse().join('').replace(/\^{1}/g, '').replace(/x^{0}/g, '');
                poly = poly.replace(/^\+/, '').replace(/\-/g, ' - ').replace(/\+/g, ' + ');
                let deriv = coeffs.slice(1).map((c, i) => c * (i + 1) !== 0 ? `${c * (i + 1) > 0 && i > 0 ? '+' : ''}${c * (i + 1) === 1 && i > 0 ? '' : c * (i + 1) === -1 && i > 0 ? '-' : c * (i + 1)}x^{${i}}` : '').reverse().join('').replace(/\^{1}/g, '').replace(/x^{0}/g, '');
                deriv = deriv.replace(/^\+/, '').replace(/\-/g, ' - ').replace(/\+/g, ' + ') || '0';
                const texPoly = coeffs.map((c, i) => c !== 0 ? `${c > 0 && i > 0 ? '+' : ''}${Math.abs(c) === 1 && i > 1 ? '' : c}x^{${i}}` : '').reverse().join('').replace(/\^{1}/g, '').replace(/x^{0}/g, '');
                const texDeriv = coeffs.slice(1).map((c, i) => {
                    const newC = c * (i + 1);
                    return newC !== 0 ? `${newC > 0 && i > 0 ? '+' : ''}${Math.abs(newC) === 1 && i > 0 ? '' : newC}x^{${i}}` : '';
                }).reverse().join('').replace(/\^{1}/g, '').replace(/x^{0}/g, '') || '0';
                // Return with optional author metadata so social controls can attach
                return { expr: `d/dx (${poly})`, result: deriv, tex: `\\frac{d}{dx} (${texPoly})`, resultTex: texDeriv, author: 'Kevin Marville' };
            }
        ];

        // Function to get random operation and normalize result/resultTex/author
        function getRandomOperation() {
            const index = Math.floor(Math.random() * operations.length);
            const op = operations[index]();
            // normalize result to string for predictable comparison
            op.result = formatResultValue(op.result);
            // ensure resultTex exists for symbolic display
            op.resultTex = typeof op.resultTex !== 'undefined' ? op.resultTex : op.result;
            op.author = op.author || 'Kevin Marville';
            return op;
        }

        // Render KaTeX (safe: fall back to text if rendering fails)
        function renderMath(element, tex) {
            try {
                element.innerHTML = katex.renderToString(String(tex), { throwOnError: false });
            } catch (e) {
                element.textContent = String(tex);
            }
        }

        // Simple geometric canvas theme drawer
        function drawGeomTheme(tex) {
            if (!gctx) return;
            const w = geomCanvas.width = Math.min(window.innerWidth * 0.9, 800);
            geomCanvas.height = 120;
            gctx.clearRect(0,0,w,geomCanvas.height);
            // background grid
            gctx.fillStyle = '#0b0b0b';
            gctx.fillRect(0,0,w,geomCanvas.height);
            gctx.strokeStyle = '#220000';
            gctx.lineWidth = 1;
            for (let x=0;x<w;x+=20){ gctx.beginPath(); gctx.moveTo(x,0); gctx.lineTo(x,geomCanvas.height); gctx.stroke(); }
            for (let y=0;y<geomCanvas.height;y+=20){ gctx.beginPath(); gctx.moveTo(0,y); gctx.lineTo(w,y); gctx.stroke(); }
            // draw moving arcs based on text hash
            const seed = Array.from(String(tex)).reduce((s,c)=>s+ c.charCodeAt(0),0);
            for (let i=0;i<5;i++){
                const r = 10 + ((seed+i*7) % 80);
                gctx.beginPath();
                gctx.strokeStyle = `rgba(255,${50+i*30},${50+i*20},0.9)`;
                gctx.arc(50 + i*120 % w, 60, r, 0, Math.PI*2);
                gctx.stroke();
            }
        }

        // Enhanced animation loop
        function startAnimation() {
            const op = getRandomOperation();
            animationContainer.classList.add('fade-out');
            const transitionListener = () => {
                animationContainer.innerHTML = '';
                renderMath(animationContainer, op.tex);
                animationContainer.classList.remove('fade-out');
                animationContainer.classList.add('fade-in');
                animationContainer.removeEventListener('transitionend', transitionListener);
            };
            animationContainer.addEventListener('transitionend', transitionListener);

            // Show result after a short delay and then fade to next
            let localTimer = 2;
            const countdownInterval = setInterval(()=>{ localTimer--; countdownNum.textContent = localTimer; if (localTimer<=0) clearInterval(countdownInterval); }, 1000);
            setTimeout(() => {
                animationContainer.innerHTML = '';
                renderMath(animationContainer, `${op.tex} = ${op.resultTex || op.result}`);
            }, 2000);

            setTimeout(() => {
                animationContainer.classList.remove('fade-in');
                animationContainer.classList.add('fade-out');
                const nextListener = () => {
                    startAnimation();
                    animationContainer.removeEventListener('transitionend', nextListener);
                };
                animationContainer.addEventListener('transitionend', nextListener);
            }, 4000);
        }

        // Start animation
        startAnimation();

        // Auto submit when user is idle (flashcard auto-review)
        function autoSubmit() {
            if (currentChallenge) {
                const answer = userAnswer.value.trim();
                const isCorrect = isAnswerCorrect(answer, currentChallenge.result);
                if (isCorrect) {
                    feedback.innerHTML = 'Correct! (auto)';
                    score++;
                    streak++;
                    feedback.innerHTML += `<br>${encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}`;
                    updateProgress();
                    scoreElement.innerHTML = `Score: ${score}`;
                    streakElement.innerHTML = `Streak: ${streak}`;
                    setTimeout(newChallenge, 1500);
                } else {
                    // reveal correct answer after short delay and advance
                    feedback.innerHTML = `No answer detected — revealing in 3s...`;
                    revealTimeout = setTimeout(() => {
                        feedback.innerHTML = `Time! Correct answer: ${currentChallenge.result}`;
                        streak = 0;
                        updateProgress();
                        scoreElement.innerHTML = `Score: ${score}`;
                        streakElement.innerHTML = `Streak: ${streak}`;
                        setTimeout(newChallenge, 2500);
                    }, 3000);
                }
            }
        }

        // New challenge
        function newChallenge() {
            clearTimeout(autoTimeout);
            clearTimeout(revealTimeout);
            currentChallenge = getRandomOperation();
            // update social controls
            authorNameEl.textContent = `by ${currentChallenge.author}`;
            const likesKey = `likes:${currentChallenge.expr}`;
            const likes = parseInt(storageGet(likesKey) || '0', 10);
            likeCountEl.textContent = likes;
            const followingKey = `follow:${currentChallenge.author}`;
            const following = storageGet(followingKey) === '1';
            followButton.textContent = following ? 'Following' : 'Follow';

            challenge.innerHTML = '';
            renderMath(challenge, `Solve: ${currentChallenge.tex}`);
            userAnswer.value = '';
            feedback.innerHTML = '';
            hintUsed = false;
            // reset and start auto-submit timeout
            countdownNum.textContent = '30';
            autoTimeout = setTimeout(autoSubmit, 30000);
            // draw geometric theme
            drawGeomTheme(currentChallenge.tex);
        }

        // Input event to reset timeout
        userAnswer.addEventListener('input', () => {
            clearTimeout(autoTimeout);
            autoTimeout = setTimeout(autoSubmit, 30000);
        });

        // Submit
        submitButton.addEventListener('click', () => {
            clearTimeout(autoTimeout);
            clearTimeout(revealTimeout);
            if (currentChallenge) {
                const answer = userAnswer.value.trim();
                const isCorrect = isAnswerCorrect(answer, currentChallenge.result); // uses mathjs/symbolic
                if (isCorrect) {
                    feedback.innerHTML = 'Correct!';
                    score++;
                    streak++;
                    feedback.innerHTML += `<br>${encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}`;
                    updateProgress();
                    scoreElement.innerHTML = `Score: ${score}`;
                    streakElement.innerHTML = `Streak: ${streak}`;
                    setTimeout(newChallenge, 1200);
                } else {
                    feedback.innerHTML = `Wrong! Showing correct in 4s...`;
                    streak = 0;
                    // reveal correct answer after short delay to create a pop-quiz style learning moment
                    revealTimeout = setTimeout(() => {
                        feedback.innerHTML = `Wrong — correct answer: ${currentChallenge.result}`;
                        updateProgress();
                        scoreElement.innerHTML = `Score: ${score}`;
                        streakElement.innerHTML = `Streak: ${streak}`;
                        setTimeout(newChallenge, 2200);
                    }, 4000);
                }
            }
        });

        // Hint button
        hintButton.addEventListener('click', () => {
            if (currentChallenge && !hintUsed) {
                hintUsed = true;
                const hint = typeof currentChallenge.result === 'string' ? currentChallenge.result.substring(0, Math.floor(currentChallenge.result.length / 2)) + '...' : `Starts with ${currentChallenge.result.toString().charAt(0)}`;
                feedback.innerHTML = `Hint: ${hint}`;
                // small penalty for hinting (encourage solving)
                if (score > 0) score = Math.max(0, score - 1);
                updateProgress();
                scoreElement.innerHTML = `Score: ${score}`;
            }
        });

        // Social panel controls
        const socialToggle = document.getElementById('social-toggle');
        const socialPanel = document.getElementById('social-panel');
        const closePanel = document.querySelector('.close-panel');

        function toggleSocialPanel() {
            const isExpanded = socialToggle.getAttribute('aria-expanded') === 'true';
            socialToggle.setAttribute('aria-expanded', !isExpanded);
            socialPanel.classList.toggle('active');
            socialPanel.setAttribute('aria-hidden', isExpanded);
        }

        socialToggle.addEventListener('click', toggleSocialPanel);
        closePanel.addEventListener('click', toggleSocialPanel);

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!socialPanel.contains(e.target) && !socialToggle.contains(e.target) && socialPanel.classList.contains('active')) {
                toggleSocialPanel();
            }
        });

        // Like / follow / share handlers
        likeButton.addEventListener('click', () => {
            if (!currentChallenge) return;
            const key = `likes:${currentChallenge.expr}`;
            const prev = parseInt(storageGet(key) || '0', 10) || 0;
            const count = prev + 1;
            storageSet(key, String(count));
            likeCountEl.textContent = count;
            const icon = likeButton.querySelector('.icon');
            icon.textContent = '♥';
        });

        followButton.addEventListener('click', () => {
            if (!currentChallenge) return;
            const key = `follow:${currentChallenge.author}`;
            const following = storageGet(key) === '1';
            storageSet(key, following ? '0' : '1');
            followButton.textContent = following ? 'Follow' : 'Following';
        });

        // Hard mode toggle and navigation
        hardModeBtn.addEventListener('click', () => {
            const pressed = hardModeBtn.getAttribute('aria-pressed') === 'true';
            hardModeBtn.setAttribute('aria-pressed', String(!pressed));
            hardModeBtn.textContent = pressed ? 'Hard: Off' : 'Hard: On';
        });
        prevBtn.addEventListener('click', () => { newChallenge(); });
        nextBtn.addEventListener('click', () => { newChallenge(); });

        // Focus management: focus input on new challenges
        function focusAnswer() { try { userAnswer.focus(); } catch (e) {} }

        function shareTextForCurrent() {
            if (!currentChallenge) return `${location.href} — ${document.title}`;
            return `${document.title}: ${currentChallenge.expr} — try it at ${location.href}`;
        }

        shareX.addEventListener('click', () => {
            const text = encodeURIComponent(shareTextForCurrent());
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        });
        shareFb.addEventListener('click', () => {
            const url = encodeURIComponent(location.href);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        });
        shareCopy.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(shareTextForCurrent()); feedback.innerHTML = 'Link copied!'; }
            catch (e) { feedback.innerHTML = 'Copy failed'; }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { submitButton.click(); }
            if (e.key.toLowerCase() === 'h') { hintButton.click(); }
            if (e.key.toLowerCase() === 'l') { likeButton.click(); }
            if (e.key.toLowerCase() === 'f') { followButton.click(); }
        });
        // Headless test runner (use ?headless=1 to run quick loop in automated environments)
        async function headlessRun(iterations=10) {
            console.log('Headless run start');
            for (let i=0;i<iterations;i++) {
                const op = getRandomOperation();
                console.log('challenge', i+1, op.expr, '->', op.result);
                await new Promise(r=>setTimeout(r, 50));
            }
            console.log('Headless run complete');
        }

        // Initial
        newChallenge();
        updateProgress();
    focusAnswer();

        // If URL includes headless parameter, run quick test harness
        try {
            const params = new URLSearchParams(location.search);
            if (params.get('headless') === '1') {
                headlessRun(20).then(()=>{ console.log('headless done'); });
            }
        } catch (e) { /* ignore */ }

    })();