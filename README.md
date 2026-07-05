# Red Velvet Engine - Platform UI 🍒

The next-generation admin and operations console for the **Red Velvet Engine** (RVE) decision engine.

## 🚀 Key Features

* **Live Dashboard**: Real-time health metrics, active rules count, and backend hot-reloads.
* **Rule Builder**: Premium drag-and-drop conditions builder, logic tree explorer, JSON Logic editor, and guard pre-filters.
* **Rule Library**: Flat table and grid explorer with filtering, full search, and bulk operations.
* **Decision Console**: Interactive playground to simulate events, evaluate fraud scores, and trace rule hits.
* **Settings**: Real-time schema contracts and engine configurations.
* **Global Command Palette (`⌘K`)**: Seamless search-as-you-type rule queries, platform navigation, theme toggling, and builder-scoped actions.

## 🛠️ Tech Stack

* **Core**: Next.js 16 (App Router, Turbopack) & React 19
* **State Management**: Zustand
* **Styling**: Tailwind CSS v4 & PostCSS
* **Layout Grid**: FlexLayout-React
* **Interactions**: React DnD (Dnd Provider) & CMDK (Command Palette)

## 📦 Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the console.

## 📖 Documentation

* [Command Palette Guide](docs/command-palette.md) - Learn more about keyboard shortcuts, action triggers, and context features.
