"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import MobileSidebar from "@/components/MobileSidebar";
import { navLinks } from "@/constants";
import UserContext from "@/components/context/UserContext";

const Header = () => {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen((prev) => !prev);
  const auth = useContext(UserContext);

  const handleLogOut = () => {
    auth.setUser("");
    auth.setUserId("");
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 p-4 max-sm:py-2 z-40 text-lessonColour bg-lessonLink backdrop-blur border-b border-gray-300/20">
        <nav className="md:container flex max-md:justify-between items-center gap-12">
          {/* Sakura Flashcards Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-60 custom-transition"
          >
            <Image
              src="/assets/images/sakura-flashcards-logo.svg"
              alt="Personal logo"
              width={40}
              height={40}
            />
            <Image
              src="/assets/images/sakura-flashcards-text-logo.png"
              alt="Personal logo"
              height={28}
              width={130}
            />
          </Link>
          <ul className="hidden md:flex w-full justify-between items-center space-x-8 uppercase font-bold text-sm tracking-[2px]">
            {/* Create a link for each item in navLinks list */}
            {navLinks.map((link) => (
              <li key={link.key} className="hover:opacity-60 custom-transition">
                <Link
                  href={
                    link.studySetId
                      ? `${link.href}/${link.studySetId}`
                      : link.href
                  }
                  className="p-2"
                >
                  <span className="relative">{link.text}</span>
                </Link>
              </li>
            ))}
            <div className="flex flex-grow"></div>
            {isClient ? (
              auth.userName ? (
                // If a user is logged in
                <li className="hover:opacity-60 custom-transition object-left-top">
                  <Link id="logout" className="link p-2 relative" href="/" onClick={handleLogOut}>
                    Log Out
                  </Link>
                </li>
              ) : (
                // else if a user is not logged in
                <>
                  <li className="hover:opacity-60 custom-transition object-left-top">
                    <Link id="login" href="/login" className="p-2 relative">
                      Login
                    </Link>
                  </li>
                  <li className="hover:opacity-60 custom-transition object-left-top">
                    <Link id="signup" href="/sign-up" className="p-2 relative">
                      Create Account
                    </Link>
                  </li>
                </>
              )
            ) : (
              // else if a user is not logged in
              <>
                <li className="hover:opacity-60 custom-transition object-left-top">
                  <Link id="login" href="/login" className="p-2 relative">
                    Login
                  </Link>
                </li>
                <li className="hover:opacity-60 custom-transition object-left-top">
                  <Link id="signup" href="/sign-up" className="p-2 relative">
                    Create Account
                  </Link>
                </li>
              </>
            )}
          </ul>
          {/* Sidebar */}
          <div className="flex items-center space-x-2 text-xl">
            <button
              type="button"
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:opacity-60 custom-transition"
              aria-label="toggle sidebar"
            >
              <Menu className="size-7" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {open && <MobileSidebar toggleSidebar={toggleSidebar} />}
      </AnimatePresence>
    </>
  )
};

export default Header;
