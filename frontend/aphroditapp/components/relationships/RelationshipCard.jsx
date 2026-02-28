import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar, useTheme, Icon, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserAvatar from '../common/UserAvatar';
import { spacing } from '../../constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function RelationshipCard({ relationship, onPress }) {
  const { name, relationship_type, cover_image, anniversary_date, members_preview = [], my_role } = relationship;
  const theme = useTheme();
  const colors = theme.colors;

  const coverUri = cover_image
    ? cover_image.startsWith('http')
      ? cover_image
      : `${API_URL}${cover_image}`
    : null;

  const typeIcon = relationship_type?.icon || '💝';
  const typeName = relationship_type?.name || 'Relación';

  return (
    <Card onPress={onPress} style={styles.card} mode="elevated">
      {/* Cover image or gradient banner */}
      <Card.Title
        title={name || 'Sin nombre'}
        subtitle={
          <View>
            {anniversary_date && (
              <View style={styles.dateRow}>
                <Icon source="calendar-heart" size={14} color={colors.primary} />
                <Text style={styles.dateText}>{new Date(anniversary_date).toLocaleDateString('es-ES')}</Text>
              </View>
            )}
            <Chip
              icon={() => <Text style={{ fontSize: 12, alignSelf: 'center', textAlign: 'center', marginBottom: 6 }}>{typeIcon}</Text>}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {typeName}
            </Chip>
          </View>
        }
        left={(prop) => {
          return (
            coverUri ? (
              <Card.Cover source={{ uri: coverUri }} style={styles.cover} />
            ) : (
              <View {...prop} style={styles.placeholderBanner}>
                <Text style={styles.bannerEmoji}>{typeIcon}</Text>
              </View>
            )
          )
        }}
        right={prop => <IconButton icon='chevron-right' />}
        style={{ gap: 20 }}
      />
      {my_role === 'owner' && (
        <View style={styles.ownerBadge}>
          <Icon source="crown" size={12} color={colors.accent} />
        </View>
      )}


      <Card.Content style={styles.content}>
       


        {/* Members preview */}
        <View style={styles.membersRow}>

          {members_preview.slice(0, 3).map((m, i) => (
            <View key={m.id || i} style={[styles.memberAvatar, { marginLeft: i > 0 ? -10 : 0 }]}>
              <UserAvatar user={m.user} size={40} />
            </View>
          ))}

          {members_preview.length > 6 && (
            <View style={styles.moreMembersChip}>
              <Text style={styles.moreText}>+{members_preview.length - 6}</Text>
            </View>
          )}

        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 20,
    //backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  banner: {
    position: 'relative',
    height: 100,
  },
  cover: {
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  placeholderBanner: {
    height: 100,
    //backgroundColor: colors.pink100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 48,
  },
  ownerBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    //backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 4,
  },
  content: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    //color: colors.text,
    flex: 1,
  },
  chip: {
    alignSelf: 'flex-start',
    //backgroundColor: colors.pink100,
    height: 28,
  },
  chipText: {
    fontSize: 12,
    //color: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    //color: colors.textSecondary,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: spacing.xs,
  },
  memberAvatar: {
    borderWidth: 4,
    //borderColor: colors.surface,
    borderRadius: 9999,
  },
  moreMembersChip: {
    marginLeft: -8,
    //backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    //borderColor: colors.surface,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
    //color: colors.textSecondary,
  },
});
