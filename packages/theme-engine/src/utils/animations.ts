import { AnimationSystem, AnimationDuration, AnimationEasing, AnimationKeyframes, TransitionSystem } from '../types';

/**
 * Animation utility functions for theme management
 */
export class AnimationUtils {
  /**
   * Create an animation system from basic configuration
   */
  static createAnimationSystem(config: {
    baseDuration?: string;
    baseEasing?: string;
    customKeyframes?: Record<string, string>;
    customEasing?: Record<string, string>;
  }): AnimationSystem {
    const {
      baseDuration = '200ms',
      baseEasing = 'ease-in-out',
      customKeyframes = {},
      customEasing = {}
    } = config;

    const duration = this.generateDurations(baseDuration);
    const easing = this.generateEasing(customEasing);
    const keyframes = this.generateKeyframes(customKeyframes);

    return {
      duration,
      easing,
      keyframes
    };
  }

  /**
   * Generate animation durations
   */
  static generateDurations(baseDuration: string = '200ms'): AnimationDuration {
    return {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: baseDuration,
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    };
  }

  /**
   * Generate animation easing functions
   */
  static generateEasing(customEasing: Record<string, string> = {}): AnimationEasing {
    return {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      ...customEasing
    };
  }

  /**
   * Generate animation keyframes
   */
  static generateKeyframes(customKeyframes: Record<string, string> = {}): AnimationKeyframes {
    return {
      fadeIn: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
      fadeOut: `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `,
      slideIn: `
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `,
      slideOut: `
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `,
      scaleIn: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `,
      scaleOut: `
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }
      `,
      rotateIn: `
        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0.8); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
      `,
      rotateOut: `
        @keyframes rotateOut {
          from { transform: rotate(0deg) scale(1); opacity: 1; }
          to { transform: rotate(180deg) scale(0.8); opacity: 0; }
        }
      `,
      custom: customKeyframes
    };
  }

  /**
   * Generate CSS animation utilities
   */
  static generateAnimationCSS(
    animations: AnimationSystem,
    prefix: string = 'op'
  ): string {
    let css = `/* Animation System */\n\n`;

    // Add keyframes
    css += `/* Keyframes */\n`;
    for (const [name, keyframe] of Object.entries(animations.keyframes)) {
      if (name !== 'custom' && typeof keyframe === 'string') {
        css += keyframe + '\n';
      }
    }

    // Add custom keyframes
    if (animations.keyframes.custom) {
      for (const [name, keyframe] of Object.entries(animations.keyframes.custom)) {
        css += keyframe + '\n';
      }
    }

    css += '\n/* Animation Utilities */\n';

    // Duration utilities
    for (const [duration, value] of Object.entries(animations.duration)) {
      css += `.${prefix}-duration-${duration} { animation-duration: ${value}; }\n`;
    }
    css += '\n';

    // Easing utilities
    for (const [easing, value] of Object.entries(animations.easing)) {
      const className = easing.replace(/[^a-zA-Z0-9]/g, '-');
      css += `.${prefix}-ease-${className} { animation-timing-function: ${value}; }\n`;
    }
    css += '\n';

    // Animation classes
    const animationNames = Object.keys(animations.keyframes).filter(name => name !== 'custom');
    for (const animation of animationNames) {
      css += `.${prefix}-animate-${animation} {\n`;
      css += `  animation-name: ${animation};\n`;
      css += `  animation-duration: ${animations.duration[200]};\n`;
      css += `  animation-timing-function: ${animations.easing['ease-in-out']};\n`;
      css += `  animation-fill-mode: both;\n`;
      css += `}\n`;
    }

    return css;
  }

  /**
   * Generate transition utilities
   */
  static generateTransitionCSS(
    transitions: TransitionSystem,
    prefix: string = 'op'
  ): string {
    let css = `/* Transition Utilities */\n`;

    // Transition property utilities
    for (const [property, value] of Object.entries(transitions.property)) {
      css += `.${prefix}-transition-${property} { transition-property: ${value}; }\n`;
    }
    css += '\n';

    // Transition duration utilities
    for (const [duration, value] of Object.entries(transitions.duration)) {
      css += `.${prefix}-transition-duration-${duration} { transition-duration: ${value}; }\n`;
    }
    css += '\n';

    // Transition timing utilities
    for (const [timing, value] of Object.entries(transitions.timing)) {
      const className = timing.replace(/[^a-zA-Z0-9]/g, '-');
      css += `.${prefix}-transition-${className} { transition-timing-function: ${value}; }\n`;
    }
    css += '\n';

    // Transition delay utilities
    for (const [delay, value] of Object.entries(transitions.delay)) {
      css += `.${prefix}-transition-delay-${delay} { transition-delay: ${value}; }\n`;
    }
    css += '\n';

    // Common transition combinations
    css += `/* Common Transitions */\n`;
    css += `.${prefix}-transition {\n`;
    css += `  transition-property: ${transitions.property.all};\n`;
    css += `  transition-duration: ${transitions.duration[150]};\n`;
    css += `  transition-timing-function: ${transitions.timing['ease-in-out']};\n`;
    css += `}\n`;

    css += `.${prefix}-transition-colors {\n`;
    css += `  transition-property: ${transitions.property.colors};\n`;
    css += `  transition-duration: ${transitions.duration[150]};\n`;
    css += `  transition-timing-function: ${transitions.timing['ease-in-out']};\n`;
    css += `}\n`;

    css += `.${prefix}-transition-opacity {\n`;
    css += `  transition-property: ${transitions.property.opacity};\n`;
    css += `  transition-duration: ${transitions.duration[150]};\n`;
    css += `  transition-timing-function: ${transitions.timing['ease-in-out']};\n`;
    css += `}\n`;

    css += `.${prefix}-transition-transform {\n`;
    css += `  transition-property: ${transitions.property.transform};\n`;
    css += `  transition-duration: ${transitions.duration[150]};\n`;
    css += `  transition-timing-function: ${transitions.timing['ease-in-out']};\n`;
    css += `}\n`;

    return css;
  }

  /**
   * Generate micro-interactions CSS
   */
  static generateMicroInteractionsCSS(prefix: string = 'op'): string {
    return `/* Micro-interactions */\n` +
      `.${prefix}-hover-lift:hover {\n` +
      `  transform: translateY(-2px);\n` +
      `  transition: transform 150ms ease-out;\n` +
      `}\n\n` +
      
      `.${prefix}-hover-scale:hover {\n` +
      `  transform: scale(1.05);\n` +
      `  transition: transform 150ms ease-out;\n` +
      `}\n\n` +
      
      `.${prefix}-hover-glow:hover {\n` +
      `  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);\n` +
      `  transition: box-shadow 150ms ease-out;\n` +
      `}\n\n` +
      
      `.${prefix}-hover-rotate:hover {\n` +
      `  transform: rotate(5deg);\n` +
      `  transition: transform 150ms ease-out;\n` +
      `}\n\n` +
      
      `.${prefix}-active-scale:active {\n` +
      `  transform: scale(0.95);\n` +
      `  transition: transform 100ms ease-out;\n` +
      `}\n\n` +
      
      `.${prefix}-focus-ring:focus {\n` +
      `  outline: 2px solid rgba(59, 130, 246, 0.5);\n` +
      `  outline-offset: 2px;\n` +
      `  transition: outline 150ms ease-out;\n` +
      `}\n`;
  }

  /**
   * Generate loading animations
   */
  static generateLoadingAnimationsCSS(prefix: string = 'op'): string {
    return `/* Loading Animations */\n` +
      `@keyframes ${prefix}-spin {\n` +
      `  from { transform: rotate(0deg); }\n` +
      `  to { transform: rotate(360deg); }\n` +
      `}\n\n` +
      
      `@keyframes ${prefix}-pulse {\n` +
      `  0%, 100% { opacity: 1; }\n` +
      `  50% { opacity: 0.5; }\n` +
      `}\n\n` +
      
      `@keyframes ${prefix}-bounce {\n` +
      `  0%, 100% { transform: translateY(0); }\n` +
      `  50% { transform: translateY(-25%); }\n` +
      `}\n\n` +
      
      `@keyframes ${prefix}-ping {\n` +
      `  75%, 100% { transform: scale(2); opacity: 0; }\n` +
      `}\n\n` +
      
      `.${prefix}-animate-spin {\n` +
      `  animation: ${prefix}-spin 1s linear infinite;\n` +
      `}\n\n` +
      
      `.${prefix}-animate-pulse {\n` +
      `  animation: ${prefix}-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n` +
      `}\n\n` +
      
      `.${prefix}-animate-bounce {\n` +
      `  animation: ${prefix}-bounce 1s infinite;\n` +
      `}\n\n` +
      
      `.${prefix}-animate-ping {\n` +
      `  animation: ${prefix}-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n` +
      `}\n`;
  }

  /**
   * Create animation with custom properties
   */
  static createAnimation(config: {
    name: string;
    keyframes: string;
    duration?: string;
    easing?: string;
    delay?: string;
    fillMode?: string;
    iterationCount?: string;
  }): string {
    const {
      name,
      keyframes,
      duration = '200ms',
      easing = 'ease-in-out',
      delay = '0s',
      fillMode = 'both',
      iterationCount = '1'
    } = config;

    return `${keyframes}\n\n` +
      `.animate-${name} {\n` +
      `  animation-name: ${name};\n` +
      `  animation-duration: ${duration};\n` +
      `  animation-timing-function: ${easing};\n` +
      `  animation-delay: ${delay};\n` +
      `  animation-fill-mode: ${fillMode};\n` +
      `  animation-iteration-count: ${iterationCount};\n` +
      `}\n`;
  }

  /**
   * Generate performance-optimized animations
   */
  static generatePerformantAnimationsCSS(prefix: string = 'op'): string {
    return `/* Performance Optimized Animations */\n` +
      `.${prefix}-will-change-transform {\n` +
      `  will-change: transform;\n` +
      `}\n\n` +
      
      `.${prefix}-will-change-opacity {\n` +
      `  will-change: opacity;\n` +
      `}\n\n` +
      
      `.${prefix}-will-change-auto {\n` +
      `  will-change: auto;\n` +
      `}\n\n` +
      
      `.${prefix}-gpu-accelerated {\n` +
      `  transform: translateZ(0);\n` +
      `  backface-visibility: hidden;\n` +
      `  perspective: 1000px;\n` +
      `}\n`;
  }
}

// Export utility functions
export function createAnimationSystem(config: Parameters<typeof AnimationUtils.createAnimationSystem>[0]): AnimationSystem {
  return AnimationUtils.createAnimationSystem(config);
}

export function generateAnimationCSS(animations: AnimationSystem, prefix?: string): string {
  return AnimationUtils.generateAnimationCSS(animations, prefix);
}

export function generateTransitionCSS(transitions: TransitionSystem, prefix?: string): string {
  return AnimationUtils.generateTransitionCSS(transitions, prefix);
}

export function createAnimation(config: Parameters<typeof AnimationUtils.createAnimation>[0]): string {
  return AnimationUtils.createAnimation(config);
}

export function generateMicroInteractionsCSS(prefix?: string): string {
  return AnimationUtils.generateMicroInteractionsCSS(prefix);
}

export function generateLoadingAnimationsCSS(prefix?: string): string {
  return AnimationUtils.generateLoadingAnimationsCSS(prefix);
} 