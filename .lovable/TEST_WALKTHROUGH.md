# CRM Pro - End-to-End Test Walkthrough

This document provides a comprehensive testing guide for all CRM Pro features. Use this to verify functionality after updates or for QA testing.

## 📊 Demo Data Summary

The following test data has been populated:

| Entity | Count | Distribution |
|--------|-------|--------------|
| Contacts | 26 | Health scores: 35-92 (varied) |
| Deals | 18 | All 6 stages represented |
| Tasks | 23 | Overdue, due today, upcoming, completed |
| Custom Fields | 6 | Contact, Deal, Task fields |
| AI Generations | 5 | Email, Proposal, Follow-up types |
| Activity Log | 12+ | Recent actions logged |

### Deal Pipeline Distribution
- **Lead**: 4 deals ($270,500 total)
- **Qualified**: 3 deals ($325,000 total)
- **Proposal**: 4 deals ($1,040,000 total)
- **Negotiation**: 3 deals ($222,000 total)
- **Closed Won**: 2 deals ($113,000 total)
- **Closed Lost**: 2 deals ($475,000 total)

---

## 🔐 A. Authentication & Navigation

### Login Flow
1. ✅ Navigate to `/auth` (logged out state)
2. ✅ Enter valid credentials
3. ✅ Verify redirect to Dashboard after login
4. ✅ Check user profile displays in header

### Theme Toggle
1. ✅ Click theme toggle in header (sun/moon icon)
2. ✅ Verify dark mode applies to all pages
3. ✅ Verify light mode applies correctly
4. ✅ Check that preference persists on refresh

### Mobile Responsive View
1. ✅ Resize browser to < 768px width
2. ✅ Verify hamburger menu appears
3. ✅ Open sidebar menu
4. ✅ Navigate between pages via mobile menu
5. ✅ Verify all pages render correctly on mobile

### Command Palette (Cmd+K)
1. ✅ Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. ✅ Type a contact name (e.g., "Emma")
3. ✅ Navigate to search result
4. ✅ Verify search works across contacts, deals, tasks

---

## 📈 B. Dashboard

### Metric Cards
1. ✅ Verify "Total Contacts" shows 26
2. ✅ Verify "Active Deals" shows count of non-closed deals
3. ✅ Verify "Pipeline Value" shows sum of active deals
4. ✅ Verify "Tasks Due" shows overdue + due today count

### Charts
1. ✅ **Revenue Chart**: Line chart showing closed won revenue over time
2. ✅ **Pipeline Funnel**: Bar chart showing deal distribution by stage
3. ✅ **Contacts Growth**: Area chart showing contacts added over time
4. ✅ **Task Completion**: Pie/donut chart showing open vs completed

### Recent Activity Feed
1. ✅ Verify shows latest 10 activity entries
2. ✅ Check activity icons match action type (created, updated, won, lost)
3. ✅ Verify relative timestamps (e.g., "2 hours ago")

### Quick Actions
1. ✅ "Add Contact" button opens contact dialog
2. ✅ "New Deal" button opens deal dialog
3. ✅ "Add Task" button opens task dialog

---

## 👥 C. Contacts Management

### Search & Filter
1. ✅ Type "Emma" in search box → filters to Emma Wilson
2. ✅ Clear search → all contacts shown
3. ✅ Filter by company using dropdown
4. ✅ Filter by tag (e.g., "enterprise")

### Table Sorting
1. ✅ Click "Name" column header → sorts alphabetically
2. ✅ Click again → reverses sort order
3. ✅ Sort by "Company", "Health Score", "Created At"

### Contact Detail Sheet
1. ✅ Click on "Emma Wilson" row
2. ✅ Verify sheet slides in from right
3. ✅ Check all contact info displayed
4. ✅ View "Deals" tab → shows linked deals
5. ✅ View "Tasks" tab → shows linked tasks
6. ✅ View "Activity" tab → shows contact activity

### Health Score
1. ✅ Check contacts with score 70+ show **green** badge
2. ✅ Check contacts with score 40-69 show **yellow** badge
3. ✅ Check contacts with score < 40 show **red** badge

### Bulk Operations
1. ✅ Check 5 contacts using row checkboxes
2. ✅ Verify bulk action bar appears
3. ✅ Click "Add Tag" → add "bulk-test" tag
4. ✅ Verify tag applied to all selected contacts
5. ✅ Select contacts and test "Delete Selected"

### Create Contact
1. ✅ Click "Add Contact" button
2. ✅ Fill required field: Name = "Test Contact"
3. ✅ Fill optional fields (email, phone, company, position)
4. ✅ Add tags: "test", "new"
5. ✅ Set health score slider
6. ✅ Fill custom field: Industry = "Technology"
7. ✅ Click "Create" → verify success toast
8. ✅ Verify contact appears in table

### Edit Contact
1. ✅ Click edit icon on a contact row
2. ✅ Modify name and email
3. ✅ Add/change custom field values
4. ✅ Click "Save" → verify success toast
5. ✅ Verify changes reflected in table

### Delete Contact
1. ✅ Click delete icon on test contact
2. ✅ Verify confirmation dialog appears
3. ✅ Click "Delete" → verify success toast
4. ✅ Verify contact removed from table

### Export to CSV
1. ✅ Click "Export" button
2. ✅ Verify CSV file downloads
3. ✅ Open CSV and verify all contacts included

---

## 💼 D. Deal Pipeline (Kanban)

### Pipeline View
1. ✅ Navigate to Deals page
2. ✅ Verify 6 columns: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
3. ✅ Verify deal cards show name, value, contact name

### Drag and Drop
1. ✅ Drag "TechVision Enterprise Platform" from Lead → Qualified
2. ✅ Verify card appears in Qualified column
3. ✅ Verify stage totals update in column headers
4. ✅ Verify success toast confirms stage change
5. ✅ Check activity log records the stage change

### Deal Detail Drawer
1. ✅ Click on a deal card
2. ✅ Verify drawer opens with full details
3. ✅ Check: Name, Value, Stage, Probability, Contact, Expected Close Date
4. ✅ View linked tasks section
5. ✅ View notes section

### Create Deal
1. ✅ Click "New Deal" button
2. ✅ Enter Name: "Test Deal Q1"
3. ✅ Enter Value: $50,000
4. ✅ Select Stage: Proposal
5. ✅ Set Probability: 60%
6. ✅ Select Contact: Emma Wilson
7. ✅ Set Expected Close Date using calendar
8. ✅ Fill custom field: Contract Type = "Annual"
9. ✅ Click "Create" → verify success toast
10. ✅ Verify deal appears in Proposal column

### Edit Deal
1. ✅ Click edit icon on a deal
2. ✅ Change value from $50,000 → $75,000
3. ✅ Update probability
4. ✅ Click "Save" → verify success toast
5. ✅ Verify stage total recalculates

### Bulk Stage Move
1. ✅ Select 3 deals using checkboxes
2. ✅ Use "Move to Stage" dropdown
3. ✅ Select "Qualified"
4. ✅ Verify all deals move to Qualified column

### Delete Deal
1. ✅ Click delete icon on test deal
2. ✅ Confirm deletion
3. ✅ Verify deal removed from pipeline

---

## ✅ E. Task Management

### Tab Navigation
1. ✅ Click "All Tasks" tab → shows all tasks
2. ✅ Click "Open" tab → shows open + in_progress tasks
3. ✅ Click "Completed" tab → shows completed tasks only

### Due Date Badges
1. ✅ **Overdue tasks** (past due date): Red badge
2. ✅ **Due today**: Yellow/amber badge
3. ✅ **Upcoming** (future date): Green badge

### Mark Task Complete
1. ✅ Click checkbox on an open task
2. ✅ Verify task status changes to "completed"
3. ✅ Verify success toast appears
4. ✅ Task moves to Completed tab

### Create Task
1. ✅ Click "New Task" button
2. ✅ Enter Title: "Test Task for QA"
3. ✅ Enter Description: "Testing task creation flow"
4. ✅ Select Priority: High
5. ✅ Select Status: Open
6. ✅ Select Due Date: Tomorrow
7. ✅ Link to Contact: Emma Wilson
8. ✅ Link to Deal: TechVision Enterprise Platform
9. ✅ Fill custom field: Estimated Hours = 2
10. ✅ Click "Create" → verify success toast

### Edit Task
1. ✅ Click edit icon on a task
2. ✅ Change priority: High → Medium
3. ✅ Change due date using calendar picker
4. ✅ Update description
5. ✅ Click "Save" → verify changes

### Bulk Complete
1. ✅ Select 4 open tasks using checkboxes
2. ✅ Click "Mark Complete" bulk action
3. ✅ Verify all tasks marked as completed
4. ✅ Verify success toast

### Delete Task
1. ✅ Click delete icon on test task
2. ✅ Confirm deletion in dialog
3. ✅ Verify task removed

---

## 📊 F. Analytics

### Chart Rendering
1. ✅ Navigate to Analytics page
2. ✅ **Revenue Trend**: Line chart with closed won revenue
3. ✅ **Pipeline Funnel**: Funnel/bar showing deals by stage
4. ✅ **Contact Growth**: Shows contacts over time
5. ✅ **Task Completion Rate**: Pie/donut of task statuses
6. ✅ **Deal Health**: Distribution of deal probabilities

### Key Metrics
1. ✅ **Win Rate**: Closed Won / (Closed Won + Closed Lost) percentage
2. ✅ **Average Deal Size**: Total pipeline value / deal count
3. ✅ **Conversion Rate**: Qualified-to-Close percentage

### Date Range Filter
1. ✅ Click date range selector
2. ✅ Select "Last 7 Days"
3. ✅ Verify charts update with filtered data
4. ✅ Select "Last 30 Days" → charts update
5. ✅ Select "Last 90 Days" → charts update
6. ✅ Use custom date range picker

---

## 🤖 G. AI Content Generator

### Generate Email
1. ✅ Navigate to AI Generator page
2. ✅ Select Contact: "Emma Wilson" from dropdown
3. ✅ Select Type: "Email"
4. ✅ Select Tone: "Professional"
5. ✅ Add optional context/prompt
6. ✅ Click "Generate"
7. ✅ Watch content stream in real-time
8. ✅ Verify generated email includes contact name
9. ✅ Verify email is contextually relevant

### Copy Functionality
1. ✅ Click "Copy" button after generation
2. ✅ Verify success toast: "Copied to clipboard"
3. ✅ Paste in text editor to verify content

### Save Generation
1. ✅ Click "Save" button
2. ✅ Verify success toast
3. ✅ Check Generation History shows saved item

### Generation History
1. ✅ View history section/panel
2. ✅ Click on a historical generation
3. ✅ Verify content loads into view
4. ✅ Check can copy from history
5. ✅ Verify delete from history works

### Test All Types
1. ✅ Generate **Email** content
2. ✅ Generate **Proposal** content
3. ✅ Generate **Follow-up** content
4. ✅ Verify each type produces appropriate content

---

## ⚙️ H. Custom Fields (Admin Only)

### Admin Access
1. ✅ Login as admin user (zuhaairshad140@gmail.com has admin role)
2. ✅ Navigate to Settings → Custom Fields
3. ✅ Verify Custom Fields Builder is visible

### Create Custom Field
1. ✅ Click "Add Field" button
2. ✅ Enter Field Name: "Annual Revenue"
3. ✅ Select Type: "Dropdown"
4. ✅ Add Options: "$0-$1M", "$1M-$10M", "$10M-$100M", "$100M+"
5. ✅ Select Entity: "Contacts"
6. ✅ Toggle Required: Off
7. ✅ Click "Create" → verify success toast
8. ✅ Verify field appears in fields table

### Edit Custom Field
1. ✅ Click edit icon on "Annual Revenue" field
2. ✅ Add new option: "$500M+"
3. ✅ Click "Save" → verify changes

### Verify Field in Forms
1. ✅ Go to Contacts page
2. ✅ Open "Add Contact" dialog
3. ✅ Verify "Annual Revenue" dropdown appears
4. ✅ Verify all options are selectable

### Regular User Access
1. ✅ Login as regular (non-admin) user
2. ✅ Navigate to Settings → Custom Fields
3. ✅ Verify "Admin Access Required" message shown
4. ✅ Verify create/edit/delete buttons are hidden
5. ✅ Confirm regular users can USE fields but not manage them

### Delete Custom Field
1. ✅ Login as admin
2. ✅ Click delete icon on test field
3. ✅ Confirm deletion
4. ✅ Verify field removed from forms

---

## 📱 I. PWA Features

### Install Prompt
1. ✅ Open app in Chrome/Edge
2. ✅ Check for install prompt in address bar
3. ✅ Click install
4. ✅ Verify app opens in standalone window

### Offline Indicator
1. ✅ Open DevTools → Network tab
2. ✅ Toggle "Offline" mode
3. ✅ Verify offline indicator appears in UI
4. ✅ Check cached data still loads

### PWA Manifest
1. ✅ Check DevTools → Application → Manifest
2. ✅ Verify app name, icons, theme color correct
3. ✅ Verify display mode: "standalone"

---

## 🔄 J. Bulk Operations Summary

### Contacts
- ✅ Select 5 contacts → Bulk add tag
- ✅ Select contacts → Bulk delete
- ✅ Verify confirmation dialogs

### Deals
- ✅ Select 3 deals → Bulk move stage
- ✅ Verify pipeline totals update

### Tasks
- ✅ Select 4 tasks → Bulk mark complete
- ✅ Verify status changes

---

## 🧪 K. Edge Cases

### Empty States
1. ✅ Create new user account
2. ✅ Verify "No contacts yet" empty state
3. ✅ Verify "No deals yet" empty state
4. ✅ Verify "No tasks yet" empty state

### Form Validation
1. ✅ Try submitting contact with empty name → error shown
2. ✅ Try invalid email format → validation error
3. ✅ Try submitting deal without name → error shown

### Duplicate Email
1. ✅ Create contact with existing email
2. ✅ Verify warning or error handling

### Cascade Deletes
1. ✅ Delete contact with linked deals
2. ✅ Verify deals' contact_id is nulled or handled
3. ✅ Delete contact with linked tasks
4. ✅ Verify appropriate handling

### Long Text
1. ✅ Create contact with very long name (100+ chars)
2. ✅ Verify text truncates properly in table
3. ✅ Verify full text visible in detail view

### Date Picker Edge Cases
1. ✅ Select date in the past → should work for due dates
2. ✅ Select date 5 years in future → should work
3. ✅ Clear date field → should be optional

### Search No Results
1. ✅ Search for "xyznonexistent"
2. ✅ Verify "No results found" message

### Drag to Same Stage
1. ✅ Drag deal and drop in same column
2. ✅ Verify no errors, smooth handling

---

## 🎨 L. Visual Verification

### Component Consistency
- ✅ All buttons use shadcn/ui Button component
- ✅ All inputs use shadcn/ui Input component
- ✅ All dialogs use shadcn/ui Dialog component
- ✅ All toasts use shadcn/ui Toast/Sonner

### Spacing & Layout
- ✅ Consistent padding across pages
- ✅ Proper spacing between sections
- ✅ Aligned form labels and inputs

### Loading States
- ✅ Skeleton loaders on Dashboard charts
- ✅ Skeleton loaders on table data
- ✅ Loading spinners on buttons during submit

### Toast Notifications
- ✅ Success toast on create/update/delete
- ✅ Error toast on failed operations
- ✅ Toasts auto-dismiss after 5 seconds

### Transitions
- ✅ Smooth page transitions
- ✅ Drawer/Sheet slide animations
- ✅ Modal fade-in animations

### Color Palette
- ✅ No gradients or AI-generated styling
- ✅ Clean slate/zinc color scheme
- ✅ Semantic colors for status (green/yellow/red)

### Dark Mode
- ✅ All pages render correctly in dark mode
- ✅ Proper contrast ratios maintained
- ✅ Charts/graphs readable in dark mode

### Responsive Breakpoints
- ✅ Desktop (1200px+): Full sidebar, multi-column layouts
- ✅ Tablet (768-1199px): Collapsible sidebar
- ✅ Mobile (<768px): Hamburger menu, stacked layouts

---

## 📋 Test Sign-Off

| Section | Tester | Date | Status |
|---------|--------|------|--------|
| A. Auth & Navigation | | | ⬜ |
| B. Dashboard | | | ⬜ |
| C. Contacts | | | ⬜ |
| D. Deals | | | ⬜ |
| E. Tasks | | | ⬜ |
| F. Analytics | | | ⬜ |
| G. AI Generator | | | ⬜ |
| H. Custom Fields | | | ⬜ |
| I. PWA Features | | | ⬜ |
| J. Bulk Operations | | | ⬜ |
| K. Edge Cases | | | ⬜ |
| L. Visual Verification | | | ⬜ |

---

## 🐛 Known Issues & Notes

_Document any issues found during testing here:_

1. 
2. 
3. 

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
