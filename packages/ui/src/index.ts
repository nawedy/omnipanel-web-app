// packages/ui/src/index.ts

// Base Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { TextArea } from './components/TextArea';
export type { TextAreaProps } from './components/TextArea';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

// Layout Components
export { Card, StatCard, FeatureCard } from './components/Card';
export type { CardProps } from './components/Card';

export { Modal, ConfirmModal, AlertModal } from './components/Modal';
export type { ModalProps } from './components/Modal';

// Navigation Components
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
} from './components/Sidebar';
export type { SidebarProps, SidebarProviderProps, SidebarMenuProps, SidebarMenuItemProps } from './components/Sidebar';

// Specialized Components
export { ChatInput } from './components/ChatInput';
export type { ChatInputProps } from './components/ChatInput';

export { Tree, Folder, File } from './components/FileTree';
export type { TreeProps, TreeElement } from './components/FileTree';

export { IconCloud, TechIcons } from './components/IconCloud';
export type { IconCloudProps } from './components/IconCloud';

// Re-export types for convenience
// export type * from '@omnipanel/types';