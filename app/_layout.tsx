import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { db, expoSQLite } from '@/db/client';
import { seedDatabase } from '@/db/seed';
import migrations from '@/drizzle/migrations';
import '@/global.css';
import { ThemePreferenceProvider, useThemePreference } from '@/hooks/use-theme-preference';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useDrizzleStudio(__DEV__ && Platform.OS !== 'web' ? expoSQLite : null);

  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setSeeded(true));
    }
  }, [success]);

  if (error) {
    console.error('Migration error:', error);
  }

  if (!success || !seeded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemePreferenceProvider>
        <AppContent />
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { resolvedTheme } = useThemePreference();

  return (
    <HeroUINativeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-entry"
          options={{
            presentation: 'modal',
            title: 'Add Entry',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="person/[name]"
          options={{
            title: 'Person',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </HeroUINativeProvider>
  );
}
