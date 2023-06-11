import ExpressionParser, { FunctionMap } from '..'

describe('Example', () => {
  it('basic operator', () => {
    const parser = new ExpressionParser()
    expect(parser.evaluate('(2 + 3) * 4 - 4')).toBe(16)
    expect(parser.evaluate('-4 + 5')).toBe(1)
    expect(parser.evaluate('4 <= (5 + 2)')).toBe(true)
    expect(parser.evaluate('4 > 5')).toBe(false)
    expect(parser.evaluate('5 ^ 2 + 2')).toBe(27)
    expect(parser.evaluate('5 + 4 * 4')).toBe(21)
    expect(parser.evaluate('5 % 3')).toBe(2)
    expect(parser.evaluate('5.5 * 3')).toBe(16.5)
    expect(parser.evaluate('5 == 5')).toBe(true)
  });
  it('function', () => {
    // Usage example
    const variables = { x: 5 };
    const functions: FunctionMap = {
      ADD: (_, a: number, b: number) => a + b,
      LENGTH: (_, str: string) => str.length,
      LENGTH_ALL: (_, str1: string, str2: string, str3: string) => [str1.length, str2.length, str3.length],
    };
    const parser = new ExpressionParser(variables, functions);
    expect(parser.evaluate('ADD(1 + 1, 5) + x')).toBe(12)
    expect(parser.evaluate('LENGTH("ADI") + 5', variables, functions)).toBe(8)
    expect(parser.evaluate('LENGTH_ALL("ADI", "FA", "TK")', variables, functions)).toEqual([3, 2, 2])
  });
  it('string', () => {
    const parser = new ExpressionParser();
    expect(parser.evaluate('"ADI"')).toBe("ADI")
    expect(parser.evaluate('\'ADI\'')).toBe("ADI")
  })
  it('boolean', () => {
    const parser = new ExpressionParser();
    expect(parser.evaluate('true AND false')).toBe(false)
    expect(parser.evaluate('true OR false')).toBe(true)
    expect(parser.evaluate('!true')).toBe(false)
    expect(parser.evaluate('!!true')).toBe(true)
  })
  it('array', () => {
    const parser = new ExpressionParser();
    expect(parser.evaluate("[1, 2, 3, 4]")).toEqual([1, 2, 3, 4])
    expect(parser.evaluate("[\"2\", 5]")).toEqual(["2", 5])
    expect(parser.evaluate("[2 + 5, 5]")).toEqual([7, 5])
    expect(parser.evaluate("[5, x]", { x: 2 })).toEqual([5, 2])
  })
  it('array method', () => {
    const parser = new ExpressionParser();
    const products = [
      { name: 'Product 1', price: 150, quantity: 2 },
      { name: 'Product 2', price: 80, quantity: 0 },
      { name: 'Product 3', price: 200, quantity: 5 },
      { name: 'Product 4', price: 120, quantity: 1 }
    ];
    expect(
      parser.evaluate('FILTER(products, "__ITEM__.price > 100 AND __ITEM__.quantity > 0")', {
        products
      })
    ).toEqual([
      { name: 'Product 1', price: 150, quantity: 2 },
      { name: 'Product 3', price: 200, quantity: 5 },
      { name: 'Product 4', price: 120, quantity: 1 }
    ])

    expect(
      parser.evaluate('MAP(products, "__ITEM__.name")', {
        products
      })
    ).toEqual([
      'Product 1',
      'Product 2',
      'Product 3',
      'Product 4',
    ])

    expect(
      parser.evaluate('FIND(products, "__ITEM__.price > 0")', {
        products
      })
    ).toEqual({
      "name": "Product 1",
      "price": 150,
      "quantity": 2
    })

    expect(
      parser.evaluate('SOME(products, "__ITEM__.price == 200")', {
        products
      })
    ).toBe(true)

  })
  it('object', () => {
    const parser = new ExpressionParser();
    expect(parser.evaluate("{ name: 'ADI', age: 20 }")).toEqual({
      name: "ADI",
      age: 20
    })
    expect(parser.evaluate("{ name: 'ADI', age: 5 + 2 }")).toEqual({
      name: "ADI",
      age: 7
    })
    expect(parser.evaluate("object.name", { object: { name: 'ADI' } })).toEqual('ADI')
    expect(parser.evaluate("object.name", { object: { name: 'ADI' } })).toEqual('ADI')
    expect(parser.evaluate("object.0.name", { object: [{ name: 'ADI' }] })).toEqual('ADI')
    expect(parser.evaluate("object.0.object.0.name", { object: [{ name: 'ADI', object: [{ name: "ADI" }] }] })).toEqual('ADI')
  })
});