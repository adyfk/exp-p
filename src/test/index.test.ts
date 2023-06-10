import ExpressionParser, { FunctionMap } from '..'

describe('Example', () => {
  it('basic operator', () => {
    const parser = new ExpressionParser()
    expect(parser.evaluate('(2 + 3) * 4 - 4')).toBe(16)
    expect(parser.evaluate('-4 + 5')).toBe(1)
    expect(parser.evaluate('4 < (5 + 2)')).toBe(true)
    expect(parser.evaluate('4 > 5')).toBe(false)
    expect(parser.evaluate('5 ^ 2 + 2')).toBe(27)
    expect(parser.evaluate('5 + 4 * 4')).toBe(21)
    expect(parser.evaluate('5 % 3')).toBe(2)
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
    const result = parser.evaluate('ADD(1 + 1, 5) + x');
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
    expect(parser.evaluate('true AND false')).toBe(false)
    expect(parser.evaluate('true OR false')).toBe(true)
  })
  it('array', () => {
    const parser = new ExpressionParser();
    expect(parser.evaluate("[1, 2, 3, 4]")).toEqual([1, 2, 3, 4])
    expect(parser.evaluate("[\"2\", 5]")).toEqual(["2", 5])
    expect(parser.evaluate("[2 + 5, 5]")).toEqual([7, 5])
    expect(parser.evaluate("[5, x]", { x: 2 })).toEqual([5, 2])
  })
  // it('object', () => {
  //   const parser = new ExpressionParser();
  //   expect(parser.evaluate("{ \"name\": \"ADI\", \"age\": 20 }")).toEqual({
  //     name: "ADI",
  //     age: 20
  //   })
  //   expect(parser.evaluate("{ \"name\": \"ADI\", \"age\": 5 + 2 }")).toEqual({
  //     name: "ADI",
  //     age: 7
  //   })
  // })
});