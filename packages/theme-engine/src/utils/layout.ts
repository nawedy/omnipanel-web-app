import { LayoutSystem, Breakpoints, Containers, GridSystem, FlexboxSystem } from '../types';

/**
 * Layout utility functions for responsive design
 */
export class LayoutUtils {
  /**
   * Create a layout system from basic configuration
   */
  static createLayoutSystem(config: {
    baseContainer?: string;
    maxContainer?: string;
    gridColumns?: number;
    gridGap?: string;
    customBreakpoints?: Partial<Breakpoints>;
  }): LayoutSystem {
    const {
      baseContainer = '1200px',
      maxContainer = '1600px',
      gridColumns = 12,
      gridGap = '1rem',
      customBreakpoints = {}
    } = config;

    const breakpoints = {
      xs: '0px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      ...customBreakpoints
    };

    const containers = this.generateContainers(baseContainer, maxContainer);
    const grid = this.generateGridSystem(gridColumns, gridGap);
    const flexbox = this.generateFlexboxSystem(gridGap);

    return {
      breakpoints,
      containers,
      grid,
      flexbox
    };
  }

  /**
   * Generate container sizes
   */
  static generateContainers(baseContainer: string, maxContainer: string): Containers {
    return {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: baseContainer,
      '2xl': maxContainer,
      full: '100%'
    };
  }

  /**
   * Generate grid system configuration
   */
  static generateGridSystem(columns: number, gap: string): GridSystem {
    return {
      columns,
      gap,
      columnGap: gap,
      rowGap: gap
    };
  }

  /**
   * Generate flexbox system configuration
   */
  static generateFlexboxSystem(gap: string): FlexboxSystem {
    return {
      gap,
      columnGap: gap,
      rowGap: gap
    };
  }

  /**
   * Generate responsive CSS for breakpoints
   */
  static generateResponsiveCSS(
    selector: string,
    styles: Record<string, any>,
    breakpoints: Breakpoints
  ): string {
    let css = '';
    
    for (const [breakpoint, styles_bp] of Object.entries(styles)) {
      if (breakpoints[breakpoint as keyof Breakpoints]) {
        const minWidth = breakpoints[breakpoint as keyof Breakpoints];
        
        if (breakpoint === 'xs' || minWidth === '0px') {
          // Base styles (no media query)
          css += `${selector} {\n`;
          for (const [prop, value] of Object.entries(styles_bp)) {
            css += `  ${this.camelToKebab(prop)}: ${value};\n`;
          }
          css += `}\n\n`;
        } else {
          // Media query styles
          css += `@media (min-width: ${minWidth}) {\n`;
          css += `  ${selector} {\n`;
          for (const [prop, value] of Object.entries(styles_bp)) {
            css += `    ${this.camelToKebab(prop)}: ${value};\n`;
          }
          css += `  }\n`;
          css += `}\n\n`;
        }
      }
    }
    
    return css;
  }

  /**
   * Generate container CSS
   */
  static generateContainerCSS(
    containers: Containers,
    breakpoints: Breakpoints,
    prefix: string = 'op'
  ): string {
    let css = `/* Container Styles */\n`;
    
    css += `.${prefix}-container {\n`;
    css += `  width: 100%;\n`;
    css += `  margin-left: auto;\n`;
    css += `  margin-right: auto;\n`;
    css += `  padding-left: 1rem;\n`;
    css += `  padding-right: 1rem;\n`;
    css += `}\n\n`;

    // Generate responsive container widths
    for (const [size, width] of Object.entries(containers)) {
      if (size !== 'full' && breakpoints[size as keyof Breakpoints]) {
        const minWidth = breakpoints[size as keyof Breakpoints];
        
        if (minWidth !== '0px') {
          css += `@media (min-width: ${minWidth}) {\n`;
          css += `  .${prefix}-container {\n`;
          css += `    max-width: ${width};\n`;
          css += `  }\n`;
          css += `}\n\n`;
        }
      }
    }

    // Container size variants
    for (const [size, width] of Object.entries(containers)) {
      css += `.${prefix}-container-${size} {\n`;
      css += `  max-width: ${width};\n`;
      css += `  margin-left: auto;\n`;
      css += `  margin-right: auto;\n`;
      css += `}\n`;
    }
    
    return css;
  }

  /**
   * Generate grid CSS utilities
   */
  static generateGridCSS(
    grid: GridSystem,
    prefix: string = 'op'
  ): string {
    let css = `/* Grid System */\n`;
    
    // Grid container
    css += `.${prefix}-grid {\n`;
    css += `  display: grid;\n`;
    css += `  grid-template-columns: repeat(${grid.columns}, 1fr);\n`;
    css += `  gap: ${grid.gap};\n`;
    css += `}\n\n`;

    // Grid gap utilities
    const gaps = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];
    for (const gap of gaps) {
      css += `.${prefix}-gap-${gap} { gap: ${this.convertToRem(gap)}; }\n`;
      css += `.${prefix}-gap-x-${gap} { column-gap: ${this.convertToRem(gap)}; }\n`;
      css += `.${prefix}-gap-y-${gap} { row-gap: ${this.convertToRem(gap)}; }\n`;
    }
    css += '\n';

    // Grid column utilities
    for (let i = 1; i <= grid.columns; i++) {
      css += `.${prefix}-col-${i} { grid-column: span ${i} / span ${i}; }\n`;
    }
    css += '\n';

    // Grid column start/end utilities
    for (let i = 1; i <= grid.columns + 1; i++) {
      css += `.${prefix}-col-start-${i} { grid-column-start: ${i}; }\n`;
      css += `.${prefix}-col-end-${i} { grid-column-end: ${i}; }\n`;
    }
    css += '\n';

    // Grid row utilities
    for (let i = 1; i <= 6; i++) {
      css += `.${prefix}-row-${i} { grid-row: span ${i} / span ${i}; }\n`;
    }
    
    return css;
  }

  /**
   * Generate flexbox CSS utilities
   */
  static generateFlexboxCSS(
    flexbox: FlexboxSystem,
    prefix: string = 'op'
  ): string {
    let css = `/* Flexbox Utilities */\n`;
    
    // Flex container
    css += `.${prefix}-flex { display: flex; }\n`;
    css += `.${prefix}-inline-flex { display: inline-flex; }\n\n`;

    // Flex direction
    css += `.${prefix}-flex-row { flex-direction: row; }\n`;
    css += `.${prefix}-flex-row-reverse { flex-direction: row-reverse; }\n`;
    css += `.${prefix}-flex-col { flex-direction: column; }\n`;
    css += `.${prefix}-flex-col-reverse { flex-direction: column-reverse; }\n\n`;

    // Flex wrap
    css += `.${prefix}-flex-wrap { flex-wrap: wrap; }\n`;
    css += `.${prefix}-flex-wrap-reverse { flex-wrap: wrap-reverse; }\n`;
    css += `.${prefix}-flex-nowrap { flex-wrap: nowrap; }\n\n`;

    // Justify content
    css += `.${prefix}-justify-start { justify-content: flex-start; }\n`;
    css += `.${prefix}-justify-end { justify-content: flex-end; }\n`;
    css += `.${prefix}-justify-center { justify-content: center; }\n`;
    css += `.${prefix}-justify-between { justify-content: space-between; }\n`;
    css += `.${prefix}-justify-around { justify-content: space-around; }\n`;
    css += `.${prefix}-justify-evenly { justify-content: space-evenly; }\n\n`;

    // Align items
    css += `.${prefix}-items-start { align-items: flex-start; }\n`;
    css += `.${prefix}-items-end { align-items: flex-end; }\n`;
    css += `.${prefix}-items-center { align-items: center; }\n`;
    css += `.${prefix}-items-baseline { align-items: baseline; }\n`;
    css += `.${prefix}-items-stretch { align-items: stretch; }\n\n`;

    // Align content
    css += `.${prefix}-content-start { align-content: flex-start; }\n`;
    css += `.${prefix}-content-end { align-content: flex-end; }\n`;
    css += `.${prefix}-content-center { align-content: center; }\n`;
    css += `.${prefix}-content-between { align-content: space-between; }\n`;
    css += `.${prefix}-content-around { align-content: space-around; }\n`;
    css += `.${prefix}-content-evenly { align-content: space-evenly; }\n\n`;

    // Flex grow/shrink
    css += `.${prefix}-flex-1 { flex: 1 1 0%; }\n`;
    css += `.${prefix}-flex-auto { flex: 1 1 auto; }\n`;
    css += `.${prefix}-flex-initial { flex: 0 1 auto; }\n`;
    css += `.${prefix}-flex-none { flex: none; }\n\n`;

    css += `.${prefix}-grow { flex-grow: 1; }\n`;
    css += `.${prefix}-grow-0 { flex-grow: 0; }\n`;
    css += `.${prefix}-shrink { flex-shrink: 1; }\n`;
    css += `.${prefix}-shrink-0 { flex-shrink: 0; }\n`;
    
    return css;
  }

  /**
   * Generate complete layout CSS
   */
  static generateLayoutCSS(
    layout: LayoutSystem,
    prefix: string = 'op'
  ): string {
    let css = `/* OmniPanel Layout System */\n\n`;
    
    css += this.generateContainerCSS(layout.containers, layout.breakpoints, prefix);
    css += '\n';
    css += this.generateGridCSS(layout.grid, prefix);
    css += '\n';
    css += this.generateFlexboxCSS(layout.flexbox, prefix);
    
    return css;
  }

  /**
   * Convert spacing value to rem
   */
  private static convertToRem(value: string): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue === 0 ? '0' : `${numValue * 0.25}rem`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Check if screen size matches breakpoint
   */
  static matchesBreakpoint(
    screenWidth: number,
    breakpoint: string,
    breakpoints: Breakpoints
  ): boolean {
    const minWidth = parseInt(breakpoints[breakpoint as keyof Breakpoints]);
    return screenWidth >= minWidth;
  }

  /**
   * Get current breakpoint based on screen width
   */
  static getCurrentBreakpoint(
    screenWidth: number,
    breakpoints: Breakpoints
  ): string {
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([, a], [, b]) => parseInt(b) - parseInt(a));
    
    for (const [name, minWidth] of sortedBreakpoints) {
      if (screenWidth >= parseInt(minWidth)) {
        return name;
      }
    }
    
    return 'xs';
  }
}

// Export utility functions
export function createLayoutSystem(config: Parameters<typeof LayoutUtils.createLayoutSystem>[0]): LayoutSystem {
  return LayoutUtils.createLayoutSystem(config);
}

export function generateLayoutCSS(layout: LayoutSystem, prefix?: string): string {
  return LayoutUtils.generateLayoutCSS(layout, prefix);
}

export function generateResponsiveCSS(
  selector: string,
  styles: Record<string, any>,
  breakpoints: Breakpoints
): string {
  return LayoutUtils.generateResponsiveCSS(selector, styles, breakpoints);
}

export function getCurrentBreakpoint(screenWidth: number, breakpoints: Breakpoints): string {
  return LayoutUtils.getCurrentBreakpoint(screenWidth, breakpoints);
}

export function matchesBreakpoint(
  screenWidth: number,
  breakpoint: string,
  breakpoints: Breakpoints
): boolean {
  return LayoutUtils.matchesBreakpoint(screenWidth, breakpoint, breakpoints);
} 