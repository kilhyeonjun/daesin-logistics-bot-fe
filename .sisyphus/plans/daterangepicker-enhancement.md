# DateRangePicker Enhancement Plan

## TL;DR

> **Quick Summary**: Enhance DateRangePicker with year dropdown navigation, editable date inputs, and preset quick-selection buttons (최근 1개월/6개월/1년) for improved UX on mobile.
> 
> **Deliverables**:
> - Enhanced `DateRangePicker.tsx` with presets and editable inputs
> - Updated `Calendar.tsx` with year dropdown support
> - New `select.tsx` shadcn component
> 
> **Estimated Effort**: Medium (4-6 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (Select) → Task 2 (Calendar) → Task 3 (DateRangePicker) → Task 4 (Build/Test) → Task 5 (Commit)

---

## Context

### Original Request
User wants to improve date selection calendar on migration page with:
1. Year navigation (dropdown)
2. Direct date input fields
3. Preset buttons for quick date range selection (최근 1개월, 6개월, 1년)

### Interview Summary
**Key Discussions**:
- Year navigation: User chose **dropdown** over << >> buttons
- Direct input: **Replace display box** with editable inputs (not separate fields)
- Presets: **Horizontal layout above calendar**
- Preset calculation: **Today going back** (e.g., today ~ 1 month ago)
- Mobile-first design priority
- Include build verification + commit & push

**Research Findings**:
- react-day-picker v9.13.0 supports `captionLayout="dropdown"` with `startMonth`/`endMonth`
- Need custom `Dropdown` component prop for shadcn styling integration
- Project has Input, Button but **no Select component** - must add
- Korean locale already configured in Calendar.tsx

### Technical Stack
- Next.js 16.1.4, React 19.2.3
- react-day-picker v9.13.0
- date-fns v4.1.0
- shadcn/ui pattern (Radix UI + Tailwind)
- Build: `next build`, Test: `vitest run`, Lint: `eslint`

---

## Work Objectives

### Core Objective
Enhance the DateRangePicker component with year navigation, direct date input, and preset quick-selection buttons while maintaining mobile-first design and existing validation constraints.

### Concrete Deliverables
1. `src/components/ui/select.tsx` - New shadcn Select component
2. `src/components/ui/calendar.tsx` - Updated with year dropdown support
3. `src/components/input/DateRangePicker.tsx` - Enhanced with presets and editable inputs

### Definition of Done
- [ ] Year dropdown navigates calendar when year selected
- [ ] Date inputs accept YYYY.MM.DD format and update calendar
- [ ] Preset buttons set correct date ranges
- [ ] All presets respect 365-day limit
- [ ] Future dates remain disabled
- [ ] Mobile-friendly layout (touch targets, responsive)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Changes committed and pushed

### Must Have
- Year dropdown navigation in calendar header
- Editable start/end date inputs
- Three preset buttons: 최근 1개월, 최근 6개월, 최근 1년
- Mobile-responsive layout
- Korean locale maintained

### Must NOT Have (Guardrails)
- Time selection (out of scope)
- Multiple month view (keep numberOfMonths=1)
- Year << >> buttons (user chose dropdown)
- Separate input fields (user chose replacing display box)
- Changes to NewMigrationForm.tsx validation logic (keep as-is)
- New external dependencies (use existing date-fns, shadcn pattern)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **User wants tests**: NO (focus on build verification)
- **Framework**: vitest
- **QA approach**: Automated verification via build + manual browser check

### Automated Verification Only

Each TODO includes EXECUTABLE verification:

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **Component Changes** | `npm run build` | Build must complete without errors |
| **Lint Check** | `npm run lint` | No lint errors |
| **Visual/Functional** | Playwright browser | Navigate and interact with calendar |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Add shadcn Select component

Wave 2 (After Wave 1):
├── Task 2: Update Calendar with year dropdown support
└── Task 3: Enhance DateRangePicker (can start structure, finishes after Task 2)

Wave 3 (After Wave 2):
└── Task 4: Build and lint verification

Wave 4 (After Wave 3):
└── Task 5: Commit and push changes

Critical Path: Task 1 → Task 2 → Task 3 → Task 4 → Task 5
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 3 (partial) | 3 (structure only) |
| 3 | 1, 2 | 4 | None |
| 4 | 3 | 5 | None |
| 5 | 4 | None | None |

---

## TODOs

- [ ] 1. Add shadcn Select Component

  **What to do**:
  - Install `@radix-ui/react-select` dependency (NOT currently installed)
  - Create `src/components/ui/select.tsx` following shadcn pattern
  - Include SelectTrigger, SelectContent, SelectItem, SelectValue exports
  - Style with Tailwind matching existing component patterns

  **Must NOT do**:
  - Deviate from shadcn component patterns
  - Install unrelated dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation, well-defined shadcn pattern to follow
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Component creation following design system patterns
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed until final commit task

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation for other tasks)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/ui/button.tsx` - shadcn component pattern (buttonVariants, cn usage)
  - `src/components/ui/input.tsx` - Simple shadcn component structure

  **External References**:
  - shadcn Select: https://ui.shadcn.com/docs/components/select
  - Radix Select: https://www.radix-ui.com/primitives/docs/components/select

  **WHY Each Reference Matters**:
  - button.tsx shows how to use `cn()` utility and variant patterns
  - input.tsx shows minimal component wrapper approach
  - shadcn docs have exact code to adapt

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # 1. Verify dependency installed
  grep "@radix-ui/react-select" package.json
  # Assert: Dependency found in package.json

  # 2. Verify file exists
  ls src/components/ui/select.tsx
  # Assert: File exists

  # 3. Verify exports
  grep -E "export.*(Select|SelectTrigger|SelectContent|SelectItem|SelectValue)" src/components/ui/select.tsx
  # Assert: All 5 exports found

  # 4. Verify Radix import
  grep "@radix-ui/react-select" src/components/ui/select.tsx
  # Assert: Import found
  ```

  **Evidence to Capture:**
  - [ ] File content after creation
  - [ ] grep output confirming exports

  **Commit**: NO (groups with final commit)

---

- [ ] 2. Update Calendar Component with Year Dropdown Support

  **What to do**:
  - Add `captionLayout` prop support (pass through to DayPicker)
  - Add `startMonth` and `endMonth` props for dropdown range
  - Create custom `Dropdown` component using shadcn Select for styling
  - Add classNames for dropdown styling (dropdown, dropdown_root, etc.)
  - Set sensible defaults: startMonth = 5 years ago, endMonth = today
  - Maintain Korean locale

  **Must NOT do**:
  - Break existing Calendar usage (must be backward compatible)
  - Add multiple month view
  - Change default behavior (captionLayout defaults to current "label" style)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component modification with styling considerations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Calendar UI patterns and dropdown integration
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed until verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 3 (full completion)
  - **Blocked By**: Task 1 (needs Select component)

  **References**:

  **Pattern References**:
  - `src/components/ui/calendar.tsx:1-81` - Current Calendar implementation (DayPicker config, classNames structure)
  - `src/components/ui/select.tsx` - Select component created in Task 1

  **API/Type References**:
  - react-day-picker DropdownProps type for custom Dropdown component

  **External References**:
  - react-day-picker captionLayout docs: https://daypicker.dev/docs/navigation#caption-layout
  - Custom Dropdown example: https://github.com/gpbl/react-day-picker/blob/main/website/docs/guides/custom-components.mdx

  **WHY Each Reference Matters**:
  - calendar.tsx:68-73 shows current `components` prop pattern for Chevron override
  - DropdownProps needed for custom Dropdown component signature
  - react-day-picker docs explain startMonth/endMonth usage

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # 1. Verify captionLayout prop
  grep "captionLayout" src/components/ui/calendar.tsx
  # Assert: captionLayout prop handling found

  # 2. Verify custom Dropdown component
  grep -E "Dropdown.*Select" src/components/ui/calendar.tsx
  # Assert: Custom Dropdown using Select found

  # 3. Verify startMonth/endMonth props
  grep -E "(startMonth|endMonth)" src/components/ui/calendar.tsx
  # Assert: Both props handled
  ```

  **Evidence to Capture:**
  - [ ] Updated calendar.tsx content
  - [ ] grep outputs confirming new features

  **Commit**: NO (groups with final commit)

---

- [ ] 3. Enhance DateRangePicker with Presets and Editable Inputs

  **What to do**:
  
  **3a. Preset Buttons (above calendar)**:
  - Add horizontal button row: 최근 1개월, 최근 6개월, 최근 1년
  - Calculate ranges using date-fns: `subMonths(today, 1)`, `subMonths(today, 6)`, `subYears(today, 1)`
  - Ensure 최근 1년 respects 365-day limit (exactly 365 days, not 366 in leap year)
  - Use Button variant="outline" with size="sm"
  - Mobile: Full-width stacked OR scrollable horizontal

  **3b. Editable Date Inputs (replace display box)**:
  - Replace read-only display with two Input fields
  - Format: YYYY.MM.DD with placeholder
  - Parse input on blur or Enter key
  - Validate format and show inline error
  - Sync bidirectionally: input changes → calendar, calendar changes → input
  - Labels: "시작일" / "종료일"

  **3c. Pass year dropdown config to Calendar**:
  - Add `captionLayout="dropdown"` to Calendar
  - Set `startMonth` to 5 years ago from today
  - Set `endMonth` to today (no future months)

  **Must NOT do**:
  - Change `onDateChange` callback signature (keep backward compatible)
  - Modify validation logic (keep in NewMigrationForm)
  - Allow future date selection via inputs
  - Add time selection

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI changes with state management and styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form patterns, mobile-first design, input validation UX
  - **Skills Evaluated but Omitted**:
    - `dev-browser`: Manual testing not primary verification method

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 2)
  - **Parallel Group**: Wave 2-3
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/components/input/DateRangePicker.tsx:1-102` - Current full implementation
  - `src/components/input/DateRangePicker.tsx:20-29` - Date parsing/formatting utils
  - `src/components/input/DateRangePicker.tsx:56-67` - Display text formatting
  - `src/components/ui/input.tsx` - Input component usage
  - `src/components/ui/button.tsx` - Button variants

  **API/Type References**:
  - `date-fns`: `subMonths`, `subYears`, `startOfDay`, `format`, `parse`

  **External References**:
  - date-fns subMonths: https://date-fns.org/docs/subMonths
  - date-fns subYears: https://date-fns.org/docs/subYears

  **WHY Each Reference Matters**:
  - Lines 20-29 have existing parseYYYYMMDD/formatToYYYYMMDD to reuse
  - Lines 56-67 show current display format to match in inputs
  - Input component for consistent styling
  - date-fns docs for correct preset calculation

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  # 1. Verify preset buttons exist
  grep -E "최근.*(1개월|6개월|1년)" src/components/input/DateRangePicker.tsx
  # Assert: All 3 preset labels found

  # 2. Verify subMonths/subYears imports
  grep -E "import.*sub(Months|Years)" src/components/input/DateRangePicker.tsx
  # Assert: Both imports found

  # 3. Verify Input components for date entry
  grep -E "<Input.*date" src/components/input/DateRangePicker.tsx
  # Assert: Input elements found

  # 4. Verify captionLayout passed to Calendar
  grep 'captionLayout="dropdown"' src/components/input/DateRangePicker.tsx
  # Assert: captionLayout prop found

  # 5. Verify mobile-friendly classes
  grep -E "flex.*(col|wrap|gap)" src/components/input/DateRangePicker.tsx
  # Assert: Responsive flex classes found
  ```

  **Visual Verification (using playwright skill)**:
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:3000/migration (or page with DateRangePicker)
  2. Assert: Preset buttons visible ("최근 1개월", "최근 6개월", "최근 1년")
  3. Click: "최근 1개월" button
  4. Assert: Date inputs show valid range (end date = today, start = ~30 days ago)
  5. Assert: Calendar highlights selected range
  6. Click: Year dropdown in calendar header
  7. Assert: Dropdown shows years from ~5 years ago to current year
  8. Select: Different year
  9. Assert: Calendar navigates to selected year
  10. Clear start date input, type "2025.06.15"
  11. Press Enter or blur
  12. Assert: Calendar navigates to June 2025
  13. Screenshot: .sisyphus/evidence/task-3-daterangepicker.png
  ```

  **Evidence to Capture:**
  - [ ] Updated DateRangePicker.tsx content
  - [ ] grep outputs
  - [ ] Screenshot of enhanced component

  **Commit**: NO (groups with final commit)

---

- [ ] 4. Build and Lint Verification

  **What to do**:
  - Run `npm run lint` and fix any errors
  - Run `npm run build` and ensure it passes
  - Fix any TypeScript errors
  - Fix any React warnings

  **Must NOT do**:
  - Skip lint errors with eslint-disable comments (fix properly)
  - Ignore build warnings (address them)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard verification commands
  - **Skills**: []
    - No special skills needed, just bash commands
  - **Skills Evaluated but Omitted**:
    - All skills: Simple command execution

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `package.json` - Script definitions

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  npm run lint
  # Assert: Exit code 0, no errors

  npm run build
  # Assert: Exit code 0, "Compiled successfully" or similar success message
  ```

  **Evidence to Capture:**
  - [ ] lint command output
  - [ ] build command output (success message)

  **Commit**: NO (groups with final commit)

---

- [ ] 5. Commit and Push Changes

  **What to do**:
  - Stage all modified/new files:
    - `src/components/ui/select.tsx` (new)
    - `src/components/ui/calendar.tsx` (modified)
    - `src/components/input/DateRangePicker.tsx` (modified)
  - Create descriptive commit message
  - Push to origin

  **Must NOT do**:
  - Commit any unrelated changes
  - Force push
  - Skip pre-commit hooks

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple git operations
  - **Skills**: [`git-master`]
    - `git-master`: Proper commit message formatting, git workflow
  - **Skills Evaluated but Omitted**:
    - None needed beyond git

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - Recent commits in repo for message style

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  git status
  # Assert: Working tree clean after commit

  git log -1 --oneline
  # Assert: Shows new commit with descriptive message

  git push origin HEAD
  # Assert: Push successful, no errors
  ```

  **Evidence to Capture:**
  - [ ] git status showing clean tree
  - [ ] git log showing commit
  - [ ] push output

  **Commit**: YES
  - Message: `feat(calendar): add year dropdown, date inputs, and preset buttons to DateRangePicker`
  - Files: 
    - `src/components/ui/select.tsx`
    - `src/components/ui/calendar.tsx`
    - `src/components/input/DateRangePicker.tsx`
  - Pre-commit: `npm run lint && npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 5 | `feat(calendar): add year dropdown, date inputs, and preset buttons to DateRangePicker` | select.tsx, calendar.tsx, DateRangePicker.tsx | lint + build |

---

## Success Criteria

### Verification Commands
```bash
npm run lint      # Expected: Exit 0, no errors
npm run build     # Expected: Exit 0, compiled successfully
git status        # Expected: Clean working tree after commit
git log -1        # Expected: Shows feat(calendar) commit
```

### Final Checklist
- [ ] Year dropdown visible in calendar header
- [ ] Year dropdown navigates calendar correctly
- [ ] Date inputs editable and sync with calendar
- [ ] All 3 preset buttons work (1개월, 6개월, 1년)
- [ ] Presets respect 365-day limit
- [ ] Future dates still disabled
- [ ] Mobile-friendly layout
- [ ] Build passes
- [ ] Lint passes
- [ ] Committed and pushed
