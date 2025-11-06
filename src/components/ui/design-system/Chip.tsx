import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export interface ChipProps extends Omit<MuiChipProps, 'variant'> {
  variant?: 'filled' | 'outlined';
}

const Chip: React.FC<ChipProps> = ({ variant = 'filled', ...props }) => {
  return <MuiChip variant={variant} {...props} />;
};

export default Chip;
