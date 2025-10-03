# Admin Dashboard

A comprehensive admin dashboard for managing all application settings in the LightDom platform.

## Features

### 🎛️ Settings Management
- **9 Categories**: General, Performance, Blockchain, Security, API, UI, Database, Email, Monitoring
- **100+ Settings**: Comprehensive configuration options for all aspects of the application
- **Real-time Validation**: Settings are validated before saving with detailed error messages
- **Change Tracking**: Complete audit log of all setting changes with timestamps and user attribution

### 🔧 Core Functionality
- **Import/Export**: Backup and restore settings via JSON files
- **Reset to Defaults**: One-click reset to factory settings
- **Live Preview**: See setting changes in real-time
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📊 Settings Overview
- **Quick Status**: Visual overview of key settings at a glance
- **Status Indicators**: Color-coded status for different configuration states
- **Category Breakdown**: See how many settings are in each category

## Usage

### Accessing the Admin Dashboard
1. Navigate to `/admin` in your browser
2. Or click "Admin Dashboard" in the main dashboard sidebar
3. Requires authentication (protected route)

### Managing Settings
1. **Select Category**: Click on any tab (General, Performance, etc.)
2. **Modify Settings**: Change values using the appropriate input controls
3. **Save Changes**: Click "Save Settings" to apply changes
4. **View History**: Click "Change Log" to see all previous changes

### Settings Categories

#### General Settings
- Application name and version
- Environment configuration (dev/staging/prod)
- Debug and maintenance modes
- User registration and authentication settings
- Session management

#### Performance Settings
- Concurrent optimization limits
- Caching configuration
- Compression settings
- CDN configuration
- File upload limits
- Worker thread management

#### Blockchain Settings
- Network configuration (mainnet/testnet/local)
- RPC endpoints and chain IDs
- Gas management
- Smart contract addresses
- Mining configuration
- Event logging

#### Security Settings
- HTTPS and SSL configuration
- CORS settings
- Rate limiting
- CSRF protection
- Password policies
- JWT configuration
- Audit logging

#### API Settings
- Base URLs and versioning
- Swagger documentation
- GraphQL configuration
- WebSocket settings
- Request/response logging
- Health checks and metrics

#### UI Settings
- Theme configuration (light/dark/auto)
- Color schemes
- Typography settings
- Animation preferences
- Accessibility options
- Notification settings

#### Database Settings
- Connection parameters
- SSL configuration
- Connection pooling
- Query logging
- Backup settings
- Replication configuration

#### Email Settings
- SMTP configuration
- Provider selection (SendGrid, Mailgun, etc.)
- Authentication settings
- Email templates
- Queue management
- Retry policies

#### Monitoring Settings
- Metrics collection
- Health checks
- Logging configuration
- Error tracking (Sentry, Bugsnag, etc.)
- Uptime monitoring
- Alerting configuration

## API Reference

### AdminSettingsService
```typescript
// Get all settings
const settings = adminSettingsService.getAllSettings();

// Get settings by category
const generalSettings = adminSettingsService.getSettingsByCategory('general');

// Update a single setting
const result = adminSettingsService.updateSetting('general', 'appName', 'New App Name');

// Update multiple settings
const result = adminSettingsService.updateMultipleSettings([
  { category: 'general', key: 'appName', value: 'New App Name' },
  { category: 'ui', key: 'theme', value: 'dark' }
]);

// Reset to defaults
adminSettingsService.resetToDefaults('admin');

// Export settings
const jsonString = adminSettingsService.exportSettings();

// Import settings
const result = adminSettingsService.importSettings(jsonString, 'admin');
```

### useAdminSettings Hook
```typescript
import { useAdminSettings } from '../hooks/useAdminSettings';

const MyComponent = () => {
  const {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    updateMultipleSettings,
    resetToDefaults,
    exportSettings,
    importSettings
  } = useAdminSettings();

  // Use the hook methods...
};
```

## File Structure

```
src/components/admin/
├── AdminDashboard.tsx          # Main admin dashboard component
├── AdminDashboard.css          # Dashboard styles
├── SettingsOverview.tsx       # Settings overview component
└── README.md                  # This documentation

src/services/
└── AdminSettingsService.ts    # Settings management service

src/types/
└── AdminSettingsTypes.ts      # TypeScript type definitions

src/hooks/
└── useAdminSettings.ts         # React hook for settings management
```

## Security Considerations

- All settings changes are logged with user attribution
- Sensitive settings (passwords, secrets) are masked in the UI
- Settings validation prevents invalid configurations
- Import/export functionality includes validation
- Admin access is protected by authentication

## Best Practices

1. **Backup Before Changes**: Always export settings before making major changes
2. **Test in Development**: Test setting changes in development environment first
3. **Monitor Change Log**: Regularly review the change log for audit purposes
4. **Validate Settings**: Check that all settings are valid before saving
5. **Document Changes**: Use the reason field when making changes for documentation

## Troubleshooting

### Settings Not Saving
- Check browser console for validation errors
- Ensure all required fields are filled
- Verify network connectivity

### Import/Export Issues
- Ensure JSON format is valid
- Check file permissions
- Verify settings structure matches expected format

### Performance Issues
- Reduce number of concurrent settings changes
- Clear browser cache
- Check for JavaScript errors in console

## Contributing

When adding new settings:

1. Add the setting to the appropriate interface in `AdminSettingsTypes.ts`
2. Add default value in `AdminSettingsService.ts`
3. Add validation rules if needed
4. Update the admin dashboard UI to include the new setting
5. Update this documentation

## License

This admin dashboard is part of the LightDom platform and follows the same licensing terms.