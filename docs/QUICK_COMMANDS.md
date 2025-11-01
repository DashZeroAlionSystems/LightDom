# Design System Quick Commands

## Test the Design System RIGHT NOW

```bash
# 1. Make sure dev server is running
npm run dev

# 2. Open browser to test page
# Navigate to: http://localhost:3000/design-system

# 3. You should see a beautiful showcase of all Material Design 3 components!
```

## If Styles Don't Appear

```bash
# Check if CSS files exist
ls src/styles/material-design-3.css
ls src/index.css
ls src/discord-theme.css

# Check browser console for errors (F12 in browser)
# Look for CSS loading errors

# Verify imports in main.tsx
cat src/main.tsx | Select-String "css"
```

## Verify CSS Classes Are Generated

Open browser DevTools (F12):
1. Go to http://localhost:3000/design-system
2. Inspect any button element
3. Look at Computed styles
4. You should see CSS custom properties like `--md3-primary-600`
5. Check if `.md3-button` class is applied

## Component Update Workflow

### Step 1: Identify Component
```bash
# Find the component file
code src/pages/auth/LoginPage.tsx
```

### Step 2: Before - Current Code Pattern
```tsx
// ❌ OLD WAY - Inline styles
<button style={{ backgroundColor: '#7c3aed', padding: '10px 20px' }}>
  Login
</button>
```

### Step 3: After - Using MD3 Classes
```tsx
// ✅ NEW WAY - MD3 classes
<button className="md3-button md3-button-filled">
  Login
</button>
```

### Step 4: Test Changes
```bash
# Save file, check browser (hot reload)
# Should see styled button!
```

## Common MD3 Class Patterns

### Buttons
```tsx
<button className="md3-button md3-button-filled">Primary Action</button>
<button className="md3-button md3-button-outlined">Secondary Action</button>
<button className="md3-button md3-button-text">Tertiary Action</button>
```

### Typography
```tsx
<h1 className="md3-headline-large">Page Title</h1>
<h2 className="md3-headline-medium">Section Title</h2>
<p className="md3-body-large">Body text goes here</p>
```

### Cards
```tsx
<div className="md3-card md3-elevation-1 p-6">
  <h3 className="md3-title-large">Card Title</h3>
  <p className="md3-body-medium">Card content</p>
</div>
```

### Inputs
```tsx
<input 
  type="text" 
  className="md3-input w-full"
  placeholder="Enter text..."
/>
```

### Layout (Use Tailwind)
```tsx
<div className="max-w-md mx-auto p-6 space-y-4">
  {/* MD3 components here */}
</div>
```

## File Locations

### Documentation
- Research: `docs/research/`
- Status: `docs/DESIGN_SYSTEM_STATUS.md`
- Session Summary: `docs/DESIGN_SYSTEM_SESSION_SUMMARY.md`
- TODO: `TODO.md`

### CSS Files
- Material Design 3: `src/styles/material-design-3.css`
- Main styles: `src/index.css`
- Theme: `src/discord-theme.css`

### Test Page
- Component showcase: `src/pages/DesignSystemTest.tsx`
- Route: http://localhost:3000/design-system

### Pages to Update
- Login: `src/pages/auth/LoginPage.tsx`
- Register: `src/components/ui/auth/RegisterPage.tsx`
- Client Dashboard: `src/pages/client/ClientDashboard.tsx`
- Admin Dashboard: `src/pages/admin/AdminDashboard.tsx`

## Troubleshooting

### Styles not applying?
1. Check browser console (F12) for CSS errors
2. Verify import order in `src/main.tsx`
3. Check if component has inline styles overriding classes
4. Clear browser cache (Ctrl+Shift+R)

### Test page looks plain?
1. Check if CSS files exist in `src/styles/`
2. Rebuild: `npm run build` then `npm run dev`
3. Check Tailwind config: `tailwind.config.js`

### Colors wrong?
1. Verify CSS custom properties in browser DevTools
2. Check `tailwind.config.js` color configuration
3. Ensure Tailwind is generating color classes

### Dark mode not working?
1. Check `[data-mode="dark"]` selectors in MD3 CSS
2. Verify theme toggle is setting data attribute
3. Test with browser DevTools by manually adding `data-mode="dark"` to html element

## Next Steps

1. ✅ Visit http://localhost:3000/design-system
2. ✅ Take screenshot of styled components
3. ⏳ Update Button component
4. ⏳ Update LoginPage
5. ⏳ Update Dashboards
6. ⏳ Test and verify

## Success Criteria

✅ Test page shows beautiful Material Design 3 components  
✅ Buttons have proper colors and hover effects  
✅ Cards have elevation shadows  
✅ Typography follows MD3 scale  
✅ Colors match Material Design 3 palette  
✅ Animations are smooth  

---

**Quick Link**: http://localhost:3000/design-system  
**Status**: CSS ✅ | Components ⏳ | Docs ✅