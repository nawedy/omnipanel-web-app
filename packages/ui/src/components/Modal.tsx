//# packages/ui/src/components/Modal.tsx

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success' | 'warning';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  glassmorphism?: boolean;
  neonBorder?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  glassmorphism = false,
  neonBorder = false,
  footer,
  className
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const overlayClasses = clsx(
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'bg-black/50 backdrop-blur-sm'
  );

  const modalClasses = clsx(
    'relative w-full rounded-lg shadow-xl',
    'transform transition-all duration-200',
    
    // Glassmorphism
    glassmorphism && [
      'backdrop-blur-md border border-white/20',
      'bg-white/90 dark:bg-gray-900/90'
    ],
    
    // Default background
    !glassmorphism && 'bg-white dark:bg-gray-800',
    
    // Size variants
    {
      'max-w-sm': size === 'sm',
      'max-w-md': size === 'md',
      'max-w-2xl': size === 'lg',
      'max-w-4xl': size === 'xl',
      'max-w-full max-h-full m-0 rounded-none': size === 'full'
    },
    
    // Variant styles
    !glassmorphism && {
      'border border-gray-200 dark:border-gray-700': variant === 'default',
      'border border-red-200 dark:border-red-800': variant === 'danger',
      'border border-green-200 dark:border-green-800': variant === 'success',
      'border border-yellow-200 dark:border-yellow-800': variant === 'warning'
    },
    
    // Neon border effect
    neonBorder && [
      'shadow-lg',
      variant === 'danger' && 'shadow-red-500/30 border-red-500/50',
      variant === 'success' && 'shadow-green-500/30 border-green-500/50',
      variant === 'warning' && 'shadow-yellow-500/30 border-yellow-500/50',
      variant === 'default' && 'shadow-blue-500/30 border-blue-500/50'
    ],
    
    className
  );

  const headerClasses = clsx(
    'flex items-center justify-between p-6 border-b',
    glassmorphism ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
  );

  const titleClasses = clsx(
    'text-lg font-semibold',
    {
      'text-gray-900 dark:text-white': variant === 'default',
      'text-red-900 dark:text-red-100': variant === 'danger',
      'text-green-900 dark:text-green-100': variant === 'success',
      'text-yellow-900 dark:text-yellow-100': variant === 'warning'
    }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={overlayClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            className={modalClasses}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={headerClasses}>
                <div>
                  {title && (
                    <h3 className={titleClasses}>
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className={clsx(
              'p-6',
              size === 'full' && 'flex-1 overflow-auto'
            )}>
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className={clsx(
                'px-6 py-4 border-t',
                glassmorphism ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
              )}>
                {footer}
              </div>
            )}
            
            {/* Glassmorphism shine effect */}
            {glassmorphism && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pre-built modal variants
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
  loading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      neonBorder
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            neonEffect
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </Modal>
  );
};

export const AlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'danger' | 'success' | 'warning' | 'default';
}> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'default'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      neonBorder
      footer={
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onClose}
            neonEffect
          >
            OK
          </Button>
        </div>
      }
    >
      <p className="text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </Modal>
  );
};

export { Modal };