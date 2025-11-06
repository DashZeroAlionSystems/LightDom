# Metaverse Dashboard - dom_space_harvester Database

## Overview

The Metaverse Dashboard provides a comprehensive view of the `dom_space_harvester` database, displaying real-time data about space bridges, chat rooms, mining activities, and economy metrics. This dashboard is designed to monitor and manage the LightDom metaverse ecosystem.

## Features

### 🏠 Overview Tab
- **Real-time Statistics**: Total bridges, space mined, chat rooms, active users
- **Recent Activity**: Latest bridge messages and system events
- **Quick Metrics**: Revenue, efficiency, and performance indicators

### 🌉 Space Bridges Tab
- **Bridge Management**: View all space bridges with filtering and search
- **Status Monitoring**: Real-time operational status and efficiency metrics
- **Space Utilization**: Track space usage, capacity, and optimization levels
- **Performance Analytics**: Bridge efficiency, volume, and connection strength

### 💬 Chat Rooms Tab
- **Room Directory**: Browse all metaverse chat rooms
- **Participant Tracking**: Monitor active users and engagement
- **Revenue Analytics**: Track room pricing and revenue generation
- **Space Allocation**: View space distribution across rooms

### 💰 Economy Tab
- **User Statistics**: Total users, balances, and staking information
- **Transaction Analytics**: Transaction volume and reward distribution
- **Marketplace Metrics**: Listings, sales, and trading activity
- **Performance Indicators**: Staking ratios and economic health

### 📊 Analytics Tab
- **Visual Charts**: Bridge utilization, user activity, and economy trends
- **Performance Metrics**: System efficiency and optimization statistics
- **Predictive Analytics**: Future trends and recommendations

## Database Schema

The dashboard connects to the `dom_space_harvester` database with the following key tables:

### Core Tables
- `metaverse.space_bridges` - Bridge infrastructure and status
- `metaverse.chat_rooms` - Virtual chat rooms and communities
- `metaverse.bridge_messages` - Real-time communication logs
- `metaverse.space_bridge_connections` - Space mining connections
- `metaverse.bridge_analytics` - Performance and usage metrics

### Views
- `metaverse.bridge_utilization` - Bridge efficiency and usage statistics
- `metaverse.active_rooms` - Currently active chat rooms
- `metaverse.economy_overview` - Economic metrics and user statistics

## API Endpoints

The dashboard uses the following API endpoints:

- `GET /api/metaverse/stats` - Overview statistics
- `GET /api/metaverse/bridges` - Space bridge data
- `GET /api/metaverse/chatrooms` - Chat room information
- `GET /api/metaverse/messages` - Recent bridge messages
- `GET /api/metaverse/economy` - Economy metrics

## Setup Instructions

### 1. Database Configuration

Ensure your PostgreSQL database is configured with the correct environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

### 2. Apply Database Schemas

Run the database migration to create the metaverse schema:

```bash
# Apply schemas via API
curl -X POST http://localhost:3001/api/db/apply-schemas

# Or use the migration endpoint
curl -X POST http://localhost:3001/api/db/migrate
```

### 3. Populate Sample Data

Add sample data to test the dashboard:

```bash
npm run db:populate-metaverse
```

### 4. Start the Application

```bash
# Start the API server
node simple-api-server.js

# Start the frontend (in another terminal)
npm run dev
```

### 5. Access the Dashboard

Navigate to `/metaverse` in your application to view the Metaverse Dashboard.

## Usage

### Navigation
- Use the tab navigation to switch between different views
- Click on bridge or room items for detailed information
- Use filters and search to find specific data

### Real-time Updates
- Enable auto-refresh for live data updates
- Manual refresh button for immediate updates
- Status indicators show real-time system health

### Data Management
- View detailed metrics for each bridge and room
- Monitor space utilization and efficiency
- Track economic performance and user activity

## Customization

### Adding New Metrics
1. Update the database schema with new tables/columns
2. Add corresponding API endpoints in `simple-api-server.js`
3. Update the dashboard component to display new data

### Styling
- Modify `MetaverseDashboard.tsx` for UI changes
- Update CSS classes for custom styling
- Use Tailwind CSS for consistent design

### Data Sources
- Connect additional data sources by updating API endpoints
- Add new database views for complex queries
- Implement caching for better performance

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify PostgreSQL is running
   - Test connection with `npm run db:health`

2. **No Data Displayed**
   - Ensure schemas are applied
   - Run sample data population
   - Check API endpoint responses

3. **Performance Issues**
   - Enable database indexing
   - Implement data pagination
   - Use connection pooling

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=metaverse:*
```

## Development

### File Structure
```
src/components/ui/
├── MetaverseDashboard.tsx     # Main dashboard component
├── MetaverseAlchemyDashboard.tsx
├── MetaverseAnimationDashboard.tsx
├── MetaverseAssetAnimations.tsx
├── MetaverseCombinationAnimations.tsx
├── MetaverseItemGraphics.tsx
├── MetaverseMarketplace.tsx
├── MetaverseMiningDashboard.tsx
├── MetaverseMiningRewards.tsx
└── MetaverseScene.tsx

scripts/
└── populate-metaverse-data.js  # Sample data population

database/
├── metaverse_schema.sql        # Core metaverse schema
├── unified_metaverse_migration.sql
└── bridge_schema.sql          # Bridge functionality
```

### Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for changes
4. Ensure database migrations are reversible

## Security Considerations

- Database credentials should be stored securely
- API endpoints should implement proper authentication
- User data should be properly sanitized
- Regular security audits recommended

## Performance Optimization

- Use database indexes for frequently queried columns
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor query performance and optimize as needed

## Future Enhancements

- Real-time WebSocket connections for live updates
- Advanced analytics and machine learning insights
- Mobile-responsive design improvements
- Integration with external blockchain networks
- Automated alerting and monitoring systems

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check database logs for errors
4. Contact the development team

---

**Note**: This dashboard is designed for the LightDom metaverse ecosystem and requires proper database setup and API server configuration to function correctly.
