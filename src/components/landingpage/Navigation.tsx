"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          Waste<span className="text-indigo-500">X</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-white/80 hover:text-white transition"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition shadow-lg"
          >
            Try Free
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-6 py-6 space-y-4">
          <MobileLink href="/" setMenuOpen={setMenuOpen}>
            Home
          </MobileLink>
          <MobileLink href="/about" setMenuOpen={setMenuOpen}>
            About
          </MobileLink>
          <MobileLink href="/contact" setMenuOpen={setMenuOpen}>
            Contact
          </MobileLink>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link href="/login" className="text-white/80">
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center"
            >
              Try Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-white/80 hover:text-white transition">
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  setMenuOpen,
}: {
  href: string;
  children: React.ReactNode;
  setMenuOpen: (v: boolean) => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className="block text-white/80 hover:text-white"
    >
      {children}
    </Link>
  );
}
