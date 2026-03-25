---
description: "Mandatory security audit checklist covering secrets, injection, CSRF, rate limiting, dependencies."
---

# Security Scan Command

Perform a comprehensive security audit of the current codebase or specifically targeted files:

## The Checklist

1. **Secrets & Credentials**
   - No hardcoded API keys, passwords, or tokens in source code.
   - Using `.env` correctly, and `.env` is ignored by git.
   - Config files do not leak sensitive values.

2. **Injection Prevention**
   - SQL queries use parameterized queries or ORMs (no string concatenation).
   - Shell commands avoid user input or safely escape it.
   - No dynamic evaluation (`eval`, `setTimeout(string)`, etc.) of user input.

3. **Cross-Site Scripting (XSS) & CSRF**
   - User input rendered in HTML is safely escaped/encoded.
   - CSRF tokens used for state-changing operations where applicable.
   - Safe Headers (e.g., CSP, X-Frame-Options) exist when relevant.

4. **Access Control & Auth**
   - Authentication checks cover all protected endpoints.
   - Authorization/Roles verified appropriately.
   - Passwords hashed (e.g., bcrypt, argon2).
   - Session/JWT signatures are validated and appropriately scoped.

5. **Rate Limiting & Resources**
   - Endpoints have reasonable rate limits to prevent Brute Force or DoS.
   - Payloads have maximum size constraints.

6. **Dependencies**
   - Check if any known vulnerable dependencies are requested (e.g., `npm audit`, `pip-audit`, etc.).
   - Are dependency versions securely pinned?

## Process

1. Perform deep static analysis using search/regex for the above patterns.
2. If vulnerabilities are found, classify by Severity: CRITICAL, HIGH, MEDIUM, LOW.
3. Present findings and specific remediation strategies.
4. If $ARGUMENTS requests fixes, apply safe fixes for each vulnerability, testing after each fix. 
