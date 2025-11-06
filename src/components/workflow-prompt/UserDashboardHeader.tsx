import React from 'react';
import { Box, Avatar, Typography, IconButton, Badge } from '@mui/material';
import { Notifications as NotificationIcon, Settings as SettingsIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';

export const UserDashboardHeader: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: '#6366f1' }}>JD</Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>John Doe</Typography>
          <Typography variant="caption" color="text.secondary">Admin • Project Alpha</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton>
          <Badge badgeContent={3} color="error">
            <NotificationIcon />
          </Badge>
        </IconButton>
        <IconButton><SettingsIcon /></IconButton>
        <IconButton><LogoutIcon /></IconButton>
      </Box>
    </Box>
  );
};

export default UserDashboardHeader;
