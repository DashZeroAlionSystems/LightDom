import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationProps as MuiBottomNavigationProps } from '@mui/material';

export interface BottomNavigationProps extends MuiBottomNavigationProps {}

const BottomNavigation: React.FC<BottomNavigationProps> = (props) => {
  return <MuiBottomNavigation {...props} />;
};

export default BottomNavigation;
