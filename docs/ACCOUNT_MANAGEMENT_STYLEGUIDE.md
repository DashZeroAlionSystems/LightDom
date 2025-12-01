# Account Management UI Style Guide

## Overview

This style guide defines the visual design, interaction patterns, and UX principles for the LightDom user account management system. All user management interfaces should follow these guidelines for consistency and usability.

## Design Principles

### 1. Clarity First
- Clear labels and descriptions
- No ambiguous actions
- Explicit confirmation for destructive operations
- Visual hierarchy that guides the eye

### 2. Efficiency
- Minimize clicks to complete tasks
- Smart defaults based on context
- Bulk operations where appropriate
- Keyboard shortcuts for power users

### 3. Consistency
- Unified color scheme across all views
- Consistent spacing and typography
- Predictable interaction patterns
- Standardized component usage

### 4. Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## Color Palette

### Primary Colors
```css
--primary: #1890ff;      /* Primary actions, links */
--primary-hover: #40a9ff; /* Hover states */
--primary-active: #096dd9; /* Active/pressed states */
```

### Status Colors
```css
--success: #52c41a;  /* Active users, verified status */
--warning: #faad14;  /* Trial, pending, warnings */
--error: #f5222d;    /* Errors, suspended, critical */
--info: #1890ff;     /* Information, tips */
```

### Role Colors
```css
--role-admin: #f5222d;     /* Admin role - Red */
--role-deepseek: #722ed1;  /* DeepSeek - Purple */
--role-enterprise: #faad14; /* Enterprise - Gold */
--role-pro: #1890ff;       /* Pro - Blue */
--role-free: #8c8c8c;      /* Free - Gray */
--role-guest: #d9d9d9;     /* Guest - Light Gray */
```

### Plan Colors
```css
--plan-admin: #f5222d;     /* Admin Plan - Red */
--plan-deepseek: #722ed1;  /* DeepSeek Plan - Purple */
--plan-enterprise: #faad14; /* Enterprise Plan - Gold */
--plan-pro: #1890ff;       /* Pro Plan - Blue */
--plan-free: #52c41a;      /* Free Plan - Green */
```

### Neutral Colors
```css
--text-primary: rgba(0, 0, 0, 0.85);
--text-secondary: rgba(0, 0, 0, 0.65);
--text-disabled: rgba(0, 0, 0, 0.25);
--border: #d9d9d9;
--background: #f0f2f5;
--card-background: #ffffff;
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes
```css
--font-size-xs: 12px;   /* Helper text, timestamps */
--font-size-sm: 14px;   /* Body text, labels */
--font-size-base: 14px; /* Default size */
--font-size-lg: 16px;   /* Section headers */
--font-size-xl: 20px;   /* Page titles */
--font-size-xxl: 24px;  /* Main headings */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 600;
```

## Spacing

Use a consistent 8px grid system:

```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-xxl: 64px;
```

## Component Patterns

### User List Table

**Layout:**
- Full-width card container
- Sticky header on scroll
- 20 items per page by default
- Pagination at bottom right

**Columns:**
1. User (avatar + name/email)
2. Role (colored tag)
3. Plan (colored tag)
4. Status (colored tag)
5. Verified (yes/no tag)
6. Stats (reputation, optimizations)
7. Last Login (date)
8. Joined (date)
9. Actions (3-dot menu)

**Interactions:**
- Hover: Light gray background (#fafafa)
- Click row: Navigate to detail view
- Click action button: Show dropdown menu
- Filters: Show above table in a row
- Sort: Click column header

### User Detail View

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header Card                             │
│ ┌────┐  Name & Email                   │
│ │Avtr│  Tags (verified, role, plan)    │
│ └────┘                                  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Statistics Row (4 columns)              │
│ Reputation | Optimizations | etc        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Tabbed Content                          │
│ [Profile] [Account] [Activity] [Features]│
│                                         │
│ Tab Content Here                        │
└─────────────────────────────────────────┘
```

**Tabs:**
1. Profile Information - Personal details
2. Account & Subscription - Status, plan, role
3. Activity & Timeline - Login history
4. Plan Features & Limits - What user can access

### User Form

**Layout:**
```
┌─────────────────────────────────────────┐
│ Form Header        [Cancel] [Save]      │
├─────────────────────────────────────────┤
│ Section: Basic Information              │
│ ┌──────────┐  ┌──────────┐             │
│ │ Username │  │  Email   │             │
│ └──────────┘  └──────────┘             │
├─────────────────────────────────────────┤
│ Section: Contact Information            │
│ ...                                     │
├─────────────────────────────────────────┤
│ Section: Role & Plan                    │
│ ...                                     │
└─────────────────────────────────────────┘
```

**Field Groups:**
- Basic Information
- Contact Information  
- Role & Plan Assignment
- Account Settings (edit only)
- Preferences

### Tags & Badges

**Role Tags:**
```tsx
<Tag color="red">Administrator</Tag>
<Tag color="purple">DeepSeek AI User</Tag>
<Tag color="gold">Enterprise User</Tag>
<Tag color="blue">Professional User</Tag>
<Tag color="default">Free User</Tag>
```

**Status Tags:**
```tsx
<Tag color="green">ACTIVE</Tag>
<Tag color="orange">SUSPENDED</Tag>
<Tag color="red">DELETED</Tag>
<Tag color="blue">PENDING</Tag>
```

**Verification Tags:**
```tsx
<Tag color="green">Verified</Tag>
<Tag color="orange">Unverified</Tag>
```

### Buttons

**Primary Actions:**
```tsx
<Button type="primary" icon={<SaveOutlined />}>
  Save User
</Button>
```

**Secondary Actions:**
```tsx
<Button icon={<EditOutlined />}>
  Edit
</Button>
```

**Danger Actions:**
```tsx
<Button danger icon={<DeleteOutlined />}>
  Delete
</Button>
```

**Link Actions:**
```tsx
<Button type="link" icon={<EyeOutlined />}>
  View Details
</Button>
```

### Modals & Confirmations

**Delete Confirmation:**
```tsx
Modal.confirm({
  title: 'Delete User',
  content: 'Are you sure you want to delete this user? This action cannot be undone.',
  okText: 'Delete',
  okType: 'danger',
  cancelText: 'Cancel',
  onOk: handleDelete
});
```

**Assignment Modal:**
```tsx
Modal.confirm({
  title: 'Assign Plan',
  content: (
    <Select>
      {/* Plan options */}
    </Select>
  ),
  okText: 'Assign',
  onOk: handleAssign
});
```

## Interaction Patterns

### Loading States

**Table Loading:**
```tsx
<Table loading={isLoading} ... />
```

**Page Loading:**
```tsx
<Spin size="large" />
```

**Button Loading:**
```tsx
<Button loading={isSaving}>Save</Button>
```

### Error States

**Form Errors:**
```tsx
<Form.Item
  validateStatus="error"
  help="Email is required"
>
  <Input />
</Form.Item>
```

**API Errors:**
```tsx
message.error('Failed to save user');
```

### Success States

**Success Message:**
```tsx
message.success('User created successfully');
```

**Success with Action:**
```tsx
notification.success({
  message: 'User Created',
  description: 'User has been created successfully.',
  btn: (
    <Button onClick={viewUser}>View User</Button>
  )
});
```

## Responsive Design

### Breakpoints
```css
--screen-xs: 480px;   /* Mobile */
--screen-sm: 576px;   /* Small tablet */
--screen-md: 768px;   /* Tablet */
--screen-lg: 992px;   /* Desktop */
--screen-xl: 1200px;  /* Large desktop */
--screen-xxl: 1600px; /* Extra large */
```

### Mobile Adaptations

**User List (Mobile):**
- Stack columns vertically
- Show avatar + name only
- Actions in slide-out drawer
- Filters in collapsible panel

**User Detail (Mobile):**
- Single column layout
- Tabs become accordion
- Statistics stack vertically

**User Form (Mobile):**
- Single column layout
- Full-width inputs
- Sticky action buttons

## Accessibility

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter to submit forms
- Escape to close modals
- Arrow keys for table navigation

### Screen Readers
- Meaningful alt text for images
- ARIA labels for icons
- Role attributes for custom components
- Skip navigation links

### Color Contrast
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

## Animation & Transitions

### Durations
```css
--transition-fast: 150ms;
--transition-base: 300ms;
--transition-slow: 500ms;
```

### Easing
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Common Animations
```css
/* Fade in */
opacity: 0 → 1 (300ms ease-in-out)

/* Slide in */
transform: translateY(10px) → translateY(0)
opacity: 0 → 1
(300ms ease-out)

/* Button hover */
transform: scale(1) → scale(1.05)
(150ms ease-in-out)
```

## Icons

Use Ant Design Icons consistently:

**User Related:**
- `<UserOutlined />` - User/profile
- `<TeamOutlined />` - Multiple users
- `<CrownOutlined />` - Role/permissions
- `<MailOutlined />` - Email
- `<PhoneOutlined />` - Phone

**Actions:**
- `<PlusOutlined />` - Create
- `<EditOutlined />` - Edit
- `<DeleteOutlined />` - Delete
- `<EyeOutlined />` - View
- `<SearchOutlined />` - Search
- `<FilterOutlined />` - Filter
- `<ReloadOutlined />` - Refresh

**Status:**
- `<CheckCircleOutlined />` - Success
- `<CloseCircleOutlined />` - Error
- `<ExclamationCircleOutlined />` - Warning
- `<InfoCircleOutlined />` - Info

## Best Practices

### Do's ✅
- Use Ant Design components consistently
- Provide clear feedback for all actions
- Show loading states during async operations
- Validate inputs on blur and submit
- Use appropriate icons with text labels
- Maintain consistent spacing
- Group related fields together

### Don'ts ❌
- Don't use custom components without reason
- Don't skip loading states
- Don't use color alone to convey meaning
- Don't make destructive actions easy to trigger
- Don't hide important information
- Don't use inconsistent terminology
- Don't skip error handling

## Examples

### Creating a User
1. Click "Create User" button
2. Form slides in or opens in modal
3. Fill required fields (marked with *)
4. Select role and plan
5. Click "Create" button
6. Show loading state on button
7. On success: Close form, show success message, refresh list
8. On error: Show error message, keep form open

### Editing a User
1. Click edit icon on user row
2. Navigate to edit view
3. Form pre-filled with current data
4. Make changes
5. Click "Update" button
6. Show loading state
7. On success: Navigate back, show success message
8. On error: Show error message, keep form open

### Deleting a User
1. Click delete icon
2. Show confirmation modal
3. User confirms deletion
4. Show loading state
5. On success: Remove from list, show success message
6. On error: Show error message

## Maintenance

This style guide should be:
- Updated when new patterns are introduced
- Reviewed during design reviews
- Referenced when building new features
- Used for onboarding new developers
- Kept in sync with implemented components

Last Updated: November 6, 2025
