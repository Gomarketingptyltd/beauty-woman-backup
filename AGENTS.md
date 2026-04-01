# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project Overview

This is a **React single-page application** (Create React App) serving as a landing/marketing page. It renders a single route (`/`) composed of several section components. The optional `Contact` component (EmailJS-powered) is present but currently disabled.

## Tech Stack

- **Language:** JavaScript (no TypeScript)
- **UI:** React 18
- **Routing:** React Router v6
- **Tooling:** Create React App 5 (`react-scripts` 5.0.1)
- **Email:** `@emailjs/browser` (used in `Contact` component)
- **Testing:** Jest + React Testing Library (infrastructure wired; no test files yet)
- **Styling:** Plain CSS, one `.css` file per component

## Repository Structure

```
src/
  index.js                    # App entry point (React root, BrowserRouter)
  App.js                      # Route definitions (single route: / → HomePage)
  App.css / index.css         # Global styles
  views/
    HomePage.js               # Composes all page sections
  components/
    Header/                   # Site header
    Banner/                   # Hero banner section
    Service/                  # Services section (SVG assets in src/assets/service/)
    Rate/                     # Rates/pricing section (SVG assets in src/assets/rate/)
    Girl/                     # Additional content section
    About/                    # About section
    Contact/                  # EmailJS contact form (currently commented out in HomePage)
public/
  index.html                  # HTML shell (root div, meta tags)
  logo.svg                    # Static logo
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (hot reload, default port 3000)
npm start

# Production build (outputs to build/)
npm run build

# Run tests
npm test
```

## Code Conventions

- Each component lives in its own folder under `src/components/` with a matching `.css` file (e.g. `Header/Header.js` + `Header/Header.css`).
- Styles are scoped per component via plain CSS; avoid adding global styles to `App.css` or `index.css` unless they truly apply site-wide.
- No TypeScript — keep all new files as `.js`.
- ESLint is configured via `react-app` preset (enforced by `react-scripts`). Fix all lint warnings before committing.

## Adding New Sections / Components

1. Create a new folder under `src/components/<ComponentName>/` containing `<ComponentName>.js` and `<ComponentName>.css`.
2. Import and render the component in `src/views/HomePage.js`.
3. If the component needs new SVG assets, place them under `src/assets/<section-name>/`.

## Enabling the Contact Form

The `Contact` component is fully implemented but disabled. To enable it:

1. Uncomment the `Contact` import and JSX in `src/views/HomePage.js`.
2. Set the EmailJS credentials (service ID, template ID, public key) inside `src/components/Contact/Contact.js`.
3. Consider using environment variables (`.env`) to avoid hardcoding credentials — CRA automatically exposes variables prefixed with `REACT_APP_` to the browser bundle.

## Testing

No test files exist yet. New tests should be placed alongside their component as `<ComponentName>.test.js`. The testing stack (Jest + React Testing Library) is already installed and ready.

## Environment Variables

CRA reads `.env` files at the project root. Any variable prefixed with `REACT_APP_` is available in the bundle as `process.env.REACT_APP_<NAME>`. Never commit secrets directly to source files.

## What to Avoid

- Do **not** run `npm run eject` — it permanently exposes the CRA webpack config and cannot be undone.
- Do **not** import from `node_modules` paths that are not listed as dependencies in `package.json`.
- Do **not** commit the `build/` directory or `node_modules/` (both are in `.gitignore`).
