'use client';
import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )theme=([^;]+)/);
    const theme = match?.[1] || 'light';
    document.documentElement.dataset.theme = theme;
  }, []);
  return children;
}
