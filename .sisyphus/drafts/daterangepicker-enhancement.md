# Draft: DateRangePicker Enhancement

## Requirements (confirmed)
- **Year navigation**: Add ability to quickly jump years (via dropdown or << >> buttons)
- **Direct date input**: Manual YYYY.MM.DD input fields for start/end dates
- **Preset buttons**: Quick selection for "최근 1개월", "최근 6개월", "최근 1년"
- **Constraints**: Max 365 days, only past dates, mobile-friendly

## Technical Decisions
- **Primary file to modify**: `src/components/input/DateRangePicker.tsx`
- **Calendar.tsx**: May need minor updates for year dropdown styling

## Research Findings

### react-day-picker v9 Year Navigation
- **captionLayout prop**: Supports "dropdown", "dropdown-years", "dropdown-months", "label"
- **Built-in dropdown**: Uses `captionLayout="dropdown"` with `startMonth`/`endMonth` to define range
- **Custom Dropdown component**: Can override via `components={{ Dropdown: CustomDropdown }}`
- **No Select component in project**: Will need to add shadcn Select or use native dropdown

### Current Implementation
- Calendar.tsx: shadcn wrapper with Korean locale, ChevronLeft/ChevronRight nav
- DateRangePicker.tsx: Range display + Calendar + reset button
- Date format: internal `yyyyMMdd`, display `yyyy.MM.dd`
- Validation: Future dates disabled, max 365 days (in NewMigrationForm)

### Available UI Components
- Button, Input, Card, Tabs, Popover, Sheet, Progress, Skeleton, Collapsible
- **Missing**: Select/Dropdown component

## Open Questions
1. Year navigation: dropdown vs << >> buttons?
2. Direct input: Replace display box with editable inputs, or add separate input fields?
3. Preset buttons layout: Horizontal row above calendar or vertical stack?
4. Need to add shadcn Select component for year dropdown?

## Scope Boundaries
- INCLUDE: Year navigation, date inputs, preset buttons
- EXCLUDE: Time selection, multiple month view, internationalization
