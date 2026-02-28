
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Pressable } from 'react-native';
import { Text, Button, Snackbar, useTheme, TextInput, IconButton, Switch, Chip, Card, ProgressBar, Checkbox, Icon, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import {
    checklistSchema, eventSchema, noteSchema, sharedListSchema
} from '../../../validation/contentSchemas';
import { contentAPI } from '../../../api/content';
import FormInput from '../../../components/common/FormInput';
import ErrorBanner from '../../../components/common/ErrorBanner';
import { extractError } from '../../../api/axios';
import { spacing } from '../../../constants/theme';
import { FlatList } from 'react-native';

export default function SharedScreen(props) {
    const { navigation, route } = props;
    const { relationshipId, type } = route.params;
    switch (type) {
        case 'note':
            return <></>
        case 'event':
            return <></>
        case 'check':
            return <ChecklistDetailScreen {...props} />
        case 'list':
            return <SharedListDetailScreen {...props} />
        default:
            return <View><Text>ERROR</Text></View>
    };
};

function ChecklistDetailScreen({ navigation, route }) {
    const { item: initialItem, relationshipId } = route.params;
    const [checklist, setChecklist] = useState(initialItem);
    const [error, setError] = useState(null);
    const [newItemText, setNewItemText] = useState('');
    const [addingItem, setAddingItem] = useState(false);

    const toggle = async (itemId) => {
        try {
            const res = await contentAPI.toggleChecklistItem(relationshipId, checklist.id, itemId);
            const updatedCheckItem = res.data.data;
            setChecklist((prev) => ({
                ...prev,
                items: prev.items.map((i) => (i.id === itemId ? updatedCheckItem : i)),
            }));
        } catch (e) {
            setError(extractError(e));
        }
    };

    const addItem = async () => {
        if (!newItemText.trim()) return;
        setAddingItem(true);
        try {
            const res = await contentAPI.addChecklistItem(relationshipId, checklist.id, newItemText.trim());
            const newItem = res.data.data;
            setChecklist((prev) => ({ ...prev, items: [...prev.items, newItem] }));
            setNewItemText('');
        } catch (e) {
            setError(extractError(e));
        } finally {
            setAddingItem(false);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            await contentAPI.deleteChecklistItem(relationshipId, checklist.id, itemId);
            setChecklist((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }));
        } catch (e) {
            setError(extractError(e));
        }
    };
    const theme = useTheme();
    const colors = theme.colors;

    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        headerCard: { margin: spacing.md, borderRadius: 20, backgroundColor: colors.surface },
        title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
        desc: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
        progressRow: { flexDirection: 'column', alignItems: 'center', gap: spacing.sm },
        progressBar: { flex: 1, height: 8, borderRadius: 4 },
        progressText: { fontSize: 13, fontWeight: '700', color: colors.success, minWidth: 35 },
        list: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.xl },
        itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingRight: 4 },
        itemRowDone: { opacity: 0.6 },
        itemText: { flex: 1, fontSize: 15, color: colors.text },
        itemTextDone: { textDecorationLine: 'line-through', color: colors.textLight },
        addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: spacing.sm, marginTop: spacing.sm },
        addInput: { flex: 1, height: 44, fontSize: 15, color: colors.text },
        addBtn: { borderRadius: 20, backgroundColor: colors.primary },
    });

    const total = checklist.items?.length || 0;
    const done = checklist.items?.filter((i) => i.is_checked)?.length || 0;
    const progress = total > 0 ? done / total : 0;

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

            <Card style={styles.headerCard} mode="elevated">
                <Card.Content>
                    <Text style={styles.title}>{checklist.title}</Text>
                    {checklist.description ? <Text style={styles.desc}>{checklist.description}</Text> : null}
                    <View style={styles.progressRow}>
                        <ProgressBar 
                        progress={progress} 
                        color={colors.success} 
                        style={styles.progressBar} 
                            visible={true}
                        />
                        <Text style={styles.progressText}>{done}/{total}</Text>
                    </View>
                </Card.Content>
            </Card>

            <FlatList
                data={checklist.items || []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.text}
                        titleStyle={[item.is_checked && styles.itemTextDone]}
                        style={[styles.itemRow, item.is_checked && styles.itemRowDone]}
                        left={(prop) => (
                            <Pressable    onPress={() => toggle(item.id)}>

                            
                            <List.Icon
                                {...prop}
                                icon={item.is_checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                color={item.is_checked ? colors.success : colors.textLight}
                             
                            />
                            </Pressable>
                        )}
                           
                        
                        right={(prop) =>
                            <IconButton
                                icon="delete-outline"
                                size={16}
                                iconColor={colors.error}
                                onPress={() => deleteItem(item.id)}
                                style={{ margin: 0 }}
                                    {...prop}
                            />
                        }
                    />
         
        )}
            ListFooterComponent={
                <View style={styles.addRow}>
                    <TextInput
                        style={styles.addInput}
                        placeholder="Añadir ítem..."
                        placeholderTextColor={colors.textLight}
                        value={newItemText}
                        onChangeText={setNewItemText}
                        returnKeyType="done"
                        onSubmitEditing={addItem}
                    />
                    <Button
                        mode="contained"
                        compact
                        loading={addingItem}
                        onPress={addItem}
                        style={styles.addBtn}
                        labelStyle={{ color: '#FFF', fontSize: 12 }}
                    >
                        Añadir
                    </Button>
                </View>
            }
      />
        </SafeAreaView>
    );
};



function SharedListDetailScreen({ navigation, route }) {
    const { item: initialItem, relationshipId } = route.params;
    const [list, setList] = useState(initialItem);
    const [error, setError] = useState(null);
    const [newItemText, setNewItemText] = useState('');
    const [addingItem, setAddingItem] = useState(false);

    const addItem = async () => {
        if (!newItemText.trim()) return;
        setAddingItem(true);
        try {
            const res = await contentAPI.addListItem(relationshipId, list.id, newItemText.trim());
            const newItem = res.data.data;
            setList((prev) => ({ ...prev, items: [...prev.items, newItem] }));
            setNewItemText('');
        } catch (e) {
            setError(extractError(e));
        } finally {
            setAddingItem(false);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            await contentAPI.deleteListItem(relationshipId, list.id, itemId);
            setList((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }));
        } catch (e) {
            setError(extractError(e));
        }
    };
    const theme = useTheme();
    const colors = theme.colors;


    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        headerCard: { margin: spacing.md, borderRadius: 20, backgroundColor: colors.surface },
        headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
        emoji: { fontSize: 40 },
        title: { fontSize: 20, fontWeight: '800', color: colors.text },
        desc: { fontSize: 14, color: colors.textSecondary },
        count: { fontSize: 13, color: colors.textLight, marginTop: 4 },
        list: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.xl },
        itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingLeft: spacing.xs, paddingRight: 4 },
        itemText: { flex: 1, fontSize: 15, color: colors.text },
        addedBy: { fontSize: 11, color: colors.textLight, marginRight: 4 },
        addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: spacing.sm, marginTop: spacing.sm },
        addInput: { flex: 1, height: 44, fontSize: 15, color: colors.text },
        addBtn: { borderRadius: 20, backgroundColor: colors.secondary },
    });

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

            <Card style={styles.headerCard} mode="elevated">
                <Card.Content>
                    <View style={styles.headerRow}>
                        <Text style={styles.emoji}>{list.emoji}</Text>
                        <View>
                            <Text style={styles.title}>{list.title}</Text>
                            {list.description ? <Text style={styles.desc}>{list.description}</Text> : null}
                        </View>
                    </View>
                    <Text style={styles.count}>{list.items?.length || 0} ítems</Text>
                </Card.Content>
            </Card>

            <FlatList
                data={list.items || []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <Icon source="circle-medium" size={20} color={colors.secondary} />
                        <Text style={styles.itemText}>{item.text}</Text>
                        {item.added_by?.username && (
                            <Text style={styles.addedBy}>{item.added_by.username}</Text>
                        )}
                        <IconButton
                            icon="delete-outline"
                            size={16}
                            iconColor={colors.error}
                            onPress={() => deleteItem(item.id)}
                            style={{ margin: 0 }}
                        />
                    </View>
                )}
                ListFooterComponent={
                    <View style={styles.addRow}>
                        <TextInput
                            style={styles.addInput}
                            placeholder="Añadir ítem..."
                            placeholderTextColor={colors.textLight}
                            value={newItemText}
                            onChangeText={setNewItemText}
                            returnKeyType="done"
                            onSubmitEditing={addItem}
                        />
                        <Button
                            mode="contained"
                            compact
                            loading={addingItem}
                            onPress={addItem}
                            style={styles.addBtn}
                            labelStyle={{ color: '#FFF', fontSize: 12 }}
                        >
                            Añadir
                        </Button>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

