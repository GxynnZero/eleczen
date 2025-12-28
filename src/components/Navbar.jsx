"use client";

import { LogIn, Menu, User, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Design", href: "/design" },
  { name: "Tools", href: "/tools" },
  { name: "Encyclopedia", href: "/encyclopedia" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
];

export default function Navbar() {
  
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl bg-black/50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Zap className="h-8 w-8 text-neon-blue relative z-10" />
                  <div className="absolute inset-0 bg-neon-blue/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-bold text-xl tracking-wider text-white">
                  ELEC<span className="text-neon-blue">ZEN</span>
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-white/10 rounded-full"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              {/* Auth Buttons */}
              {session ? (
                <div className="relative ml-4 group">
                  <Link href="/profile">
                    <motion.div
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="User"
                          className="w-6 h-6 rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </div>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4 px-5 py-2 rounded-full bg-neon-blue text-black font-bold text-sm shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-shadow flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden glass-panel border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === item.href
                      ? "text-black bg-neon-blue font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-white/10 mt-4">
                {session ? (
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="User"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-neon-purple" />
                    )}
                    <span className="font-medium">My Profile</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
