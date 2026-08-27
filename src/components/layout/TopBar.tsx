import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  DollarSign, 
  UserCheck,
  Laptop,
  Lock,
  LogOut,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useStaffStore } from '../../stores/useStaffStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { formatCurrency } from '../../utils/format';
import { sound } from '../../utils/audio';

interface TopBarProps {
  pageTitle: string;
  onOpenSearch: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ pageTitle, onOpenSearch, onNavigateTab }) => {
  const { settings, setTheme, toggleAudio } = useSettingsStore();
  const { currentStaff, setPinModalOpen, lockScreen, logout } = useStaffStore();
  const { currentShift, setShiftDrawerOpen } = useShiftStore();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cycleTheme = () => {
    sound.playClick();
    if (settings.theme === 'light') setTheme('dark');
    else if (settings.theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (settings.theme === 'light') return <Sun className="w-4 h-4 text-[#FF9F0A]" />;
    if (settings.theme === 'dark') return <Moon className="w-4 h-4 text-[#98989D]" />;
    return <Laptop className="w-4 h-4 text-[#0071E3]" />;
  };

  return (
    <header className="h-16 px-6 bg-[#FFFFFF]/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between z-20 shrink-0 select-none transition-colors">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {pageTitle}
        </h2>
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
          <span>Store Open</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenSearch();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs text-[#6E6E73] dark:text-[#98989D] transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono">
            /
          </kbd>
        </button>

        {/* Active Shift Indicator Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShiftDrawerOpen(true);
          }}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] transition-all"
        >
          <DollarSign className="w-3.5 h-3.5 text-[#8B6F5A] dark:text-[#D4BBA5]" />
          <span>
            {currentShift?.status === 'OPEN'
              ? `Shift: ${formatCurrency(currentShift.expectedCash)}`
              : 'Shift: Closed'}
          </span>
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          title={settings.enableAudio ? 'Audio Effects On' : 'Audio Muted'}
          className="w-9 h-9 rounded-[10px] bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          {settings.enableAudio ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 opacity-50" />
          )}
        </button>

        {/* Dark Mode Switcher */}
        <button
          type="button"
          onClick={cycleTheme}
          title={`Theme: ${settings.theme}`}
          className="w-9 h-9 rounded-[10px] bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center transition-colors"
        >
          {getThemeIcon()}
        </button>

        {/* Staff Switcher & Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-[10px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors border border-transparent hover:border-black/5"
          >
            {currentStaff.avatar ? (
              <img
                src={currentStaff.avatar}
                alt={currentStaff.name}
                className="w-7 h-7 rounded-full object-cover border border-black/10 dark:border-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#8B6F5A]/20 text-[#8B6F5A] text-xs font-semibold flex items-center justify-center">
                {currentStaff.name.charAt(0)}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {currentStaff.name}
            </span>
            <ChevronDown className="w-3 h-3 text-[#6E6E73] opacity-70" />
          </button>

          {/* Profile Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1C1C1E] rounded-[18px] shadow-2xl border border-black/10 dark:border-white/10 p-2 z-50 flex flex-col gap-1">
              {/* Header Info */}
              <div className="px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                <p className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {currentStaff.name}
                </p>
                <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider">
                  Role: {currentStaff.role}
                </p>
              </div>

              {/* Menu items */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsProfileMenuOpen(false);
                  setPinModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-left transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8B6F5A]" />
                <span>Switch Staff (PIN)</span>
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsProfileMenuOpen(false);
                    onNavigateTab('staff');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-left transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Manage Staff & Roles</span>
                </button>
              )}

              <div className="my-1 border-t border-black/[0.04] dark:border-white/[0.06]" />

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsProfileMenuOpen(false);
                  lockScreen();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 text-left transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Screen / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
