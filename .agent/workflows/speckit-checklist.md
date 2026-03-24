---
description: Create domain-specific validation checklists for quality gates
---

# Spec-Kit Checklist

Create domain-specific validation checklists based on the feature and project constitution. Checklists serve as quality gates before implementation.

## When to Use

- After `/speckit-plan` to create validation criteria
- When adding new quality dimensions to a feature
- To establish acceptance criteria before implementation

## Steps

### 1. Identify Checklist Domain

Common domains:
- **UX**: User experience validation
- **Security**: Security requirements
- **Performance**: Performance criteria
- **Accessibility**: A11y requirements
- **Testing**: Test coverage requirements
- **Documentation**: Doc completeness

User can specify: `/speckit-checklist Create a UX checklist for the dashboard`

### 2. Load Context

Read:
- Feature specification for requirements
- Constitution for project-wide standards
- Existing checklists in `FEATURE_DIR/checklists/`

### 3. Generate Checklist

Structure:

```markdown
# [Domain] Checklist: [Feature Name]

**Purpose**: [What this checklist validates]
**Created**: [Date]
**Feature**: [Link to spec.md]

## [Category 1]

- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

## [Category 2]

- [ ] [Specific, testable criterion]

## Notes

- Items marked incomplete require attention before `/speckit-implement`
```

### 4. Domain-Specific Items

**UX Checklist**:
- [ ] Primary action is obvious on each screen
- [ ] Can new user understand in 5 seconds?
- [ ] Touch targets are fingertip-sized
- [ ] Works in both Light and Dark mode
- [ ] RTL layout tested (if applicable)
- [ ] Numbers are readable at arm's length
- [ ] Scrollbar visible when content extends

**Security Checklist**:
- [ ] Authentication required for sensitive operations
- [ ] Input validation on all user inputs
- [ ] No sensitive data in logs
- [ ] Proper permission requests
- [ ] Secure storage for credentials

**Performance Checklist**:
- [ ] Lists use lazy loading
- [ ] Images are optimized
- [ ] Network calls are minimized
- [ ] Offline mode handled gracefully
- [ ] No blocking operations on main thread

**Testing Checklist**:
- [ ] Unit tests for business logic
- [ ] Integration tests for data flow
- [ ] UI tests for critical paths
- [ ] Edge cases covered
- [ ] Error scenarios tested

### 5. Write Checklist

// turbo
Write to `FEATURE_DIR/checklists/[domain].md`

### 6. Report Completion

Output:
- Checklist file path
- Item count
- Integration with `/speckit-implement` validation

## Guidelines

- Each item must be testable (yes/no answer)
- Draw from constitution principles
- Keep checklists focused (5-15 items per domain)
- Multiple checklists can exist per feature
