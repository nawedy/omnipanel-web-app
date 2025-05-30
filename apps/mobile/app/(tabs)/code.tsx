import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function CodeScreen(): JSX.Element {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    placeholder: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Code</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.placeholder}>
            Code editor coming soon...{'\n\n'}
            • Monaco editor integration{'\n'}
            • Syntax highlighting{'\n'}
            • Multi-file support{'\n'}
            • Git integration{'\n'}
            • AI code completion
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
} 