# Development Guidelines Updates 📋

*Based on: OmniPanel Vercel Deployment Experience*  
*Created: January 2025*  
*Purpose: Rules for future project development and deployment*

---

## 🚀 Deployment Configuration Rules

### Rule 1: Vercel Function Runtime Specifications
```yaml
RULE: Always use @package@version format for Vercel function runtimes
IMPLEMENTATION:
  - ✅ DO: "runtime": "@vercel/node@5.2.2"
  - ❌ DON'T: "runtime": "nodejs22.x"
  - ❌ DON'T: "runtime": "nodejs@22.x"
VALIDATION: Research latest version before deployment
```

### Rule 2: Function Pattern Context Awareness
```yaml
RULE: Function patterns must be relative to build output directory
IMPLEMENTATION:
  - ✅ DO: "app/api/**/*.ts" (relative to build context)
  - ❌ DON'T: "apps/web/app/api/**/*.ts" (absolute from repo root)
VALIDATION: Consider buildCommand directory when defining patterns
```

### Rule 3: File Extension Accuracy
```yaml
RULE: Match function patterns to actual source file extensions
IMPLEMENTATION:
  - ✅ DO: "**/*.ts" for TypeScript projects
  - ✅ DO: "**/*.js" for JavaScript projects
  - ❌ DON'T: Mix .js patterns with .ts source files
VALIDATION: Verify file extensions in actual project structure
```

---

## 📦 Version Management Rules

### Rule 4: Node.js Version Consistency
```yaml
RULE: Maintain consistent Node.js versions across all project files
SCOPE:
  - package.json engines field (all packages)
  - vercel.json NODE_VERSION
  - .nvmrc file
  - README documentation
  - CI/CD configuration
VALIDATION: Single source of truth for version requirements
```

### Rule 5: Package Engine Standardization
```yaml
RULE: All packages in monorepo must specify same Node.js version
IMPLEMENTATION:
  engines: {
    "node": ">=22.0.0",
    "pnpm": ">=8.0.0"
  }
EXCEPTION: Only if specific package requires different version
VALIDATION: Automated check during CI/CD
```

### Rule 6: Documentation Version Alignment
```yaml
RULE: Update all documentation when changing version requirements
FILES_TO_UPDATE:
  - README.md
  - APP_BUILDS.md
  - All app-specific README files
  - Setup and installation guides
VALIDATION: Grep search for old version references
```

---

## 🏗️ Monorepo Configuration Rules

### Rule 7: Dual Configuration Consistency
```yaml
RULE: Keep root and app-specific vercel.json files synchronized
REQUIREMENT:
  - Same runtime versions
  - Consistent environment variables
  - Aligned build commands
  - Matching function patterns
VALIDATION: Automated diff checking
```

### Rule 8: Environment Variable Minimalism
```yaml
RULE: Use minimal, essential environment variables in deployment config
PREFERRED:
  - NODE_ENV: "production"
AVOID:
  - Redundant platform variables (VERCEL: "1")
  - Build-specific flags handled by platform
VALIDATION: Question necessity of each environment variable
```

### Rule 9: Build Command Optimization
```yaml
RULE: Optimize build commands for monorepo structure
PATTERN:
  buildCommand: "cd apps/[app-name] && npm run build"
  installCommand: "npm install && cd apps/[app-name] && npm install"
  outputDirectory: "apps/[app-name]/.next"
VALIDATION: Test build process locally before deployment
```

---

## 🔍 Research and Documentation Rules

### Rule 10: Documentation-First Problem Solving
```yaml
RULE: Always consult official documentation before attempting fixes
PROCESS:
  1. Read error message carefully
  2. Search official platform documentation
  3. Look for recent examples in same framework
  4. Verify latest package versions
VALIDATION: Document research sources in commit messages
```

### Rule 11: Incremental Change Strategy
```yaml
RULE: Make one configuration change per commit during debugging
BENEFITS:
  - Easier to identify working solutions
  - Clearer git history
  - Faster rollback capability
  - Better learning documentation
VALIDATION: Squash commits only after confirming solution
```

### Rule 12: Error Message Documentation
```yaml
RULE: Document exact error messages and solutions
REQUIREMENT:
  - Include full error text in commit messages
  - Document research sources
  - Explain solution reasoning
  - Add to lessons learned documents
VALIDATION: Create searchable knowledge base
```

---

## 🎯 Quality Assurance Rules

### Rule 13: Pre-Deployment Checklist Enforcement
```yaml
RULE: Complete checklist before any deployment attempt
CHECKLIST:
  - [ ] All vercel.json files updated consistently
  - [ ] Function patterns relative to build context
  - [ ] File extensions match source code
  - [ ] Environment variables minimized
  - [ ] Local build test successful
  - [ ] Documentation updated
VALIDATION: Automated pre-commit hooks
```

### Rule 14: Configuration Testing Strategy
```yaml
RULE: Test deployment configurations in isolation
APPROACH:
  - Create minimal test deployment
  - Verify each configuration element
  - Test API routes functionality
  - Validate build process
VALIDATION: Staging environment before production
```

### Rule 15: Knowledge Capture Requirement
```yaml
RULE: Document all deployment issues and solutions
DELIVERABLES:
  - Lessons learned document
  - Updated development guidelines
  - Error resolution playbook
  - Best practices update
VALIDATION: Reference materials for future deployments
```

---

## 🛠️ Development Workflow Rules

### Rule 16: Version Upgrade Strategy
```yaml
RULE: Plan and execute version upgrades systematically
PROCESS:
  1. Research compatibility impacts
  2. Update all version references simultaneously
  3. Test locally before committing
  4. Update deployment configurations
  5. Validate entire build pipeline
VALIDATION: Comprehensive testing across all environments
```

### Rule 17: Configuration Management
```yaml
RULE: Centralize deployment configuration knowledge
IMPLEMENTATION:
  - Single source configuration templates
  - Automated validation scripts
  - Standard configuration patterns
  - Version-controlled deployment docs
VALIDATION: Regular configuration audits
```

### Rule 18: Error Recovery Planning
```yaml
RULE: Plan rollback strategy before making changes
REQUIREMENTS:
  - Know how to revert each change
  - Identify last working configuration
  - Document rollback procedures
  - Test rollback process
VALIDATION: Practice rollback scenarios
```

---

## 📊 Monitoring and Maintenance Rules

### Rule 19: Deployment Monitoring
```yaml
RULE: Monitor deployments for configuration drift
MONITORING:
  - Regular configuration audits
  - Version alignment checks
  - Performance impact assessment
  - Error rate monitoring
VALIDATION: Automated alerts for configuration changes
```

### Rule 20: Knowledge Base Maintenance
```yaml
RULE: Keep deployment knowledge current and accessible
MAINTENANCE:
  - Regular documentation updates
  - Lessons learned compilation
  - Best practices refinement
  - Team knowledge sharing
VALIDATION: Quarterly documentation review
```

---

## 🎓 Implementation Guidelines

### Immediate Actions Required
1. **Update existing projects** with these rules
2. **Create automated checks** for version consistency
3. **Establish configuration templates** for new projects
4. **Train team members** on new guidelines
5. **Create reference documentation** for common scenarios

### Long-term Improvements
1. **Automated deployment validation** pipelines
2. **Configuration drift detection** systems
3. **Comprehensive error playbooks** for common issues
4. **Team knowledge sharing** sessions
5. **Regular guideline updates** based on new learnings

---

## 📝 Rule Implementation Checklist

### For New Projects
- [ ] Use Node.js version consistency rules (Rules 4-6)
- [ ] Implement Vercel configuration rules (Rules 1-3)
- [ ] Apply monorepo configuration rules (Rules 7-9)
- [ ] Establish quality assurance rules (Rules 13-15)

### For Existing Projects
- [ ] Audit current configurations against new rules
- [ ] Update inconsistent version references
- [ ] Standardize deployment configurations
- [ ] Document existing deployment knowledge

### For Team Processes
- [ ] Create deployment checklists based on rules
- [ ] Establish configuration review processes
- [ ] Implement automated validation where possible
- [ ] Schedule regular knowledge sharing sessions

---

*These rules should be integrated into existing development guidelines and updated based on future deployment experiences and platform changes.* 