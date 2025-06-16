'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, User, Settings, Palette, Bell, Accessibility, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';

interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [_open, _setOpen] = useState(defaultOpen);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue: SidebarContextValue = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          ...style
        } as React.CSSProperties}
        className={clsx(
          'group/sidebar-wrapper flex min-h-screen w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  glassmorphism?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  glassmorphism = false,
  className,
  children,
  ...props
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        className={clsx(
          'flex h-full w-[--sidebar-width] flex-col',
          glassmorphism ? 'bg-black/20 backdrop-blur-md border-r border-white/10' : 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'text-gray-900 dark:text-white',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <AnimatePresence>
        {openMobile && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
            />
            
            <motion.div
              className={clsx(
                'fixed inset-y-0 z-50 flex h-full w-[--sidebar-width] flex-col',
                glassmorphism ? 'bg-black/20 backdrop-blur-md border-r border-white/10' : 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
                'text-gray-900 dark:text-white',
                side === 'left' ? 'left-0' : 'right-0'
              )}
              style={{
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE
              } as React.CSSProperties}
              initial={{ x: side === 'left' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: side === 'left' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div
      className="group peer hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
    >
      <div
        className={clsx(
          'relative bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
            : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
          state === 'expanded' ? 'w-[--sidebar-width]' : 'w-0'
        )}
      />
      
      <motion.div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out',
          state === 'expanded' ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        initial={{ x: -256 }}
        animate={{ x: state === 'expanded' ? 0 : -256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div
          className={clsx(
            'flex h-full w-full flex-col',
            glassmorphism ? 'bg-black/20 backdrop-blur-md border border-white/10' : 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
            'text-gray-900 dark:text-white',
            variant === 'floating' && 'rounded-lg shadow-lg',
            variant === 'inset' && 'rounded-lg border'
          )}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const SidebarTrigger: React.FC<React.ComponentProps<typeof Button>> = ({
  className,
  onClick,
  ...props
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={clsx('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('flex flex-col gap-2 p-4 border-b border-gray-200 dark:border-gray-800', className)}
      {...props}
    />
  );
};

const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('flex-1 overflow-auto p-2', className)}
      {...props}
    />
  );
};

const SidebarFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('p-4 border-t border-gray-200 dark:border-gray-800', className)}
      {...props}
    />
  );
};

export interface SidebarMenuProps {
  className?: string;
  children: React.ReactNode;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ className, children }) => {
  return (
    <div className={clsx('flex flex-col bg-gray-900 rounded-md', className)}>
      {children}
    </div>
  );
};

export interface SidebarMenuItemProps {
  icon: LucideIcon; // Updated to LucideIcon
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  className
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative flex items-center gap-3 px-3 py-2.5 text-left',
        'text-white bg-transparent border-none cursor-pointer',
        'hover:bg-gray-800 focus:bg-gray-700 transition-all duration-200',
        'rounded-md outline-none',
        isActive && 'bg-gray-700',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute left-0 top-1 w-1 bg-blue-500 rounded-full"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isActive ? '80%' : 0,
          opacity: isActive ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
      
      <div className="flex-shrink-0 w-4 h-4">
        <Icon /> {/* Render LucideIcon directly */}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const DefaultSidebarMenu: React.FC = () => {
  const [activeItem, setActiveItem] = useState('profile');

  const menuItems = [
    { id: 'profile', icon: User, label: 'Public profile' },
    { id: 'account', icon: Settings, label: 'Account' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'accessibility', icon: Accessibility, label: 'Accessibility' },
    { id: 'notifications', icon: Bell, label: 'Notifications' }
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeItem === item.id}
          onClick={() => setActiveItem(item.id)}
        />
      ))}
    </SidebarMenu>
  );
};

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  DefaultSidebarMenu,
  useSidebar
};