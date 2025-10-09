# Cursor Pre-Work Validation Checklist

## 🚨 **MANDATORY CHECKS BEFORE STARTING ANY WORK**

### **1. Project State Check**
- [ ] Read `.cursor/project-memory.md` to understand current project state
- [ ] Check if project is marked as "PRODUCTION_READY" or "COMPLETE"
- [ ] Verify what systems are already implemented and working

### **2. Existing Work Search**
- [ ] Search for existing files with similar functionality
- [ ] Check if components already exist in `src/components/`
- [ ] Check if services already exist in `src/services/`
- [ ] Check if API endpoints already exist in `api-server-express.js`
- [ ] Check if hooks already exist in `src/hooks/`

### **3. Documentation Check**
- [ ] Search existing documentation for the feature
- [ ] Check if feature is already documented in README files
- [ ] Verify if documentation needs updating vs. creating new files

### **4. Forbidden Actions Check**
- [ ] Verify task is not in forbidden list (auth, mining, dashboard, API rewrites)
- [ ] Check if task involves creating duplicate files
- [ ] Ensure task is not rebuilding existing functionality

### **5. File Creation Validation**
- [ ] Check if new file matches forbidden patterns
- [ ] Verify file doesn't already exist
- [ ] Ensure file creation is justified and necessary
- [ ] Check if existing files can be updated instead

## 🎯 **VALIDATION COMMANDS**

### **Search Existing Work:**
```bash
# Search for similar functionality
grep -r "keyword" src/ --include="*.ts" --include="*.tsx"

# Check API endpoints
grep -r "endpoint" api-server-express.js

# Check documentation
grep -r "feature" *.md
```

### **Check Project State:**
```bash
# Read project memory
cat .cursor/project-memory.md

# Check completion status
grep -i "complete\|ready\|status" *.md
```

### **Validate File Creation:**
```bash
# Check if file already exists
ls -la path/to/file

# Check for similar files
find . -name "*similar*" -type f
```

## 🚫 **FORBIDDEN ACTIONS**

### **DO NOT CREATE:**
- New authentication components (already complete)
- New mining services (already complete)
- New dashboard components (already complete)
- New API endpoints (already complete)
- New documentation files with suffixes (*_COMPLETE.md, etc.)

### **DO NOT REWRITE:**
- Working authentication system
- Working mining system
- Working dashboard system
- Working API integration
- Existing documentation

## ✅ **ALLOWED ACTIONS**

### **Bug Fixes:**
- Fix TypeScript errors
- Fix runtime errors
- Fix UI bugs
- Fix API bugs
- Fix integration issues

### **Enhancements:**
- Add new features (not rewrite existing)
- Improve performance
- Add tests
- Add monitoring
- Add security features

### **Documentation Updates:**
- Update existing README.md
- Update existing API docs
- Fix typos and errors
- Add missing information

## 🔍 **VALIDATION SCRIPT**

Run the validation script before starting work:

```bash
# Validate before starting work
node .cursor/validation-script.js "task description"

# Validate file creation
node .cursor/validation-script.js "create file: path/to/file"
```

## 📋 **DECISION TREE**

```
Is the project marked as PRODUCTION_READY?
├─ YES → Check if task is bug fix or enhancement
│   ├─ Bug fix → Proceed with caution
│   ├─ Enhancement → Proceed with caution
│   └─ Rewrite → STOP - Not allowed
└─ NO → Proceed with normal validation

Does existing work exist for this task?
├─ YES → Update existing work instead
└─ NO → Proceed with new work

Is file creation necessary?
├─ YES → Check forbidden patterns
│   ├─ Forbidden → STOP - Not allowed
│   └─ Allowed → Proceed
└─ NO → Update existing files
```

## 🎯 **SUCCESS CRITERIA**

### **Before Starting Work:**
- [ ] All validation checks passed
- [ ] No existing work found or existing work will be updated
- [ ] File creation is justified and necessary
- [ ] Task is not forbidden
- [ ] Project state is understood

### **After Completing Work:**
- [ ] No duplicate files created
- [ ] Existing functionality still works
- [ ] New work integrates properly
- [ ] Documentation is updated (not duplicated)
- [ ] Project state is maintained

## 🚨 **EMERGENCY STOP CONDITIONS**

Stop work immediately if:
- Project is marked as PRODUCTION_READY and task involves rewriting
- Existing work is found and task involves creating duplicates
- File creation matches forbidden patterns
- Task involves rebuilding working systems
- Validation script returns errors

## 📞 **ESCALATION**

If validation is unclear or conflicting:
1. Re-read project memory file
2. Search more thoroughly for existing work
3. Consider if task is truly necessary
4. Focus on bug fixes and enhancements only
5. When in doubt, don't create new files

---

**Remember: This project is 95% complete and production-ready. Focus on bug fixes and enhancements, not rebuilding existing functionality.**