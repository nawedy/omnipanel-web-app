import { TypographySystem, FontFamilies, FontSizes, FontWeights, LineHeights, LetterSpacing, TextStyles } from '../types';

/**
 * Typography utility functions
 */
export class TypographyUtils {
  /**
   * Create a typography system from basic configuration
   */
  static createTypographySystem(config: {
    primaryFont?: string[];
    secondaryFont?: string[];
    monoFont?: string[];
    displayFont?: string[];
    baseSize?: string;
    scaleRatio?: number;
  }): TypographySystem {
    const {
      primaryFont = ['Inter', 'sans-serif'],
      secondaryFont = ['Charter', 'serif'],
      monoFont = ['JetBrains Mono', 'monospace'],
      displayFont,
      baseSize = '1rem',
      scaleRatio = 1.25
    } = config;

    const fonts: FontFamilies = {
      sans: primaryFont,
      serif: secondaryFont,
      mono: monoFont,
      ...(displayFont && { display: displayFont })
    };

    const sizes = this.generateFontSizes(baseSize, scaleRatio);
    const weights = this.getStandardWeights();
    const lineHeights = this.getStandardLineHeights();
    const letterSpacing = this.getStandardLetterSpacing();
    const textStyles = this.generateTextStyles(sizes, weights, lineHeights);

    return {
      fonts,
      sizes,
      weights,
      lineHeights,
      letterSpacing,
      textStyles
    };
  }

  /**
   * Generate font sizes using a modular scale
   */
  static generateFontSizes(baseSize: string = '1rem', ratio: number = 1.25): FontSizes {
    const basePx = parseFloat(baseSize) * 16; // Convert rem to px
    
    return {
      xs: `${(basePx * Math.pow(ratio, -2) / 16)}rem`,
      sm: `${(basePx * Math.pow(ratio, -1) / 16)}rem`,
      base: baseSize,
      lg: `${(basePx * Math.pow(ratio, 1) / 16)}rem`,
      xl: `${(basePx * Math.pow(ratio, 2) / 16)}rem`,
      '2xl': `${(basePx * Math.pow(ratio, 3) / 16)}rem`,
      '3xl': `${(basePx * Math.pow(ratio, 4) / 16)}rem`,
      '4xl': `${(basePx * Math.pow(ratio, 5) / 16)}rem`,
      '5xl': `${(basePx * Math.pow(ratio, 6) / 16)}rem`,
      '6xl': `${(basePx * Math.pow(ratio, 7) / 16)}rem`,
      '7xl': `${(basePx * Math.pow(ratio, 8) / 16)}rem`,
      '8xl': `${(basePx * Math.pow(ratio, 9) / 16)}rem`,
      '9xl': `${(basePx * Math.pow(ratio, 10) / 16)}rem`
    };
  }

  /**
   * Get standard font weights
   */
  static getStandardWeights(): FontWeights {
    return {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    };
  }

  /**
   * Get standard line heights
   */
  static getStandardLineHeights(): LineHeights {
    return {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    };
  }

  /**
   * Get standard letter spacing
   */
  static getStandardLetterSpacing(): LetterSpacing {
    return {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    };
  }

  /**
   * Generate text styles for headings and body text
   */
  static generateTextStyles(
    sizes: FontSizes,
    weights: FontWeights,
    lineHeights: LineHeights
  ): TextStyles {
    return {
      h1: {
        fontSize: sizes['4xl'],
        fontWeight: weights.bold,
        lineHeight: lineHeights.tight,
        letterSpacing: '-0.025em'
      },
      h2: {
        fontSize: sizes['3xl'],
        fontWeight: weights.semibold,
        lineHeight: lineHeights.tight,
        letterSpacing: '-0.025em'
      },
      h3: {
        fontSize: sizes['2xl'],
        fontWeight: weights.semibold,
        lineHeight: lineHeights.snug
      },
      h4: {
        fontSize: sizes.xl,
        fontWeight: weights.semibold,
        lineHeight: lineHeights.snug
      },
      h5: {
        fontSize: sizes.lg,
        fontWeight: weights.semibold,
        lineHeight: lineHeights.normal
      },
      h6: {
        fontSize: sizes.base,
        fontWeight: weights.semibold,
        lineHeight: lineHeights.normal
      },
      body: {
        fontSize: sizes.base,
        fontWeight: weights.normal,
        lineHeight: lineHeights.normal
      },
      caption: {
        fontSize: sizes.sm,
        fontWeight: weights.normal,
        lineHeight: lineHeights.snug
      },
      label: {
        fontSize: sizes.sm,
        fontWeight: weights.medium,
        lineHeight: lineHeights.normal
      },
      code: {
        fontSize: sizes.sm,
        fontWeight: weights.normal,
        lineHeight: lineHeights.relaxed
      }
    };
  }

  /**
   * Calculate optimal line height for font size
   */
  static calculateOptimalLineHeight(fontSize: string): number {
    const sizeInPx = parseFloat(fontSize) * 16; // Assume rem
    
    // Smaller text needs more line height for readability
    if (sizeInPx <= 12) return 1.6;
    if (sizeInPx <= 16) return 1.5;
    if (sizeInPx <= 20) return 1.4;
    if (sizeInPx <= 24) return 1.3;
    return 1.2; // Large text needs less line height
  }

  /**
   * Generate font stacks with fallbacks
   */
  static generateFontStacks(): FontFamilies {
    return {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif'
      ],
      serif: [
        'Charter',
        'Bitstream Charter',
        'Sitka Text',
        'Cambria',
        'Georgia',
        'serif'
      ],
      mono: [
        'JetBrains Mono',
        'Fira Code',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ],
      display: [
        'Cal Sans',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif'
      ]
    };
  }

  /**
   * Get web-safe font combinations
   */
  static getWebSafeFonts(): Record<string, FontFamilies> {
    return {
      classic: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        serif: ['Times New Roman', 'Times', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace']
      },
      modern: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Consolas', 'Monaco', 'monospace']
      },
      apple: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'sans-serif'],
        serif: ['Iowan Old Style', 'Apple Garamond', 'Baskerville', 'serif'],
        mono: ['SF Mono', 'Monaco', 'monospace']
      }
    };
  }
}

// Export utility functions
export function createTypographySystem(config: Parameters<typeof TypographyUtils.createTypographySystem>[0]): TypographySystem {
  return TypographyUtils.createTypographySystem(config);
}

export function generateFontStacks(): FontFamilies {
  return TypographyUtils.generateFontStacks();
}

export function calculateOptimalLineHeight(fontSize: string): number {
  return TypographyUtils.calculateOptimalLineHeight(fontSize);
} 