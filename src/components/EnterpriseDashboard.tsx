import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Building2,
  Users,
  Shield,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Key,
  Globe,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  UserPlus,
  UserMinus,
  RefreshCw
} from 'lucide-react';
import { 
  EnterpriseOrganization, 
  SSOProvider, 
  EnterpriseUser, 
  SSOSession,
  SSOAnalytics 
} from '../types/SSOTypes';

interface EnterpriseDashboardProps {
  enterpriseId: string;
  onUserCreate?: (user: EnterpriseUser) => void;
  onUserUpdate?: (user: EnterpriseUser) => void;
  onUserDelete?: (userId: string) => void;
  onProviderCreate?: (provider: SSOProvider) => void;
  onProviderUpdate?: (provider: SSOProvider) => void;
  onProviderDelete?: (providerId: string) => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  enterpriseId,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onProviderCreate,
  onProviderUpdate,
  onProviderDelete
}) => {
  const [organization, setOrganization] = useState<EnterpriseOrganization | null>(null);
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [sessions, setSessions] = useState<SSOSession[]>([]);
  const [analytics, setAnalytics] = useState<SSOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const loadEnterpriseData = async () => {
      try {
        setLoading(true);
        
        // Mock organization data
        const mockOrganization: EnterpriseOrganization = {
          id: enterpriseId,
          name: 'LightDom Enterprise',
          domain: 'lightdom.com',
          description: 'Leading DOM optimization platform',
          logoUrl: '/logo.png',
          website: 'https://lightdom.com',
          industry: 'Technology',
          size: '1000+',
          ssoProviders: ['saml_1', 'oauth_1'],
          defaultSsoProvider: 'saml_1',
          settings: {
            allowSelfRegistration: false,
            requireEmailVerification: true,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              maxAge: 90
            },
            sessionSettings: {
              timeout: 480, // 8 hours
              maxConcurrentSessions: 3,
              requireReauthForSensitive: true
            },
            securitySettings: {
              requireMFA: true,
              allowedMfaMethods: ['totp', 'sms', 'email'],
              ipWhitelist: ['192.168.1.0/24'],
              geoRestrictions: ['US', 'CA', 'EU']
            },
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
              logoUrl: '/logo.png',
              faviconUrl: '/favicon.ico'
            }
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {}
        };

        // Mock SSO providers
        const mockProviders: SSOProvider[] = [
          {
            id: 'saml_1',
            name: 'Corporate SAML',
            type: 'saml',
            displayName: 'Corporate SAML Provider',
            description: 'Main corporate SAML identity provider',
            iconUrl: '/icons/saml.png',
            isActive: true,
            configuration: {
              saml: {
                entityId: 'https://saml.lightdom.com',
                ssoUrl: 'https://saml.lightdom.com/sso',
                certificate: '-----BEGIN CERTIFICATE-----...',
                nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
                assertionConsumerServiceUrl: 'https://app.lightdom.com/auth/saml/callback',
                audience: 'https://app.lightdom.com',
                issuer: 'https://saml.lightdom.com',
                signatureAlgorithm: 'RSA-SHA256',
                digestAlgorithm: 'SHA256'
              }
            },
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'oauth_1',
            name: 'Google Workspace',
            type: 'oauth',
            displayName: 'Google Workspace OAuth',
            description: 'Google Workspace integration',
            iconUrl: '/icons/google.png',
            isActive: true,
            configuration: {
              oauth: {
                clientId: 'google-client-id',
                clientSecret: 'google-client-secret',
                authorizationUrl: 'https://accounts.google.com/oauth/authorize',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
                scope: ['openid', 'email', 'profile'],
                redirectUri: 'https://app.lightdom.com/auth/oauth/callback',
                responseType: 'code',
                grantType: 'authorization_code'
              }
            },
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Mock users
        const mockUsers: EnterpriseUser[] = [
          {
            id: 'user_1',
            userId: 'user_1',
            enterpriseId: enterpriseId,
            ssoProviderId: 'saml_1',
            externalId: 'john.doe@lightdom.com',
            username: 'john.doe',
            email: 'john.doe@lightdom.com',
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            roles: ['admin', 'developer'],
            groups: ['engineering', 'admins'],
            permissions: ['read', 'write', 'admin'],
            isActive: true,
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          },
          {
            id: 'user_2',
            userId: 'user_2',
            enterpriseId: enterpriseId,
            ssoProviderId: 'oauth_1',
            externalId: 'jane.smith@lightdom.com',
            username: 'jane.smith',
            email: 'jane.smith@lightdom.com',
            firstName: 'Jane',
            lastName: 'Smith',
            displayName: 'Jane Smith',
            roles: ['user'],
            groups: ['marketing'],
            permissions: ['read'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          }
        ];

        // Mock sessions
        const mockSessions: SSOSession[] = [
          {
            id: 'session_1',
            userId: 'user_1',
            enterpriseId: enterpriseId,
            ssoProviderId: 'saml_1',
            sessionToken: 'session_token_1',
            refreshToken: 'refresh_token_1',
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            isActive: true,
            metadata: {}
          }
        ];

        // Mock analytics
        const mockAnalytics: SSOAnalytics = {
          totalLogins: 1250,
          successfulLogins: 1200,
          failedLogins: 50,
          uniqueUsers: 45,
          averageSessionDuration: 240, // 4 hours
          topProviders: [
            {
              providerId: 'saml_1',
              providerName: 'Corporate SAML',
              loginCount: 800,
              successRate: 96
            },
            {
              providerId: 'oauth_1',
              providerName: 'Google Workspace',
              loginCount: 400,
              successRate: 98
            }
          ],
          dailyStats: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            logins: Math.floor(Math.random() * 50) + 20,
            uniqueUsers: Math.floor(Math.random() * 20) + 10,
            averageSessionDuration: Math.floor(Math.random() * 200) + 180
          })),
          errorStats: [
            { errorType: 'Invalid credentials', count: 25, percentage: 50 },
            { errorType: 'Session expired', count: 15, percentage: 30 },
            { errorType: 'Network error', count: 10, percentage: 20 }
          ]
        };

        setOrganization(mockOrganization);
        setSsoProviders(mockProviders);
        setUsers(mockUsers);
        setSessions(mockSessions);
        setAnalytics(mockAnalytics);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load enterprise data');
      } finally {
        setLoading(false);
      }
    };

    loadEnterpriseData();
  }, [enterpriseId]);

  const handleCreateUser = async () => {
    // In a real implementation, you would open a user creation dialog
    console.log('Create user');
  };

  const handleCreateProvider = async () => {
    // In a real implementation, you would open a provider creation dialog
    console.log('Create SSO provider');
  };

  const handleSyncUsers = async () => {
    // In a real implementation, you would sync users from SSO providers
    console.log('Sync users from SSO providers');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      pending: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{organization?.name}</h1>
            <p className="text-gray-600">{organization?.domain}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(organization?.isActive ? 'active' : 'inactive')}
          {getStatusBadge(organization?.isActive ? 'active' : 'inactive')}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSO Providers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ssoProviders.length}</div>
            <p className="text-xs text-muted-foreground">
              {ssoProviders.filter(p => p.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter(s => s.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.averageSessionDuration} min avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? Math.round((analytics.successfulLogins / analytics.totalLogins) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalLogins} total logins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="providers">SSO Providers</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enterprise Users</CardTitle>
                  <CardDescription>Manage users and their access</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleSyncUsers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Users
                  </Button>
                  <Button onClick={handleCreateUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.groups.map((group) => (
                            <Badge key={group} variant="outline" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.isActive ? 'active' : 'inactive')}
                          {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SSO Providers</CardTitle>
                  <CardDescription>Configure identity providers</CardDescription>
                </div>
                <Button onClick={handleCreateProvider}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ssoProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <CardTitle className="text-lg">{provider.displayName}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(provider.isActive ? 'active' : 'inactive')}
                          {getStatusBadge(provider.isActive ? 'active' : 'inactive')}
                        </div>
                      </div>
                      <CardDescription>{provider.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <Badge variant="outline">{provider.type.toUpperCase()}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Users:</span>
                          <span>{users.filter(u => u.ssoProviderId === provider.id).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Updated:</span>
                          <span>{new Date(provider.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Monitor user sessions and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {users.find(u => u.id === session.userId)?.displayName || 'Unknown User'}
                      </TableCell>
                      <TableCell>
                        {ssoProviders.find(p => p.id === session.ssoProviderId)?.name || 'Unknown Provider'}
                      </TableCell>
                      <TableCell>{session.ipAddress}</TableCell>
                      <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.lastActivityAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Login Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Logins:</span>
                    <span className="font-medium">{analytics?.totalLogins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful:</span>
                    <span className="font-medium text-green-600">{analytics?.successfulLogins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{analytics?.failedLogins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Users:</span>
                    <span className="font-medium">{analytics?.uniqueUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session Duration:</span>
                    <span className="font-medium">{analytics?.averageSessionDuration} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topProviders.map((provider) => (
                    <div key={provider.providerId} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{provider.providerName}</div>
                        <div className="text-sm text-gray-500">{provider.loginCount} logins</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{provider.successRate}%</div>
                        <div className="text-sm text-gray-500">success rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Configure enterprise settings and policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input 
                    id="org-name" 
                    value={organization?.name || ''} 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="org-domain">Domain</Label>
                  <Input 
                    id="org-domain" 
                    value={organization?.domain || ''} 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="default-provider">Default SSO Provider</Label>
                  <Select value={organization?.defaultSsoProvider || ''}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {ssoProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="self-registration"
                    checked={organization?.settings.allowSelfRegistration || false}
                    className="rounded"
                  />
                  <Label htmlFor="self-registration">Allow self-registration</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="require-mfa"
                    checked={organization?.settings.securitySettings.requireMFA || false}
                    className="rounded"
                  />
                  <Label htmlFor="require-mfa">Require MFA</Label>
                </div>

                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseDashboard;