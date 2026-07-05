# RVE Platform - Command Palette

An elegant, high-fidelity command palette built with `cmdk` that serves as the navigation and quick-actions hub for the Red Velvet Engine Management Console.

---

## ⌨️ Shortcuts & Interaction

| Shortcut / Action | Action |
|---|---|
| `⌘ K` / `Ctrl + K` | **Toggle command palette** globally from any page |
| `↓` / `↑` | **Navigate** through list commands and groups |
| `↵` (Enter) | **Select** and execute highlighted action |
| `ESC` | **Dismiss** command palette overlay |

---

## ✨ Features

### 1. Global Navigation (Shortcuts: `G` then Key)
Allows lightning-fast switching between platform dashboards:
* **Dashboard**: `G` + `D`
* **Rule Library**: `G` + `L`
* **Rule Builder**: `G` + `B`
* **Decision Console**: `G` + `C`
* **Settings**: `G` + `S`

### 2. Live Rule Search (Search-as-you-type)
Automatically fetches rules from the engine's Redis store on load. Enables searching rules instantly by name or code and navigating straight to their **Inspector** details page.

### 3. Global Engine & Theme Actions
* **Reload Decision Engine (`Shift + R`)**: Hot-reloads the backend fraud rules from Redis.
* **Toggle Theme (`T + T`)**: Switches color palettes instantly between Dark Mode and Light Mode.
* **Create New Rule (`C + R`)**: Wipes the current builder state draft and redirects to the editor.

### 4. Contextual Rule Builder Commands (Available only on `/rules/builder`)
* **Save Changes (`⌘ S`)**: Triggers rule saving in the builder page.
* **Execution Mode Setting**: Updates the active draft's policy execution mode:
  * Set Mode: **Active**
  * Set Mode: **Staged**
  * Set Mode: **Suspended**
  * Set Mode: **Deactivated**

---

## 🛠️ Architecture & Files

The Command Palette is designed using a decoupled event-driven system to prevent state polluting and allow global mounting:

### 1. Transient Visibility Store
Defined in [`command-palette-store.ts`](file:///home/undead34/Projects/RVE%20Project/rve-platform/lib/stores/command-palette-store.ts). Operates as a simple, transient (non-persisted) Zustand store to control the menu overlay visibility state.

### 2. Global Mounting
Rendered inside the root [`app-shell.tsx`](file:///home/undead34/Projects/RVE%20Project/rve-platform/components/layout/app-shell.tsx) wrapper. This ensures the keyboard listeners and glassmorphic overlay elements are mounted across all platform routes.

### 3. Custom Decoupled Events (Save System)
Rather than tightly coupling the palette with builder-specific CRUD hooks, the command palette dispatches a custom browser event:
* Dispatches: `window.dispatchEvent(new CustomEvent("rve-save-rule"))`
* Listened in: [`builder/page.tsx`](file:///home/undead34/Projects/RVE%20Project/rve-platform/app/(platform)/rules/builder/page.tsx) to run `handleSave()` on the loaded draft.

### 4. Glassmorphic CSS Theme
All styles are fully custom and defined at the bottom of [`globals.css`](file:///home/undead34/Projects/RVE%20Project/rve-platform/app/(platform)/globals.css). Features backdrop blur filters, theme-aware border highlights, elevated surfaces, and scale-up animations.
