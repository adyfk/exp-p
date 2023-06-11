# Expression Parser for JavaScript/TypeScript

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

@adifkz/exp-p is a lightweight expression parser library for JavaScript and TypeScript that allows you to evaluate mathematical and logical expressions dynamically. It supports various operators, functions, and data types, making it versatile for different use cases.

## Features

- Parse and evaluate mathematical expressions
- Support for variables and functions
- Handle complex nested expressions
- Comprehensive error handling and validation

## Performance

Our expression parser is built with a strong focus on performance to handle demanding use cases. Some key performance features include:

- **Optimized Parsing**: The parser is designed to quickly and accurately parse expressions, minimizing processing time.
- **Efficient Evaluation**: The evaluation engine is optimized for rapid execution of parsed expressions, ensuring high-performance calculations.
- **Minimal Overhead**: The lightweight design of the library ensures minimal overhead during parsing and evaluation.

## Installation

You can install the library via npm:

```shell
npm install @adifkz/exp-p
```

To use the expression parser, follow these steps:

1. Import the ExpressionParser class from the library:
```typescript
const ExpressionParser = require('@adifkz/exp-p');
```

2. Create an instance of the ExpressionParser:
```typescript
const parser = new ExpressionParser();
```

3. Evaluate an expression using the evaluate method:
```typescript
const expression = '2 * (3 + 5)';
const result = parser.evaluate(expression);

console.log(result); // Output: 16
```


## Examples
```typescript
import ExpressionParser, { FunctionMap } from '@adifkz/exp-p';

// Basic operators
const parser = new ExpressionParser();
console.log(parser.evaluate('(2 + 3) * 4 - 4')); // Output: 16
console.log(parser.evaluate('-4 + 5')); // Output: 1
console.log(parser.evaluate('4 < (5 + 2)')); // Output: true
console.log(parser.evaluate('4 > 5')); // Output: false
console.log(parser.evaluate('5 ^ 2 + 2')); // Output: 27
console.log(parser.evaluate('5 + 4 * 4')); // Output: 21
console.log(parser.evaluate('5 % 3')); // Output: 2

// Functions and variables
const variables = { x: 5 };
const functions: FunctionMap = {
  ADD: (a: number, b: number) => a + b,
  LENGTH: (str: string) => str.length,
};
const parser2 = new ExpressionParser(variables, functions);
console.log(parser2.evaluate('ADD(1 + 1, 5) + x')); // Output: 12
console.log(parser2.evaluate('LENGTH("ADI") + 5')); // Output: 8

// String, boolean, array, and object literals
const parser3 = new ExpressionParser();
console.log(parser3.evaluate('"ADI"')); // Output: "ADI"
console.log(parser3.evaluate('true AND false')); // Output: false
console.log(parser3.evaluate("[1, 2, 3, 4]")); // Output: [1, 2, 3, 4]
console.log(parser3.evaluate("{ name: 'ADI', age: 20 }")); // Output: { name: 'ADI', age: 20 }
```

Please note that these examples provide a glimpse into the capabilities of the expression parser. You can customize and extend it based on your specific requirements.

## API Reference

### ExpressionParser

The ExpressionParser class is the main class provided by @adifkz/exp-p for evaluating expressions. It can be instantiated as follows:

```typescript
const parser = new ExpressionParser(variables, functions, operators);
```

The variables `parameter` is an optional object that defines the variables available in the expressions. Each key-value pair represents a variable name and its corresponding value.

The functions `parameter` is also an optional object that defines the functions available in the expressions. Each key-value pair represents a function name and its corresponding function implementation.

The functions `operator` is also an optional object that defines the operatos available in the expressions.

`parser.evaluate(expression: string, variables?: Record<string, any>, functions: Record<string, any>, operators: Record<string, any>)`: any

This method evaluates the given expression and returns the result.

* expression: The expression to evaluate.

### FunctionMap

The FunctionMap type is an object that defines the functions available in the expressions. Each key-value pair represents a function name and its corresponding function implementation.
```typescript
type FunctionMap = { [name: string]: Function };
```

## License
This library is licensed under the MIT License.

## Author
@adifkz/exp-p is developed and maintained by Adi Fatkhurozi. For any inquiries or feedback, please contact Adi Fatkhurozi at ady.fatkhurozi@gmail.com.

## Repository
The source code for this library can be found on [GitHub](https://github.com/adyfk/exp-p.git).


Feel free to copy this Markdown content and save it as `README.md` in your GitHub repository.
