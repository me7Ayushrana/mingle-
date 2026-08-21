import { memo, forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: object;
  secureTextEntryToggle?: boolean;
}

export const Input = memo(
  forwardRef<TextInput, InputProps>(function Input(
    { label, error, containerStyle, secureTextEntryToggle, secureTextEntry, style, ...props },
    ref,
  ) {
    const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry ?? false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text variant="label">{label}</Text> : null}
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.muted}
            secureTextEntry={secureTextEntryToggle ? isPasswordHidden : secureTextEntry}
            style={[styles.input, error && styles.inputError, secureTextEntryToggle && styles.inputWithIcon, style]}
            accessibilityLabel={label}
            {...props}
          />
          {secureTextEntryToggle && (
            <Pressable
              style={styles.iconContainer}
              onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            >
              <Feather
                name={isPasswordHidden ? 'eye-off' : 'eye'}
                size={20}
                color={colors.foregroundMuted}
              />
            </Pressable>
          )}
        </View>
        {error ? (
          <Text variant="caption" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    color: colors.foreground,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
  },
});
