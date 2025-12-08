# User Management System Documentation

## Overview

The LightDom User Management System provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing users with different roles and subscription plans. This system is designed to support various user types including administrators, DeepSeek AI users, paid plan subscribers, and default free users.

## Architecture

### Database Schema

The system uses PostgreSQL with the following main tables:

- **user_roles**: Defines available user roles with permissions
- **user_plans**: Subscription plans with features and pricing
- **users**: Extended user table with profile and subscription data
- **user_sessions**: Active user sessions for authentication
- **user_activity_logs**: Audit trail of all user actions
- **user_api_keys**: API keys for programmatic access

### User Types

#### 1. Admin User
- **Purpose**: Full system access for platform administrators
- **Features**:
  - User management (create, edit, delete users)
  - System settings access
  - Billing and security management
  - Monitoring and analytics
- **Limits**: Unlimited access to all features

#### 2. DeepSeek AI User
- **Purpose**: Special user type for AI/automation workflows
- **Features**:
  - Unlimited API access
  - Workflow automation
  - Advanced mining capabilities
  - AI model access
- **Limits**: No team members, focused on automation

#### 3. Enterprise User
- **Purpose**: Full-featured access for large organizations
- **Features**:
  - Unlimited optimizations
  - Unlimited API calls
  - Team management
  - Custom integrations
  - Dedicated support
- **Pricing**: $99/month or $990/year

#### 4. Professional (Pro) User
- **Purpose**: Enhanced features for professionals
- **Features**:
  - 100 optimizations/month
  - API access (1000 calls/day)
  - Advanced analytics
  - Up to 3 team members
- **Pricing**: $29/month or $290/year

#### 5. Free User
- **Purpose**: Basic access for getting started
- **Features**:
  - 10 optimizations/month
  - Basic dashboard
  - Community support
- **Pricing**: Free

#### 6. Guest User
- **Purpose**: Read-only access for visitors
- **Features**: Limited to viewing public content
- **Pricing**: Free

## API Endpoints

### User CRUD Operations

#### List All Users
```
GET /api/users?page=1&limit=20&search=&role=&plan=&status=&sort=created_at&order=DESC
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `search`: Search by name, email, or username
- `role`: Filter by role (admin, deepseek, enterprise, pro, free, guest)
- `plan`: Filter by plan (admin, deepseek, enterprise, pro, free)
- `status`: Filter by account status (active, suspended, pending)
- `sort`: Sort field (created_at, updated_at, email, username, reputation_score)
- `order`: Sort order (ASC, DESC)

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Get Single User
```
GET /api/users/:id
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role_name": "pro",
    "plan_name": "pro",
    ...
  }
}
```

#### Create New User
```
POST /api/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role_name": "free",
  "plan_name": "free",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "location": "New York, NY"
}
```

#### Update User
```
PUT /api/users/:id
```

**Request Body:** (only include fields to update)
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "bio": "Updated bio",
  "plan_name": "pro"
}
```

#### Delete User (Soft Delete)
```
DELETE /api/users/:id
```

### Plan Management

#### List Available Plans
```
GET /api/users/plans/list?public_only=true
```

#### Assign Plan to User
```
POST /api/users/:id/assign-plan
```

**Request Body:**
```json
{
  "plan_name": "pro"
}
```

### Role Management

#### List Available Roles
```
GET /api/users/roles/list
```

#### Assign Role to User
```
POST /api/users/:id/assign-role
```

**Request Body:**
```json
{
  "role_name": "admin"
}
```

### Statistics

#### Get User Statistics Overview
```
GET /api/users/stats/overview
```

**Response:**
```json
{
  "overview": {
    "total_users": 150,
    "active_users": 142,
    "suspended_users": 3,
    "new_users_30d": 25,
    "active_users_7d": 89
  },
  "by_plan": [...],
  "by_role": [...]
}
```

## Frontend Components

### UserList Component
**Location**: `src/components/admin/UserList.tsx`

Displays a paginated, filterable, and sortable list of all users.

**Features:**
- Search by name, email, or username
- Filter by role, plan, and status
- Sort by multiple fields
- Inline actions (view, edit, delete)
- Pagination controls

**Usage:**
```tsx
import UserList from '@/components/admin/UserList';

<UserList
  onUserSelect={(user) => console.log(user)}
  onCreateUser={() => navigate('/admin/users/create')}
/>
```

### UserDetail Component
**Location**: `src/components/admin/UserDetail.tsx`

Shows comprehensive details about a single user.

**Features:**
- Profile information
- Account and subscription details
- Activity timeline
- Plan features and limits
- Quick actions (assign role/plan)

**Usage:**
```tsx
import UserDetail from '@/components/admin/UserDetail';

<UserDetail
  userId="user-uuid"
  onEdit={() => setEditMode(true)}
  onBack={() => navigate('/admin/users')}
/>
```

### UserForm Component
**Location**: `src/components/admin/UserForm.tsx`

Form for creating new users or editing existing ones.

**Features:**
- All user fields (profile, contact, preferences)
- Role and plan selection
- Password for new users
- Account status management (edit mode)
- Validation and error handling

**Usage:**
```tsx
import UserForm from '@/components/admin/UserForm';

// Create mode
<UserForm
  onSuccess={(user) => console.log('Created:', user)}
  onCancel={() => navigate('/admin/users')}
/>

// Edit mode
<UserForm
  userId="user-uuid"
  onSuccess={(user) => console.log('Updated:', user)}
  onCancel={() => navigate('/admin/users')}
/>
```

### UserManagementPage
**Location**: `src/pages/admin/UserManagementPage.tsx`

Complete admin page with statistics and all user management features.

**Features:**
- User statistics dashboard
- Integrated list, detail, and form views
- Tab-based navigation
- Responsive layout

## Configuration Files

### User Plans Configuration
**Location**: `config/user-plans.json`

Defines all subscription plans with:
- Plan details (name, label, description)
- Pricing (monthly, yearly)
- Trial period
- Features list
- Usage limits

### User Roles Configuration
**Location**: `config/user-roles.json`

Defines all user roles with:
- Role details (name, label, description)
- Permission sets
- Feature flags
- Access levels

## Authentication & Authorization

### Authentication
All API endpoints (except plan listing) require a valid JWT token:

```javascript
headers: {
  'Authorization': 'Bearer <token>'
}
```

### Authorization

- **Admin-only endpoints**: Create, update, delete users; assign roles/plans
- **Self-service endpoints**: Users can view and update their own profile
- **Public endpoints**: List public plans (for signup pages)

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure session management
3. **Soft Deletes**: Users are marked deleted, not removed
4. **Audit Logging**: All user actions are logged
5. **Permission Checks**: Role-based access control
6. **Input Validation**: All inputs are validated
7. **SQL Injection Protection**: Parameterized queries

## Workflow Examples

### Creating an Admin User

1. Admin logs into the system
2. Navigates to User Management page
3. Clicks "Create User" button
4. Fills in user details:
   - Email: admin@company.com
   - Username: admin_user
   - Password: SecurePass123!
   - Role: Admin
   - Plan: Admin
5. Submits form
6. System creates user with admin privileges
7. Admin receives confirmation

### Creating a DeepSeek User

1. Admin creates user with:
   - Role: DeepSeek
   - Plan: DeepSeek AI Plan
   - No password (API key authentication)
2. System generates API key
3. DeepSeek user can access API endpoints
4. Unlimited API calls and workflow automation

### Assigning a Paid Plan

1. Admin views user details
2. Clicks "Change Plan" button
3. Selects new plan (e.g., "Professional")
4. Confirms change
5. System updates:
   - User's plan_id
   - Subscription status
   - Trial period (if applicable)
6. User gains access to plan features

## Database Migration

To set up the database schema:

```bash
psql -U postgres -d lightdom -f migrations/20251106_user_management_system.sql
```

This migration:
- Creates all required tables
- Inserts default roles and plans
- Adds indexes for performance
- Creates helper views
- Sets up triggers

## Future Enhancements

1. **Email Verification**: Automated email verification flow
2. **Two-Factor Authentication**: Enhanced security
3. **Team Management**: Organizations and team members
4. **Usage Tracking**: Monitor plan limits and usage
5. **Billing Integration**: Stripe/payment processing
6. **Bulk Operations**: Import/export users
7. **Advanced Filtering**: Saved filters and custom views
8. **User Impersonation**: Admin can view as user
9. **Notification System**: Email/SMS notifications
10. **Activity Dashboard**: Detailed user activity reports

## Troubleshooting

### Cannot Create User
- Check admin authentication token
- Verify required fields (email, username, password for new users)
- Ensure email/username is unique
- Confirm role and plan exist in database

### User Not Appearing in List
- Check if user was soft-deleted (deleted_at is not null)
- Verify filters are not excluding the user
- Check pagination (user may be on another page)

### Permission Denied
- Verify user has admin role
- Check JWT token is valid and not expired
- Ensure correct Authorization header format

## Support

For issues or questions:
- Check logs in `user_activity_logs` table
- Review API response error messages
- Contact system administrator
