import React from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, Divider, ProgressBar, useTheme, Icon, Avatar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import { registerSchema } from '../validation/authSchemas';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/common/FormInput';
import ErrorBanner from '../components/common/ErrorBanner';
import {  spacing } from '../constants/theme';
import { useNavigation } from 'expo-router';


export default function RegisterScreen(props) {
  const { register, error, clearError, isLoading } = useAuth();
  const navigation = useNavigation();

  const theme= useTheme();
const colors = theme.colors;
function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 0.25;
  if (/[A-Z]/.test(password)) score += 0.25;
  if (/[0-9]/.test(password)) score += 0.25;
  if (/[^A-Za-z0-9]/.test(password)) score += 0.25;
  return score;
}

function strengthColor(strength) {
  if (strength < 0.5) return colors.error;
  if (strength < 0.75) return colors.warning;
  return colors.success;
}

function strengthLabel(strength) {
  if (strength < 0.25) return '';
  if (strength < 0.5) return 'Débil';
  if (strength < 0.75) return 'Media';
  return 'Fuerte ✓';
}

  const handleRegister = async (values, { setSubmitting }) => {
    console.log(values);
    clearError();
    await register(values);
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>

            <IconButton icon="account-plus" size={32}   style={{alignSelf: 'flex-start' }} />

            <Avatar.Icon size={80} icon="account-plus" style={{ backgroundColor: colors.primary }} />
            <Text style={styles.title}>Crear cuenta 🌸</Text>
            <Text style={styles.subtitle}>Únete y comparte momentos especiales</Text>
          </View>

          {/* Error banner */}
          <ErrorBanner message={error} visible={Boolean(error)} onDismiss={clearError} />

          {/* Form */}
          <Formik
            initialValues={{
              username: '',
              email: '',
              phone: '',
              password: '',
              password_confirm: '',
            }}
           //validationSchema={registerSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }) => {
              const strength = getPasswordStrength(values.password);
              return (
                <View style={styles.form}>
                  <FormInput
                    label="Nombre de usuario"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    error={errors.username}
                    touched={touched.username}
                    leftIcon="account"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <FormInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                    touched={touched.email}
                    leftIcon="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <FormInput
                    label="Teléfono (opcional)"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={errors.phone}
                    touched={touched.phone}
                    leftIcon="phone"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />

                  <FormInput
                    label="Contraseña"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                    leftIcon="lock"
                    secureTextEntry
                    returnKeyType="next"
                  />

                  {/* Password strength indicator */}
                  {values.password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <ProgressBar
                        progress={strength}
                        color={strengthColor(strength)}
                        style={styles.strengthBar}
                      />
                      <Text style={[styles.strengthLabel, { color: strengthColor(strength) }]}>
                        {strengthLabel(strength)}
                      </Text>
                    </View>
                  )}

                  <FormInput
                    label="Confirmar contraseña"
                    value={values.password_confirm}
                    onChangeText={handleChange('password_confirm')}
                    onBlur={handleBlur('password_confirm')}
                    error={errors.password_confirm}
                    touched={touched.password_confirm}
                    leftIcon="lock-check"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting || isLoading}
                    disabled={!isValid || isSubmitting || isLoading}
                    style={styles.registerBtn}
                    contentStyle={styles.registerBtnContent}
                    labelStyle={styles.registerBtnLabel}
                  >
                    Crear cuenta
                  </Button>
                </View>
              );
            }}
          </Formik>

          {/* Footer */}
          <Divider style={styles.divider} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('login')}>
              <Text style={styles.footerLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    //backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.xs,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    //backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 6,
    //shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    //color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    //color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  registerBtn: {
    marginTop: spacing.md,
    borderRadius: 28,
    //backgroundColor: colors.secondary,
    elevation: 4,
    ///shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerBtnContent: {
    height: 52,
  },
  registerBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  divider: {
    marginVertical: spacing.xl,
    //backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    //color: colors.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    //color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
