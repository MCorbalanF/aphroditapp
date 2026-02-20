import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { useField } from 'formik';

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  left?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
}

export default function FormInput({
  name,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  left,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  ...rest
}: FormInputProps) {
  const [field, meta, helpers] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const hasError = meta.touched && !!meta.error;

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={field.value}
        onChangeText={helpers.setValue}
        onBlur={() => helpers.setTouched(true)}
        mode="outlined"
        error={hasError}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        left={left}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          ) : undefined
        }
        style={[styles.input, multiline && { minHeight: 80 }]}
        outlineStyle={{ borderRadius: 12 }}
        {...rest}
      />
      <HelperText type="error" visible={hasError}>
        {meta.error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
});