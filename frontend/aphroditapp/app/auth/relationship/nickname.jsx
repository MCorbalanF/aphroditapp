import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Button, Card, List, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import { nicknameSchema } from '../../../validation/relationshipSchemas';
import { relationshipsAPI } from '../../../api/relationships';
import FormInput from '../../../components/common/FormInput';
import UserAvatar from '../../../components/common/UserAvatar';
import ErrorBanner from '../../../components/common/ErrorBanner';
import { extractError } from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { spacing } from '../../../constants/theme';

export default function NicknameScreen({ navigation, route }) {
  const { id, members = [] } = route.params;
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const theme= useTheme();
  const colors = theme.colors;
  // Filter out self
  const otherMembers = members.filter((m) => m.user?.id !== user?.id);

  const handleSave = async (values, { setSubmitting, resetForm }) => {
    try {
      await relationshipsAPI.setNickname(id, values);
      setSuccess(true);
      resetForm();
      setSelectedMember(null);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Apodos 🏷️</Text>
        <Text style={styles.subtitle}>Pon un apodo especial a los miembros de tu relación</Text>

        <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

        {/* Member selector */}
        <Text style={styles.label}>Selecciona un miembro:</Text>
        <View style={styles.membersList}>
          {otherMembers.map((m) => (
            <Card
              key={m.id}
              style={[styles.memberCard, selectedMember?.id === m.id && styles.memberCardSelected]}
              onPress={() => setSelectedMember(m)}
              mode="elevated"
            >
              <Card.Content style={styles.memberCardContent}>
                <UserAvatar user={m.user} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.user?.username}</Text>
                  {m.nickname_for_me && (
                    <Text style={styles.currentNickname}>Apodo actual: "{m.nickname_for_me}"</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Nickname form */}
        {selectedMember && (
          <Formik
            initialValues={{ given_to_id: selectedMember.user?.id || '', nickname: selectedMember.nickname_for_me || '' }}
            validationSchema={nicknameSchema}
            enableReinitialize
            onSubmit={handleSave}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <FormInput
                  label={`Apodo para ${selectedMember.user?.username}`}
                  value={values.nickname}
                  onChangeText={handleChange('nickname')}
                  onBlur={handleBlur('nickname')}
                  error={errors.nickname}
                  touched={touched.nickname}
                  leftIcon="sticker-emoji"
                  placeholder="Ej: Osito, Cariño..."
                />
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.btn}
                  contentStyle={styles.btnContent}
                >
                  Guardar apodo
                </Button>
              </View>
            )}
          </Formik>
        )}
      </View>

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={2000}
        style={{ backgroundColor: colors.success }}
      >
        ¡Apodo guardado! 🏷️
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: spacing.xl },
  title: { fontSize: 24, fontWeight: '800',  marginBottom: spacing.xs },
  subtitle: { fontSize: 14, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600',  marginBottom: spacing.sm },
  membersList: { gap: spacing.sm, marginBottom: spacing.lg },
  memberCard: { borderRadius: 16 },
  memberCardSelected: { borderWidth: 2 },
  memberCardContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  memberName: { fontSize: 15, fontWeight: '600' },
  currentNickname: { fontSize: 12 },
  form: { gap: spacing.sm },
  btn: { borderRadius: 28 },
  btnContent: { height: 48 },
});
