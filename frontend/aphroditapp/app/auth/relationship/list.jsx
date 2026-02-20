import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { contentAPI } from '../../../api/content';
import EmptyState from '../../../components/common/EmptyState';
import ErrorBanner from '../../../components/common/ErrorBanner';
import { extractError } from '../../../api/axios';
import { spacing } from '../../../constants/theme';

const CREATE_SCREEN = {
  note: 'note',
  event: 'event',
  checklist: 'check',
  list: 'list',
};

const DETAIL_SCREEN = {
  checklist: 'check',
  list: 'list',
};

const TYPE_ICON = {
  note: 'note-text',
  event: 'calendar-heart',
  checklist: 'format-list-checkbox',
  list: 'format-list-bulleted',
  media: 'image',
};

const TYPE_COLOR = {
  note: '#FFD93D',
  event: '#FF6B9D',
  checklist: '#6BCB77',
  list: '#845EC2',
  media: '#FF9671',
};


export default function ContentListScreen(props) {
  const { navigation, route } = props;
  console.log('Route params:', props);
  const { id: relationshipId, type, data: initialData = [], name: typeName } = route.params;
  const [items, setItems] = useState(initialData);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = theme.colors;
  const handleDelete = useCallback(async (itemId) => {
    try {
      await contentAPI.remove(relationshipId, type, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      setError(extractError(e));
    }
  }, [relationshipId, type]);

  function NoteCard({ item, onDelete }) {
    return (
      <Card style={[styles.itemCard, { borderLeftColor: item.color || '#FFD93D', borderLeftWidth: 4 }]} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            {item.title ? <Text style={styles.cardTitle}>{item.title}</Text> : null}
            <IconButton icon="delete-outline" size={18} iconColor={colors.error} onPress={onDelete} style={{ margin: 0 }} />
          </View>
          <Text style={styles.noteBody} numberOfLines={4}>{item.body}</Text>
          <Text style={styles.cardMeta}>{new Date(item.created_at).toLocaleDateString('es-ES')}</Text>
        </Card.Content>
      </Card>
    );
  }

  function EventCard({ item, onDelete }) {
    return (
      <Card style={styles.itemCard} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <IconButton icon="delete-outline" size={18} iconColor={colors.error} onPress={onDelete} style={{ margin: 0 }} />
          </View>
          <View style={styles.eventRow}>
            <MaterialCommunityIcons name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.cardMeta}>{new Date(item.start_datetime).toLocaleString('es-ES')}</Text>
          </View>
          {item.location ? (
            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.textSecondary} />
              <Text style={styles.cardMeta} numberOfLines={1}>{item.location}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    );
  }

  function GenericCard({ item, label, onPress, onDelete }) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Card style={styles.itemCard} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title || label}</Text>
              <IconButton icon="delete-outline" size={18} iconColor={colors.error} onPress={onDelete} style={{ margin: 0 }} />
            </View>
            {item.description ? <Text style={styles.noteBody} numberOfLines={2}>{item.description}</Text> : null}
            {item.completion_percentage !== undefined && (
              <Chip compact icon="check" style={styles.progressChip} textStyle={{ fontSize: 11 }}>
                {item.completion_percentage}% completado
              </Chip>
            )}
            {item.items?.length > 0 && (
              <Text style={styles.cardMeta}>{item.items.length} ítems</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }
  const renderItem = ({ item }) => {
    const onDelete = () => handleDelete(item.id);
    if (type === 'note') return <NoteCard item={item} onDelete={onDelete} />;
    if (type === 'event') return <EventCard item={item} onDelete={onDelete} />;
    return (
      <GenericCard
        item={item}
        label={typeName}
        onDelete={onDelete}
        onPress={() => {
          if (DETAIL_SCREEN[type]) {
            navigation.navigateDeprecated('shared', {
              screen: DETAIL_SCREEN[type],
              
                item: item,
                relationshipId: relationshipId,
                type: DETAIL_SCREEN[type]
              
            });
          }
        }}
      />
    );
  };

  const emptyMessages = {
    note: { title: 'Sin notas todavía', subtitle: 'Escribe tu primera nota compartida' },
    event: { title: 'Sin eventos todavía', subtitle: 'Añade momentos especiales a compartir' },
    checklist: { title: 'Sin checklists', subtitle: 'Crea tu primera lista de tareas compartida' },
    list: { title: 'Sin listas todavía', subtitle: 'Crea listas de deseos, películas y más' },
    media: { title: 'Sin fotos todavía', subtitle: 'Comparte fotos y recuerdos especiales' },
  };


  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={TYPE_ICON[type] || 'folder'}
            title={emptyMessages[type]?.title}
            subtitle={emptyMessages[type]?.subtitle}
          />
        }
      />
      {CREATE_SCREEN[type] && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: TYPE_COLOR[type] || colors.primary }]}
          onPress={() => navigation.navigate(CREATE_SCREEN[type], { relationshipId, onCreated: (item) => setItems((p) => [item, ...p]) })}
          color="#FFF"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.md, flexGrow: 1, gap: spacing.sm, paddingBottom: 80 },
  itemCard: { borderRadius: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  noteBody: { fontSize: 14, lineHeight: 20 },
  cardMeta: { fontSize: 12, marginTop: 4 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  progressChip: { alignSelf: 'flex-start', marginTop: spacing.xs },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.lg, borderRadius: 28 },
});
