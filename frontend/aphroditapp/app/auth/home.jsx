import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Badge, Chip, Avatar, Surface, Button, useTheme, Icon, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dashboardAPI } from '../../api/dashboard';
import { relationshipsAPI } from '../../api/relationships';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../../components/common/UserAvatar';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import EmptyState from '../../components/common/EmptyState';
import RelationshipCard from '../../components/relationships/RelationshipCard';
import NotificationItem from '../../components/notifications/NotificationItem';
import { extractError } from '../../api/axios';
import { spacing } from '../../constants/theme';
import { router, useNavigation } from 'expo-router';

export default function DashboardScreen(props) {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const theme = useTheme();
  const colors = theme.colors;
  const loadDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.get();
      setDashboard(res.data.data);
      setError(null);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      await relationshipsAPI.respondInvitation(invitationId, action);
      loadDashboard();
    } catch (e) {
      setError(extractError(e));
    }
  };

  if (loading) return <LoadingOverlay />;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? '🌅 Buenos días' : greetingHour < 20 ? '☀️ Buenas tardes' : '🌙 Buenas noches';

  return (
    <SafeAreaView style={styles.safe}>
      <View>

        <Card.Title
          subtitle={user?.username || 'Usuario'}
          title={greeting}
          right={() => <UserAvatar user={user} size={36} style={{marginRight: spacing.sm  }} />}
        />

        {/* Unread notifications badge */}
        {dashboard?.unread_notification_count > 0 && (
          <TouchableOpacity
            style={styles.notifBanner}
            onPress={() => navigation.navigate('notifications')}
          >
            <Icon source="bell-ring" size={20} color={colors.primary} />
            <Text style={styles.notifBannerText}>
              Tienes {dashboard.unread_notification_count} notificacion
              {dashboard.unread_notification_count !== 1 ? 'es' : ''} sin leer
            </Text>
            <Icon source="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Pending invitations */}
        {dashboard?.pending_invitations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invitaciones pendientes 📨</Text>
            {dashboard.pending_invitations.map((inv) => (
              <Card key={inv.id} style={styles.invCard} mode="elevated">
                <Card.Content style={styles.invContent}>
                  <View style={styles.invInfo}>
                    <Icon source="account-group" size={24} color={colors.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTitle}>{inv.relationship?.name || 'Una relación'}</Text>
                      <Text style={styles.invFrom}>De: {inv.sent_by?.username}</Text>
                      {inv.message ? <Text style={styles.invMsg}>{inv.message}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.invActions}>
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleRespondInvitation(inv.id, 'accept')}
                      style={styles.acceptBtn}
                      labelStyle={styles.acceptBtnLabel}
                    >
                      Aceptar
                    </Button>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleRespondInvitation(inv.id, 'reject')}
                      style={styles.rejectBtn}
                      labelStyle={styles.rejectBtnLabel}
                    >
                      Rechazar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Relationships header */}
        <Card.Title 
          title="Mis relaciones 💝"
          titleStyle={styles.sectionTitle}
          right={() => (
            <TouchableOpacity              onPress={() => navigation.navigate('create')}>
              <Icon source="plus-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          )}
          style={{ marginBottom: spacing.sm }}
        />
       
      </View>
      <FlatList
        data={dashboard?.relationships || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}

        renderItem={({ item }) => (
          <RelationshipCard
            relationship={item}
            onPress={() =>
              navigation.navigateDeprecated('relationship', {
                screen: 'detail',
                params: {
                  id: item.id,
                  name: item.name,
                }
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-off"
            title="Sin relaciones aún"
            subtitle="Crea una relación y empieza a compartir momentos"
            action="Crear relación"
            onAction={() => navigation.navigate('create')}
          />
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    //backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: 13,
    //color: colors.textSecondary,
    fontWeight: '500',
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    //color: colors.text,
  },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    //backgroundColor: colors.pink100,
    padding: spacing.sm + 4,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  notifBannerText: {
    flex: 1,
    //color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    //color: colors.text,
  },
  invCard: {
    borderRadius: 16,
    //backgroundColor: colors.surface,
  },
  invContent: {
    gap: spacing.sm,
  },
  invInfo: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  invTitle: {
    fontSize: 15,
    fontWeight: '700',
    //color: colors.text,
  },
  invFrom: {
    fontSize: 13,
    //color: colors.textSecondary,
  },
  invMsg: {
    fontSize: 13,
    //color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  invActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptBtn: {
    flex: 1,
    borderRadius: 20,
    //backgroundColor: colors.success,
  },
  acceptBtnLabel: {
    fontSize: 13,
  },
  rejectBtn: {
    flex: 1,
    borderRadius: 20,
    //borderColor: colors.error,
  },
  rejectBtnLabel: {
    //color: colors.error,
    fontSize: 13,
  },
});
