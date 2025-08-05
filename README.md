# Synergym Frontend Web

AI-Powered Fitness Platform - React TypeScript Frontend

This is the frontend web application for **Synergym**, an AI-based fitness coaching and analysis platform. Built with React 19, TypeScript, and Vite, it delivers a modern and responsive user experience optimized for performance and accessibility.

---

## Getting Started

### Prerequisites

* Node.js 18+
* pnpm (recommended) or npm

### Installation & Running

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint
```

---

## Tech Stack

### Core Frameworks

* React 19
* TypeScript
* Vite
* React Router DOM

### UI & UX

* Tailwind CSS 4
* Radix UI (accessible headless UI components)
* Lucide React & React Icons (icon libraries)
* Sonner (toast notifications)
* React Confetti (celebration effects)

### State & Data Management

* Zustand (lightweight state management)
* TanStack Query (server state management)
* Axios (HTTP client)

### Utilities

* date-fns (date handling)
* class-variance-authority, clsx, tailwind-merge (class utilities)
* React Markdown (markdown rendering)

### Internationalization & Charts

* i18next & react-i18next
* Recharts (data visualization)

---

## Project Structure

```
src/
├── api/                 # API interfaces
├── components/          # Reusable UI components
├── config/              # Configuration files
├── hooks/               # Custom React hooks
├── lib/                 # External libraries or wrappers
├── pages/               # Page-level components
├── services/            # Business logic and API calls
├── store/               # Global state stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main app component
└── main.tsx             # Application entry point
```

---

## Key Features & Pages

### Authentication & User Management

* `Login.tsx` - User login
* `Signup.tsx`, `Signup2.tsx` - Multi-step registration
* `FindCredentials.tsx` - Recover account credentials
* `OAuth2RedirectHandler.tsx` - OAuth2 login handler
* `SocialSignupPage.tsx` - Social registration
* `MyPage.tsx` - User dashboard
* `EditProfilePage.tsx` - Edit profile

### Workout & Analysis

* `Home.tsx` - Homepage
* `Dashboard.tsx` - Personalized dashboard
* `PhotoUpload.tsx` - Upload workout photos
* `AnalysisResultPage.tsx` - View AI results
* `AnalysisSharePage.tsx` - Share analysis
* `ExerciseListPage.tsx` - Browse exercises
* `ExerciseDetailPage.tsx` - Exercise detail view

### Routine Management

* `RoutineCreatePage.tsx` - Create routines
* `RoutineDetailPage.tsx` - View routine details
* `RoutineEditPage.tsx` - Edit existing routines
* `GoalRecommendationPage.tsx` - Personalized goal suggestions

### Community

* `CommunityPage.tsx` - Main community feed
* `CommunityDetailPage.tsx` - Post details
* `CommunityWritePage.tsx` - Create new post

### Admin Tools

* `AdminDashboard.tsx` - Admin home
* `MemberManagementPage.tsx` - Manage members
* `CommunityManagementPage.tsx` - Manage posts
* `MemberStatsPage.tsx` - View user statistics
* `PopularContentsPage.tsx` - Trending content

---

## Development Environment

### Vite Configuration (`vite.config.ts`)

```ts
alias: {
  "@": path.resolve(__dirname, "./src")
},
server: {
  host: '0.0.0.0',
  port: 5173,
  hmr: {
    protocol: 'ws',
    host: '192.168.2.168',
    port: 5173,
  }
}
```

### ESLint & TypeScript

* ESLint 9+ with React rules
* TypeScript 5.8+ with strict mode

---

## Design System

### Tailwind CSS 4

* Utility-first styling
* Responsive design
* Light/Dark theme support

### Component Libraries

* Radix UI: Accessible headless components

  * Dialog, Dropdown, Select, Checkbox, Switch, etc.
* Custom Components: Modular and reusable UI pieces

---

## Internationalization

Supported Languages:

* English
* Korean

Implemented using `i18next` and `react-i18next`.

---

## State Management

### Zustand

* Lightweight and scalable global state
* TypeScript friendly

### TanStack Query

* Powerful server-state management
* Built-in caching, background refetching, and error handling

---

## Development Guidelines

### Code Style

```bash
# Run linter
pnpm lint

# Auto formatting (if configured)
pnpm format
```

### Type Safety

* Strict typing across all components and functions
* Typed API responses

#### Example Typed Component

```tsx
interface Props {
  title: string;
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {title}
    </button>
  );
};
```

---

## Deployment

### Build

```bash
pnpm build
```

### Environment Variables

```
# .env.local
VITE_API_URL=http://localhost:8080
VITE_AI_API_URL=http://localhost:8000
```

---

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Write and test your code
3. Run linter: `pnpm lint`
4. Commit: `git commit -m "feat: Add new feature"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

---

## License

MIT License

---

Powered by Vite + React + TypeScript
