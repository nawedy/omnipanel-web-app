import { SpacingSystem, SpacingScale, ComponentSpacing, LayoutSpacing } from '../types';

/**
 * Spacing utility functions
 */
export class SpacingUtils {
  /**
   * Create spacing system with base unit and scale
   */
  static createSpacingSystem(
    baseUnit: number = 16,
    scaleRatio: number = 1.25
  ): SpacingSystem {
    const scale = this.generateSpacingScale(baseUnit);
    const component = this.generateComponentSpacing(scale);
    const layout = this.generateLayoutSpacing(scale);

    return {
      scale,
      component,
      layout
    };
  }

  /**
   * Generate spacing scale using base unit and ratio
   */
  static generateSpacingScale(
    baseUnit: number = 16,
    multipliers: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
  ): SpacingScale {
    const scale = {
      px: '1px',
      0: '0px'
    } as any;
    
    // Generate the main scale
    for (let i = 1; i <= 96; i++) {
      (scale as any)[i] = `${(baseUnit * i) / 16}rem`;
    }
    
    // Add fractional values
    const fractionalValues = [0.5, 1.5, 2.5, 3.5];
    for (const size of fractionalValues) {
      (scale as any)[size] = `${(baseUnit * size) / 16}rem`;
    }
    
    return scale as SpacingScale;
  }

  /**
   * Generate component-specific spacing
   */
  static generateComponentSpacing(scale: SpacingScale): ComponentSpacing {
    return {
      button: {
        padding: { x: scale[4], y: scale[2] },
        margin: { x: scale[0], y: scale[0] },
        gap: scale[2]
      },
      input: {
        padding: { x: scale[3], y: scale[2] },
        margin: { x: scale[0], y: scale[0] },
        gap: scale[2]
      },
      card: {
        padding: { x: scale[6], y: scale[6] },
        margin: { x: scale[0], y: scale[4] },
        gap: scale[4]
      },
      modal: {
        padding: { x: scale[8], y: scale[8] },
        margin: { x: scale[4], y: scale[4] },
        gap: scale[6]
      },
      dropdown: {
        padding: { x: scale[3], y: scale[2] },
        margin: { x: scale[0], y: scale[1] },
        gap: scale[2]
      }
    };
  }

  /**
   * Generate layout-specific spacing
   */
  static generateLayoutSpacing(scale: SpacingScale): LayoutSpacing {
    return {
      container: scale[80], // 80rem max container width
      section: scale[24],   // 6rem section spacing
      grid: scale[8],       // 2rem grid gap
      sidebar: scale[64],   // 16rem sidebar width
      header: scale[16],    // 4rem header height
      footer: scale[12]     // 3rem footer height
    };
  }

  /**
   * Calculate rhythm spacing based on line height
   */
  static calculateRhythm(
    baseLineHeight: number = 1.5,
    baseFontSize: number = 16
  ): Record<string, string> {
    const rhythmUnit = baseLineHeight * baseFontSize;
    
    return {
      'rhythm-xs': `${rhythmUnit * 0.25}px`,
      'rhythm-sm': `${rhythmUnit * 0.5}px`,
      'rhythm-base': `${rhythmUnit}px`,
      'rhythm-lg': `${rhythmUnit * 1.5}px`,
      'rhythm-xl': `${rhythmUnit * 2}px`,
      'rhythm-2xl': `${rhythmUnit * 3}px`
    };
  }

  /**
   * Generate responsive spacing variants
   */
  static generateResponsiveSpacing(scale: SpacingScale): Record<string, Record<string, string>> {
    return {
      mobile: {
        container: scale[4],
        section: scale[12],
        grid: scale[4],
        sidebar: scale[48],
        header: scale[14],
        footer: scale[8]
      },
      tablet: {
        container: scale[6],
        section: scale[16],
        grid: scale[6],
        sidebar: scale[56],
        header: scale[16],
        footer: scale[10]
      },
      desktop: {
        container: scale[8],
        section: scale[24],
        grid: scale[8],
        sidebar: scale[64],
        header: scale[16],
        footer: scale[12]
      }
    };
  }

  /**
   * Get common spacing patterns
   */
  static getSpacingPatterns(): Record<string, Record<string, string>> {
    return {
      tight: {
        xs: '0.125rem',
        sm: '0.25rem',
        base: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      normal: {
        xs: '0.25rem',
        sm: '0.5rem',
        base: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      loose: {
        xs: '0.5rem',
        sm: '1rem',
        base: '2rem',
        lg: '3rem',
        xl: '4rem'
      }
    };
  }

  /**
   * Convert spacing value to different units
   */
  static convertSpacing(
    value: string,
    targetUnit: 'px' | 'rem' | 'em',
    baseFontSize: number = 16
  ): string {
    const numValue = parseFloat(value);
    const unit = value.replace(numValue.toString(), '');

    let pxValue: number;
    
    switch (unit) {
      case 'px':
        pxValue = numValue;
        break;
      case 'rem':
        pxValue = numValue * baseFontSize;
        break;
      case 'em':
        pxValue = numValue * baseFontSize;
        break;
      default:
        return value; // Unknown unit, return as-is
    }

    switch (targetUnit) {
      case 'px':
        return `${pxValue}px`;
      case 'rem':
        return `${pxValue / baseFontSize}rem`;
      case 'em':
        return `${pxValue / baseFontSize}em`;
      default:
        return value;
    }
  }

  /**
   * Generate spacing utilities for CSS
   */
  static generateSpacingUtilities(scale: SpacingScale): Record<string, string> {
    const utilities: Record<string, string> = {};

    // Margin utilities
    for (const [key, value] of Object.entries(scale)) {
      utilities[`m-${key}`] = `margin: ${value}`;
      utilities[`mx-${key}`] = `margin-left: ${value}; margin-right: ${value}`;
      utilities[`my-${key}`] = `margin-top: ${value}; margin-bottom: ${value}`;
      utilities[`mt-${key}`] = `margin-top: ${value}`;
      utilities[`mr-${key}`] = `margin-right: ${value}`;
      utilities[`mb-${key}`] = `margin-bottom: ${value}`;
      utilities[`ml-${key}`] = `margin-left: ${value}`;
    }

    // Padding utilities
    for (const [key, value] of Object.entries(scale)) {
      utilities[`p-${key}`] = `padding: ${value}`;
      utilities[`px-${key}`] = `padding-left: ${value}; padding-right: ${value}`;
      utilities[`py-${key}`] = `padding-top: ${value}; padding-bottom: ${value}`;
      utilities[`pt-${key}`] = `padding-top: ${value}`;
      utilities[`pr-${key}`] = `padding-right: ${value}`;
      utilities[`pb-${key}`] = `padding-bottom: ${value}`;
      utilities[`pl-${key}`] = `padding-left: ${value}`;
    }

    // Gap utilities
    for (const [key, value] of Object.entries(scale)) {
      utilities[`gap-${key}`] = `gap: ${value}`;
      utilities[`gap-x-${key}`] = `column-gap: ${value}`;
      utilities[`gap-y-${key}`] = `row-gap: ${value}`;
    }

    return utilities;
  }
}

// Export utility functions
export function createSpacingSystem(config: Parameters<typeof SpacingUtils.createSpacingSystem>[0]): SpacingSystem {
  return SpacingUtils.createSpacingSystem(config);
}

export function generateSpacingScale(baseUnit?: number): SpacingScale {
  return SpacingUtils.generateSpacingScale(baseUnit);
}

export function calculateRhythm(baseLineHeight?: number, baseFontSize?: number): Record<string, string> {
  return SpacingUtils.calculateRhythm(baseLineHeight, baseFontSize);
} 