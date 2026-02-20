import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Icon, useTheme, IconButton } from 'react-native-paper';
import {  spacing } from '../../constants/theme';

export default function EmptyState({ icon = 'inbox', title, subtitle, action, onAction }) {
  const theme = useTheme();
  const colors = theme.colors;
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={colors.primary} />
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {action}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    //color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    //color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: 24,
  },
});
