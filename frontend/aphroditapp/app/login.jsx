import React from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, Divider, useTheme, IconButton, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import { loginSchema } from '../validation/authSchemas';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/common/FormInput';
import ErrorBanner from '../components/common/ErrorBanner';
import { spacing } from '../constants/theme';
import { useNavigation } from 'expo-router';

export default function LoginScreen(props) {
  const { login, error, clearError, isLoading } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();
  const colors = theme.colors;
  const handleLogin = async (values, { setSubmitting }) => {
    clearError();
    await login(values.username, values.password);
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

            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />

   
            <Avatar.Icon size={80} icon="heart" style={{ backgroundColor: colors.primary }} />
            
            <Text style={styles.title}>Bienvenido de vuelta 💕</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Error banner */}
          <ErrorBanner message={error} visible={Boolean(error)} onDismiss={clearError} />

          {/* Form */}
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <FormInput
                  label="Usuario"
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
                  label="Contraseña"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  leftIcon="lock"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting || isLoading}
                  disabled={isSubmitting || isLoading}
                  style={styles.loginBtn}
                  contentStyle={styles.loginBtnContent}
                  labelStyle={styles.loginBtnLabel}
                >
                  Iniciar sesión
                </Button>
              </View>
            )}
          </Formik>

          {/* Footer */}
          <Divider style={styles.divider} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('signin')}>
              <Text style={styles.footerLink}>Regístrate</Text>
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
    //backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 6,
    //shadowColor: colors.primary,
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
  loginBtn: {
    marginTop: spacing.md,
    borderRadius: 28,
    //backgroundColor: colors.primary,
    elevation: 4,
    //shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginBtnContent: {
    height: 52,
  },
  loginBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    //color: '#FFF',
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
