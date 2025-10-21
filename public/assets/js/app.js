'use strict';

class ApocalypseCalculus {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.attachEventListeners();
        this.startAnimation();
        this.showCookieConsentIfNeeded();
    }

    initializeElements() {
        // Get all DOM elements
        this.elements = {
            animation: document.getElementById('animation-container'),
            challenge: document.getElementById('challenge'),
            userAnswer: document.getElementById('user-answer'),
            submitButton: document.getElementById('submit-answer'),
            hintButton: document.getElementById('hint-button'),
            feedback: document.getElementById('feedback'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            streak: document.getElementById('streak'),
            progressFill: document.getElementById('progress-fill'),
            likeButton: document.getElementById('like-button'),
            likeCount: document.getElementById('like-count'),
            followButton: document.getElementById('follow-button'),
            authorName: document.getElementById('author-name'),
            shareX: document.getElementById('share-x'),
            shareFb: document.getElementById('share-fb'),
            shareCopy: document.getElementById('share-copy'),
            cookieConsent: document.getElementById('cookie-consent'),
            cookieAccept: document.getElementById('cookie-accept'),
            cookieDecline: document.getElementById('cookie-decline'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            hardModeBtn: document.getElementById('hard-mode'),
            countdownNum: document.getElementById('countdown-num'),
            canvas: document.getElementById('geom-canvas'),
            socialToggle: document.getElementById('social-toggle'),
            socialPanel: document.getElementById('social-panel'),
            closePanel: document.querySelector('.close-panel')
        };

        this.gctx = this.elements.canvas.getContext('2d');
    }

    initializeState() {
        this.score = 0;
        this.streak = 0;
        this.currentChallenge = null;
        this.autoTimeout = null;
        this.revealTimeout = null;
        this.hintUsed = false;
        this.extremeMode = false;
    }

    attachEventListeners() {
        // Submit answer
        this.elements.submitButton.addEventListener('click', () => this.submitAnswer());
        this.elements.userAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });

        // Social panel
        this.elements.socialToggle.addEventListener('click', () => this.toggleSocialPanel());
        this.elements.closePanel.addEventListener('click', () => this.toggleSocialPanel());

        // Other controls
        this.elements.hintButton.addEventListener('click', () => this.showHint());
        this.elements.prevBtn.addEventListener('click', () => this.newChallenge());
        this.elements.nextBtn.addEventListener('click', () => this.newChallenge());
        this.elements.hardModeBtn.addEventListener('click', () => this.toggleHardMode());
        // Extreme difficulty toggle via long-press or double click
        this.elements.hardModeBtn.addEventListener('dblclick', () => this.toggleExtremeMode());

        // Social actions
        this.elements.likeButton.addEventListener('click', () => this.handleLike());
        this.elements.followButton.addEventListener('click', () => this.handleFollow());
        this.elements.shareX.addEventListener('click', () => this.shareToX());
        this.elements.shareFb.addEventListener('click', () => this.shareToFacebook());
        this.elements.shareCopy.addEventListener('click', () => this.copyShareLink());

        // Cookie consent
        this.elements.cookieAccept.addEventListener('click', () => this.acceptCookies());
        this.elements.cookieDecline.addEventListener('click', () => this.declineCookies());

        // Input timeout reset
        this.elements.userAnswer.addEventListener('input', () => this.resetAutoSubmitTimeout());
    }

    async submitAnswer() {
        if (!this.currentChallenge) return;

        const answer = this.elements.userAnswer.value.trim();
        const response = await fetch('/index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'checkAnswer',
                userAnswer: answer,
                expectedAnswer: this.currentChallenge.result
            })
        });
        try {
            if (!response.ok) {
                const txt = await response.text();
                this.elements.feedback.innerHTML = 'Server error: ' + txt;
                console.error('Server error on checkAnswer', response.status, txt);
                return;
            }
            const result = await response.json();
            this.handleAnswerResult(result.correct);
        } catch (e) {
            console.error('Network or parse error on submitAnswer', e);
            this.elements.feedback.innerHTML = 'Network error — using local check';
            // fallback: simple local equality check
            const isCorrect = (answer === String(this.currentChallenge.result));
            this.handleAnswerResult(isCorrect);
        }
    }

    handleAnswerResult(isCorrect) {
        if (isCorrect) {
            this.elements.feedback.innerHTML = 'Correct!';
            this.score++;
            this.streak++;
            this.updateProgress();
            setTimeout(() => this.newChallenge(), 1500);
        } else {
            this.elements.feedback.innerHTML = 'Try again!';
            this.streak = 0;
            this.updateProgress();
        }
    }

    async newChallenge() {
        this.clearTimeouts();
        // request level from UI
        const level = this.extremeMode ? 12 : (this.score ? Math.floor(this.score / 5) + 1 : 1);
        try {
            const response = await fetch('/index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getOperation', level })
            });
            if (!response.ok) {
                const txt = await response.text();
                console.error('Server returned error for getOperation', response.status, txt);
                this.elements.feedback.innerHTML = 'Server error fetching operation';
                this.currentChallenge = this.generateLocalOperation(level);
            } else {
                this.currentChallenge = await response.json();
            }
        } catch (e) {
            // fallback to local generation when server isn't reachable
            console.warn('Server fetch failed, using local fallback operation.', e);
            this.currentChallenge = this.generateLocalOperation(level);
            this.elements.feedback.innerHTML = 'Using local fallback (server unreachable).';
        }
        this.renderChallenge();
        this.startAutoSubmitTimeout();
    }

    renderChallenge() {
        this.renderMath(this.elements.challenge, `Solve: ${this.currentChallenge.tex}`);
        this.elements.userAnswer.value = '';
        this.elements.feedback.innerHTML = '';
        this.hintUsed = false;
        this.elements.countdownNum.textContent = '30';
        this.drawGeomTheme(this.currentChallenge.tex);

        // Update social elements
        this.elements.authorName.textContent = `by ${this.currentChallenge.author}`;
        this.updateLikeCount();
    }

    renderMath(element, tex) {
        try {
            element.innerHTML = katex.renderToString(String(tex), { throwOnError: false });
        } catch (e) {
            element.textContent = String(tex);
        }
    }

    drawGeomTheme(tex) {
        if (!this.gctx) return;

        const w = this.elements.canvas.width = Math.min(window.innerWidth * 0.9, 800);
        this.elements.canvas.height = 120;

        this.gctx.clearRect(0, 0, w, this.elements.canvas.height);
        this.gctx.fillStyle = '#0b0b0b';
        this.gctx.fillRect(0, 0, w, this.elements.canvas.height);

        // Add geometric patterns here
    }

    // Extreme mode toggle
    toggleExtremeMode() {
        this.extremeMode = !this.extremeMode;
        this.elements.hardModeBtn.textContent = this.extremeMode ? 'Hard: Extreme' : (this.hardMode ? 'Hard: On' : 'Hard: Off');
        this.elements.hardModeBtn.setAttribute('aria-pressed', this.extremeMode ? 'true' : 'false');
        this.newChallenge();
    }

    // Utility: add resource link to DOM (PDF)
    addResourceLink() {
        if (document.getElementById('resource-block')) return;
        const div = document.createElement('div');
        div.id = 'resource-block';
        div.style.marginTop = '12px';
        div.style.fontSize = '0.95em';
        div.innerHTML = `Advanced: <a href="https://math.dartmouth.edu/~m46s21/Script_MATH46_2020.pdf" target="_blank">Applied Mathematics (PDF)</a>`;
        const parent = document.getElementById('interaction-section');
        parent.insertBefore(div, parent.querySelector('#feedback'));
    }

    // Frontend test harness: run from console
    async testIntegration() {
        const levels = [1, 6, 12];
        for (const level of levels) {
            try {
                const response = await fetch('/index.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getOperation', level })
                });
                if (!response.ok) throw new Error('Server error');
                const data = await response.json();
                console.log(`Server response for level ${level}:`, data);
            } catch (e) {
                const fallback = this.generateLocalOperation(level);
                console.warn(`Fallback for level ${level}:`, fallback);
            }
        }
        console.log('Integration test complete.');
    }

    // Local fallback operation generator if server not available
    generateLocalOperation(level = 1) {
        level = Math.max(1, Number(level) || 1);
        if (level >= 10) {
            return {
                expr: 'Extreme: Solve Laplace equation in polar coordinates (outline)',
                tex: '\\nabla^2 \\psi = 0',
                result: 'Separation of variables; series solution',
                resultTex: '\\psi(r,\\theta)=a_0 + b_0\\ln r + \\sum_{n=1}^\\infty (r^n(...)+r^{-n}(...))',
                author: 'Applied Math (local)'
            };
        }
        // simple algebra / calculus random
        const t = Math.floor(Math.random() * 4);
        if (t === 0) {
            const a = Math.floor(Math.random() * 10 * level) + 1;
            const b = Math.floor(Math.random() * 10 * level) + 1;
            return { expr: `${a} + ${b}`, tex: `${a} + ${b}`, result: String(a + b), resultTex: String(a + b), author: 'local' };
        } else if (t === 1) {
            const a = Math.floor(Math.random() * 6 * level) + 1;
            const b = Math.floor(Math.random() * 4) + 1;
            const coeff = (a / (b + 1));
            return { expr: `\int ${a}x^${b} dx`, tex: `\\int ${a}x^{${b}} \\; dx`, result: `${coeff}x^${b + 1} + C`, resultTex: `${coeff}x^{${b + 1}} + C`, author: 'local' };
        } else if (t === 2) {
            const n = Math.floor(Math.random() * 5) + 2;
            return { expr: `d/dx x^${n}`, tex: `\\frac{d}{dx} x^{${n}}`, result: `${n}x^${n - 1}`, resultTex: `${n}x^{${n - 1}}`, author: 'local' };
        }
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        const det = a * a - b * b;
        return { expr: `det([[${a},${b}],[${b},${a}]])`, tex: `\\det [[${a},${b}],[${b},${a}]]`, result: String(det), resultTex: String(det), author: 'local' };
    }

    // Storage methods
    storageSet(key, value) {
        const consent = this.getCookie('cookieConsent');
        if (consent === 'yes') {
            this.setCookie(key, value, 365);
        } else {
            try {
                localStorage.setItem(key, value);
            } catch (e) { /* fallback */ }
        }
    }

    storageGet(key) {
        const consent = this.getCookie('cookieConsent');
        if (consent === 'yes') {
            return this.getCookie(key);
        }
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    setCookie(name, value, days) {
        const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
        document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/`;
    }

    getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    }

    showCookieConsentIfNeeded() {
        if (!this.getCookie('cookieConsent')) {
            this.elements.cookieConsent.style.display = 'block';
        }
    }

    acceptCookies() {
        this.setCookie('cookieConsent', 'yes', 365);
        this.elements.cookieConsent.style.display = 'none';
    }

    declineCookies() {
        this.setCookie('cookieConsent', 'no', 365);
        this.elements.cookieConsent.style.display = 'none';
    }

    toggleSocialPanel() {
        const isExpanded = this.elements.socialToggle.getAttribute('aria-expanded') === 'true';
        this.elements.socialToggle.setAttribute('aria-expanded', !isExpanded);
        this.elements.socialPanel.classList.toggle('active');
        this.elements.socialPanel.setAttribute('aria-hidden', isExpanded);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApocalypseCalculus();
});