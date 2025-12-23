import React from 'react';
import { BottomNavigationAction as MuiBottomNavigationAction, BottomNavigationActionProps as MuiBottomNavigationActionProps } from '@mui/material';

export interface BottomNavigationActionProps extends MuiBottomNavigationActionProps {}

const BottomNavigationAction: React.FC<BottomNavigationActionProps> = (props) => {
  return <MuiBottomNavigationAction {...props} />;
};

export default BottomNavigationAction;
