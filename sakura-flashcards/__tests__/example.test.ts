// src/__tests__/example.test.ts
describe('Example Test Suite', () => {
    it('should pass a basic test', () => {
      expect(true).toBe(true);
    });
  
    it('should correctly add numbers', () => {
      const sum = 2 + 2;
      expect(sum).toBe(4);
    });
  
    // Example with async test
    it('should handle async operations', async () => {
      const promise = Promise.resolve('test');
      const result = await promise;
      expect(result).toBe('test');
    });
  });