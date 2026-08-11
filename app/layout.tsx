import './globals.css';
import SiteShell from '@/components/SiteShell';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'Phoneme Studio',
  description: 'A premium phoneme activity builder for Speech Pathology educators',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
