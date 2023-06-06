# Expression Parser Library

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A high-performance expression parser library designed to handle complex mathematical and logical expressions efficiently.

## Features

- Parse and evaluate mathematical expressions
- Support for variables and functions
- Handle complex nested expressions
- Comprehensive error handling and validation

## Performance

Our expression parser is built with a strong focus on performance to handle demanding use cases. Some key performance features include:

- **Optimized Parsing**: The parser is designed to quickly and accurately parse expressions, minimizing processing time.
- **Efficient Evaluation**: The evaluation engine is optimized for rapid execution of parsed expressions, ensuring high-performance calculations.
- **Built-in Caching**: The library intelligently caches intermediate results to avoid unnecessary recalculations, further enhancing performance.
- **Minimal Overhead**: The lightweight design of the library ensures minimal overhead during parsing and evaluation.

## Installation

You can install the library via npm:

```shell
npm install exp-p
```

## Usage
```javascript

const { ExpressionParser } = require('expression-parser');

const parser = new ExpressionParser();
const expression = '2 * (3 + x)';
const result = parser.evaluate(expression, { x: 5 });

console.log(result); // Output: 16

```

For detailed usage instructions, please refer to the Documentation.

## Contributing
Contributions are welcome! If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License
Feel free to modify this template to suit your specific needs and add any additional sections or information you deem necessary. Remember to include a license file and documentation in your repository to provide additional details about your library.
