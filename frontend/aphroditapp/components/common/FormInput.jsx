import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import {  spacing } from '../../constants/theme';

export default function FormInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  secureTextEntry,
  leftIcon,
  rightIcon,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  ...props
}) {
  const [secureVisible, setSecureVisible] = useState(false);
  const hasError = Boolean(error && touched);
  const theme = useTheme();
  const colors = theme.colors;
  const rightComponent = secureTextEntry ? (
    <TextInput.Icon
      icon={secureVisible ? 'eye-off' : 'eye'}
      onPress={() => setSecureVisible((v) => !v)}
      //color={colors.textLight}
    />
  ) : rightIcon ? (
    <TextInput.Icon icon={rightIcon} />
  ) : undefined;

  const leftComponent = leftIcon ? (
    <TextInput.Icon icon={leftIcon} color={hasError ? colors.error : colors.primary} />
  ) : undefined;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        mode="outlined"
        secureTextEntry={secureTextEntry && !secureVisible}
        error={hasError}
        left={leftComponent}
        right={rightComponent}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, multiline && styles.multiline, inputStyle]}
        outlineStyle={styles.outline}
        contentStyle={styles.content}
        {...props}
      />
      {hasError && (
        <HelperText type="error" visible={hasError} style={styles.helper}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  
  multiline: {
    minHeight: 100,
  },
  outline: {
    borderRadius: 12,
  },
  content: {
    paddingVertical: 4,
  },
  helper: {
    marginTop: -4,
  },
});
