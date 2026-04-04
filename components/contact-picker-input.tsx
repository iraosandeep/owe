import { useContacts, type ContactEntry } from '@/hooks/use-contacts';
import { Card, Input } from 'heroui-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

type ContactPickerInputProps = {
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  onContactSelected?: (contact: ContactEntry) => void;
};

const SEARCH_DEBOUNCE_MS = 220;
const MAX_RESULTS = 8;
const EMPTY_QUERY_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 30;

export function ContactPickerInput({
  placeholder = 'Search contacts or type a name...',
  value,
  onChangeText,
  onContactSelected,
}: ContactPickerInputProps) {
  const { searchContacts, requestPermission } = useContacts();
  const [results, setResults] = useState<ContactEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRequestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSearchRef = useRef(false);

  const runSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const trimmed = query.trim();

      debounceRef.current = setTimeout(async () => {
        const requestId = ++searchRequestIdRef.current;
        setIsLoading(true);

        try {
          const contacts = await searchContacts(
            trimmed,
            trimmed ? SEARCH_PAGE_SIZE : EMPTY_QUERY_PAGE_SIZE
          );
          if (requestId !== searchRequestIdRef.current) return;

          const topResults = contacts.slice(0, MAX_RESULTS);
          setResults(topResults);
          setShowResults(topResults.length > 0);
        } catch {
          if (requestId !== searchRequestIdRef.current) return;
          setResults([]);
          setShowResults(false);
        } finally {
          if (requestId === searchRequestIdRef.current) {
            setIsLoading(false);
          }
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [searchContacts]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      onChangeText(text);

      if (suppressSearchRef.current) {
        suppressSearchRef.current = false;
        return;
      }

      runSearch(text);
    },
    [onChangeText, runSearch]
  );

  const handleSelect = useCallback(
    (contact: ContactEntry) => {
      suppressSearchRef.current = true;
      onChangeText(contact.name);
      onContactSelected?.(contact);
      setResults([]);
      setShowResults(false);
    },
    [onChangeText, onContactSelected]
  );

  return (
    <View>
      <Input
        placeholder={placeholder}
        value={value}
        onFocus={() => {
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
          }
          runSearch(value);
        }}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => {
            setShowResults(false);
          }, 120);
        }}
        onChangeText={handleChange}
        autoCapitalize="words"
      />
      {showResults && (
        <Card variant="default" className="absolute left-0 right-0 top-13 z-10">
          <Card.Body>
            {isLoading ? (
              <Text className="py-2 text-center text-sm text-muted">Loading contacts...</Text>
            ) : null}
            {results.map((contact, index) => (
              <Pressable
                key={`${contact.name}-${contact.phone ?? 'none'}-${index}`}
                onPress={() => handleSelect(contact)}
                className={
                  index < results.length - 1 ? 'border-b border-separator py-2.5' : 'py-2.5'
                }>
                <Text className="text-[15px] font-semibold text-foreground">{contact.name}</Text>
                {contact.phone ? (
                  <Text className="mt-px text-[13px] text-muted">{contact.phone}</Text>
                ) : null}
              </Pressable>
            ))}
          </Card.Body>
        </Card>
      )}
      <Pressable
        onPress={async () => {
          const granted = await requestPermission();
          if (!granted) {
            Alert.alert('Permission Required', 'Please allow access to contacts to search.');
          }
        }}>
        <Text className="mb-1 text-[13px] text-accent">Allow contacts access</Text>
      </Pressable>
    </View>
  );
}
