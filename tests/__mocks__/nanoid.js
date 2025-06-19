// Mock for nanoid to handle ES modules issue in Jest
module.exports = {
  nanoid: jest.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9)),
  customAlphabet: jest.fn(() => jest.fn(() => 'test-custom-id')),
  urlAlphabet: 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW',
  random: jest.fn(() => Math.random()),
}; 