import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, SegmentedButtons, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import { createRelationshipSchema } from '../../validation/relationshipSchemas';
import { relationshipsAPI } from '../../api/relationships';
import { authAPI } from '../../api/auth';
import FormInput from '../../components/common/FormInput';
import ErrorBanner from '../../components/common/ErrorBanner';
import { extractError } from '../../api/axios';
import { spacing } from '../../constants/theme';

const DEFAULT_TYPES = [
  { id: 1, name: 'Pareja', icon: '💑' },
  { id: 2, name: 'Amigos', icon: '👫' },
  { id: 3, name: 'Familia', icon: '👨‍👩‍👧' },
  { id: 4, name: 'Compañeros', icon: '🤝' },
];

export default function CreateRelationshipScreen({ navigation }) {
  const [error, setError] = useState(null);
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const theme = useTheme();
  const colors = theme.colors;

  const handleCreate = async (values, { setSubmitting }) => {
    try {
      const res = await relationshipsAPI.create({
        name: values.name,
        relationship_type_id: values.relationship_type_id,
        anniversary_date: values.anniversary_date || undefined,
      });

      navigation.goBack();

    } catch (e) {
      setError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <ErrorBanner message={error} visible={Boolean(error)} onDismiss={() => setError(null)} />

          <Text style={styles.title}>Nueva relación 💕</Text>

          <Text style={styles.subtitle}>Crea un espacio compartido con tus personas especiales</Text>

          <Formik
            initialValues={{ name: '', relationship_type_id: '', anniversary_date: '' }}
            validationSchema={createRelationshipSchema}
            onSubmit={handleCreate}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
              <View style={styles.form}>
                <FormInput
                  label="Nombre de la relación"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={errors.name}
                  touched={touched.name}
                  leftIcon="heart"
                  placeholder="Ej: Mi amor y yo 💕"
                />

                <Text style={styles.label}>Tipo de relación</Text>
                {touched.relationship_type_id && errors.relationship_type_id && (
                  <Text style={styles.errorText}>{errors.relationship_type_id}</Text>
                )}
                <View style={styles.typesGrid}>
                  {types.map((t) => (
                    <Chip
                      key={t.id}
                      selected={values.relationship_type_id === t.id}
                      onPress={() => setFieldValue('relationship_type_id', t.id)}
                      style={[
                        styles.typeChip,
                        values.relationship_type_id === t.id && {backgroundColor:colors.primary},
                      ]}
                      textStyle={[
                        styles.typeChipText,
                        values.relationship_type_id === t.id &&  { color:colors.onPrimary},
                      ]}
                      icon={() => <Text style={{ fontSize: 16 }}>{t.icon}</Text>}
                    >
                      {t.name}
                    </Chip>
                  ))}
                </View>

                <FormInput
                  label="Fecha de aniversario (opcional)"
                  value={values.anniversary_date}
                  onChangeText={handleChange('anniversary_date')}
                  onBlur={handleBlur('anniversary_date')}
                  error={errors.anniversary_date}
                  touched={touched.anniversary_date}
                  leftIcon="calendar-heart"
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.btn}
                  contentStyle={styles.btnContent}
                  labelStyle={styles.btnLabel}
                >
                  Crear relación
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                  style={{ marginTop: spacing.xs }}
                >
                  Cancelar
                </Button>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, },
  scroll: { padding: spacing.xl, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800',  marginBottom: spacing.xs },
  subtitle: { fontSize: 14,  marginBottom: spacing.xl, lineHeight: 20 },
  form: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600',  marginBottom: spacing.xs },
  errorText: {  fontSize: 12, marginTop: -spacing.xs, marginBottom: spacing.xs },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  typeChip: {  borderRadius: 20 },
  typeChipTextSelected: {  fontWeight: '700' },
  btn: { borderRadius: 28,  elevation: 4, marginTop: spacing.md },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 16, fontWeight: '700',  },
});
