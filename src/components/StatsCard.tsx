import React from 'react';
import { Paper, Typography, Skeleton } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number | null;
  color: string;
  isLoading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  color,
  isLoading = false,
}) => (
  <Paper elevation={2} sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ color }} gutterBottom>
      {title}
    </Typography>
    {isLoading ? (
      <Skeleton variant="text" width={100} height={60} />
    ) : (
      <Typography variant="h4" fontWeight="bold">
        {value?.toLocaleString() ?? 0}
      </Typography>
    )}
  </Paper>
);
