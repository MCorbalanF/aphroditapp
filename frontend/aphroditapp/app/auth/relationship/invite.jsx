import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, SegmentedButtons, Snackbar, useTheme, TextInput, Searchbar, List, Avatar, Card, IconButton, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import { inviteSchema } from '../../../validation/relationshipSchemas';
import { relationshipsAPI } from '../../../api/relationships';
import FormInput from '../../../components/common/FormInput';
import ErrorBanner from '../../../components/common/ErrorBanner';
import { extractError } from '../../../api/axios';
import { spacing } from '../../../constants/theme';

export default function InviteScreen({ navigation, route }) {
  const { id, name } = route.params;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [inviteBy, setInviteBy] = useState('username');
  const theme = useTheme();
  const colors = theme.colors;
  const [query, setQuery] = useState('');
  const handleInvite = async (values, { setSubmitting, resetForm }) => {
    try {
      await relationshipsAPI.invite(id, {
        username_or_email:  values.username.email ,
        message: values.message,
      });
      setSuccess(true);
      resetForm();
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };
  const handleUserQuery = async (text, setList) => {
    try {
      const res = await relationshipsAPI.userSearch(text);
      setList(res.data);
    } catch (e) {
      setError(extractError(e));
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Invitar a {name} 📨</Text>
          <Text style={styles.subtitle}>Invita a alguien a unirse a vuestra relación</Text>

          <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

          <Formik
            initialValues={{ username: null, email: '', message: '', userlist: [] }}
            validationSchema={inviteSchema}
            onSubmit={handleInvite}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
              <View style={styles.form}>
                <Searchbar
                  placeholder="Buscar usuario"
                  onChangeText={setQuery}
                  value={query}
                  platform="default"
                  mode="bar"
                  icon='account-search'
                  //traileringIcon={'chevron-down'}
                  clearIcon={'arrow-right'}
                  onClearIconPress={e => handleUserQuery(e.nativeEvent.text, (list) => setFieldValue('userlist', list))}
                  onSubmitEditing={e => handleUserQuery(e.nativeEvent.text, (list) => setFieldValue('userlist', list))}
                />
                {values.userlist.length > 0 && values.userlist.slice(0, 5).map((u) => {
                  return (
                    <List.Item
                      key={u.id}
                      title={u.username}
                      description={u.email}
                      onPress={() => {

                        setFieldValue('username', u);
                        setFieldValue('userlist', []);
                      }}
                      left={prop => u.avatar ?
                        <Avatar.Image source={{ uri: u.avatar }} {...prop} />
                        :
                        <Avatar.Icon
                          icon='account'  {...prop}
                          color={theme.colors.onPrimaryContainer}
                          style={{ backgroundColor: theme.colors.primaryContainer, marginLeft: 6 }}
                        />
                      }
                    />
                  )
                })}
                {values.username &&
                  <Card>
                    <Card.Content>
                      <Card.Title
                        title={values.username?.username || 'Ningún usuario seleccionado'}
                        subtitle={values.username?.email}
                        left={prop => values.username?.avatar ?
                          <Avatar.Image source={{ uri: values.username.avatar }} {...prop} />
                          :
                          <Avatar.Icon icon='account' {...prop} />}
                        right={prop=><Icon source='check-all' {...prop} />}
                      />
                    </Card.Content>
                  </Card>}

                <FormInput
                  label="Mensaje (opcional)"
                  value={values.message}
                  onChangeText={handleChange('message')}
                  onBlur={handleBlur('message')}
                  error={errors.message}
                  touched={touched.message}
                  leftIcon="message-text"
                  multiline
                  numberOfLines={3}
                  placeholder="Escribe un mensaje personal..."
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.btn}
                  contentStyle={styles.btnContent}
                  //labelStyle={styles.btnLabel}
                  icon="send"
                >
                  Enviar invitación
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                //labelStyle={{ color: colors.textSecondary }}
                >
                  Cancelar
                </Button>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={success}
        onDismiss={() => { setSuccess(false); navigation.goBack(); }}
        duration={2000}
        style={styles.snackbar}
      >
        ¡Invitación enviada correctamente! 🎉
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.xl, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, marginBottom: spacing.xl },
  segmented: { marginBottom: spacing.lg },
  form: { gap: spacing.sm },
  btn: { borderRadius: 28, elevation: 4, marginTop: spacing.md },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
