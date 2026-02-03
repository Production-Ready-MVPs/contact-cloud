
# CRM Application - Full Implementation Plan (Updated)

## Overview
A professional, full-featured CRM application built with React, TypeScript, and shadcn/ui components. Includes contact management, deal pipeline with drag-and-drop, task management, analytics dashboard, AI-powered content generation, and PWA support—all with user authentication and persistent data storage using Lovable Cloud.

---

## 1. Layout & Navigation
**Professional sidebar-based layout with responsive design**

- **Left Sidebar:** Collapsible navigation using `Sidebar` component with icons for Dashboard, Contacts, Deals, Tasks, Analytics, AI Generator
- **Top Header:** `Command` palette for global search, notifications, and `Avatar` with `DropdownMenu` (profile, settings, logout)
- **Main Content Area:** Dynamic content with `Skeleton` loading states
- **Dark Mode Toggle:** `Button` to switch themes using next-themes
- **Mobile Responsive:** `Sheet` drawer for mobile navigation

**shadcn/ui:** Sidebar, Button, Avatar, DropdownMenu, Command, Sheet, Skeleton, Separator

---

## 2. Authentication
**Secure user login system**

- Sign up / Sign in pages with `Form`, `Input`, `Button`
- Form validation using react-hook-form + zod
- Protected routes (redirect to login if not authenticated)
- User profiles table with RLS policies
- Separate `user_roles` table (admin/user) for security
- `Toast` notifications for auth feedback

**shadcn/ui:** Card, Form, Input, Button, Label, Toast

---

## 3. Dashboard Page
**Overview of key CRM metrics**

- Welcome `Card` with user's name
- Summary `Cards`: Total Contacts, Active Deals, Open Tasks, Revenue with `Badge` indicators
- Recent activity feed in scrollable `Card`
- Quick action `Buttons` (Add Contact, Create Deal, New Task)
- Charts using Recharts (already installed) for trends
- `Skeleton` loaders while data fetches

**shadcn/ui:** Card, Badge, Button, Separator, Skeleton, Avatar

---

## 4. Contacts Management
**Full CRUD for contact records**

- **Contact List:** `Table` with sorting, filtering, pagination
- **Bulk Operations:** `Checkbox` selection + bulk action `DropdownMenu` (delete, assign tags, export)
- **Relationship Health Score:** Visual 0-100 score with color-coded `Badge` on each contact
- **Contact Details:** `Sheet` slide-out panel with full info + `Tabs` for activity/notes/deals
- **Add/Edit Contact:** `Dialog` with `Form`, `Input`, `Select`, `Textarea`, `Calendar` for dates
- **Custom Fields:** Dynamic fields defined by admin, rendered based on field type
- **Delete Contact:** `AlertDialog` confirmation
- **Import/Export:** CSV export via `Button`

**shadcn/ui:** Table, Checkbox, Dialog, Sheet, Tabs, Form, Input, Select, Textarea, Calendar, Badge, Avatar, Button, DropdownMenu, AlertDialog, Skeleton

---

## 5. Deal Pipeline
**Kanban-style deal tracking with @dnd-kit/core**

- **Pipeline Stages:** Lead → Qualified → Proposal → Negotiation → Closed Won/Lost as columns
- **Deal Cards:** `Card` components showing deal name, value `Badge`, contact `Avatar`, expected close date
- **Drag & Drop:** Using `@dnd-kit/core` for smooth drag between stages
- **Deal Details:** `Drawer` with full form, contact association, value, probability, notes
- **Bulk Operations:** Multi-select deals for stage change or deletion
- **Stage Value Totals:** Sum displayed per column with `Badge`
- **Create/Edit/Delete:** `Dialog` forms with validation, `AlertDialog` for delete

**shadcn/ui:** Card, Badge, Avatar, Drawer, Dialog, Form, Input, Select, Textarea, Calendar, Button, AlertDialog, Skeleton
**Library:** @dnd-kit/core, @dnd-kit/sortable

---

## 6. Task Management
**To-do and reminder system**

- **Task List:** `Table` view with `Checkbox` for completion, filterable by status
- **Task Tabs:** `Tabs` for All / Open / Completed views
- **Task Details:** Title, description, due date (`Calendar`), priority `Select`, linked contact/deal
- **Quick Actions:** Inline `Button` for complete, `DropdownMenu` for edit/delete
- **Due Date Indicators:** Color-coded `Badge` (overdue=red, today=yellow, upcoming=green)
- **Bulk Operations:** Multi-select with bulk complete/delete
- **Create/Edit:** `Dialog` with full `Form`

**shadcn/ui:** Table, Tabs, Checkbox, Calendar, Select, Badge, Button, DropdownMenu, Dialog, Form, Input, Textarea, AlertDialog, Skeleton

---

## 7. Analytics Page
**Visual insights and reporting**

- **Charts (Recharts):**
  - Deal pipeline funnel chart
  - Revenue over time line chart
  - Contacts added per month bar chart
  - Task completion rate pie chart
  - Relationship health distribution
- **Key Metrics Cards:** Win rate, average deal size, conversion rate
- **Date Range Filter:** `Calendar` date picker in `Popover`
- **Export Reports:** `Button` to download CSV/PDF

**shadcn/ui:** Card, Badge, Button, Calendar, Popover, Select, Tabs, Skeleton

---

## 8. AI Content Generator (NEW)
**AI-powered content creation using Lovable AI**

- **Generator Interface:** `Tabs` for Email / Proposal / Follow-up types
- **Contact Context:** `Select` to choose contact, auto-loads relationship data
- **Tone Selection:** `Select` for Professional / Friendly / Urgent
- **AI Generation:** Edge function calling Lovable AI Gateway (google/gemini-3-flash-preview)
- **Streaming Output:** Real-time `Textarea` update as AI generates
- **Generated Templates:**
  - Personalized cold outreach emails
  - Deal proposals with contact/deal context
  - Follow-up messages based on activity history
- **Copy/Edit/Send:** `Button` actions for generated content
- **History:** Previous generations saved and viewable

**shadcn/ui:** Card, Tabs, Select, Textarea, Button, Skeleton, Toast

---

## 9. Custom Fields Builder (NEW - Admin Only)
**Dynamic field configuration**

- **Admin Panel:** `Tabs` section in settings for field management
- **Field Types:** Text, Number, Date, Dropdown, Checkbox, URL
- **Entity Selection:** `Select` to apply to Contacts, Deals, or Tasks
- **Field Configuration:** `Dialog` with `Form` for name, type, required, options
- **Drag Reorder:** Field order customization
- **CRUD:** `Table` listing all custom fields with edit/delete actions
- **Role-Based Access:** Only admins can access (using `user_roles` table)

**shadcn/ui:** Tabs, Table, Dialog, Form, Input, Select, Checkbox, Button, AlertDialog, Badge

---

## 10. PWA Configuration (Phase 9)
**Progressive Web App support**

- **manifest.json:** App name, icons, theme colors, display mode
- **Service Worker:** Using Vite PWA plugin for caching
- **Offline Support:** Cache critical assets and show offline indicator
- **Install Prompt:** Custom `Dialog` prompting users to install
- **App Icons:** Multiple sizes for various devices
- **Splash Screen:** Branded loading screen

---

## 11. Database Schema (Lovable Cloud)
**Structured data storage with RLS**

```
profiles (id, user_id, full_name, avatar_url, created_at)
user_roles (id, user_id, role[admin/user])
contacts (id, user_id, name, email, phone, company, position, notes, tags[], health_score, custom_fields{}, created_at)
deals (id, user_id, contact_id, name, value, stage, probability, expected_close_date, notes, custom_fields{}, created_at)
tasks (id, user_id, contact_id, deal_id, title, description, due_date, priority, status, custom_fields{}, created_at)
custom_field_definitions (id, user_id, entity_type, field_name, field_type, options[], required, display_order)
ai_generations (id, user_id, contact_id, type, prompt, content, created_at)
activity_log (id, user_id, entity_type, entity_id, action, metadata{}, created_at)
```

**RLS Policies:** Users only see their own data; admins have elevated access via `has_role()` function

---

## 12. Design & Theme
**Clean, professional aesthetic using shadcn/ui exclusively**

- **Color Scheme:** Slate/zinc neutral palette (shadcn default)
- **Accent Color:** Blue for primary actions
- **Dark Mode:** Full support via next-themes
- **Components:** 100% shadcn/ui primitives - NO custom styled divs
- **Loading States:** `Skeleton` components everywhere
- **Notifications:** `Sonner` toasts for all feedback
- **Responsive:** Mobile-first with proper breakpoints

---

## Implementation Phases
1. **Phase 1:** Layout structure (Sidebar, Header, routing, dark mode)
2. **Phase 2:** Connect Lovable Cloud + database schema + RLS policies
3. **Phase 3:** Authentication (signup, login, profiles, roles)
4. **Phase 4:** Dashboard with summary cards and charts
5. **Phase 5:** Contacts management (CRUD, health score, bulk ops)
6. **Phase 6:** Deal pipeline with @dnd-kit Kanban
7. **Phase 7:** Task management system
8. **Phase 8:** Analytics page with Recharts
9. **Phase 9:** AI Content Generator (Lovable AI integration)
10. **Phase 10:** Custom Fields Builder (admin only)
11. **Phase 11:** PWA configuration + polish + responsive refinements
