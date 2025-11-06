import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { Workflow as WorkflowIcon, Extension as ComponentIcon, Palette as StyleguideIcon, BarChart as AnalyticsIcon, SmartToy as AgentIcon, Settings as SettingsIcon } from '@mui/icons-material';

export const QuickNavigationMenu: React.FC = () => {
  const menuItems = [
    { icon: <WorkflowIcon />, text: 'Workflows', path: '/workflows' },
    { icon: <ComponentIcon />, text: 'Components', path: '/components' },
    { icon: <StyleguideIcon />, text: 'Styleguides', path: '/styleguides' },
    { icon: <AnalyticsIcon />, text: 'Analytics', path: '/analytics' },
    { icon: <AgentIcon />, text: 'Agents', path: '/agents' },
    { icon: <SettingsIcon />, text: 'Settings', path: '/settings' }
  ];

  return (
    <Box sx={{ width: 250, bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Quick Navigation</Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} button sx={{ borderRadius: 1, mb: 0.5, '&:hover': { bgcolor: '#e0e0e0' } }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QuickNavigationMenu;
