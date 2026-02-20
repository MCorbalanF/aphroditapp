import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

const TYPE_CONFIG = {
  invitation_received: { icon: 'account-plus', color: '#845EC2' },
  invitation_accepted: { icon: 'account-check', color: '#6BCB77' },
  new_content: { icon: 'bell-ring', color: '#FF6B9D' },
  content_updated: { icon: 'pencil', color: '#FF9671' },
  default: { icon: 'bell', color: colors.primary },
};

export default function NotificationItem({ notification, onPress }) {
  const { title, body, notification_type, is_read, created_at } = notification;
  const config = TYPE_CONFIG[notification_type] || TYPE_CONFIG.default;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, !is_read && styles.unread]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: config.color + '22' }]}>
        <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !is_read && styles.titleUnread]} numberOfLines={1}>
          {title}
        </Text>
        {body ? (
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        ) : null}
        <Text style={styles.time}>{timeAgo(created_at)}</Text>
      </View>
      {!is_read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  unread: {
    backgroundColor: colors.pink100,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  titleUnread: {
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
});
