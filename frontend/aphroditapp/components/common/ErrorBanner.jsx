import React from 'react';
import { StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import { colors, spacing } from '../../constants/theme';

export default function ErrorBanner({ message, visible, onDismiss }) {
  if (!message) return null;
  return (
    <Banner
      visible={visible ?? Boolean(message)}
      actions={[{ label: 'Cerrar', onPress: onDismiss }]}
      icon="alert-circle"
      style={styles.banner}
    >
      {message}
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: {
    //backgroundColor: '#FDECEA',
    marginBottom: spacing.sm,
  },
});
