<div align="center">

# 🔄 Recursion Visualizer

**Watch recursion come alive — one call at a time.**

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://github.com/yuvnex/Recursion_Visualizer)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Ready-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-ff69b4?style=for-the-badge)](./CONTRIBUTING.md)

An interactive, browser-based tool that transforms abstract recursive algorithms into stunning visual experiences. Watch the call tree build in real-time, see the call stack grow and shrink, and finally *get* recursion.

[**Live Demo**](https://github.com/yuvnex/Recursion_Visualizer) · [**Report a Bug**](https://github.com/yuvnex/Recursion_Visualizer/issues) · [**Request a Feature**](https://github.com/yuvnex/Recursion_Visualizer/issues)

</div>

---

## 📸 Gallery

| Factorial | Fibonacci |
|:---------:|:---------:|
| ![Factorial Visualization](./public/hr-reference-factorial.png) | ![Fibonacci Visualization](./public/hr-reference-fibonacci.png) |
| *Linear recursion with a single call chain* | *Exponential branching with overlapping subproblems* |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌳 **Dynamic Call Tree** | Nodes reveal parent-child relationships and execution phases in real-time |
| 📚 **Live Call Stack** | Tracks active frames, parameters, and return values as execution unfolds |
| ▶️ **Step-by-Step Playback** | Pause, rewind, and replay any point in the execution |
| 🧩 **Built-in Examples** | Factorial, Fibonacci, Binary Search, Merge Sort, Quick Sort — ready to go |
| ✏️ **Custom Code Editor** | Write your own recursive function and visualize it instantly |
| 🌐 **Multi-Language Support** | JavaScript, Python, Java, and C/C++ (transpiled locally) |
| 🔒 **100% Offline** | All execution and analysis happen in your browser — no server, no API keys |
| 🎨 **Professional UI** | Responsive layouts, smooth animations, and a clean modern design |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yuvnex/Recursion_Visualizer.git

# 2. Navigate into the project
cd Recursion_Visualizer

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open your browser to **[http://localhost:5173](http://localhost:5173)** and start visualizing!

### Production Build

```bash
npm run build    # Compile and optimize for production
npm run preview  # Preview the production build locally
```

---

## 💡 How to Use

### Option 1 — Built-in Examples

Select any pre-loaded algorithm from the sidebar (Fibonacci, Quick Sort, Binary Search, etc.) to immediately see its full execution tree rendered step by step.

### Option 2 — Custom Code

1. Switch to **"Custom Code"** mode in the sidebar.
2. Choose your preferred language from the dropdown.
3. Write or paste your recursive function. Make sure it includes:
   - A **base case** to terminate execution
   - At least one **recursive call**
   - A **function invocation** at the end of the snippet
4. Click **"Analyze & Visualize"** and watch it unfold.

**Example — Factorial in JavaScript:**

```javascript
function factorial(n) {
  if (n <= 1) {
    return 1; // Base case
  }
  return n * factorial(n - 1); // Recursive call
}

factorial(5); // Invoke at the end!
```

### Reading the Visualization

The recursion tree uses color-coded nodes to show exactly where execution is at any given moment:

| Color | Phase | Meaning |
|:-----:|-------|---------|
| 🟠 **Amber** | Calling | Currently executing this frame |
| 🟣 **Purple** | Returning | Unwinding — returning a value |
| 🟢 **Green** | Base Case | Recursion terminates here |
| ⚫ **Gray** | Complete | Frame fully resolved |

> **Tip:** The **Code Editor** panel highlights the active line in sync with each step — green for base cases, blue for recursive calls.

---

## 🛠️ Architecture

```
src/
├── api/
│   └── llmClient.js          # Unified analysis interface (delegates to local engine)
├── components/
│   └── recursion/
│       └── ExampleSelector.jsx   # Built-in algorithm examples registry
└── lib/
    ├── codeRunner.js         # Transpilation engine + sandboxed JS execution + tracing
    └── recursionTreeBuilder.js   # Tree structure computation + execution timeline
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS + Radix UI |
| **Animations** | Framer Motion |
| **Execution** | Custom JS sandbox transpiler (no external runtime) |

---

## ⚠️ Known Limitations

These safeguards exist to ensure smooth performance in the browser:

- **Max recursion depth** is capped at **500 calls** to prevent stack overflows.
- **Single function tracing** — the engine traces one primary recursive function per run.
- **Simple recursion only** — complex cross-function mutual recursion may not trace correctly.
- **Parameter rendering** — best suited for primitives and basic arrays; deeply nested objects may render partially.

---

## 🤝 Contributing

Contributions are warmly welcome! Here are two common ways to get involved:

### ➕ Add a New Built-in Example

Open `src/components/recursion/ExampleSelector.jsx` and add an entry to the `EXAMPLES` array:

```javascript
{
  id: "your-algorithm",
  name: "Your Algorithm",
  difficulty: "Medium",       // "Easy" | "Medium" | "Hard"
  description: "Brief description of what this algorithm does.",
  input: 6,
  code: `function yourAlgorithm(n) { ... }\nyourAlgorithm(6);`
}
```

### 🌐 Extend Language Support

Open `src/lib/codeRunner.js` and update the `transpileToJS()` switch statement with a new case for your language, including detection patterns and transpilation logic.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with ❤️ to make learning algorithms more intuitive and accessible.

*If this project helped you, consider giving it a ⭐ on GitHub!*

</div>
