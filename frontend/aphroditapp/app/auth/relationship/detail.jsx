import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, FAB, Portal, Dialog, Divider, Avatar, useTheme, Icon, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { relationshipsAPI } from '../../../api/relationships';
import UserAvatar from '../../../components/common/UserAvatar';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorBanner from '../../../components/common/ErrorBanner';
import { extractError } from '../../../api/axios';
import { spacing } from '../../../constants/theme';

const CONTENT_SECTIONS = [
  { key: 'notes', label: 'Notas', icon: 'note-text', color: '#FFD93D', type: 'note' },
  { key: 'events', label: 'Eventos', icon: 'calendar-heart', color: '#FF6B9D', type: 'event' },
  { key: 'checklists', label: 'Checklists', icon: 'format-list-checkbox', color: '#6BCB77', type: 'checklist' },
  { key: 'lists', label: 'Listas', icon: 'format-list-bulleted', color: '#845EC2', type: 'list' },
  { key: 'media', label: 'Fotos/Vídeos', icon: 'image-multiple', color: '#FF9671', type: 'media' },
];

export default function RelationshipDetailScreen(props) {
  const { navigation, route } = props;
  const { id } = route?.params;
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const theme = useTheme();
  const colors = theme.colors;
  const load = useCallback(async () => {
    try {
      const res = await relationshipsAPI.get(id);
      setRelationship(res.data.data);
      navigation.setOptions({ title: res.data.data?.name || 'Relación' });
      setError(null);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [route.params?.id]);

  if (loading) return <LoadingOverlay />;
  if (!relationship) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Relación no encontrada</Text>
    </View>
  );

  const { name, relationship_type, members = [], anniversary_date, notes = [], events = [], checklists = [], lists = [], media = [] } = relationship;
  const contentCounts = { notes: notes.length, events: events.length, checklists: checklists.length, lists: lists.length, media: media.length };

  return (
    <Portal.Host>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

          {/* Members section */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👥 Miembros</Text>
                {relationship.my_role === 'owner' && (
                  <IconButton
                    icon="account-plus"
                    size={22}
                    color={colors.primary}
                    onPress={() => navigation.navigate('invite', { id, name })}
                  />

                )}
              </View>
              <View style={styles.membersRow}>
                {members.map((m) => (
                  <View key={m.id} style={[styles.memberItem, { maxWidth: members.length > 2 ? 46 : 80, position: 'relative' }]}>
                    <UserAvatar user={m.user} size={members.length > 2 ? 32 : 68} />
                    <Text style={styles.memberName} variant={members.length < 2 ? 'headlineLarge' : 'labelSmall'} numberOfLines={5}>
                      {m.nickname_for_me || m.user?.username}
                      {m.nickname_for_me && m.user?.username && `\n (${m.user.username})`}
                    </Text>
                    {m.role === 'owner' && (
                      <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: colors.backdrop, borderRadius: 9999, padding: 2 }}>
                        <Icon source="crown" size={12} color={colors.accent} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
              <Card.Actions>

              <Button
                mode="outlined"
                compact
                onPress={() => navigation.navigate('nickname', { id, members })}
                style={styles.nicknameBtn}
                icon="sticker-emoji"
              >
                Gestionar apodos
              </Button>
                            </Card.Actions>

            </Card.Content>
          </Card>

          {/* Info card */}
          {(anniversary_date || relationship_type) && (
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.infoRow}>
                {relationship_type && (
                  <Chip icon={() => <Text>{relationship_type.icon}</Text>} style={styles.chip} textStyle={styles.chipText}>
                    {relationship_type.name}
                  </Chip>
                )}
                {anniversary_date && (
                  <View style={styles.dateRow}>
                    <MaterialCommunityIcons name="calendar-heart" size={16} color={colors.primary} />
                    <Text style={styles.dateText}>{new Date(anniversary_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Content sections */}
          <Text style={styles.contentTitle}>📦 Contenido compartido</Text>
          <View style={styles.contentGrid}>
            {CONTENT_SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.key}
                style={styles.contentCell}
                onPress={() => navigation.navigate('list', { id, type: section.type, data: relationship[section.key], name: section.label })}
              >
                <Card style={styles.contentCard} mode="elevated">
                  <Card.Content style={styles.contentCardContent}>

                    <Avatar.Icon size={40} icon={section.icon} color={section.color} style={{ backgroundColor: section.color + '22' }} />
                    <Text style={styles.contentLabel}>{section.label}</Text>
                    <Text style={styles.contentCount}>{contentCounts[section.key]}</Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* FAB group for adding content */}
        <Portal>
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            fabStyle={styles.mainFab}
            actions={[
              { icon: 'note-text', label: 'Nota', onPress: () => navigation.navigate('create', { relationshipId: id, type: 'note' }), color: colors.primary },
              { icon: 'calendar-heart', label: 'Evento', onPress: () => navigation.navigate('create', { relationshipId: id, type: 'event' }), color: colors.primary },
              { icon: 'format-list-checkbox', label: 'Checklist', onPress: () => navigation.navigate('create', { relationshipId: id, type: 'check' }), color: colors.primary },
              { icon: 'format-list-bulleted', label: 'Lista', onPress: () => navigation.navigate('create', { relationshipId: id, type: 'list' }), color: colors.primary },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
          />
        </Portal>
      </SafeAreaView>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, },
  card: { margin: spacing.md, marginBottom: 0, borderRadius: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.sm },
  memberItem: { alignItems: 'center', gap: 4 },
  memberName: { textAlign: 'center' },
  nicknameBtn: { alignSelf: 'flex-start', borderRadius: 20 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  chipText: { fontSize: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13 },
  contentTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: 100 },
  contentCell: { width: '47%' },
  contentCard: { borderRadius: 16 },
  contentCardContent: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  contentIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  contentLabel: { fontSize: 13, fontWeight: '600' },
  contentCount: { fontSize: 24, fontWeight: '800' },

});
