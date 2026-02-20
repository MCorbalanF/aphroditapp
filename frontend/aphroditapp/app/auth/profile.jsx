import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import {
    Text, Button, Surface, List,
    Divider, Switch, Snackbar, Portal,
    Modal, TextInput, useTheme,
} from 'react-native-paper';
import { Formik } from 'formik';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { changePasswordSchema } from '@/components/form/ValidationSchemas';
import FormInput from '@/components/form/FormInput';
import { useAuth } from '@/context/AuthContext';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const MDtheme = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [changePassVisible, setChangePassVisible] = useState(false);
    const [snack, setSnack] = useState(null);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const { updateTheme, theme } = useAuth();
    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    const handleChangePassword = async (
        values,
        { setSubmitting, resetForm },
    ) => {
        try {

            setSnack({ msg: 'Contraseña cambiada correctamente', isError: false });
            setChangePassVisible(false);
            resetForm();
        } catch (err) {
            //setSnack({ msg: extractApiError(err), isError: true });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: MDtheme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <Text variant="headlineSmall" style={styles.pageTitle}>
                        Ajustes
                    </Text>

                    {/* Account */}
                    <Text variant="labelLarge" style={styles.sectionLabel}>
                        CUENTA
                    </Text>
                    <Surface style={styles.card} elevation={1}>
                        <List.Item
                            title="Email"
                            description={user?.email}
                            left={(p) => <List.Icon {...p} icon="email-outline" />}
                        />
                        <Divider />
                        <List.Item
                            title="Cambiar contraseña"
                            left={(p) => <List.Icon {...p} icon="lock-reset" />}
                            right={(p) => <List.Icon {...p} icon="chevron-right" />}
                            onPress={() => setChangePassVisible(true)}
                        />
                        <Divider />
                        <List.Item
                            title="Editar perfil"
                            left={(p) => <List.Icon {...p} icon="account-edit-outline" />}
                            right={(p) => <List.Icon {...p} icon="chevron-right" />}
                            onPress={() => router.push('/(tabs)/profile')}
                        />
                    </Surface>

                    {/* Preferences */}
                    <Text variant="labelLarge" style={styles.sectionLabel}>
                        PREFERENCIAS
                    </Text>
                    <Surface style={styles.card} elevation={1}>
                        <List.Item
                            title="Notificaciones"
                            description="Recibir notificaciones push"
                            left={(p) => <List.Icon {...p} icon="bell-outline" />}
                            right={() => (
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    color={MDtheme.colors.primary}
                                />
                            )}
                        />
                        <Divider />
                        <List.Item
                            title={`Tema ${theme === 'dark' ? 'oscuro' : 'claro'}`}
                            left={(p) => <List.Icon {...p} icon={'theme-light-dark'} />}
                            right={(p) => <List.Icon {...p} icon={theme !== 'dark' ? 'white-balance-sunny' : 'weather-night'} />}
                            onPress={() => updateTheme(theme === 'light' ? 'dark' : 'light')}
                        />
                        <Divider />
                        <List.Item
                            title="Lenguaje "
                            disabled
                            left={(p) => <List.Icon {...p} icon="translate" />}
                            right={(p) => <Text style={{ color: MDtheme.colors.disabled, alignSelf:'center' }}>Español</Text>}
                            onPress={() => router.push('/(tabs)/profile')}
                        />
                    </Surface>

                    {/* About */}
                    <Text variant="labelLarge" style={styles.sectionLabel}>
                        ACERCA DE
                    </Text>
                    <Surface style={styles.card} elevation={1}>
                        <List.Item
                            title="Versión de la app"
                            description={Application.nativeBuildVersion || '0.0.0'}
                            left={(p) => <List.Icon {...p} icon="information-outline" />}
                        />
                        <Divider />
                        <List.Item
                            title="Términos y condiciones"
                            left={(p) => <List.Icon {...p} icon="file-document-outline" />}
                            right={(p) => <List.Icon {...p} icon="chevron-right" />}
                        />
                        <Divider />
                        <List.Item
                            title="Política de privacidad"
                            left={(p) => <List.Icon {...p} icon="shield-outline" />}
                            right={(p) => <List.Icon {...p} icon="chevron-right" />}
                        />
                    </Surface>

                    {/* Logout */}
                    <Button
                        mode="outlined"
                        icon="logout"
                        onPress={handleLogout}
                        textColor={MDtheme.colors.error}
                        style={[styles.logoutBtn, { borderColor: MDtheme.colors.error }]}
                        contentStyle={styles.btnContent}
                    >
                        Cerrar sesión
                    </Button>
                </View>
            </ScrollView>

            {/* Change password modal */}
            <Portal>
                <Modal
                    visible={changePassVisible}
                    onDismiss={() => setChangePassVisible(false)}
                    contentContainerStyle={[
                        styles.modal,
                        { backgroundColor: MDtheme.colors.surface },
                    ]}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>
                        Cambiar contraseña
                    </Text>
                    <Formik
                        initialValues={{
                            old_password: '',
                            new_password: '',
                            new_password2: '',
                        }}
                        validationSchema={changePasswordSchema}
                        onSubmit={handleChangePassword}
                    >
                        {({ handleSubmit, isSubmitting }) => (
                            <View style={styles.form}>
                                <FormInput
                                    name="old_password"
                                    label="Contraseña actual"
                                    secureTextEntry
                                    left={<TextInput.Icon icon="lock-outline" />}
                                />
                                <FormInput
                                    name="new_password"
                                    label="Nueva contraseña"
                                    secureTextEntry
                                    left={<TextInput.Icon icon="lock-plus-outline" />}
                                />
                                <FormInput
                                    name="new_password2"
                                    label="Confirmar nueva contraseña"
                                    secureTextEntry
                                    left={<TextInput.Icon icon="lock-check-outline" />}
                                />
                                <View style={styles.modalActions}>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setChangePassVisible(false)}
                                        style={styles.modalBtn}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={() => handleSubmit()}
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                        style={styles.modalBtn}
                                    >
                                        Guardar
                                    </Button>
                                </View>
                            </View>
                        )}
                    </Formik>
                </Modal>
            </Portal>

            <Snackbar
                visible={!!snack}
                onDismiss={() => setSnack(null)}
                duration={3000}
                style={{
                    backgroundColor: snack?.isError
                        ? MDtheme.colors.error
                        : MDtheme.colors.primary,
                }}
            >
                {snack?.msg}
            </Snackbar>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { flexGrow: 1 },
    container: { padding: 20, gap: 4 },
    pageTitle: { fontWeight: 'bold', marginBottom: 8 },
    sectionLabel: {
        opacity: 0.5,
        marginTop: 16,
        marginBottom: 6,
        marginLeft: 4,
    },
    card: { borderRadius: 16, overflow: 'hidden' },
    logoutBtn: {
        marginTop: 24,
        borderRadius: 12,
    },
    btnContent: { paddingVertical: 4 },
    modal: {
        margin: 24,
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    form: { gap: 4 },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalBtn: { flex: 1, borderRadius: 12 },
});