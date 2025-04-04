"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between py-4 border-b mb-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Kuru Terminal</h1>
      </div>
      <div className="flex gap-6">
        <Link 
          href="/" 
          className={`hover:text-primary transition-colors ${pathname === '/' ? 'font-bold' : ''}`}
        >
          Home
        </Link>
        <Link 
          href="/compare" 
          className={`hover:text-primary transition-colors ${pathname === '/compare' ? 'font-bold' : ''}`}
        >
          Compare Services
        </Link>
      </div>
    </nav>
  );
} 