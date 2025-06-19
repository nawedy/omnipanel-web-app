// apps/web/src/lib/toast.ts
// Simple toast implementation to replace sonner

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

class ToastManager {
  private container: HTMLElement | null = null;

  private createContainer() {
    if (this.container) return this.container;
    
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
    return this.container;
  }

  private showToast(message: string, type: 'success' | 'error' | 'info', options: ToastOptions = {}) {
    const container = this.createContainer();
    const toast = document.createElement('div');
    
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    toast.style.cssText = `
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    toast.textContent = message;
    container.appendChild(toast);

    // Add animation styles
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, options.duration || 3000);
  }

  success(message: string, options?: ToastOptions) {
    this.showToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    this.showToast(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    this.showToast(message, 'info', options);
  }
}

const toastManager = new ToastManager();

export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => toastManager.error(message, options),
  info: (message: string, options?: ToastOptions) => toastManager.info(message, options),
}; 