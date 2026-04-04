import { useCallback, useState } from 'react';

import type { ContactEntry } from '@/hooks/use-contacts';
import type { TransactionType } from '@/types';

type AddEntryFormState = {
  personName: string;
  phone: string;
  amount: string;
  type: TransactionType;
  interest: string;
  date: string;
  saving: boolean;
};

type SetFormField =
  | { field: 'contact'; value: ContactEntry }
  | { field: 'amount'; value: string }
  | { field: 'interest'; value: string }
  | { field: 'date'; value: string }
  | { field: 'type'; value: string };

export function useAddEntryFormState() {
  const [state, setState] = useState<AddEntryFormState>({
    personName: '',
    phone: '',
    amount: '',
    type: 'given',
    interest: '',
    date: new Date().toISOString().split('T')[0],
    saving: false,
  });

  const setFormField = useCallback((payload: SetFormField) => {
    setState((prev) => {
      switch (payload.field) {
        case 'contact':
          return {
            ...prev,
            personName: payload.value.name,
            phone: payload.value.phone ?? '',
          };

        case 'amount':
        case 'interest':
        case 'type':
        case 'date':
          return {
            ...prev,
            [payload.field]: payload.value,
          };
      }
    });
  }, []);

  return { state, setFormField };
}
