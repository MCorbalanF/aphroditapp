
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, Snackbar, useTheme, TextInput, IconButton, Switch, Chip } from 'react-native-paper';
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

export default function CreateScreen(props) {
    const { navigation, route } = props;
    const { relationshipId, type } = route.params;
    switch (type) {
        case 'note':
            return <CreateNoteScreen {...props} />
        case 'event':
            return <CreateEventScreen {...props} />
        case 'check':
            return <CreateChecklistScreen {...props} />
        case 'list':
            return <CreateListScreen {...props} />
        default:
            return <View><Text>ERROR</Text></View>
    };
};



const NOTE_COLORS = [
    '#FFFFFF', '#FFD93D', '#FF6B9D', '#6BCB77', '#845EC2',
    '#FF9671', '#4D96FF', '#FFF0F3', '#F4F4F9',
];

function CreateNoteScreen({ navigation, route }) {
    const { relationshipId, onCreated } = route.params;
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleCreate = async (values, { setSubmitting, resetForm }) => {
        try {
            const res = await contentAPI.create(relationshipId, {
                content_type: 'note',
                title: values.title,
                body: values.body,
                color: values.color,
            });
            const created = res.data.data?.item;
            onCreated?.(created);
            setSuccess(true);
            resetForm();
        } catch (e) {
            setError(extractError(e));
        } finally {
            setSubmitting(false);
        }
    };
    const theme = useTheme();
    const colors = theme.colors;
    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.xl, flexGrow: 1 },
        title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
        form: { gap: spacing.sm },
        label: { fontSize: 14, fontWeight: '600', color: colors.text },
        colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
        colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.border },
        colorDotSelected: { borderColor: colors.primary, borderWidth: 3, transform: [{ scale: 1.2 }] },
        notePreview: {
            borderRadius: 16, padding: spacing.md, marginBottom: spacing.md,
            minHeight: 80, borderWidth: 1, borderColor: colors.border,
            elevation: 2,
        },
        previewTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
        previewBody: { fontSize: 13, color: colors.textSecondary },
        btn: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4, marginTop: spacing.md },
        btnContent: { height: 52 },
        btnLabel: { fontSize: 16, fontWeight: '700' },
    });

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Nueva nota 📝</Text>

                    <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

                    <Formik
                        initialValues={{ title: '', body: '', color: '#FFFFFF' }}
                        validationSchema={noteSchema}
                        onSubmit={handleCreate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                            <View style={styles.form}>
                                {/* Color picker */}
                                <Text style={styles.label}>Color de la nota</Text>
                                <View style={styles.colorRow}>
                                    {NOTE_COLORS.map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            style={[
                                                styles.colorDot,
                                                { backgroundColor: c },
                                                values.color === c && styles.colorDotSelected,
                                            ]}
                                            onPress={() => setFieldValue('color', c)}
                                        />
                                    ))}
                                </View>

                                {/* Live preview */}
                                <View style={[styles.notePreview, { backgroundColor: values.color || '#FFFFFF' }]}>
                                    <Text style={styles.previewTitle}>{values.title || 'Título de la nota'}</Text>
                                    <Text style={styles.previewBody}>{values.body || 'Escribe algo...'}</Text>
                                </View>

                                <FormInput
                                    label="Título (opcional)"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    error={errors.title}
                                    touched={touched.title}
                                    leftIcon="format-title"
                                />

                                <FormInput
                                    label="Contenido *"
                                    value={values.body}
                                    onChangeText={handleChange('body')}
                                    onBlur={handleBlur('body')}
                                    error={errors.body}
                                    touched={touched.body}
                                    leftIcon="text"
                                    multiline
                                    numberOfLines={6}
                                    placeholder="Escribe tu nota aquí..."
                                />

                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    style={styles.btn}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                    icon="content-save"
                                >
                                    Guardar nota
                                </Button>

                                <Button mode="text" onPress={() => navigation.goBack()} labelStyle={{ color: colors.textSecondary }}>
                                    Cancelar
                                </Button>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar visible={success} onDismiss={() => { setSuccess(false); navigation.goBack(); }} duration={1500} style={{ backgroundColor: colors.success }}>
                ¡Nota creada! 📝
            </Snackbar>
        </SafeAreaView>
    );
}




const RECURRENCE_OPTIONS = [
    { value: 'none', label: 'Nunca' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
];


const EVENT_COLORS = ['#FF6B9D', '#845EC2', '#FF9671', '#4D96FF', '#6BCB77', '#FFD93D'];

function CreateEventScreen({ navigation, route }) {
    const { relationshipId, onCreated } = route.params;
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleCreate = async (values, { setSubmitting, resetForm }) => {
        try {
            const res = await contentAPI.create(relationshipId, {
                content_type: 'event',
                title: values.title,
                description: values.description,
                location: values.location,
                start_datetime: values.start_datetime,
                end_datetime: values.end_datetime || undefined,
                is_all_day: values.is_all_day,
                recurrence: values.recurrence,
                reminder_minutes_before: parseInt(values.reminder_minutes_before) || 60,
                event_color: values.event_color,
            });
            onCreated?.(res.data.data?.item);
            setSuccess(true);
            resetForm();
        } catch (e) {
            setError(extractError(e));
        } finally {
            setSubmitting(false);
        }
    };
    const theme = useTheme();
    const colors = theme.colors;
    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.xl, flexGrow: 1 },
        title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
        form: { gap: spacing.sm },
        label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.xs },
        switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
        switchLabel: { fontSize: 15, color: colors.text },
        reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
        recurrenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
        reminderChip: { backgroundColor: colors.surfaceVariant },
        reminderChipSelected: { backgroundColor: colors.primary },
        colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
        colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
        colorDotSelected: { borderColor: colors.text, borderWidth: 3, transform: [{ scale: 1.15 }] },
        btn: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4, marginTop: spacing.md },
        btnContent: { height: 52 },
        btnLabel: { fontSize: 16, fontWeight: '700' },
    });

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Nuevo evento 📅</Text>

                    <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

                    <Formik
                        initialValues={{
                            title: '',
                            description: '',
                            location: '',
                            start_datetime: new Date().toISOString().slice(0, 16),
                            end_datetime: '',
                            is_all_day: false,
                            recurrence: 'none',
                            reminder_minutes_before: '60',
                            event_color: '#FF6B9D',
                        }}
                        validationSchema={eventSchema}
                        onSubmit={handleCreate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                            <View style={styles.form}>
                                <FormInput
                                    label="Título del evento *"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    error={errors.title}
                                    touched={touched.title}
                                    leftIcon="calendar"
                                />

                                <FormInput
                                    label="Descripción"
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    multiline
                                    numberOfLines={3}
                                    leftIcon="text"
                                />

                                <FormInput
                                    label="Ubicación"
                                    value={values.location}
                                    onChangeText={handleChange('location')}
                                    onBlur={handleBlur('location')}
                                    leftIcon="map-marker"
                                />

                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>Todo el día</Text>
                                    <Switch
                                        value={values.is_all_day}
                                        onValueChange={(v) => setFieldValue('is_all_day', v)}
                                        color={colors.primary}
                                    />
                                </View>

                                <FormInput
                                    label="Fecha y hora de inicio *"
                                    value={values.start_datetime}
                                    onChangeText={handleChange('start_datetime')}
                                    onBlur={handleBlur('start_datetime')}
                                    error={errors.start_datetime}
                                    touched={touched.start_datetime}
                                    leftIcon="clock-start"
                                    placeholder="YYYY-MM-DDTHH:MM"
                                />

                                {!values.is_all_day && (
                                    <FormInput
                                        label="Fecha y hora de fin"
                                        value={values.end_datetime}
                                        onChangeText={handleChange('end_datetime')}
                                        onBlur={handleBlur('end_datetime')}
                                        leftIcon="clock-end"
                                        placeholder="YYYY-MM-DDTHH:MM"
                                    />
                                )}

                                <Text style={styles.label}>Recordatorio</Text>
                                <View style={styles.reminderRow}>
                                    {['15', '30', '60', '120', '1440'].map((mins) => (
                                        <Chip
                                            key={mins}
                                            selected={values.reminder_minutes_before === mins}
                                            onPress={() => setFieldValue('reminder_minutes_before', mins)}
                                            style={[styles.reminderChip, values.reminder_minutes_before === mins && styles.reminderChipSelected]}
                                            textStyle={{ fontSize: 12, color: values.reminder_minutes_before === mins ? '#FFF' : colors.text }}
                                        >
                                            {mins === '1440' ? '1 día' : mins === '60' ? '1h' : mins === '120' ? '2h' : `${mins}min`}
                                        </Chip>
                                    ))}
                                </View>

                                <Text style={styles.label}>Repetición</Text>
                                <View style={styles.recurrenceRow}>
                                    {RECURRENCE_OPTIONS.map((opt) => (
                                        <Chip
                                            key={opt.value}
                                            selected={values.recurrence === opt.value}
                                            onPress={() => setFieldValue('recurrence', opt.value)}
                                            style={[styles.reminderChip, values.recurrence === opt.value && styles.reminderChipSelected]}
                                            textStyle={{ fontSize: 12, color: values.recurrence === opt.value ? '#FFF' : colors.text }}
                                        >
                                            {opt.label}
                                        </Chip>
                                    ))}
                                </View>

                                <Text style={styles.label}>Color del evento</Text>
                                <View style={styles.colorRow}>
                                    {EVENT_COLORS.map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            style={[styles.colorDot, { backgroundColor: c }, values.event_color === c && styles.colorDotSelected]}
                                            onPress={() => setFieldValue('event_color', c)}
                                        />
                                    ))}
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    style={styles.btn}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                    icon="calendar-plus"
                                >
                                    Crear evento
                                </Button>

                                <Button mode="text" onPress={() => navigation.goBack()} labelStyle={{ color: colors.textSecondary }}>
                                    Cancelar
                                </Button>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar visible={success} onDismiss={() => { setSuccess(false); navigation.goBack(); }} duration={1500} style={{ backgroundColor: colors.success }}>
                ¡Evento creado! 📅
            </Snackbar>
        </SafeAreaView>
    );
}
function CreateChecklistScreen({ navigation, route }) {
    const { relationshipId, onCreated } = route.params;
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [items, setItems] = useState([]);

    const addItem = () => {
        if (!newItem.trim()) return;
        setItems((prev) => [...prev, newItem.trim()]);
        setNewItem('');
    };

    const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

    const handleCreate = async (values, { setSubmitting, resetForm }) => {
        try {
            const res = await contentAPI.create(relationshipId, {
                content_type: 'checklist',
                title: values.title,
                description: values.description,
                items,
            });
            onCreated?.(res.data.data?.item);
            setSuccess(true);
            resetForm();
            setItems([]);
        } catch (e) {
            setError(extractError(e));
        } finally {
            setSubmitting(false);
        }
    };
    const theme = useTheme();
    const colors = theme.colors;
    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.xl, flexGrow: 1 },
        title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
        form: { gap: spacing.sm },
        label: { fontSize: 14, fontWeight: '600', color: colors.text },
        itemInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
        itemInput: { flex: 1, backgroundColor: colors.surface },
        addBtn: { backgroundColor: colors.primary, borderRadius: 12, margin: 0, marginVertical: 'auto', alignSelf: 'center' },
        itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceVariant, borderRadius: 8, paddingLeft: spacing.sm },
        itemText: { fontSize: 14, color: colors.text, flex: 1 },
        btn: { borderRadius: 28, backgroundColor: colors.success, elevation: 4, marginTop: spacing.md },
        btnContent: { height: 52 },
        btnLabel: { fontSize: 16, fontWeight: '700', color: colors.onSuccess },
    });
    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Nueva checklist ✅</Text>
                    <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

                    <Formik
                        initialValues={{ title: '', description: '' }}
                        validationSchema={checklistSchema}
                        onSubmit={handleCreate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                            <View style={styles.form}>
                                <FormInput
                                    label="Título de la checklist *"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    error={errors.title}
                                    touched={touched.title}
                                    leftIcon="format-list-checkbox"
                                />

                                <FormInput
                                    label="Descripción (opcional)"
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    multiline
                                    numberOfLines={2}
                                    leftIcon="text"
                                />

                                {/* Items section */}
                                <Text style={styles.label}>Ítems ({items.length})</Text>

                                <View style={styles.itemInputRow}>
                                    <TextInput
                                        label="Añadir ítem"
                                        value={newItem}
                                        onChangeText={setNewItem}
                                        mode="outlined"
                                        style={styles.itemInput}
                                        outlineStyle={{ borderRadius: 12 }}
                                        returnKeyType="done"
                                        onSubmitEditing={addItem}
                                    />
                                    <IconButton
                                        icon="plus"
                                        size={24}
                                        iconColor={colors.onPrimary}
                                        style={styles.addBtn}
                                        onPress={addItem}
                                    />
                                </View>

                                {items.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemText}>☐ {item}</Text>
                                        <IconButton icon="close" size={16} iconColor={colors.error} onPress={() => removeItem(idx)} style={{ margin: 0 }} />
                                    </View>
                                ))}

                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    style={styles.btn}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                    icon="content-save"
                                >
                                    Crear checklist
                                </Button>

                                <Button mode="text" onPress={() => navigation.goBack()} labelStyle={{ color: colors.textSecondary }}>
                                    Cancelar
                                </Button>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar visible={success} onDismiss={() => { setSuccess(false); navigation.goBack(); }} duration={1500} style={{ backgroundColor: colors.success }}>
                ¡Checklist creada! ✅
            </Snackbar>
        </SafeAreaView>
    );
};


const EMOJI_SUGGESTIONS = ['📝', '🎬', '🌍', '🛒', '❤️', '🎵', '📚', '🍕', '✈️', '🎮'];

function CreateListScreen({ navigation, route }) {
    const { relationshipId, onCreated } = route.params;
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [items, setItems] = useState([]);

    const addItem = () => {
        if (!newItem.trim()) return;
        setItems((prev) => [...prev, newItem.trim()]);
        setNewItem('');
    };

    const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

    const handleCreate = async (values, { setSubmitting, resetForm }) => {
        try {
            const res = await contentAPI.create(relationshipId, {
                content_type: 'list',
                title: values.title,
                description: values.description,
                emoji: values.emoji,
                items,
            });
            onCreated?.(res.data.data?.item);
            setSuccess(true);
            resetForm();
            setItems([]);
        } catch (e) {
            setError(extractError(e));
        } finally {
            setSubmitting(false);
        }
    };

    const theme = useTheme();
    const colors = theme.colors;

    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: { padding: spacing.xl, flexGrow: 1 },
        title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
        form: { gap: spacing.sm },
        label: { fontSize: 14, fontWeight: '600', color: colors.text },
        emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
        emoji: { fontSize: 28, padding: 4, borderRadius: 8 },
        emojiSelected: { backgroundColor: colors.pink100, borderWidth: 2, borderColor: colors.primary },
        itemInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
        itemInput: { flex: 1, backgroundColor: colors.surface },
        addBtn: { backgroundColor: colors.secondary, borderRadius: 12, margin: 0 },
        itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceVariant, borderRadius: 8, paddingVertical: 4, paddingLeft: spacing.sm },
        itemBullet: { fontSize: 16, color: colors.secondary, marginRight: spacing.xs },
        itemText: { fontSize: 14, color: colors.text, flex: 1 },
        btn: { borderRadius: 28, backgroundColor: colors.secondary, elevation: 4, marginTop: spacing.md },
        btnContent: { height: 52 },
        btnLabel: { fontSize: 16, fontWeight: '700', color: colors.onSecondary },
    });

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Nueva lista 📋</Text>
                    <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

                    <Formik
                        initialValues={{ title: '', description: '', emoji: '📝' }}
                        validationSchema={sharedListSchema}
                        onSubmit={handleCreate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                            <View style={styles.form}>
                                <Text style={styles.label}>Emoji de la lista</Text>
                                <View style={styles.emojiRow}>
                                    {EMOJI_SUGGESTIONS.map((e) => (
                                        <Text
                                            key={e}
                                            style={[styles.emoji, values.emoji === e && styles.emojiSelected]}
                                            onPress={() => setFieldValue('emoji', e)}
                                        >
                                            {e}
                                        </Text>
                                    ))}
                                </View>

                                <FormInput
                                    label="Título de la lista *"
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    error={errors.title}
                                    touched={touched.title}
                                    leftIcon="format-list-bulleted"
                                />

                                <FormInput
                                    label="Descripción (opcional)"
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    multiline
                                    numberOfLines={2}
                                    leftIcon="text"
                                />

                                {/* Items */}
                                <Text style={styles.label}>Ítems ({items.length})</Text>
                                <View style={styles.itemInputRow}>
                                    <TextInput
                                        label="Añadir ítem"
                                        value={newItem}
                                        onChangeText={setNewItem}
                                        mode="outlined"
                                        style={styles.itemInput}
                                        outlineStyle={{ borderRadius: 12 }}
                                        returnKeyType="done"
                                        onSubmitEditing={addItem}
                                    />
                                    <IconButton
                                        icon="plus"
                                        size={24}
                                        iconColor="#FFF"
                                        style={styles.addBtn}
                                        onPress={addItem}
                                    />
                                </View>

                                {items.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemBullet}>•</Text>
                                        <Text style={styles.itemText}>{item}</Text>
                                        <IconButton icon="close" size={16} iconColor={colors.error} onPress={() => removeItem(idx)} style={{ margin: 0 }} />
                                    </View>
                                ))}

                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    style={styles.btn}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                    icon="content-save"
                                >
                                    Crear lista
                                </Button>

                                <Button mode="text" onPress={() => navigation.goBack()} labelStyle={{ color: colors.textSecondary }}>
                                    Cancelar
                                </Button>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar visible={success} onDismiss={() => { setSuccess(false); navigation.goBack(); }} duration={1500} style={{ backgroundColor: colors.success }}>
                ¡Lista creada! 📋
            </Snackbar>
        </SafeAreaView>
    );
}
