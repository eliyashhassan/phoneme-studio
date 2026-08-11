'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Settings, Info, Search, Grid3X3, Home } from 'lucide-react';
import { useState } from 'react';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/wordle', label: 'Wordle', icon: Grid3X3 },
  { href: '/word-search', label: 'Word Search', icon: Search },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="nav-wrap">
          <Link href="/" className="brand" aria-label="Phoneme Studio home">
            <span className="brand-mark">P</span>
            <span>
              <strong>Phoneme Studio</strong>
              <small>Classroom Activity Builder</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={pathname === href ? 'nav-link active' : 'nav-link'}>
                <Icon size={17} /> {label}
              </Link>
            ))}
          </nav>

          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="mobile-menu">
            {[...nav, { href: '/about', label: 'About', icon: Info }, { href: '/settings', label: 'Settings', icon: Settings }].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? 'mobile-link active' : 'mobile-link'}>
                <Icon size={18} /> {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main>{children}</main>
      <footer className="footer">
        <div><strong>Phoneme Studio</strong><span>Frontend Design & Usability — Assessment 1</span></div>
        <div className="footer-meta">Eliyash Hassan · Student ID: 22204648</div>
      </footer>
    </div>
  );
}
