import * as Contacts from 'expo-contacts';
import { useCallback, useState } from 'react';

export interface ContactEntry {
  name: string;
  phone: string | null;
}

export function useContacts() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const pickContact = useCallback(async (): Promise<ContactEntry | null> => {
    let granted = hasPermission;
    if (granted === null) {
      granted = await requestPermission();
    }
    if (!granted) return null;

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      sort: Contacts.SortTypes.FirstName,
      pageSize: 1,
    });

    const first = data[0];
    if (!first?.name) return null;
    return {
      name: first.name,
      phone: first.phoneNumbers?.[0]?.number ?? null,
    };
  }, [hasPermission, requestPermission]);

  const getAllContacts = useCallback(async (): Promise<ContactEntry[]> => {
    let granted = hasPermission;
    if (granted === null) {
      granted = await requestPermission();
    }
    if (!granted) return [];

    const contacts: ContactEntry[] = [];
    let pageOffset = 0;
    let hasNextPage = true;
    const pageSize = 500;

    while (hasNextPage) {
      const result = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
        pageSize,
        pageOffset,
      });

      contacts.push(
        ...result.data
          .filter((c) => c.name)
          .map((c) => ({
            name: c.name!,
            phone: c.phoneNumbers?.[0]?.number ?? null,
          }))
      );

      hasNextPage = Boolean(result.hasNextPage);
      pageOffset += pageSize;
    }

    return contacts;
  }, [hasPermission, requestPermission]);

  const searchContacts = useCallback(
    async (query: string, pageSize = 20): Promise<ContactEntry[]> => {
      let granted = hasPermission;
      if (granted === null) {
        granted = await requestPermission();
      }
      if (!granted) return [];

      const trimmedQuery = query.trim();
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        ...(trimmedQuery ? { name: trimmedQuery } : {}),
        sort: Contacts.SortTypes.FirstName,
        pageSize,
      });

      return data
        .filter((c) => c.name)
        .map((c) => ({
          name: c.name!,
          phone: c.phoneNumbers?.[0]?.number ?? null,
        }));
    },
    [hasPermission, requestPermission]
  );

  return { hasPermission, requestPermission, searchContacts, pickContact, getAllContacts };
}
