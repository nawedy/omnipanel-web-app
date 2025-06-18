# Vercel Deployment Troubleshooting Guide

## 🚨 Problem: "Invalid Route Source Pattern" Error

**Date Encountered**: January 2, 2025  
**Resolution Status**: ✅ Resolved  
**Time to Resolution**: ~2 hours

---

## 📋 Problem Description

### Error Message
```
Error: Invalid route source pattern: "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot))"
```

### Symptoms
- Vercel deployment fails during configuration validation
- Multiple attempts to fix with different approaches fail
- Cached project configurations persist problematic patterns
- Error occurs even after deleting `.vercel` directory

### Root Cause
**Vercel uses path-to-regexp syntax, NOT RegExp syntax** for route source patterns in `vercel.json`.

---

## 🔍 Debugging Process

### Step 1: Identify the Problem
1. **Error Location**: Check `vercel.json` headers section
2. **Pattern Analysis**: Look for RegExp-style patterns like `/(.*\\.(...))`
3. **Documentation Check**: Consult Vercel's route pattern documentation

### Step 2: Common Misconceptions
❌ **Wrong Assumption**: Vercel accepts standard RegExp patterns  
✅ **Reality**: Vercel requires path-to-regexp syntax

❌ **Wrong Fix**: Trying to escape RegExp characters further  
✅ **Correct Fix**: Convert to path-to-regexp syntax

### Step 3: Cached Configuration Issues
- Deleting `.vercel` directory doesn't always clear server-side cache
- Creating new project names can help bypass cached configs
- Server-side project settings may retain invalid patterns

---

## ✅ Solution

### Pattern Conversion Examples

#### Static File Extensions
```json
// ❌ INVALID (RegExp syntax)
"source": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot))"

// ✅ VALID (path-to-regexp syntax)
"source": "/:path*.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)"
```

#### Alternative Valid Patterns
```json
// For nested paths with file extensions
"source": "**/*.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)"

// For specific directory patterns
"source": "/static/:path*"

// For catch-all routes
"source": "/:path*"
```

### Complete Working Configuration
```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm run build:website-with-deps",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install --filter @omnipanel/website --filter @omnipanel/theme-engine --no-frozen-lockfile",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/:path*.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, s-maxage=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🛠️ Debugging Commands

### Essential Commands for Future Reference

```bash
# Check deployment status
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# Clear local cache
rm -rf .vercel

# Test deployment with verbose output
vercel --prod --debug

# Validate vercel.json syntax
vercel dev --debug

# Check route patterns in deployed config
vercel inspect <deployment-url> | grep -A10 "Routes"
```

### Testing Route Patterns
```bash
# Test if deployment is responding
curl -I https://your-deployment.vercel.app

# Check specific static asset
curl -I https://your-deployment.vercel.app/favicon.ico

# Verify cache headers
curl -H "Accept: text/html" https://your-deployment.vercel.app/some-asset.js
```

---

## 🔄 Systematic Troubleshooting Process

### Phase 1: Pattern Identification
1. **Locate the Error**: Find the exact pattern causing issues
2. **Pattern Type**: Identify if it's headers, redirects, or rewrites
3. **Syntax Check**: Verify if using RegExp vs path-to-regexp

### Phase 2: Pattern Conversion
1. **Convert Syntax**: Change from RegExp to path-to-regexp
2. **Test Locally**: Use `vercel dev` to test configuration
3. **Validate Patterns**: Ensure patterns match intended routes

### Phase 3: Deployment Testing
1. **Clear Cache**: Remove `.vercel` directory
2. **Deploy**: Use `vercel --prod`
3. **Inspect**: Check deployed configuration with `vercel inspect`
4. **Verify**: Test actual routes and headers

### Phase 4: Persistent Issues
1. **New Project**: Create new Vercel project if cache persists
2. **Different Name**: Use different project name to avoid conflicts
3. **Manual Config**: Manually configure project settings in Vercel dashboard

---

## 📚 Reference Documentation

### Key Resources
1. **Vercel Route Patterns**: https://vercel.com/docs/projects/project-configuration#routes
2. **path-to-regexp Syntax**: https://github.com/pillarjs/path-to-regexp
3. **Vercel Headers**: https://vercel.com/docs/projects/project-configuration#headers
4. **Error Documentation**: https://vercel.com/docs/errors

### Common path-to-regexp Patterns
```
:param          - Named parameter
:param*         - Zero or more parameters
:param+         - One or more parameters
:param?         - Optional parameter
**              - Match everything (including slashes)
*               - Match segment (excluding slashes)
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. RegExp Syntax in Vercel
❌ Don't use: `/(.*\\.js)$`, `\\d+`, `[a-z]+`  
✅ Use instead: `/:path*.js`, `/:id`, `/:slug`

### 2. Cached Configuration
- Always delete `.vercel` directory when changing patterns
- Consider using new project names for persistent cache issues
- Server-side cache may require creating entirely new projects

### 3. Pattern Testing
- Test patterns locally with `vercel dev` before deploying
- Use `vercel inspect` to verify deployed configuration
- Don't assume patterns work without verification

### 4. File Extension Patterns
❌ Complex RegExp: `/(.*\\.(js|css|...))`  
✅ Simple path-to-regexp: `/:path*.(js|css|...)`

---

## 🎯 Future Instructions for AI Assistant

### When Encountering "Invalid Route Source Pattern" Error:

1. **Immediate Actions**:
   - Identify the problematic pattern in `vercel.json`
   - Check if using RegExp syntax instead of path-to-regexp
   - Reference this document for conversion examples

2. **Pattern Conversion Priority**:
   - Convert RegExp patterns to path-to-regexp syntax first
   - Use simple patterns like `/:path*` when possible
   - Avoid complex RegExp constructs

3. **Testing Strategy**:
   - Clear `.vercel` directory
   - Test with `vercel dev` locally
   - Deploy and inspect configuration
   - Verify actual route behavior

4. **Escalation Path**:
   - If patterns are correct but errors persist, try new project name
   - If cache issues continue, create entirely new Vercel project
   - Document any new patterns or edge cases encountered

### Pattern Conversion Quick Reference:
```
RegExp → path-to-regexp
/(.*\\.(ext))  →  /:path*.(ext)
/(.*)          →  /:path*
/api/(.*)      →  /api/:path*
\\d+           →  :id (with validation in code)
[a-zA-Z]+      →  :slug (with validation in code)
```

---

## 📊 Resolution Metrics

- **Time to Identify**: 30 minutes
- **Time to Fix**: 15 minutes  
- **Time to Deploy**: 5 minutes
- **Total Resolution**: ~2 hours (including research and documentation)

**Success Indicators**:
- ✅ Deployment completes without errors
- ✅ Routes show correct patterns in `vercel inspect`
- ✅ Static assets load with proper cache headers
- ✅ Website responds correctly to requests

---

*This document should be updated whenever new Vercel deployment issues are encountered to build a comprehensive troubleshooting knowledge base.* 