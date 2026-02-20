import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, RefreshControl } from 'react-native';
import { Text, Button, Badge, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsAPI } from '../../api/notifications';
import NotificationItem from '../../components/notifications/NotificationItem';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import { extractError } from '../../api/axios';
import { spacing } from '../../constants/theme';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = theme.colors;
  const load = useCallback(async () => {
    try {
      const res = await notificationsAPI.list();
      const data = res.data.data;
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unread_count || 0);
      setError(null);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      setError(extractError(e));
    }
  };

  const markOneRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  if (loading) return <LoadingOverlay />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadLabel}>
            <Badge style={styles.badge}>{unreadCount}</Badge>{'  '}sin leer
          </Text>
          <Button mode="text" compact onPress={markAllRead} labelStyle={{ color: colors.primary }}>
            Marcar todas como leídas
          </Button>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => !item.is_read && markOneRead(item.id)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="bell-off"
            title="Sin notificaciones"
            subtitle="Aquí aparecerán las actualizaciones de tus relaciones"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.sm, paddingHorizontal: spacing.md,  borderBottomWidth: 1,  },
  unreadLabel: { fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.sm, flexGrow: 1 },
});
