import {
  generateSlug,
  sanitizeFileName,
  formatFileSize,
  capitalize,
  truncate,
  safeJsonParse
} from '../helpers';

describe('Helpers Utilities', () => {
  describe('generateSlug', () => {
    it('should convert text to slug format', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test with Special Characters!')).toBe('test-with-special-characters');
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove invalid characters from filename', () => {
      expect(sanitizeFileName('file<>name.txt')).toBe('filename.txt');
      expect(sanitizeFileName('file|name?.txt')).toBe('filename.txt');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFileName('valid-file_name.txt')).toBe('valid-file_name.txt');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2097152)).toBe('2 MB');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a long string', 10)).toBe('This is...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should use custom suffix', () => {
      expect(truncate('This is a long string', 10, '---')).toBe('This is---');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"key": "value"}')).toEqual({ key: 'value' });
      expect(safeJsonParse('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    it('should return fallback for invalid JSON', () => {
      expect(safeJsonParse('invalid json')).toBeNull();
      expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true });
    });
  });
}); 