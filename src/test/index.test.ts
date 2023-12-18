import { createParser, FunctionMap } from '../'

describe('example', () => {

  it('basic operator', () => {
    const parser = createParser({
    })
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
      add: (_, a: number, b: number) => a + b,
      length: (_, str: string) => str.length,
      length_all: (_, str1: string, str2: string, str3: string) => [str1.length, str2.length, str3.length],
    };
    const parser = createParser({ variables });
    parser.setFunctions(functions)
    expect(parser.evaluate('add(1 + 1, 5) + x')).toBe(12)
    expect(parser.evaluate('length("ADI") + 5', variables)).toBe(8)
    expect(parser.evaluate('length_all("ADI", "FA", "TK")', variables)).toEqual([3, 2, 2])
  });
  it('string', () => {
    const parser = createParser();
    expect(parser.evaluate('"ADI"')).toBe("ADI")
    expect(parser.evaluate('\'ADI\'')).toBe("ADI")
    expect(parser.evaluate('regex("ddd212sdf","\\d\\w\\d")')).toBe(true)
    expect(parser.evaluate('regex("ddd212sdf","\\d\\w\\d","y")')).toBe(false)
  })
  it('boolean', () => {
    const parser = createParser();
    expect(parser.evaluate('true and false')).toBe(false)
    expect(parser.evaluate('true or false')).toBe(true)
    expect(parser.evaluate('!true')).toBe(false)
    expect(parser.evaluate('!!true')).toBe(true)
  })
  it('array', () => {
    const parser = createParser();
    expect(parser.evaluate("[1, 2, 3, 4]")).toEqual([1, 2, 3, 4])
    expect(parser.evaluate("[\"2\", 5]")).toEqual(["2", 5])
    expect(parser.evaluate("[2 + 5, 5]")).toEqual([7, 5])
    expect(parser.evaluate("[5, x]", { x: 2 })).toEqual([5, 2])
  })
  it('array method', () => {
    const parser = createParser();

    expect(
      parser.evaluate('unique(products)', {
        products: [1, 1, 4, 5, 6, 6, 7, 7, 8, 8]
      })
    ).toEqual([1, 4, 5, 6, 7, 8])

    const products = [
      { name: 'Product 1', price: 150, quantity: 2 },
      { name: 'Product 2', price: 80, quantity: 0 },
      { name: 'Product 3', price: 200, quantity: 5 },
      { name: 'Product 4', price: 120, quantity: 1 },
      { name: 'Product 4', price: 120, quantity: 1 }
    ];
    expect(
      parser.evaluate('unique(products, "_item_.name")', {
        products
      })
    ).toEqual([
      { name: 'Product 1', price: 150, quantity: 2 },
      { name: 'Product 2', price: 80, quantity: 0 },
      { name: 'Product 3', price: 200, quantity: 5 },
      { name: 'Product 4', price: 120, quantity: 1 },
    ])

    expect(
      parser.evaluate('filter(products, "_item_.price > 100 and _item_.quantity > 0")', {
        products
      })
    ).toEqual([
      { name: 'Product 1', price: 150, quantity: 2 },
      { name: 'Product 3', price: 200, quantity: 5 },
      { name: 'Product 4', price: 120, quantity: 1 },
      { name: 'Product 4', price: 120, quantity: 1 },
    ])

    expect(
      parser.evaluate('map(products, "_item_.name")', {
        products
      })
    ).toEqual([
      'Product 1',
      'Product 2',
      'Product 3',
      'Product 4',
      'Product 4',
    ])

    expect(
      parser.evaluate('find(products, "_item_.price > 0")', {
        products
      })
    ).toEqual({
      "name": "Product 1",
      "price": 150,
      "quantity": 2
    })

    expect(
      parser.evaluate('some(products, "_item_.price == 200")', {
        products
      })
    ).toBe(true)

    expect(
      parser.evaluate('reduce(products, "_curr_ + _item_.price", 0)', {
        products
      })
    ).toBe(670)
  })
  it('object', () => {
    const parser = createParser();
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
    expect(parser.evaluate("{ name: 'ADI', age: 20, ...z, student: false }", { z: { address: 'jl indonesia' } })).toEqual(
      {
        "address": "jl indonesia",
        "age": 20,
        "name": "ADI",
        "student": false,
      }
    )
  })
  it('date', () => {
    const parser = createParser();

    // expect(parser.evaluate(`date()`)).toBe(moment().toISOString())
    // expect(parser.evaluate(`date("2020-01-01")`)).toBe('2019-12-31T17:00:00.000Z')
    expect(parser.evaluate(`date_day(date("2020-01-01"))`)).toBe(1)
    expect(parser.evaluate(`date_month(date("2020-01-01"))`)).toBe(1)
    expect(parser.evaluate(`date_year(date("2020-01-01"))`)).toBe(2020)
    expect(parser.evaluate(`date_format("DD-MM-YYYY", "2020-01-01")`)).toBe("01-01-2020")
    // expect(parser.evaluate(`date_in_format("YYYY-MM-DD", "2020-01-01")`)).toBe('2019-12-31T17:00:00.000Z')
    // expect(parser.evaluate(`date_in_millis(${moment("2020/01/01", 'YYYY/MM/DD').valueOf()})`)).toBe('2019-12-31T17:00:00.000Z')
    // expect(parser.evaluate(`date_millis("2020-01-01")`)).toBe(1577811600000)
    expect(parser.evaluate(`date_format("DD-MM-YYYY", date_plus(1, "day", "2020-01-05"))`)).toBe("06-01-2020")
    expect(parser.evaluate(`date_format("DD-MM-YYYY", date_plus(-1, "day", "2020-01-05"))`)).toBe("04-01-2020")
    expect(parser.evaluate(`date_format("DD-MM-YYYY", date_minus(1, "day", "2020-01-05"))`)).toBe("04-01-2020")
    expect(parser.evaluate(`date_format("DD-MM-YYYY", date_minus(-1, "day", "2020-01-05"))`)).toBe("06-01-2020")
  })
});