# AGENTS.md

## Instructions for AI and automated contributors

### 1. Mandatory Development Workflow: TDD & Testing
- **Test-Driven Development (TDD)**: Every agent MUST follow a TDD approach. Write or update tests before or alongside implementation.
- **Full Test Coverage**:
  - Run `npm test` for unit tests.
  - Run integration tests (if applicable) before check-in.
  - Run `npm run test:e2e` (or `npm run test:e2e:update-snapshots` to update the snapshots) for E2E tests for any UI or flow changes.
  - Run `npm run typecheck`
  - Run `npm run lint`
- **Visual Verification**: Every UI modification MUST be confirmed visually. Use the browser subagent to check the UI status and perform visual comparison against mockups or expected layouts.
- **Pre-commit Checks**: Run `npm run lint` and `npm run typecheck` to ensure code quality.

### 2. Coding Practices & Architecture
- **Styling**: Prefer **CSS Modules** (`.module.css`) for all components. Avoid inline styles and global CSS unless strictly necessary for base layouts.
- **State Management**:
  - Maintain type-safety in the `GameContext` (Zustand store) or any other relevant context.
  - Use consolidated, explicit reducer cases for state updates to minimize redundancy.
  - Support both numeric and string-based IDs for character loading to ensure compatibility with test mocks and external links.
- **Clean Code**:
  - Be critical of redundancy. Remove unused components, systems, and dependencies aggressively.
  - Avoid hardcoding values; use theme variables or central data files.
- **Theming**: The project uses a dark-first design system (`dark` and `nexus` themes). Ensure any new UI respects CSS variables defined in [theme.ts](file:///home/antonio/src/openroll/src/theme.ts).

### 3. Contributions & Communication
- **Commit Messages**: Start with a short imperative summary line (e.g., "Add character export functionality").
- **Documentation**: Subdirectory-specific `AGENTS.md` files may provide more granular rules for specific subsystems.
- **Artifacts**: Maintain `task.md`, `implementation_plan.md`, and `walkthrough.md` for major tasks to provide clear progress and verification for human reviewers.
