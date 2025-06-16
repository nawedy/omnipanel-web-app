// Core Theme Types
export interface Theme {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: ThemeCategory;
  type: ThemeType;
  
  // Theme metadata
  metadata: ThemeMetadata;
  
  // Color system
  colors: ColorSystem;
  
  // Typography system
  typography: TypographySystem;
  
  // Spacing system
  spacing: SpacingSystem;
  
  // Component styles
  components: ComponentStyles;
  
  // Layout system
  layout: LayoutSystem;
  
  // Effects and animations
  effects: EffectsSystem;
  
  // Animation system
  animations?: {
    transitions?: Record<string, string>;
    keyframes?: Record<string, string>;
  };
  
  // Custom properties
  custom?: Record<string, any>;
}

// Theme Categories
export type ThemeCategory = 
  | 'official'
  | 'dark'
  | 'light'
  | 'neon'
  | 'minimal'
  | 'glassmorphism'
  | 'high-contrast'
  | 'seasonal'
  | 'custom';

// Theme Types
export type ThemeType = 'static' | 'dynamic' | 'adaptive' | 'time-based';

// Theme Metadata
export interface ThemeMetadata {
  created: string;
  updated: string;
  tags: string[];
  preview: string;
  screenshots: string[];
  compatibility: {
    minVersion?: string;
    maxVersion?: string;
    requiredFeatures?: string[];
  };
  license: string;
  homepage?: string;
  repository?: string;
  rating?: number;
  downloads?: number;
  
  // Optional marketplace-specific properties
  stats?: {
    downloads: number;
    activeInstalls: number;
    rating: number;
    reviewCount: number;
    views: number;
    likes: number;
    forks: number;
    lastDownload: string;
  };
  categories?: string[];
}

// Color System
export interface ColorSystem {
  // Base colors
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  
  // Semantic colors
  semantic: SemanticColors;
  
  // Surface colors
  surface: SurfaceColors;
  
  // State colors
  state: StateColors;
  
  // Syntax highlighting
  syntax: SyntaxColors;
  
  // Custom color palettes
  custom?: Record<string, ColorPalette>;
}

// Color Palette
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Semantic Colors
export interface SemanticColors {
  success: ColorVariant;
  warning: ColorVariant;
  error: ColorVariant;
  info: ColorVariant;
  text: TextColors;
  border: BorderColors;
}

// Surface Colors
export interface SurfaceColors {
  background: string;
  foreground: string;
  card: string;
  popover: string;
  modal: string;
  sidebar: string;
  header: string;
  footer: string;
}

// State Colors
export interface StateColors {
  hover: string;
  active: string;
  focus: string;
  disabled: string;
  selected: string;
  pressed: string;
}

// Syntax Colors
export interface SyntaxColors {
  keyword: string;
  string: string;
  number: string;
  comment: string;
  operator: string;
  function: string;
  variable: string;
  type: string;
  constant: string;
  tag: string;
  attribute: string;
  punctuation: string;
}

// Color Variant
export interface ColorVariant {
  light: string;
  default: string;
  dark: string;
  contrast: string;
}

// Text Colors
export interface TextColors {
  primary: string;
  secondary: string;
  muted: string;
  disabled: string;
  inverse: string;
}

// Border Colors
export interface BorderColors {
  default: string;
  muted: string;
  subtle: string;
  strong: string;
}

// Typography System
export interface TypographySystem {
  // Font families
  fonts: FontFamilies;
  
  // Font sizes
  sizes: FontSizes;
  
  // Font weights
  weights: FontWeights;
  
  // Line heights
  lineHeights: LineHeights;
  
  // Letter spacing
  letterSpacing: LetterSpacing;
  
  // Text styles
  textStyles: TextStyles;
}

// Font Families
export interface FontFamilies {
  sans: string[];
  serif: string[];
  mono: string[];
  display?: string[];
  custom?: Record<string, string[]>;
  fontFamily?: string[];
}

// Font Sizes
export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

// Font Weights
export interface FontWeights {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

// Line Heights
export interface LineHeights {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

// Letter Spacing
export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

// Text Styles
export interface TextStyles {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  label: TextStyle;
  code: TextStyle;
  custom?: Record<string, TextStyle>;
}

// Text Style
export interface TextStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: string;
}

// Spacing System
export interface SpacingSystem {
  // Base spacing scale
  scale: SpacingScale;
  
  // Component spacing
  component: ComponentSpacing;
  
  // Layout spacing
  layout: LayoutSpacing;
  
  // Base property for utility access
  base?: string;
}

// Spacing Scale
export interface SpacingScale {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

// Component Spacing
export interface ComponentSpacing {
  button: ComponentSpacingValues;
  input: ComponentSpacingValues;
  card: ComponentSpacingValues;
  modal: ComponentSpacingValues;
  dropdown: ComponentSpacingValues;
}

// Component Spacing Values
export interface ComponentSpacingValues {
  padding: {
    x: string;
    y: string;
  };
  margin: {
    x: string;
    y: string;
  };
  gap: string;
}

// Layout Spacing
export interface LayoutSpacing {
  container: string;
  section: string;
  grid: string;
  sidebar: string;
  header: string;
  footer: string;
}

// Component Styles
export interface ComponentStyles {
  button: ButtonStyles;
  input: InputStyles;
  card: CardStyles;
  modal: ModalStyles;
  sidebar: SidebarStyles;
  header: HeaderStyles;
  footer: FooterStyles;
  dropdown: DropdownStyles;
  tooltip: TooltipStyles;
  badge: BadgeStyles;
  avatar: AvatarStyles;
  progress: ProgressStyles;
  slider: SliderStyles;
  switch: SwitchStyles;
  checkbox: CheckboxStyles;
  radio: RadioStyles;
  select: SelectStyles;
  textarea: TextareaStyles;
  table: TableStyles;
  tabs: TabsStyles;
  accordion: AccordionStyles;
  custom?: Record<string, any>;
}

// Button Styles
export interface ButtonStyles {
  base: ComponentStyleBase;
  variants: {
    primary: ComponentStyleVariant;
    secondary: ComponentStyleVariant;
    outline: ComponentStyleVariant;
    ghost: ComponentStyleVariant;
    link: ComponentStyleVariant;
    destructive: ComponentStyleVariant;
  };
  sizes: {
    sm: ComponentStyleSize;
    md: ComponentStyleSize;
    lg: ComponentStyleSize;
    xl: ComponentStyleSize;
  };
}

// Input Styles
export interface InputStyles {
  base: ComponentStyleBase;
  variants: {
    default: ComponentStyleVariant;
    filled: ComponentStyleVariant;
    outline: ComponentStyleVariant;
    underline: ComponentStyleVariant;
  };
  sizes: {
    sm: ComponentStyleSize;
    md: ComponentStyleSize;
    lg: ComponentStyleSize;
  };
  states: ComponentStates;
}

// Card Styles
export interface CardStyles {
  base: ComponentStyleBase;
  variants: {
    default: ComponentStyleVariant;
    outlined: ComponentStyleVariant;
    elevated: ComponentStyleVariant;
    filled: ComponentStyleVariant;
  };
}

// Modal Styles
export interface ModalStyles {
  overlay: ComponentStyleBase;
  content: ComponentStyleBase;
  header: ComponentStyleBase;
  body: ComponentStyleBase;
  footer: ComponentStyleBase;
}

// Component Style Base - Updated with all CSS properties
export interface ComponentStyleBase {
  backgroundColor?: string;
  color?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number;
  transition?: string;
  boxShadow?: string;
  outline?: string;
  opacity?: number;
  transform?: string;
  cursor?: string;
  textDecoration?: string;
  backdropFilter?: string;
  height?: string;
  minHeight?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  display?: string;
  position?: string;
  zIndex?: number;
  custom?: Record<string, any>;
}

// Component Style Variant
export interface ComponentStyleVariant extends ComponentStyleBase {
  hover?: Partial<ComponentStyleBase>;
  active?: Partial<ComponentStyleBase>;
  focus?: Partial<ComponentStyleBase>;
  disabled?: Partial<ComponentStyleBase>;
}

// Component Style Size
export interface ComponentStyleSize {
  padding?: string;
  fontSize?: string;
  height?: string;
  minHeight?: string;
  iconSize?: string;
}

// Component States
export interface ComponentStates {
  default: ComponentStyleBase;
  hover: ComponentStyleBase;
  active: ComponentStyleBase;
  focus: ComponentStyleBase;
  disabled: ComponentStyleBase;
  error: ComponentStyleBase;
  success: ComponentStyleBase;
}

// Layout System
export interface LayoutSystem {
  breakpoints: Breakpoints;
  containers: Containers;
  grid: GridSystem;
  flexbox: FlexboxSystem;
}

// Breakpoints
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Containers
export interface Containers {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// Grid System
export interface GridSystem {
  columns: number;
  gap: string;
  columnGap: string;
  rowGap: string;
}

// Flexbox System
export interface FlexboxSystem {
  gap: string;
  columnGap: string;
  rowGap: string;
}

// Effects System
export interface EffectsSystem {
  shadows: ShadowSystem;
  borders: BorderSystem;
  animations: AnimationSystem;
  transitions: TransitionSystem;
  filters: FilterSystem;
}

// Shadow System
export interface ShadowSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// Border System
export interface BorderSystem {
  radius: BorderRadius;
  width: BorderWidth;
  style: BorderStyle;
}

// Border Radius
export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Border Width
export interface BorderWidth {
  0: string;
  2: string;
  4: string;
  8: string;
  default: string;
}

// Border Style
export interface BorderStyle {
  solid: string;
  dashed: string;
  dotted: string;
  double: string;
  none: string;
}

// Animation System
export interface AnimationSystem {
  duration: AnimationDuration;
  easing: AnimationEasing;
  keyframes: AnimationKeyframes;
}

// Animation Duration
export interface AnimationDuration {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

// Animation Easing
export interface AnimationEasing {
  linear: string;
  ease: string;
  'ease-in': string;
  'ease-out': string;
  'ease-in-out': string;
  bounce: string;
  elastic: string;
}

// Animation Keyframes
export interface AnimationKeyframes {
  fadeIn: string;
  fadeOut: string;
  slideIn: string;
  slideOut: string;
  scaleIn: string;
  scaleOut: string;
  rotateIn: string;
  rotateOut: string;
  custom?: Record<string, string>;
}

// Transition System
export interface TransitionSystem {
  property: TransitionProperty;
  duration: TransitionDuration;
  timing: TransitionTiming;
  delay: TransitionDelay;
}

// Transition Property
export interface TransitionProperty {
  none: string;
  all: string;
  colors: string;
  opacity: string;
  shadow: string;
  transform: string;
}

// Transition Duration
export interface TransitionDuration {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

// Transition Timing
export interface TransitionTiming {
  linear: string;
  ease: string;
  'ease-in': string;
  'ease-out': string;
  'ease-in-out': string;
}

// Transition Delay
export interface TransitionDelay {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

// Filter System
export interface FilterSystem {
  blur: FilterBlur;
  brightness: FilterBrightness;
  contrast: FilterContrast;
  grayscale: FilterGrayscale;
  opacity: FilterOpacity;
  saturate: FilterSaturate;
  sepia: FilterSepia;
}

// Filter Blur
export interface FilterBlur {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

// Filter Brightness
export interface FilterBrightness {
  0: string;
  50: string;
  75: string;
  90: string;
  95: string;
  100: string;
  105: string;
  110: string;
  125: string;
  150: string;
  200: string;
}

// Filter Contrast
export interface FilterContrast {
  0: string;
  50: string;
  75: string;
  100: string;
  125: string;
  150: string;
  200: string;
}

// Filter Grayscale
export interface FilterGrayscale {
  0: string;
  100: string;
}

// Filter Opacity
export interface FilterOpacity {
  0: string;
  5: string;
  10: string;
  20: string;
  25: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  75: string;
  80: string;
  90: string;
  95: string;
  100: string;
}

// Filter Saturate
export interface FilterSaturate {
  0: string;
  50: string;
  100: string;
  150: string;
  200: string;
}

// Filter Sepia
export interface FilterSepia {
  0: string;
  100: string;
}

// Additional interface stubs for complex component styles
export interface SidebarStyles extends ComponentStyleBase {}
export interface HeaderStyles extends ComponentStyleBase {}
export interface FooterStyles extends ComponentStyleBase {}
export interface DropdownStyles extends ComponentStyleBase {}
export interface TooltipStyles extends ComponentStyleBase {}
export interface BadgeStyles extends ComponentStyleBase {}
export interface AvatarStyles extends ComponentStyleBase {}
export interface ProgressStyles extends ComponentStyleBase {}
export interface SliderStyles extends ComponentStyleBase {}
export interface SwitchStyles extends ComponentStyleBase {}
export interface CheckboxStyles extends ComponentStyleBase {}
export interface RadioStyles extends ComponentStyleBase {}
export interface SelectStyles extends ComponentStyleBase {}
export interface TextareaStyles extends ComponentStyleBase {}
export interface TableStyles extends ComponentStyleBase {}
export interface TabsStyles extends ComponentStyleBase {}
export interface AccordionStyles extends ComponentStyleBase {}

// Theme Engine Interface (for types only, implementation is in engine.ts)
export interface IThemeEngine {
  themes: Map<string, Theme>;
  currentTheme: Theme | null;
  
  // Theme management
  addTheme(theme: Theme): void;
  removeTheme(themeId: string): void;
  getTheme(themeId: string): Theme | undefined;
  listThemes(): Theme[];
  
  // Theme switching
  setTheme(themeId: string): Promise<void>;
  getCurrentTheme(): Theme | null;
  
  // Theme compilation
  compileTheme(theme: Theme): CompiledTheme;
  applyTheme(compiledTheme: CompiledTheme): void;
  
  // Event handling
  onThemeChange(callback: (theme: Theme) => void): () => void;
}

// Compiled Theme
export interface CompiledTheme {
  id: string;
  css: string;
  variables: Record<string, string>;
  components: Record<string, any>;
  metadata: ThemeMetadata;
}

// Theme Validation
export interface ThemeValidationResult {
  valid: boolean;
  errors: ThemeValidationError[];
  warnings: ThemeValidationWarning[];
}

// Theme Validation Error
export interface ThemeValidationError {
  path: string;
  message: string;
  type: 'missing' | 'invalid' | 'type' | 'format';
}

// Theme Validation Warning
export interface ThemeValidationWarning {
  path: string;
  message: string;
  type: 'deprecated' | 'unused' | 'performance' | 'accessibility';
}

// Theme Builder Interface (for types only, implementation is in builder.ts)
export interface IThemeBuilder {
  create(config: Partial<Theme>): IThemeBuilder;
  setColors(colors: Partial<ColorSystem>): IThemeBuilder;
  setTypography(typography: Partial<TypographySystem>): IThemeBuilder;
  setSpacing(spacing: Partial<SpacingSystem>): IThemeBuilder;
  setComponents(components: Partial<ComponentStyles>): IThemeBuilder;
  setLayout(layout: Partial<LayoutSystem>): IThemeBuilder;
  setEffects(effects: Partial<EffectsSystem>): IThemeBuilder;
  validate(): ThemeValidationResult;
  build(): Theme;
}

// Theme Export/Import
export interface ThemeExportOptions {
  format: 'json' | 'css' | 'scss' | 'less' | 'stylus';
  minify?: boolean;
  includeMeta?: boolean;
  customProperties?: boolean;
}

export interface ThemeImportOptions {
  validate?: boolean;
  merge?: boolean;
  override?: boolean;
}

// Dynamic Theme Types
export interface DynamicTheme extends Theme {
  conditions: ThemeCondition[];
  fallback: string;
}

export interface ThemeCondition {
  type: 'time' | 'system' | 'user' | 'context';
  condition: any;
  themeId: string;
}

// Adaptive Theme Types
export interface AdaptiveTheme extends Theme {
  adaptations: ThemeAdaptation[];
  baseTheme: string;
}

export interface ThemeAdaptation {
  property: string;
  source: 'system' | 'user' | 'context' | 'api';
  mapping: Record<string, any>;
} 