import React from 'react';
import { Avatar, useTheme } from 'react-native-paper';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function UserAvatar({ user, size = 40, style }) {
  const theme = useTheme();
  const colors = theme.colors;

  if (user?.avatar) {
    const uri = user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`;
    return <Avatar.Image size={size} source={{ uri }} style={style} />;
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <Avatar.Text
      size={size}
      label={initials}
      style={[{ backgroundColor: colors.primary }, style]}
      labelStyle={{ color: colors.onPrimary, fontWeight: '700' }}
    />
  );
}
