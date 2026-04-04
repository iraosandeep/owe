import * as Contacts from "expo-contacts";
import { useCallback, useState } from "react";

export interface ContactEntry {
  name: string;
  phone: string | null;
}

export function useContacts() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    const granted = status === "granted";
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

  const searchContacts = useCallback(
    async (query: string): Promise<ContactEntry[]> => {
      let granted = hasPermission;
      if (granted === null) {
        granted = await requestPermission();
      }
      if (!granted) return [];

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        name: query,
        sort: Contacts.SortTypes.FirstName,
        pageSize: 20,
      });

      return data
        .filter((c) => c.name)
        .map((c) => ({
          name: c.name!,
          phone: c.phoneNumbers?.[0]?.number ?? null,
        }));
    },
    [hasPermission, requestPermission],
  );

  return { hasPermission, requestPermission, searchContacts, pickContact };
}
