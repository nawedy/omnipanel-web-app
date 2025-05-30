import { ColorPalette, ColorSystem } from '../types';

/**
 * Color utility class for theme manipulation
 */
export class ColorUtils {
  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Convert hex to HSL
   */
  static hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const { r, g, b } = rgb;
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / diff + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to hex
   */
  static hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (sNorm === 0) {
      r = g = b = lNorm;
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      r = hue2rgb(p, q, hNorm + 1/3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1/3);
    }

    return this.rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
  }

  /**
   * Lighten a color by a percentage
   */
  static lighten(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    const newL = Math.min(100, hsl.l + (amount * 100));
    return this.hslToHex(hsl.h, hsl.s, newL);
  }

  /**
   * Darken a color by a percentage
   */
  static darken(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    const newL = Math.max(0, hsl.l - (amount * 100));
    return this.hslToHex(hsl.h, hsl.s, newL);
  }

  /**
   * Saturate a color by a percentage
   */
  static saturate(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    const newS = Math.min(100, hsl.s + (amount * 100));
    return this.hslToHex(hsl.h, newS, hsl.l);
  }

  /**
   * Desaturate a color by a percentage
   */
  static desaturate(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    const newS = Math.max(0, hsl.s - (amount * 100));
    return this.hslToHex(hsl.h, newS, hsl.l);
  }

  /**
   * Calculate luminance of a color
   */
  static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rLum, gLum, bLum] = [r, g, b].map(c => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if color contrast meets WCAG standards
   */
  static isAccessible(
    foreground: string, 
    background: string, 
    level: 'AA' | 'AAA' = 'AA'
  ): boolean {
    const contrast = this.getContrastRatio(foreground, background);
    return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
  }

  /**
   * Generate accessible text color for background
   */
  static getAccessibleTextColor(backgroundColor: string): string {
    const luminance = this.getLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * Generate color palette from base color
   */
  static generatePalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor);
    if (!hsl) {
      throw new Error('Invalid color format');
    }

    return {
      50: this.hslToHex(hsl.h, Math.max(10, hsl.s - 20), Math.min(98, hsl.l + 40)),
      100: this.hslToHex(hsl.h, Math.max(15, hsl.s - 10), Math.min(95, hsl.l + 30)),
      200: this.hslToHex(hsl.h, Math.max(20, hsl.s - 5), Math.min(90, hsl.l + 20)),
      300: this.hslToHex(hsl.h, Math.max(25, hsl.s), Math.min(80, hsl.l + 10)),
      400: this.hslToHex(hsl.h, hsl.s, Math.min(70, hsl.l + 5)),
      500: baseColor, // Base color
      600: this.hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.max(30, hsl.l - 5)),
      700: this.hslToHex(hsl.h, Math.min(100, hsl.s + 10), Math.max(25, hsl.l - 10)),
      800: this.hslToHex(hsl.h, Math.min(100, hsl.s + 15), Math.max(20, hsl.l - 15)),
      900: this.hslToHex(hsl.h, Math.min(100, hsl.s + 20), Math.max(15, hsl.l - 20)),
      950: this.hslToHex(hsl.h, Math.min(100, hsl.s + 25), Math.max(10, hsl.l - 25))
    };
  }

  /**
   * Generate complementary color
   */
  static getComplementary(color: string): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    const complementaryHue = (hsl.h + 180) % 360;
    return this.hslToHex(complementaryHue, hsl.s, hsl.l);
  }

  /**
   * Generate triadic colors
   */
  static getTriadic(color: string): [string, string] {
    const hsl = this.hexToHsl(color);
    if (!hsl) return [color, color];

    const triadic1 = (hsl.h + 120) % 360;
    const triadic2 = (hsl.h + 240) % 360;
    
    return [
      this.hslToHex(triadic1, hsl.s, hsl.l),
      this.hslToHex(triadic2, hsl.s, hsl.l)
    ];
  }

  /**
   * Generate analogous colors
   */
  static getAnalogous(color: string, count: number = 2): string[] {
    const hsl = this.hexToHsl(color);
    if (!hsl) return [color];

    const colors: string[] = [];
    const step = 30; // 30 degrees apart

    for (let i = 1; i <= count; i++) {
      const hue1 = (hsl.h + (step * i)) % 360;
      const hue2 = (hsl.h - (step * i) + 360) % 360;
      
      colors.push(this.hslToHex(hue1, hsl.s, hsl.l));
      if (colors.length < count) {
        colors.push(this.hslToHex(hue2, hsl.s, hsl.l));
      }
    }

    return colors.slice(0, count);
  }

  /**
   * Mix two colors
   */
  static mix(color1: string, color2: string, ratio: number = 0.5): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Generate color variations
   */
  static getVariations(color: string): {
    lighter: string[];
    darker: string[];
    saturated: string[];
    desaturated: string[];
  } {
    return {
      lighter: [
        this.lighten(color, 0.1),
        this.lighten(color, 0.2),
        this.lighten(color, 0.3)
      ],
      darker: [
        this.darken(color, 0.1),
        this.darken(color, 0.2),
        this.darken(color, 0.3)
      ],
      saturated: [
        this.saturate(color, 0.1),
        this.saturate(color, 0.2),
        this.saturate(color, 0.3)
      ],
      desaturated: [
        this.desaturate(color, 0.1),
        this.desaturate(color, 0.2),
        this.desaturate(color, 0.3)
      ]
    };
  }
}

// Export utility functions
export function generateColorPalette(baseColor: string): ColorPalette {
  return ColorUtils.generatePalette(baseColor);
}

export function createColorSystem(
  primary: string,
  secondary?: string,
  accent?: string,
  neutral?: string
): Partial<ColorSystem> {
  return {
    primary: ColorUtils.generatePalette(primary),
    secondary: secondary ? ColorUtils.generatePalette(secondary) : undefined,
    accent: accent ? ColorUtils.generatePalette(accent) : undefined,
    neutral: neutral ? ColorUtils.generatePalette(neutral) : undefined
  };
}

export function adjustColor(
  color: string,
  adjustments: {
    lighten?: number;
    darken?: number;
    saturate?: number;
    desaturate?: number;
  }
): string {
  let result = color;
  
  if (adjustments.lighten) {
    result = ColorUtils.lighten(result, adjustments.lighten);
  }
  if (adjustments.darken) {
    result = ColorUtils.darken(result, adjustments.darken);
  }
  if (adjustments.saturate) {
    result = ColorUtils.saturate(result, adjustments.saturate);
  }
  if (adjustments.desaturate) {
    result = ColorUtils.desaturate(result, adjustments.desaturate);
  }
  
  return result;
}

export function getContrastRatio(color1: string, color2: string): number {
  return ColorUtils.getContrastRatio(color1, color2);
}

export function ensureAccessibility(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): { color: string; accessible: boolean } {
  const accessible = ColorUtils.isAccessible(foreground, background, level);
  
  if (accessible) {
    return { color: foreground, accessible: true };
  }

  // Try to find accessible color
  const accessibleColor = ColorUtils.getAccessibleTextColor(background);
  
  return {
    color: accessibleColor,
    accessible: ColorUtils.isAccessible(accessibleColor, background, level)
  };
} 