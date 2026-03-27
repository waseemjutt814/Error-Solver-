# 🔗 Error Solver — Professional React Architecture

**Created by Waseem Akram**

> *A brilliantly simple, strictly-numbered file architecture that generates a visual map of your entire project. Keep your codebase 100% clean and instantly debuggable.*

---

## 🌟 The Philosophy
In massive projects, figuring out "who calls what" takes hours. **Error Solver** fixes this by enforcing a strict, numbered file naming convention, giving you a **beautiful UI Dashboard** to visualize the whole flow automatically. 

**This repository is your empty workspace.** The complex engine is hidden away in `.error-solver/`, leaving your root folder perfectly clean and ready for your next React/Node project.

---

## 📂 Project Architecture

```
my-next-big-app/
│
├── 📁 .error-solver/                 ← ⚙️ MAGIC ENGINE (Hidden)
│   ├── engine/                       Waseem's 10/10 TypeScript Engine
│   └── dashboard/                    The visual HTML frontend
│
├── 📁 src/                           ← 💻 YOUR ACTUAL CODE GOES HERE 
│   ├── 01_components/                Reusable UI
│   ├── 02_hooks/                     Custom React Hooks
│   ├── 03_pages/                     Screens/Routes
│   ├── 04_services/                  APIs and DB
│   └── 05_utils/                     Helpers
│
├── package.json                      ← Just run `npm run audit`
└── README.md                         ← You are here!
```

---

## 🚀 Quick Start

### Step 1: Write Code Inside `src/`
Navigate to the `src/` folders and create your files. **Name them like this:**
```
[ID]_[Name]_[INPUT]to[OUTPUT].ts

Example:
001_LoginButton_STARTto002.tsx  ← Entry point (Button clicks)
002_useAuth_001to003.ts         ← Middle logic
003_AuthAPI_002toEND.ts         ← Exit point (Network request)
```

Each folder in `src/` has a `README.md` explaining typical naming conventions for that specific layer.

### Step 2: Audit Your Pipeline
Open your terminal at the root of the project:
```bash
npm run audit
```
This runs the hidden 8-point engine. It checks for:
- ❌ Missing files
- ❌ Orphaned/Abandoned code
- ❌ ID duplicates (e.g. two `005`s)
- ❌ Broken connections (e.g. `001` flows into `002` but `002` doesn't exist)
- ✅ Prints a full connectivity map!

### Step 3: Open the Dashboard 🪄
```bash
npm run dashboard
```
This tells you exactly where the visual dashboard is located (`.error-solver/dashboard/index.html`). Double-click that file in your file explorer to see your entire project as an interactive graph!

---

## 🎯 The "Language" of Error Solver

| Keyword | What it means | Example |
|------|--------------|----------|
| `001` | File ID (Must be 3+ digits) | `001`, `050`, `999` |
| `START`| **Only** for origin points (clicks, server entry) | `001_Button_STARTto002.tsx` |
| `END`  | **Only** for exit points (DB save, unmount) | `099_SaveDB_098toEND.ts` |
| `MULT` | Used when MANY files connect | `050_Session_MULTtoMULT.ts` |

---

## 👨‍💻 About The Creator

**Waseem Akram**  
Built with a passion for clean, structured, and beginner-friendly code architecture. This template proves that you don't need messy roots or massive frameworks to have a world-class developer experience — just smart naming, a hidden engine, and a good plan!

**License:** MIT — Free forever.
