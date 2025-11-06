# User Creation Workflow Rules & Documentation

## Overview

This document defines the complete workflow rules, validation logic, and business processes for creating and managing users in the LightDom platform. These rules ensure data integrity, security, and proper user lifecycle management.

## User Creation Workflows

### 1. Admin Creates User Workflow

**Actors:** System Administrator, Platform Administrator

**Preconditions:**
- Admin must be authenticated
- Admin must have 'admin' role
- Admin has valid JWT token

**Steps:**
1. Admin navigates to User Management page
2. Admin clicks "Create User" button
3. System displays user creation form
4. Admin fills in required fields:
   - Email (unique, valid format)
   - Username (unique, 3-50 characters)
   - Password (8+ characters, if not using wallet auth)
   - Role selection
   - Plan selection
5. Admin optionally fills profile fields:
   - First name, last name
   - Phone, company, location
   - Bio, timezone, language
6. Admin clicks "Create User" button
7. System validates all inputs
8. System checks for existing email/username
9. System creates user record:
   - Hash password with bcrypt
   - Assign selected role and plan
   - Set subscription dates based on plan trial period
   - Set account_status = 'active'
   - Set email_verified = false
10. System creates activity log entry
11. System returns success response with user data
12. UI shows success message
13. UI navigates back to user list

**Postconditions:**
- New user exists in database
- User has assigned role and plan
- Activity log entry created
- User can log in (if password provided)

**Validation Rules:**
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Username must be unique
- Username must be 3-50 alphanumeric characters
- Password must be 8+ characters (if provided)
- Role must exist in user_roles table
- Plan must exist in user_plans table
- Phone must be valid format (if provided)
- Timezone must be valid IANA timezone (if provided)

**Error Scenarios:**
- Email already exists → 409 Conflict
- Username already exists → 409 Conflict
- Invalid email format → 400 Bad Request
- Invalid role/plan → 400 Bad Request
- Missing required fields → 400 Bad Request
- Insufficient permissions → 403 Forbidden
- Invalid/expired token → 401 Unauthorized

### 2. Self-Service User Registration

**Actors:** New User (Public)

**Preconditions:**
- User visits registration page
- User agrees to terms of service

**Steps:**
1. User navigates to signup page
2. User fills registration form:
   - Email
   - Username
   - Password (min 8 chars)
   - Optional: Wallet address
3. User agrees to terms and conditions
4. User clicks "Sign Up" button
5. System validates inputs
6. System checks email/username uniqueness
7. System creates user with:
   - role = 'free' (default)
   - plan = 'free' (default)
   - account_status = 'pending' or 'active'
   - email_verified = false
8. System sends verification email
9. System creates session token
10. System returns success with token
11. UI redirects to dashboard
12. User sees "Verify Email" banner

**Postconditions:**
- User account created with free plan
- Verification email sent
- User logged in with active session
- Activity log entry created

**Validation Rules:**
- Same as admin creation
- Must accept terms of service
- ReCAPTCHA validation (if enabled)
- Rate limiting: Max 5 signups per IP per hour

### 3. DeepSeek User Creation

**Actors:** System Administrator

**Purpose:** Create automated AI user for workflows

**Special Requirements:**
- Role must be 'deepseek'
- Plan must be 'deepseek'
- No password (API key authentication)
- No email verification required
- API key generated automatically

**Steps:**
1. Admin creates user with role='deepseek'
2. System generates API key
3. System stores hashed API key
4. System returns API key to admin (one-time display)
5. Admin configures DeepSeek integration with API key

**Postconditions:**
- DeepSeek user created
- API key generated and stored
- User can authenticate via API key
- Unlimited API access enabled

### 4. Enterprise/Paid User Onboarding

**Actors:** Sales Team, New Enterprise Customer

**Preconditions:**
- Sales process completed
- Payment method on file
- Contract signed

**Steps:**
1. Sales team creates user account
2. Assigns 'enterprise' or 'pro' role
3. Assigns corresponding paid plan
4. Sets trial_ends_at if trial period
5. System sends welcome email with setup instructions
6. User receives login credentials
7. User logs in and completes profile
8. System tracks onboarding progress

**Postconditions:**
- Paid user account active
- Subscription billing scheduled
- Welcome email sent
- Onboarding tracking initiated

## User Update Workflows

### 1. User Updates Own Profile

**Allowed Fields:**
- first_name, last_name
- bio, avatar_url
- phone, company, location
- timezone, language
- preferences (JSON)

**Restrictions:**
- Cannot change email
- Cannot change username
- Cannot change role
- Cannot change plan
- Cannot change account_status

**Workflow:**
1. User navigates to profile settings
2. User modifies editable fields
3. User clicks "Save Changes"
4. System validates inputs
5. System updates user record
6. System logs activity
7. System returns updated user data
8. UI shows success message

### 2. Admin Updates User

**Allowed Fields:**
- All user editable fields
- Plus: role_id, plan_id
- Plus: account_status
- Plus: email_verified
- Plus: subscription_status

**Workflow:**
1. Admin selects user
2. Admin clicks "Edit"
3. Admin modifies fields
4. Admin clicks "Update User"
5. System validates admin permissions
6. System validates inputs
7. System updates user record
8. System logs activity (including admin ID)
9. System returns updated user
10. UI shows success message

### 3. Plan Assignment

**Workflow:**
1. Admin views user details
2. Admin clicks "Change Plan"
3. System shows available plans
4. Admin selects new plan
5. System calculates:
   - Subscription start date = now
   - Trial end date = now + plan.trial_period_days
   - Subscription status = 'trial' or 'active'
6. System updates user:
   - plan_id = new plan
   - subscription_started_at = now
   - trial_ends_at = calculated date
   - subscription_status = calculated status
7. System logs plan change
8. System returns updated user
9. UI shows success with plan details

**Business Rules:**
- Cannot downgrade from paid to free without confirmation
- Changing plan resets trial period if plan has trial
- Previous plan benefits end immediately
- New plan benefits activate immediately
- Billing adjustments handled separately

### 4. Role Assignment

**Workflow:**
1. Admin views user details
2. Admin clicks "Change Role"
3. System shows available roles
4. Admin selects new role
5. System validates role exists
6. System updates user.role_id
7. System logs role change
8. System returns updated user
9. UI shows success with new permissions

**Business Rules:**
- Admin cannot remove their own admin role
- At least one admin must exist in system
- Role change immediate, no grace period
- User sees new permissions on next login/refresh
- Active sessions may need re-authentication

## User Deletion Workflow

### Soft Delete (Default)

**Workflow:**
1. Admin selects user
2. Admin clicks "Delete"
3. System shows confirmation modal
4. Admin confirms deletion
5. System checks: Cannot delete self
6. System updates user:
   - deleted_at = current timestamp
   - account_status = 'deleted'
7. System invalidates all user sessions
8. System logs deletion (including admin ID)
9. System returns success
10. UI removes user from list

**Postconditions:**
- User record preserved in database
- User cannot log in
- User data available for reporting
- Can be restored by admin if needed

### Hard Delete (Restricted)

**When Allowed:**
- GDPR right to be forgotten request
- Data retention policy expiration
- Legal requirement

**Workflow:**
1. Admin initiates hard delete
2. System requires additional confirmation
3. System checks for dependencies:
   - Optimizations
   - Activity logs
   - API keys
   - Sessions
4. System archives related data
5. System deletes user record
6. System logs deletion
7. System returns success

**Postconditions:**
- User record removed from database
- Related records archived or deleted
- Action logged for compliance
- Cannot be undone

## Validation Rules

### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return error('Invalid email format');
}
```

### Username Validation
```javascript
const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
if (!usernameRegex.test(username)) {
  return error('Username must be 3-50 alphanumeric characters');
}
```

### Password Validation
```javascript
if (password.length < 8) {
  return error('Password must be at least 8 characters');
}
// Additional checks:
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character (optional)
```

### Phone Validation
```javascript
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
if (phone && !phoneRegex.test(phone)) {
  return error('Invalid phone number format');
}
```

## Business Rules

### Account Status Transitions

```
pending → active (email verified)
pending → suspended (admin action)
active → suspended (admin action)
active → deleted (admin action)
suspended → active (admin action)
deleted → (no transitions, terminal state)
```

### Subscription Status Transitions

```
trial → active (trial ends, payment successful)
trial → expired (trial ends, no payment)
active → past_due (payment failed)
active → cancelled (user/admin cancels)
past_due → active (payment recovered)
past_due → cancelled (grace period ends)
cancelled → (no automatic transitions)
```

### Plan Upgrade/Downgrade Rules

**Upgrade (Free → Pro → Enterprise):**
- Immediate access to new features
- Prorated billing adjustment
- No data loss
- Trial period not applicable

**Downgrade (Enterprise → Pro → Free):**
- Requires confirmation
- Schedule for end of billing period
- Warn about feature loss
- May require data reduction

### Role Permission Matrix

| Action | Guest | Free | Pro | Enterprise | DeepSeek | Admin |
|--------|-------|------|-----|------------|----------|-------|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create optimizations | ✗ | Limited | ✓ | ✓ | ✓ | ✓ |
| Access API | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Manage team | ✗ | ✗ | Limited | ✓ | ✗ | ✓ |
| View all users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Create users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Edit users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Assign roles/plans | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## Security Rules

### Password Requirements
- Minimum 8 characters
- Cannot be common password
- Cannot be username or email
- Hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Never logged or exposed in API

### Session Management
- JWT token expires after 24 hours
- Refresh token valid for 7 days
- Maximum 5 concurrent sessions per user
- Automatic logout after 30 minutes inactivity
- Session invalidated on password change
- Session invalidated on role change

### API Key Management
- Generated using crypto.randomBytes(32)
- Stored as SHA-256 hash
- Prefix shown for identification
- Rate limited per key
- Can be revoked by user or admin
- Expires after configured period

### Rate Limiting
- Signup: 5 per hour per IP
- Login: 10 per hour per IP
- Password reset: 3 per hour per email
- API calls: Based on plan limits
- Admin actions: 100 per minute

## Audit Logging

### What to Log
- User creation (who, when, role, plan)
- User updates (who, when, what changed)
- User deletion (who, when, reason)
- Login attempts (success/failure)
- Password changes
- Role/plan changes
- Session creation/destruction
- API key creation/revocation

### Log Format
```json
{
  "user_id": "uuid",
  "action": "user_created",
  "resource": "user",
  "resource_id": "uuid",
  "details": {
    "created_by": "admin_uuid",
    "role": "pro",
    "plan": "pro"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-11-06T13:00:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "User with this email already exists",
  "code": "USER_EXISTS",
  "status": 409,
  "details": {
    "field": "email",
    "value": "user@example.com"
  }
}
```

### Error Codes
- `USER_EXISTS` - Email or username already exists
- `INVALID_EMAIL` - Email format invalid
- `INVALID_USERNAME` - Username format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_ROLE` - Role doesn't exist
- `INVALID_PLAN` - Plan doesn't exist
- `PERMISSION_DENIED` - Insufficient permissions
- `AUTHENTICATION_REQUIRED` - Not authenticated
- `VALIDATION_ERROR` - Input validation failed
- `USER_NOT_FOUND` - User doesn't exist
- `CANNOT_DELETE_SELF` - Admin cannot delete own account

## Testing Scenarios

### Unit Tests Required
- Email validation
- Username validation
- Password hashing
- Token generation
- Permission checks
- Plan limit calculations

### Integration Tests Required
- User creation flow
- User update flow
- Plan assignment flow
- Role assignment flow
- Deletion flow
- Authentication flow

### End-to-End Tests Required
- Admin creates user
- User self-registration
- DeepSeek user creation
- Plan upgrade/downgrade
- User deletion and restoration

## Compliance & Privacy

### GDPR Compliance
- Right to access: User can export their data
- Right to rectification: User can update profile
- Right to erasure: User can request deletion
- Right to portability: User can export data
- Right to object: User can opt out of marketing

### Data Retention
- Active users: Retained indefinitely
- Deleted users: 30-day soft delete period
- After 30 days: Hard delete or archive
- Activity logs: 90 days
- Audit logs: 7 years

Last Updated: November 6, 2025
