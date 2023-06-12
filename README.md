# Expression Parser for JavaScript/TypeScript

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The Expression Parser library, also known as "@adifkz/exp-p," is a powerful tool for parsing and evaluating mathematical and logical expressions. It provides a flexible and extensible solution for integrating expression parsing capabilities into your projects. This documentation will guide you through the usage, customization options, and API of the library. You can find the library on npm under the package name "@adifkz/exp-p" and the source code on GitHub at https://github.com/adyfk/exp-p.

## Features

- Evaluate mathematical expressions with operators like `+`, `-`, `*`, `/`, `%`, `^`, etc.
- Evaluate logical expressions with operators like `AND`, `OR`, `NOT`, etc.
- Support for parentheses to control the order of operations.
- Define and use variables in your expressions.
- Define custom functions to extend the functionality of the parser.
- Evaluate string literals.
- Evaluate array literals and perform operations on arrays.
- Evaluate object literals and access properties dynamically.

## Installation

You can install ExpressionParser using npm:

```bash
npm install @adifkz/exp-p
```

## Usage
To use ExpressionParser in your JavaScript code, you need to import the ExpressionParser class and create an instance of it:

```typescript
import { createParser } from '@adifkz/exp-p';

const parser = createParser();
```

## Evaluating Expressions
Once you have created an instance of ExpressionParser, you can use the evaluate method to evaluate expressions. The evaluate method takes two parameters: the expression to evaluate and an optional context object that contains variables and functions used in the expression.

```typescript
const parser = createParser();

const result = parser.evaluate('2 + 3 * 4'); // 14
```

## Variable Mapping
You can define variables and use them in your expressions by providing a context object to the evaluate method.

```typescript
const parser = createParser();

// Define variables
const variables = {
  x: 5,
  y: 10,
};

// Evaluate expression with variables
const result = parser.evaluate("x + y", variables);
console.log(result); // Output: 15
```

## Function Extension
The Expression Parser allows you to extend its functionality by adding custom functions. Here's an example of defining a custom function:

```typescript
const parser = createParser();

// Define custom function
const functions = {
  square: (_, value: number) => value * value,
};

parser.setFunctions(functions)
// Evaluate expression with custom function
const result = parser.evaluate("square(5)");
console.log(result); // Output: 25
```

## Examples

```typescript
it('basic operator', () => {
  const parser = createParser()
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
  const products = [
    { name: 'Product 1', price: 150, quantity: 2 },
    { name: 'Product 2', price: 80, quantity: 0 },
    { name: 'Product 3', price: 200, quantity: 5 },
    { name: 'Product 4', price: 120, quantity: 1 }
  ];
  expect(
    parser.evaluate('filter(products, "_item_.price > 100 and _item_.quantity > 0")', {
      products
    })
  ).toEqual([
    { name: 'Product 1', price: 150, quantity: 2 },
    { name: 'Product 3', price: 200, quantity: 5 },
    { name: 'Product 4', price: 120, quantity: 1 }
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
  ).toBe(550)
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
})
```