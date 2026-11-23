"use client";

import { LoginView } from "@/components/auth/LoginView";
import { AddClothingModal } from "@/components/modals/AddClothingModal";
import { ClothingDetailModal } from "@/components/modals/ClothingDetailModal";
import { useWardrobe } from "@/context/WardrobeContext";
import {
  BarChart3,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  FolderHeart,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User,
  Watch,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    isAuthenticated,
    logout,
    items,
    outfits,
    wishlist,
    profile,
    settings,
    updateSettings,
    openAddModal,
    toasts,
    dismissToast,
  } = useWardrobe();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryDesktopNav: NavItem[] = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Closet", href: "/wardrobe", icon: Shirt, count: items.length },
    { label: "Matcher", href: "/matcher", icon: SlidersHorizontal },
    { label: "Stylist", href: "/stylist", icon: Sparkles },
    { label: "Builder", href: "/builder", icon: Layers },
    {
      label: "Outfits",
      href: "/outfits",
      icon: FolderHeart,
      count: outfits.length,
    },
    { label: "Calendar", href: "/calendar", icon: Calendar },
  ];

  const allDrawerItems: NavItem[] = [
    { label: "Home Overview", href: "/", icon: LayoutDashboard },
    { label: "My Closet", href: "/wardrobe", icon: Shirt, count: items.length },
    { label: "Outfit Matcher", href: "/matcher", icon: SlidersHorizontal },
    { label: "Smart Stylist", href: "/stylist", icon: Sparkles },
    { label: "Outfit Builder", href: "/builder", icon: Layers },
    {
      label: "Saved Outfits",
      href: "/outfits",
      icon: FolderHeart,
      count: outfits.length,
    },
    { label: "Accessories & Perfumes", href: "/accessories", icon: Watch },
    { label: "Outfit Calendar", href: "/calendar", icon: Calendar },
    { label: "Wear History", href: "/history", icon: Clock },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Bookmark,
      count: wishlist.length,
    },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const mobileBottomTabs: NavItem[] = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Closet", href: "/wardrobe", icon: Shirt },
    { label: "Matcher", href: "/matcher", icon: SlidersHorizontal },
    { label: "Stylist", href: "/stylist", icon: Sparkles },
    { label: "Outfits", href: "/outfits", icon: FolderHeart },
  ];

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === "dark" ? "light" : "dark",
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => dismissToast(t.id)}
              className="pointer-events-auto cursor-pointer p-3.5 rounded-[12px] bg-[#090909] text-white shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#269238] flex-shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <div className="font-semibold">{t.title}</div>
                {t.description && (
                  <div className="text-slate-300 mt-0.5">{t.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#f5f8ff] dark:bg-[#090909] text-[#090909] dark:text-white pb-[72px] lg:pb-6">
      {/* Structured GetWardrobe Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 px-3 sm:px-6 bg-white dark:bg-[#121824] border-b border-slate-200/90 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 rounded-[10px] bg-[#f5f8ff] dark:bg-slate-800 flex items-center justify-center text-[#090909] dark:text-white flex-shrink-0"
              aria-label="Open all modules menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-[#2E2E2E] border border-slate-300/60 dark:border-slate-700 flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                <img
                  src="/logo.png"
                  alt="Sagu's Wardrobe Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-[15px] tracking-tight truncate text-[#090909] dark:text-white">
                Sagu&apos;s Wardrobe
              </span>
            </Link>
          </div>

          {/* Center: Desktop Primary Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryDesktopNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-[10px] text-[13.5px] font-medium inline-flex items-center gap-1.5 transition-all duration-fast ${
                    isActive
                      ? "bg-[#0288d1] text-white font-semibold shadow-[0_6px_16px_rgba(2,136,209,0.18)]"
                      : "text-[#666666] dark:text-slate-300 hover:bg-[#f5f8ff] dark:hover:bg-slate-800 hover:text-[#090909] dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[11px] px-1.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1]"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Compact Action Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="h-9 px-3 rounded-[10px] bg-[#0288d1] hover:bg-[#0277bd] text-white text-[13px] font-semibold inline-flex items-center gap-1 shadow-[0_6px_16px_rgba(2,136,209,0.18)] transition-all duration-fast"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-[10px] bg-[#f5f8ff] dark:bg-slate-800 text-[#666666] dark:text-slate-300 flex items-center justify-center hover:text-[#090909]"
              aria-label="Toggle theme"
            >
              {settings.theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-[10px] bg-[#f5f8ff] dark:bg-slate-800 text-[#666666] hover:text-rose-600 flex items-center justify-center"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Out Navigation Drawer (All Modules) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] bg-white dark:bg-[#121824] h-full flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] overflow-hidden bg-[#2E2E2E] border border-slate-300/60 dark:border-slate-700 flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="Sagu's Wardrobe Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-[14.5px] leading-tight">
                    Sagu&apos;s Wardrobe
                  </div>
                  <div className="text-[12px] text-[#666666]">
                    {profile.name} • {items.length} items
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-[8px] bg-[#f5f8ff] dark:bg-slate-800 flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
              {allDrawerItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#0288d1] text-white font-semibold"
                        : "text-[#090909] dark:text-slate-200 hover:bg-[#f5f8ff] dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[12px] px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#f5f8ff] dark:bg-slate-800 text-[#0288d1]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full h-10 px-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-[13.5px] font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4">
        {children}
      </main>

      {/* Perfectly Aligned 5-Column Android Bottom Navigation Bar */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white dark:bg-[#121824] border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-1px_3px_rgba(0,0,0,0.08)] grid grid-cols-5 items-center px-1"
      >
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                isActive
                  ? "text-[#0288d1] font-semibold"
                  : "text-[#666666] dark:text-slate-400"
              }`}
            >
              <div
                className={`px-3 py-1 rounded-full transition-colors ${
                  isActive ? "bg-[#0288d1]/12 text-[#0288d1]" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] leading-none truncate max-w-full px-1">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Global Modals */}
      <AddClothingModal />
      <ClothingDetailModal />

      {/* Toast Notifications */}
      <div className="fixed bottom-20 lg:bottom-5 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto cursor-pointer p-3.5 rounded-[12px] bg-[#090909] text-white shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#269238] flex-shrink-0 mt-0.5" />
            <div className="text-[13px]">
              <div className="font-semibold">{t.title}</div>
              {t.description && (
                <div className="text-slate-300 mt-0.5">{t.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
