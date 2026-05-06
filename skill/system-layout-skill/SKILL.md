---
name: system-layout-skill
description: Build or review admin and doctor system pages for the E-Medical Booking frontend without breaking the shared shell layout. Use when Codex adds or edits screens rendered inside `System.tsx` or `Doctor.tsx`, writes SCSS for those screens, or needs guardrails for working only inside the main content area.
---

# System Layout Skill

## Follow the shell contract

- Treat `System.tsx` and `Doctor.tsx` as the owners of the shared shell layout.
- Assume the shell already provides the sidebar, header, and page scrolling behavior.
- Edit only the feature screen rendered inside the main content area unless the user explicitly asks to change shared layout code.
- Do not import or render `Header` or `Sidebar` inside feature pages.

## Build inside the main content area

- Start each feature page with one top-level container named for the feature, for example `manage-package-container`.
- Structure the page in this order when applicable: title or breadcrumb, summary cards, toolbar or filters, main table or primary content.
- Write the page as a normal React screen and let the parent route place it inside the shell.

```tsx
import React from 'react';
import './ManagePackage.scss';

const ManagePackage: React.FC = () => {
  return (
    <div className="manage-package-container">
      <div className="title-section">
        <h3>Quan ly goi kham</h3>
      </div>

      <div className="dashboard-cards">
        {/* Summary cards */}
      </div>

      <div className="toolbar-section">
        {/* Filters and actions */}
      </div>

      <div className="table-section">
        {/* Main content */}
      </div>
    </div>
  );
};

export default ManagePackage;
```

## Scope styles locally

- Nest SCSS under the feature container.
- Do not style `html`, `body`, `.admin-layout`, `.header-topbar`, or other shared shell classes from a feature stylesheet.
- Do not use full-screen `position: fixed` or cross-page absolute positioning for the feature layout.
- Use `absolute` only inside a local `relative` container for UI details such as dropdowns, tooltips, or modal internals.
- Preserve local scrolling inside the content area and avoid forcing body scroll.

```scss
.manage-package-container {
  padding: 24px;
  width: 100%;
  height: 100%;

  .title-section {
    margin-bottom: 20px;
  }

  .dashboard-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .card-item {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 16px;
    }
  }
}
```

## Review checklist

- Confirm the change stays inside the main content area and does not rework the shared shell.
- Confirm the feature page does not import `Header` or `Sidebar`.
- Confirm the stylesheet does not override global layout selectors.
- Confirm the page keeps existing scroll behavior intact.
- Confirm spacing, cards, filters, and data sections follow the existing system-screen pattern.
