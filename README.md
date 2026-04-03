# Recursion Visualizer

An interactive tool to visualize how recursive functions execute step by step. Watch the call tree build, see the stack grow and shrink, and understand recursion from the ground up.

**100% Offline** — No API keys required. Works entirely in your browser.

---

## Features

✨ **Interactive Recursion Visualization**
- Real-time animation of recursive calls and returns
- Visual recursion tree showing parent-child relationships
- Call stack visualization
- Execution log with detailed step tracking

🎯 **Built-In Examples**
- Factorial
- Fibonacci
- Binary Search
- Sum Array
- Power Function

💻 **Multi-Language Support**
- JavaScript (full support)
- Python (transpiled to JS)
- Java (transpiled to JS)
- C / C++ (transpiled to JS)

🎮 **Full Execution Control**
- Run automatically or step through manually
- Adjustable animation speed (0.25x to 2x)
- Pause, resume, and reset at any time
- Real-time step counter

🎨 **Professional UI**
- Clean, modern design
- Responsive layout
- Smooth animations
- Color-coded execution phases

---

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173` and start visualizing!

### Build for Production

```bash
npm run build
npm run preview
```

---

## How to Use

### 1. Select an Example

Choose from the built-in examples (Factorial, Fibonacci, etc.) to see them in action immediately.

### 2. Custom Code

Paste your own recursive function and watch it visualize:

1. Switch to **"Custom Code"** mode
2. Select your programming language
3. Paste your recursive function
4. Add a function call at the end (e.g., `factorial(5);`)
5. Click **"Analyze & Visualize"**

### Writing Recursive Functions

Your code must have:
- **One recursive function** (clearly defined with parameters)
- **A base case** (termination condition)
- **Recursive calls** (at least one self-call)
- **A function invocation** (a call to the function at the end)

**Example (JavaScript):**
```javascript
function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// Function call at the end
factorial(5);
```

### Understanding the Visualization

**Recursion Tree:**
- Shows the complete call hierarchy
- Colored nodes indicate execution phase:
  - 🟠 **Amber**: Currently executing (calling)
  - 🟣 **Purple**: Currently returning
  - 🟢 **Green**: Base cases
  - ⚫ **Gray**: Completed calls
- Depth numbers show nesting level

**Call Stack:**
- Shows the current stack of active function calls
- Updates as functions are called and return
- Displays parameters for each call
- Shows return values when available

**Execution Log:**
- Records every step in the execution
- Shows calls, returns, and base cases
- Useful for understanding execution order

**Code Editor:**
- 🟢 Green lines: Base case conditions
- 🔵 Blue lines: Recursive function calls
- Highlights current line during execution

---

## Architecture

### Core Files

**`src/lib/codeRunner.js`**
- Detects recursive function name and entry point
- Transpiles non-JS languages to JavaScript
- Instruments code to trace execution
- Executes in sandboxed context

**`src/lib/recursionTreeBuilder.js`**
- Converts execution steps to tree structure
- Computes tree depth and relationships
- Validates tree consistency
- Generates execution timeline

**`src/api/llmClient.js`**
- Provides unified analysis interface
- 100% offline (no external APIs)
- Delegates to local execution engine

**Components:**
- `RecursionTree.jsx` — Tree visualization
- `CallStack.jsx` — Stack display
- `ExecutionLog.jsx` — Step log
- `CodeEditor.jsx` — Code display with highlighting
- `ControlPanel.jsx` — Play/pause/step controls
- `CustomCodePanel.jsx` — Custom code input
- `ExampleSelector.jsx` — Built-in example selection

### Data Flow

```
User Code
    ↓
runCodeLocally() [codeRunner.js]
    ├→ Detect function name
    ├→ Transpile to JavaScript
    ├→ Instrument code
    └→ Execute with tracing
    ↓
Execution Steps
    ↓
buildRecursionTree() [recursionTreeBuilder.js]
    ↓
Tree Structure
    ↓
React Components (Visualization)
```

---

## Supported Languages & Patterns

### JavaScript
- Full ES6 syntax support
- Arrow functions, async/await
- Class methods

### Python
- Indentation-based blocks converted to JS
- `if`/`elif`/`else` statements
- `while` and `for` loops
- Boolean operators: `and`, `or`, `not`

### Java
- Type declarations stripped
- Access modifiers removed
- Class/method wrappers handled
- Arrays and parameters normalized

### C / C++
- Preprocessor directives removed
- Function signatures normalized
- Type casts removed
- Pointer syntax handled

---

## Limitations & Known Issues

- **Maximum recursion depth**: 500 calls (prevents browser crashes)
- **Simple recursion only**: Complex nested function calls may not trace correctly
- **Single function requirement**: Only traces one recursive function per execution
- **Parameter inference**: Limited to simple types (numbers, strings, arrays, objects)

---

## Code Quality

- ✅ **Modular Architecture**: Clear separation of concerns
- ✅ **Well Documented**: Comprehensive comments throughout
- ✅ **Type-Safe Patterns**: Consistent data structures
- ✅ **Error Handling**: Graceful degradation with helpful messages
- ✅ **Performance**: Optimized rendering with memoization
- ✅ **Accessibility**: Semantic HTML, keyboard support

---

## Technologies

- **React** 18 — UI framework
- **Vite** — Build tool & dev server
- **Framer Motion** — Animations
- **Tailwind CSS** — Styling
- **Radix UI** — Component primitives
- **JavaScript** — Code transpilation & execution

---

## Project Structure

```
recursion-visualizer/
├── src/
│   ├── api/
│   │   └── llmClient.js          # Code analysis interface
│   ├── components/
│   │   ├── recursion/             # Main UI components
│   │   │   ├── RecursionTree.jsx
│   │   │   ├── CallStack.jsx
│   │   │   ├── ExecutionLog.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── CustomCodePanel.jsx
│   │   │   ├── ExampleSelector.jsx
│   │   │   └── ModeToggle.jsx
│   │   └── ui/                    # Shadcn/UI components
│   ├── lib/
│   │   ├── codeRunner.js          # Execution engine
│   │   ├── recursionTreeBuilder.js # Tree generation
│   │   └── utils.js
│   ├── pages/
│   │   └── RecursionVisualizer.jsx # Main page
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Contributing & Development

### Adding a New Example

Edit `src/components/recursion/ExampleSelector.jsx`:

```javascript
{
  id: 'myFunction',
  name: 'My Function',
  difficulty: 'Beginner',
  description: 'Short description',
  input: 5,
  code: `function myFunction(n) { ... }`
}
```

Then add a simulator in `src/pages/RecursionVisualizer.jsx`:

```javascript
const simulators = {
  myFunction: (input) => {
    const steps = []
    // ... trace execution
    return steps
  }
}
```

### Extending Language Support

Edit `src/lib/codeRunner.js` and add transpiler functions for new languages in:
- `transpileToJS()` switch statement
- Language detection patterns

---

## Troubleshooting

**"Could not find recursive function"**
- Ensure the function is defined with a clear name
- Make sure it calls itself at least once

**"No function call found"**
- Add a function invocation at the end
- Example: `factorial(5);`

**"Recursion exceeded 500 calls"**
- Your input value is too large
- Try a smaller input (e.g., 5 instead of 20 for Fibonacci)

**Code won't execute**
- Try converting to JavaScript first
- Check for syntax errors in your code
- Ensure base case terminates properly

---

## License

MIT

---

## FAQ

**Q: Does this require internet?**  
A: No. Everything runs locally in your browser. No data is sent anywhere.

**Q: Can I visualize any recursive function?**  
A: Yes, as long as it's valid code in a supported language and has a clear base case.

**Q: How deep can the recursion go?**  
A: Up to 500 calls. This prevents browser slowdowns and crashes.

**Q: Can I export the visualization?**  
A: Currently, screenshots are your best option. Video recording is planned for future versions.

---

Built with ❤️ to help students understand recursion.


```bash
mkdir recursion-visualizer
cd recursion-visualizer
```

### 2. Copy all files

Copy all the files provided in this project into the folder above.

> **Important:** also copy the entire `src/components/ui/` folder from the
> original project — it contains ~40 shadcn/ui components that are unchanged.

### 3. Install dependencies

```bash
npm install
```

This installs React, Vite, Tailwind, framer-motion, lucide-react, etc.
**There are no longer any `@base44/` packages** — those have all been removed.

### 4. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env`. You have two options:

#### Option A — Use only pre-saved traces (no API key needed)
Leave `VITE_ANTHROPIC_API_KEY` blank. The app will only analyze functions that
are already in `src/data/customAnalysis.json`.

#### Option B — Use live Anthropic AI for any code
Get a free API key at <https://console.anthropic.com/> and paste it:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
```

### 5. Run the dev server

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## Customizing Your Data

### Add more pre-saved traces

Edit `src/data/customAnalysis.json`. Each entry looks like:

```json
{
  "language": "javascript",
  "inputCall": "myFunction(3)",
  "response": {
    "functionName": "myFunction",
    "inputCall": "myFunction(3)",
    "steps": [
      {
        "type": "call",
        "nodeId": 0,
        "parentId": null,
        "label": "myFunction(3)",
        "params": { "n": 3 },
        "isBaseCase": false
      },
      {
        "type": "return",
        "nodeId": 0,
        "value": 6
      }
    ]
  }
}
```

**Step rules:**
- Every `"call"` step must be followed eventually by a `"return"` step with the same `nodeId`
- Children are called between their parent's `"call"` and `"return"`
- `"parentId": null` means root node
- Set `"isBaseCase": true` on the base case nodes

### Change built-in examples

Edit `src/components/recursion/ExampleSelector.jsx` — the `EXAMPLES` array at the top.

### Change the default example

In `src/pages/RecursionVisualizer.jsx`, the first line of `EXAMPLES[0]` is used
on load. Reorder the array in `ExampleSelector.jsx` to change it.

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static host (Netlify, Vercel, GitHub Pages, etc.)

---

## What Was Removed from the Original Base44 Version

| Removed | Replaced with |
|---|---|
| `@base44/sdk` package | nothing — not needed |
| `@base44/vite-plugin` package | nothing — not needed |
| `src/api/base44Client.js` | `src/api/llmClient.js` (local JSON + Anthropic) |
| `src/lib/AuthContext.jsx` | removed — no login required |
| `src/lib/NavigationTracker.jsx` | removed — no analytics |
| `src/lib/app-params.js` | removed — no Base44 app ID needed |
| `src/App.jsx` (auth flow) | simplified `src/App.jsx` |
| `src/pages.config.js` | removed — routes handled directly in App.jsx |

Everything else (all UI components, all visualizer logic) is identical.
