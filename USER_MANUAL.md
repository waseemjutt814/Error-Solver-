# 📘 Error Solver: Comprehensive User Manual

Welcome to **Error Solver**, built by Waseem Akram. This manual explains exactly *why* this tool exists, how the architecture works, and every command you need to use it effectively.

---

## 🤔 1. Why Error Solver? (The Philosophy)

### The Problem with Modern Development
When you open a large React, Next.js, or Node project built by someone else (or even your past self), the hardest part isn't reading the code—it's understanding the **Flow**. 

- *If I click this login button, what file does it trigger next?*
- *Where is the API called?*
- *Did I accidentally leave a dead file in my project?*

Traditionally, developers spend hours tracing imports and exports just to fix a simple bug. 

### The Error Solver Solution
Error Solver forces you to write **Self-Documenting Code** using a strict numbering system. By naming your files intelligently, the hidden engine automatically maps your entire project into a beautiful, interactive visual graph.

You will never have to guess "what connects to what" again. If a link is broken, the engine warns you before your code even runs!

---

## 🏗️ 2. The Project Structure Explained

To keep your workspace clean and professional, we separated the messy "tool" logic from your actual code.

```
your-project/
│
├── .error-solver/         ← 🛑 DO NOT TOUCH. This is the hidden Engine.
│                            It contains the TypeScript analyzer and Frontend Graph.
│
├── src/                   ← ✅ YOUR WORKSPACE.
│   ├── 01_components/     (UI elements like Buttons, Cards)
│   ├── 02_hooks/          (React Hooks like useAuth)
│   ├── 03_pages/          (Screens like HomePage)
│   ├── 04_services/       (API calls, DB queries)
│   └── 05_utils/          (Helper functions)
│
├── package.json           ← Project scripts and dependencies
├── USER_MANUAL.md         ← You are here!
└── README.md              ← Quick overview
```

---

## 🏷️ 3. The File Naming Convention (Crucial)

Every file you create inside `src/` MUST follow this exact format:
**`[ID]_[Name]_[INPUT]to[OUTPUT].ext`**

### The 4 Parts of a File Name
1. **ID**: A unique ~3-digit number (e.g., `001`, `050`). You cannot repeat this.
2. **Name**: What the file does (e.g., `LoginButton`, `FetchUser`).
3. **INPUT**: The ID of the file that triggers this one.
4. **OUTPUT**: The ID of the file this one triggers next.

### Example Names
* `001_LoginButton_STARTto002.tsx` (Entry point, connects to 002)
* `002_useAuthForm_001to003.ts` (Takes 001, passes to 003)
* `003_AuthAPI_002toEND.ts` (Takes 002, ends the flow)

### Special Keywords
- **`START`**: Use this for Entry Points (e.g., a button click, a page load, a server route).
- **`END`**: Use this for Exit Points (e.g., saving to a database, rendering UI on screen).
- **`MULT`**: Use this for shared files. For example, if a utility function `FormatDate` is used by 50 different files, name it `500_FormatDate_MULTtoMULT.ts`. 

---

## 💻 4. Command Reference

Before running anything, make sure you install dependencies (The engine runs on TypeScript!):
```bash
npm install
```
*(Or `pnpm install`, `yarn install`)*

Once modules are installed, use the following commands:

### `npm run audit`
**What it does:** Runs the hidden 8-point Error Solver Engine.
**When to use it:** Use this frequently as you build your app.
**What it checks for:**
1. **File Mismatches**: Warns you if a numbered file is missing.
2. **Connectivity Issues**: Warns you if `001` flows to `002`, but `002` doesn't exist.
3. **Orphans/Dead Code**: Warns you if a file exists on your disk but isn't connected to the flow.
4. **Duplicate IDs**: Warns you if you used `004` twice.
5. **ID Gaps**: Warns you if your numbering skips numbers (e.g., `005` to `007`).
6. **Flow Tracing**: Maps the entire pipeline from START to END and catches infinite loops.

### `npm run dashboard`
**What it does:** Tells you exactly where the visual frontend is located.
**How to use:** Go to your file explorer, open `.error-solver/dashboard/`, and double-click `index.html`. It will instantly open a beautiful visual graph of your codebase in Chrome/Edge/Firefox. No backend server required!

---

## 🚫 5. Best Practices & Things to Avoid

- **DO NOT** edit code inside `.error-solver/`. It is a strict TypeScript engine.
- **DO NOT** create a file named `Login.tsx`. Error Solver will ignore it because it doesn't follow the numbered pipeline rule.
- **DO** keep your numbers structured. Keep Components in the `000s`, Hooks in the `100s`, Pages in the `200s`, etc.
- **DO** run `npm run audit` before making a Git Commit to ensure your codebase is structurally sound.

---

> *"Plan your architecture before you write the code. Error Solver visually enforces the plan."* — Waseem Akram
