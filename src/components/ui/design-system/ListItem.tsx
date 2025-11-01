import React from 'react';
import { ListItem as MuiListItem, ListItemProps as MuiListItemProps } from '@mui/material';

export interface ListItemProps extends MuiListItemProps {}

const ListItem: React.FC<ListItemProps> = (props) => {
  return <MuiListItem {...props} />;
};

export default ListItem;
