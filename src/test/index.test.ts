import ExpressionParser, { FunctionMap } from '..'

describe('Example', () => {
  it('basic operator', () => {
    const parser = new ExpressionParser()
    expect(parser.evaluate('(2 + 3) * 4 - 4')).toBe(16)
    expect(parser.evaluate('-4 + 5')).toBe(1)
    expect(parser.evaluate('4 < 5')).toBe(true)
    expect(parser.evaluate('4 > 5')).toBe(false)
    expect(parser.evaluate('5 + 4 * 5')).toBe(25)
  });
  it('basic infix operator exp', () => {
    const parser = new ExpressionParser()
  });
  it('function', () => {
    // Usage example
    const variables = { x: 5 };
    const functions: FunctionMap = {
      ADD: (a: number, b: number) => a + b,
    };
    const parser = new ExpressionParser(variables, functions);
    const result = parser.evaluate('ADD(2, 5) + x');
    expect(result).toBe(12)
  });
  it('string', () => {
    const variables = { x: 5 };
    const functions: FunctionMap = {
      ADD: (a: number, b: number) => a + b,
      LENGTH: (str: string) => str.length,
    };
    const parser = new ExpressionParser();
    const result = parser.evaluate('LENGTH("ADI") + 5', variables, functions);
    expect(result).toBe(8)
  })
  it('boolean', () => {
    const parser = new ExpressionParser();
    const result = parser.evaluate('true AND false');
    expect(result).toBe(false)
  })
});