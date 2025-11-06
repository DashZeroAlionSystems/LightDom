/**
 * DeepSeek User Management Workflow Service
 * Provides workflows for DeepSeek AI to manage users and understand data at each stage
 * Created: 2025-11-06
 */

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  requiredData: string[];
  optionalData: string[];
  actions: string[];
  nextStages: string[];
}

export interface UserManagementWorkflow {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  permissions: string[];
}

/**
 * DeepSeek User Management Workflows
 * Defines what information DeepSeek needs at each stage of user management
 */
export class DeepSeekUserWorkflowService {
  /**
   * Create New User Workflow
   * What DeepSeek needs to know to create a user
   */
  static getCreateUserWorkflow(): UserManagementWorkflow {
    return {
      id: 'create-user',
      name: 'Create New User',
      description: 'Workflow for creating a new user account with proper role and plan assignment',
      permissions: ['users:create', 'roles:read', 'plans:read'],
      stages: [
        {
          id: 'gather-basic-info',
          name: 'Gather Basic Information',
          description: 'Collect essential user information',
          requiredData: [
            'email',
            'username',
            'intended_role (admin|deepseek|enterprise|pro|free|guest)',
            'intended_plan (admin|deepseek|enterprise|pro|free)'
          ],
          optionalData: [
            'first_name',
            'last_name',
            'company',
            'password (not needed for DeepSeek users)',
            'wallet_address'
          ],
          actions: [
            'Validate email format',
            'Check email uniqueness',
            'Check username uniqueness',
            'Determine if password is required based on role'
          ],
          nextStages: ['validate-role-plan', 'cancel']
        },
        {
          id: 'validate-role-plan',
          name: 'Validate Role and Plan Compatibility',
          description: 'Ensure role and plan are compatible and exist',
          requiredData: [
            'role_name',
            'plan_name',
            'available_roles (from API)',
            'available_plans (from API)'
          ],
          optionalData: [],
          actions: [
            'Fetch available roles from GET /api/users/roles/list',
            'Fetch available plans from GET /api/users/plans/list',
            'Validate role exists',
            'Validate plan exists',
            'Check role-plan compatibility (e.g., admin role should have admin plan)'
          ],
          nextStages: ['gather-profile-data', 'gather-basic-info', 'cancel']
        },
        {
          id: 'gather-profile-data',
          name: 'Gather Profile Details',
          description: 'Collect additional profile information',
          requiredData: [],
          optionalData: [
            'phone',
            'location',
            'timezone',
            'language',
            'bio',
            'avatar_url'
          ],
          actions: [
            'Set defaults (timezone: UTC, language: en)',
            'Validate phone format if provided',
            'Validate timezone if provided'
          ],
          nextStages: ['create-user-account', 'cancel']
        },
        {
          id: 'create-user-account',
          name: 'Create User Account',
          description: 'Execute user creation via API',
          requiredData: [
            'all_validated_user_data'
          ],
          optionalData: [],
          actions: [
            'POST to /api/users with complete user data',
            'Handle success response (user created)',
            'Handle error responses (409 Conflict, 400 Bad Request, etc.)',
            'Log activity in user_activity_logs'
          ],
          nextStages: ['post-creation-setup', 'gather-basic-info']
        },
        {
          id: 'post-creation-setup',
          name: 'Post-Creation Setup',
          description: 'Complete any post-creation tasks',
          requiredData: [
            'created_user_id',
            'user_role',
            'user_plan'
          ],
          optionalData: [],
          actions: [
            'Generate API key if role is deepseek',
            'Send welcome email if role is not deepseek',
            'Set up trial period if plan has trial',
            'Log successful creation',
            'Return user data to caller'
          ],
          nextStages: ['complete']
        }
      ]
    };
  }

  /**
   * Update Existing User Workflow
   * What DeepSeek needs to know to update a user
   */
  static getUpdateUserWorkflow(): UserManagementWorkflow {
    return {
      id: 'update-user',
      name: 'Update Existing User',
      description: 'Workflow for updating user profile, role, or plan',
      permissions: ['users:read', 'users:update', 'roles:read', 'plans:read'],
      stages: [
        {
          id: 'identify-user',
          name: 'Identify User to Update',
          description: 'Locate the user that needs to be updated',
          requiredData: [
            'user_identifier (id, email, or username)'
          ],
          optionalData: [],
          actions: [
            'Search for user by identifier',
            'GET /api/users/:id to fetch current user data',
            'Verify user exists',
            'Check current role and plan'
          ],
          nextStages: ['determine-update-type', 'cancel']
        },
        {
          id: 'determine-update-type',
          name: 'Determine Update Type',
          description: 'Identify what needs to be updated',
          requiredData: [
            'current_user_data',
            'update_intent (profile|role|plan|status)'
          ],
          optionalData: [],
          actions: [
            'Determine if updating profile fields',
            'Determine if changing role',
            'Determine if changing plan',
            'Determine if changing account status'
          ],
          nextStages: [
            'update-profile',
            'change-role',
            'change-plan',
            'change-status',
            'cancel'
          ]
        },
        {
          id: 'update-profile',
          name: 'Update Profile Information',
          description: 'Update user profile fields',
          requiredData: [
            'user_id',
            'fields_to_update (first_name, last_name, bio, etc.)'
          ],
          optionalData: [
            'first_name',
            'last_name',
            'phone',
            'company',
            'location',
            'bio',
            'timezone',
            'language',
            'preferences'
          ],
          actions: [
            'Validate updated fields',
            'PUT /api/users/:id with updated data',
            'Log activity'
          ],
          nextStages: ['complete', 'determine-update-type']
        },
        {
          id: 'change-role',
          name: 'Change User Role',
          description: 'Assign a new role to the user',
          requiredData: [
            'user_id',
            'new_role_name',
            'current_role_name'
          ],
          optionalData: [],
          actions: [
            'Fetch available roles',
            'Validate new role exists',
            'Check if admin is removing last admin (not allowed)',
            'POST /api/users/:id/assign-role',
            'Log role change activity'
          ],
          nextStages: ['complete', 'determine-update-type']
        },
        {
          id: 'change-plan',
          name: 'Change Subscription Plan',
          description: 'Assign a new plan to the user',
          requiredData: [
            'user_id',
            'new_plan_name',
            'current_plan_name'
          ],
          optionalData: [
            'billing_information (for paid plans)',
            'downgrade_confirmation (if downgrading)'
          ],
          actions: [
            'Fetch available plans',
            'Validate new plan exists',
            'Check if downgrade requires confirmation',
            'Calculate trial period if applicable',
            'POST /api/users/:id/assign-plan',
            'Log plan change activity'
          ],
          nextStages: ['complete', 'determine-update-type']
        },
        {
          id: 'change-status',
          name: 'Change Account Status',
          description: 'Activate, suspend, or manage account status',
          requiredData: [
            'user_id',
            'new_status (active|suspended|pending)',
            'reason_for_change'
          ],
          optionalData: [],
          actions: [
            'Validate status transition',
            'PUT /api/users/:id with new account_status',
            'Invalidate sessions if suspending',
            'Send notification email',
            'Log status change activity'
          ],
          nextStages: ['complete', 'determine-update-type']
        }
      ]
    };
  }

  /**
   * Analyze User Workflow
   * What DeepSeek needs to understand user data and behavior
   */
  static getAnalyzeUserWorkflow(): UserManagementWorkflow {
    return {
      id: 'analyze-user',
      name: 'Analyze User Data',
      description: 'Workflow for understanding user information, behavior, and usage patterns',
      permissions: ['users:read', 'analytics:read'],
      stages: [
        {
          id: 'fetch-user-data',
          name: 'Fetch User Information',
          description: 'Retrieve complete user profile and metadata',
          requiredData: [
            'user_identifier'
          ],
          optionalData: [],
          actions: [
            'GET /api/users/:id for full user profile',
            'Extract role, plan, and permissions',
            'Note account status and subscription status',
            'Check email verification status'
          ],
          nextStages: ['analyze-activity', 'cancel']
        },
        {
          id: 'analyze-activity',
          name: 'Analyze User Activity',
          description: 'Understand user behavior and patterns',
          requiredData: [
            'user_id'
          ],
          optionalData: [],
          actions: [
            'Query user_activity_logs for recent actions',
            'Calculate login frequency',
            'Identify last active date',
            'Count total actions performed',
            'Analyze action types (optimizations, API calls, etc.)'
          ],
          nextStages: ['analyze-usage', 'generate-insights']
        },
        {
          id: 'analyze-usage',
          name: 'Analyze Plan Usage',
          description: 'Compare usage against plan limits',
          requiredData: [
            'user_plan_limits',
            'current_usage_data'
          ],
          optionalData: [],
          actions: [
            'Fetch plan limits from user.plan_limits',
            'Query usage data (optimizations, API calls, storage)',
            'Calculate % of limits used',
            'Identify approaching limits',
            'Determine if upgrade is recommended'
          ],
          nextStages: ['generate-insights']
        },
        {
          id: 'generate-insights',
          name: 'Generate User Insights',
          description: 'Create actionable insights about the user',
          requiredData: [
            'user_profile',
            'activity_data',
            'usage_data'
          ],
          optionalData: [],
          actions: [
            'Summarize user engagement level',
            'Identify potential issues (approaching limits, suspended, etc.)',
            'Recommend actions (upgrade plan, verify email, etc.)',
            'Generate user health score',
            'Create insights report'
          ],
          nextStages: ['complete']
        }
      ]
    };
  }

  /**
   * Get all available workflows
   */
  static getAllWorkflows(): UserManagementWorkflow[] {
    return [
      this.getCreateUserWorkflow(),
      this.getUpdateUserWorkflow(),
      this.getAnalyzeUserWorkflow()
    ];
  }

  /**
   * Get workflow by ID
   */
  static getWorkflowById(id: string): UserManagementWorkflow | null {
    const workflows = this.getAllWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  /**
   * Execute a workflow stage
   * This is a helper method that DeepSeek can use to execute individual stages
   */
  static async executeStage(
    workflowId: string,
    stageId: string,
    data: Record<string, any>
  ): Promise<{
    success: boolean;
    nextStage: string | null;
    data: Record<string, any>;
    errors: string[];
  }> {
    const workflow = this.getWorkflowById(workflowId);
    if (!workflow) {
      return {
        success: false,
        nextStage: null,
        data: {},
        errors: [`Workflow ${workflowId} not found`]
      };
    }

    const stage = workflow.stages.find(s => s.id === stageId);
    if (!stage) {
      return {
        success: false,
        nextStage: null,
        data: {},
        errors: [`Stage ${stageId} not found in workflow ${workflowId}`]
      };
    }

    // Validate required data
    const errors: string[] = [];
    for (const required of stage.requiredData) {
      if (!data[required]) {
        errors.push(`Missing required data: ${required}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        nextStage: null,
        data,
        errors
      };
    }

    // Stage execution would happen here
    // This is a template - actual implementation would call APIs
    return {
      success: true,
      nextStage: stage.nextStages[0] || null,
      data: { ...data },
      errors: []
    };
  }
}

export default DeepSeekUserWorkflowService;
