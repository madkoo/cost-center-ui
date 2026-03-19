import { SearchIcon } from '@primer/octicons-react';
import { TextInput } from '@primer/react';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search cost centers or users…' }: SearchBarProps) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  return (
    <TextInput
      leadingVisual={SearchIcon}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      aria-label="Search"
      sx={{ width: '100%', maxWidth: 480 }}
      size="large"
    />
  );
}
