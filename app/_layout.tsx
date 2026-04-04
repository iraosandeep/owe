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
    // TODO: remove this for when publish
    if (success) {
      seedDatabase().then(() => setSeeded(true));
    }
  }, [success]);

  if (error) {
    console.error('Migration error:', error);
  }

  if (!success || !seeded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
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
            presentation: 'formSheet',
            title: 'Add Entry',
            headerShown: false,
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="person/[name]"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </HeroUINativeProvider>
  );
}
