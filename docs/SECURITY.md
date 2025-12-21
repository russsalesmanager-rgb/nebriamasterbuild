# Nebria Security Policies

This document outlines the security controls, policies, and procedures for the Nebria platform.

## Security Architecture

### Defense in Depth

Nebria implements multiple layers of security:

1. **Edge Layer** (Cloudflare)
2. **API Gateway Layer** (Worker)
3. **Application Layer** (Backend API)
4. **Data Layer** (Encrypted storage)

## Authentication & Authorization

### JWT Token System

- **Access Tokens**: 15-minute expiry, used for API requests
- **Refresh Tokens**: 7-day expiry, used to obtain new access tokens
- **Token Storage**: Client-side in localStorage (web) or secure storage (mobile)

### Password Requirements

- Minimum 8 characters
- Must be hashed with bcrypt (salt rounds: 10)
- Never stored in plaintext
- Never logged or transmitted except during registration/login

### Role-Based Access Control (RBAC)

Five role levels (in order of privilege):

1. **OWNER** (roleId: 1)
   - Full platform control
   - Can override any action
   - All overrides are audit logged
   - Cannot be banned or restricted

2. **ADMIN** (roleId: 2)
   - User management
   - Content moderation
   - Analytics access
   - Cannot override owner actions

3. **MODERATOR** (roleId: 3)
   - Content moderation
   - User warnings/bans
   - Limited analytics

4. **VERIFIED_CREATOR** (roleId: 4)
   - Enhanced posting capabilities
   - Priority support
   - Special badges

5. **USER** (roleId: 5)
   - Standard user permissions
   - Post, comment, react
   - Default role for new users

## Content Security

### Illegal Content Policy

**Definition**: Content that is illegal under US federal law, including but not limited to:
- Child sexual abuse material (CSAM)
- Content promoting terrorism
- Content inciting violence
- Copyright infringement (when verified)

**Action Protocol**:
1. **Instant deletion** of content
2. **Permanent ban** of user account
3. **Audit log entry** with details
4. **Law enforcement notification** (when applicable)

**Owner Override**:
- Owner can unban content/users
- Override must include reason
- Action is logged in audit trail
- Recommended only for false positives

### Clickable URLs

URLs in content **are allowed** with safety controls:

1. **Rate Limiting**: Prevent spam
2. **Abuse Flags**: Users can report malicious links
3. **Scanning Stubs**: (Future) URL scanning for malware/phishing
4. **Owner Override**: Owner can remove specific domains

### Content Moderation Flow

```
User Posts Content
    ↓
Instant Checks (sync)
    ├─ Banned words
    ├─ Spam patterns
    └─ Rate limits
    ↓
Background Queue (async)
    ├─ Content analysis
    ├─ URL safety check
    ├─ Media scanning
    └─ User history review
    ↓
Action (if needed)
    ├─ Flag for review
    ├─ Auto-delete (if illegal)
    ├─ Temp suspension
    └─ Permanent ban
    ↓
Audit Log
```

## Data Protection

### Encryption

**In Transit**:
- TLS 1.3 for all connections
- HTTPS enforced (HTTP redirects to HTTPS)
- WebSocket Secure (WSS) for real-time

**At Rest**:
- Database: Encrypted at rest (Neon/Supabase)
- Media: Server-side encryption (R2)
- Passwords: bcrypt hashed (never plaintext)

### Data Privacy

**User Data**:
- Email is private (not displayed publicly)
- IP addresses logged for security only
- Minimal tracking (no 3rd party analytics by default)

**GDPR Compliance**:
- Users can export their data
- Users can request deletion
- Deletion request processed within 30 days
- Some data retained for legal compliance (audit logs)

### Sensitive Data Handling

**Never Log**:
- Passwords (plaintext or hashed)
- Full JWT tokens
- Full credit card numbers
- Social security numbers
- Personal identification numbers

**Log Only**:
- User IDs
- Request IDs
- Timestamps
- Actions performed
- IP addresses (hashed after 90 days)

## Input Validation

### Server-Side Validation

All inputs validated with express-validator:

**Posts**:
- Content: Max 5000 characters
- Type: Must be valid enum
- Zone: Must be valid zone key
- SQL injection prevention via Sequelize ORM
- XSS prevention via output encoding

**Users**:
- Username: 3-50 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Min 8 characters

**Files**:
- Size: Max 50MB per file
- Types: Whitelist of allowed MIME types
- Scan for malware (future enhancement)

### Output Encoding

- All user-generated content HTML-escaped
- URLs in content properly encoded
- JSON responses properly serialized

## Rate Limiting

### Global Limits

- **Standard API**: 100 requests / 15 minutes per IP
- **Auth endpoints**: 5 requests / 5 minutes per IP
- **Upload endpoints**: 10 uploads / hour per user
- **Post creation**: 20 posts / hour per user

### Progressive Penalties

1st violation: Warning
2nd violation: 1-hour suspension
3rd violation: 24-hour suspension
4th violation: Permanent ban (owner can override)

## Audit Logging

### Logged Actions

**Always Logged**:
- User registration/login/logout
- Post creation/deletion
- User bans/unbans
- Role changes
- Owner overrides
- Admin actions
- Content flagging
- File uploads/deletions

**Audit Log Schema**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "action": "ACTION_NAME",
  "entityType": "Post|User|File",
  "entityId": "uuid",
  "metadata": {
    "reason": "string",
    "previousValue": "any",
    "newValue": "any"
  },
  "createdAt": "timestamp"
}
```

**Retention**:
- Audit logs retained for 7 years minimum
- Immutable (cannot be deleted or modified)
- Encrypted at rest

## Security Headers

### HTTP Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' cdn.socket.io;
style-src 'self' 'unsafe-inline' fonts.googleapis.com;
font-src 'self' fonts.gstatic.com;
img-src 'self' data: https: http:;
connect-src 'self' ws: wss:;
frame-src 'self';
```

**Note**: `unsafe-inline` allowed for scripts to support single-page app. In production, consider moving to CSP nonces.

## Vulnerability Management

### Dependency Scanning

- Automated: GitHub Dependabot
- Weekly scans for vulnerabilities
- Auto-update for minor/patch versions
- Manual review for major versions

### Security Updates

- Critical: Deployed within 24 hours
- High: Deployed within 7 days
- Medium: Deployed within 30 days
- Low: Deployed with next release

### Penetration Testing

- Annual third-party penetration test
- Quarterly internal security audits
- Bug bounty program (future)

## Incident Response

### Security Incident Classification

**P0 (Critical)**:
- Data breach
- CSAM detected
- Complete service outage
- Database compromise

**P1 (High)**:
- Authentication bypass
- Privilege escalation
- SQL injection
- XSS vulnerability

**P2 (Medium)**:
- CSRF vulnerability
- Information disclosure
- Denial of service

**P3 (Low)**:
- Rate limit bypass
- Minor UI bugs
- Non-sensitive information leak

### Response Timeline

- **P0**: Immediate response, 1-hour resolution target
- **P1**: 4-hour response, 24-hour resolution target
- **P2**: 24-hour response, 1-week resolution target
- **P3**: 1-week response, 1-month resolution target

### Incident Steps

1. **Detect**: Monitor logs, alerts, user reports
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat, patch vulnerability
4. **Recover**: Restore service, verify integrity
5. **Post-Mortem**: Document incident, improve processes

## Compliance

### Standards

- **OWASP Top 10**: Addressed in design and implementation
- **CWE/SANS Top 25**: Regular review and mitigation
- **GDPR**: Data protection and privacy controls
- **CCPA**: California consumer privacy rights

### Third-Party Services

All third-party services vetted for:
- Security certifications (SOC 2, ISO 27001)
- Data handling practices
- Encryption in transit and at rest
- Incident response procedures

**Current Services**:
- **Cloudflare**: SOC 2 Type II, ISO 27001
- **Neon/Supabase**: SOC 2, encryption at rest
- **Upstash**: SOC 2, encryption at rest

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** publicly disclose the vulnerability
2. Email: security@nebria.app (set up after launch)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### Response Timeline

- Acknowledgment: Within 24 hours
- Initial assessment: Within 72 hours
- Fix deployed: Depends on severity (see above)
- Public disclosure: After fix deployed + 90 days

### Recognition

- Security researchers credited (if desired)
- Hall of fame (future)
- Bug bounty rewards (future program)

## Security Training

### Developer Training

- Secure coding practices
- OWASP Top 10 awareness
- Input validation techniques
- Authentication best practices
- Regular security workshops

### Admin Training

- Incident response procedures
- Content moderation policies
- User privacy protection
- Audit log review
- Owner override guidelines

## Regular Reviews

### Security Audits

- **Code Review**: Every PR reviewed for security issues
- **Dependency Audit**: Weekly automated scans
- **Access Review**: Quarterly review of user roles
- **Log Review**: Daily review of suspicious activity
- **Policy Review**: Annual review and update

### Metrics

Tracked monthly:
- Failed login attempts
- Rate limit violations
- Content moderation actions
- Security incidents
- Audit log entries
- Uptime/availability

---

Last Updated: 2024-12-21

For security inquiries: security@nebria.app (after launch)

For general support: support@nebria.app (after launch)
