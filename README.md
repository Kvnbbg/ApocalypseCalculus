# ApocalypseCalculus
(Axones) Brain Stimulator

![Front](apocalypseCalculusFront.png)

![Apocalypse Calculus Banner](https://via.placeholder.com/1200x400/ff0000/ffffff?text=Apocalypse+Calculus+-+Brain+Stimulator) 

**Apocalypse Calculus** is an infinite, gamified math and physics trainer designed as a **brain stimulator** (inspired by *Axones*—the ancient neural training grounds of the mind). Built for **agentic work**—empowering AI agents, developers, and autonomous systems to sharpen computational reasoning, pattern recognition, and adaptive learning—this web app turns mental math into an endless apocalypse of challenges. Survive waves of derivatives, quantum equations, and non-Euclidean geometry while leveling up your cognitive arsenal.

Whether you're an AI agent training for real-time decision-making, a developer prototyping agentic workflows, or a human user pushing mental limits, Apocalypse Calculus auto-adapts difficulty, provides hints, and teaches through failure. No boredom, just infinite progression.

🚀 **Live Demo**: [Deployed on GitHub Pages](https://kvnbbg.github.io/apocalypseCalculus) *(or host your own via the HTML file)*

## ✨ Features

- **Infinite Challenges**: Procedurally generated problems across math, physics, and beyond—basic arithmetic to advanced derivatives and quantum simulations. Difficulty scales every 10 solves.
- **Gamification & Progression**:
  - Score tracking, streak counters, and level-ups.
  - Progress bar for visual feedback.
  - Encouragement messages to keep momentum high (e.g., "You're a math wizard!").
- **Auto-Learning Mode**: 30-second idle timeout triggers auto-submit and correction—perfect for passive observation and learning without intervention.
- **Rich Math Rendering**: Powered by KaTeX for beautiful, professional display of equations (e.g., \(\frac{d}{dx}(x^2) = 2x\)).
- **Interactive Elements**:
  - Real-time input with hint button.
  - Smooth fade transitions and animations to prevent cognitive fatigue.
- **Agentic Integration**: Embeddable as a micro-app for AI workflows—expose challenges via API hooks (future extension) or run in iframes for autonomous training loops.
- **Themed UI/UX**: Dark, apocalyptic theme with glowing red accents for immersion. Responsive design for desktop/mobile.
- **Core Topics Covered**:
  - **Arithmetic**: Addition, subtraction, multiplication, division, percentages, negatives/positives.
  - **Advanced Math**: Powers, modulo, square roots, logarithms, exponentials, binary conversion, even/odd checks.
  - **Trigonometry**: Sin, cos, tan with variable angles.
  - **Geometry**: Euclidean distances, triangle/circle areas; intro to non-Euclidean (spherical excess).
  - **Calculus**: Polynomial derivatives with symbolic rendering.
  - **Physics**: Kinetic energy, free-fall distance.
  - **Quantum**: Hydrogen atom energy levels.
  - **And More**: Expandable via the operations array in `script.js`.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (with animations/transitions), JavaScript (ES6+).
- **Math Rendering**: [KaTeX](https://katex.org/) for LaTeX-style equations.
- **Deployment**: Single-file HTML—host anywhere (GitHub Pages, Vercel, Netlify).
- **No Backend**: Pure client-side for instant, agentic execution.
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge).

## 🚀 Quick Start

1. **Clone the Repo**:
   ```
   git clone https://github.com/kvnbbg/apocalypseCalculus.git
   cd apocalypseCalculus
   ```

2. **Run Locally**:
   - Open `index.html` directly in your browser (no server needed!).
   - Or serve with a local server:
     ```
     npx serve .  # or python -m http.server 8000
     ```

3. **Deploy**:
   - Push to GitHub and enable GitHub Pages.
   - Or drag `index.html` to any static host.

4. **Customize for Agentic Work**:
   - Edit the `operations` array in `<script>` to add domain-specific challenges (e.g., graph theory for AI pathfinding).
   - Integrate with agents: Use `getRandomOperation()` as a callable function for scripted training.

## 📖 Usage Guide

### For Humans (Brain Training)
- Load the page and start solving challenges in the input field.
- Submit manually or let auto-mode teach you after 30s.
- Build streaks to unlock harder levels—aim for 100+!

### For AI Agents & Developers
- **Training Loop**: Script fetches challenges via DOM manipulation or export `getRandomOperation()` for headless runs.
- **Evaluation**: Compare agent outputs against `result` for reinforcement learning.
- **Example Agentic Snippet** (JavaScript):
  ```js
  // Pseudo-code for agent integration
  const challenge = getRandomOperation();
  const agentGuess = yourAgent.solve(challenge.expr); // Your AI logic here
  const isCorrect = agentGuess === challenge.result;
  if (isCorrect) streak++; else learnFromMistake(challenge);
  ```
- Extend with Web Workers for parallel simulations.

### Keyboard Shortcuts
- `Enter`: Submit answer.
- `H`: Toggle hint.

## 🤝 Contributing

Contributions welcome! This is an open playground for math enthusiasts and agentic AI builders.

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-derivatives`).
3. Commit changes (`git commit -m 'Add quaternion ops for quantum agents'`).
4. Push (`git push origin feature/amazing-derivatives`).
5. Open a Pull Request.

**Ideas**:
- Add integrals or matrix ops.
- Integrate WebGL for visual physics sims.
- API endpoint for agentic batch challenges.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details (create if needed).

## 📄 License

MIT License - Free to fork, modify, and deploy for your agentic empire. See [LICENSE](LICENSE) for details.

## 👋 Acknowledgments

- Built with ❤️ by [Kevin Marville](https://github.com/kvnbbg).
- Powered by KaTeX for math magic.
- Inspired by ancient *Axones* and modern AI training paradigms.

**Connect**: [GitHub](https://github.com/kvnbbg) | [Instagram @techandstream](https://instagram.com/techandstream)

---

*Survive the math apocalypse. Level up your mind (or your agents). ∞* 

---

*(This README is optimized for GitHub rendering—add badges, GIFs, or screenshots for extra flair!)*

## Issues

### Issue 1: [Bug] Derivative Generator Produces Invalid Polynomial Strings for Degree 0 Constants
**#1 opened on Oct 17, 2025 by kvnbbg**

**Description**:  
When generating derivatives for constant polynomials (e.g., \( f(x) = 5 \)), the output string is `'0'` but the TeX rendering fails to wrap it properly, showing raw text instead of \( 0 \). This breaks immersion in agentic training loops where symbolic output is parsed.

**Steps to Reproduce**:
1. Level up to trigger a high-degree poly that rolls a constant.
2. Observe `resultTex` in console: `'0'` without KaTeX delimiters.

**Expected Behavior**: Render as \( 0 \).  
**Impact**: Low (rare), but affects symbolic AI integrations.  
**Priority**: Medium.  
**Labels**: bug, calculus, rendering.

### Issue 2: [Enhancement] Add Integral Operations for Balanced Calculus Coverage
**#2 opened on Oct 17, 2025 by kvnbbg**

**Description**:  
Derivatives are covered, but no antiderivatives/integrals. For agentic work in optimization (e.g., RL reward integrals), add basic indefinite integrals for polynomials and trig functions.

**Proposed Solution**:
- Extend `operations` array with an integral generator using SymPy.js or manual rules.
- Example: \(\int x^2 dx = \frac{x^3}{3} + C\).

**Benefits**: Completes calculus suite; useful for physics sim agents.  
**Difficulty**: Medium (symbolic math).  
**Priority**: High.  
**Labels**: enhancement, calculus, agentic.

### Issue 3: [Feature] Expose RESTful API for Headless Agentic Integration
**#3 opened on Oct 17, 2025 by kvnbbg**

**Description**:  
Current app is UI-only; for true agentic workflows (e.g., LangChain agents or autonomous bots), provide a simple API to fetch challenges/results without browser.

**Proposed Solution**:
- Add `api.js` with endpoints like `/challenge?level=5&topic=quantum`.
- Use Express.js mini-server (or serverless via Vercel).
- Auth via API key for rate-limiting.

**Use Case**: Integrate into AI pipelines for dynamic math-based decision trees.  
**Difficulty**: High (new backend).  
**Priority**: High.  
**Labels**: feature, api, agentic.
