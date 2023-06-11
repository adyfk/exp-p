type ValueType = number | string | boolean | any[] | object;
export type VariableMap = { [key: string]: ValueType };
export type FunctionMap = { [key: string]: (...args: any[]) => any };
export type OperatorMap = { [key: string]: (a: any, b: any) => any };

interface ParserState {
  tokens: string[];
  currentTokenIndex: number;
  currentToken: string;
  nextToken: () => void;
  variables: VariableMap;
  functions: FunctionMap;
  operators: OperatorMap;
}

class ExpressionParser {
  private variables: VariableMap;
  private functions: FunctionMap;
  private operators: OperatorMap;

  constructor(variables?: VariableMap, functions?: FunctionMap, operators?: OperatorMap) {
    this.variables = {
      PI: Math.PI,
      ...(variables || {})
    };
    this.functions = {
      ...(functions || {})
    };
    this.operators = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
      '%': (a, b) => a % b,
      AND: (a, b) => a && b,
      OR: (a, b) => a || b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      '==': (a, b) => a === b,
      '!=': (a, b) => a !== b,
      '^': (a, b) => Math.pow(a, b),
      ...(operators || {})
    };
  }

  private tokenize(expression: string): string[] {
    const regex = /([-+*/():,<>!=%^\[\]\{\}])|\b(?:\d+(\.\d+)?)|(?:"[^"]*")|(?:'[^']*')|(?:\w+(?:\.\w+)*(?:\[\d+\])?)/g;
    return expression.match(regex) || [];
  }

  private parseNumber(state: ParserState): number {
    const token = state.currentToken;
    if (token === undefined || isNaN(Number(token))) {
      throw new Error('Invalid expression');
    }

    state.nextToken();
    return parseFloat(token);
  }

  private parseString(state: ParserState, tickType: string): string {
    const token = state.currentToken;
    if (token === undefined || !token.startsWith(tickType) || !token.endsWith(tickType)) {
      throw new Error('Invalid expression');
    }

    state.nextToken();
    return token.slice(1, -1);
  }

  private parseBoolean(state: ParserState): boolean {
    const token = state.currentToken;
    if (token === undefined || (token !== 'true' && token !== 'false')) {
      throw new Error('Invalid expression');
    }

    state.nextToken();
    return token === 'true';
  }

  private parseArray(state: ParserState): any[] {
    state.nextToken();
    const array: any[] = [];

    while (state.currentToken !== ']') {
      array.push(this.parseExpression(state));

      if (state.currentToken === ',') {
        state.nextToken();
      }
    }

    if (state.currentToken !== ']') {
      throw new Error('Invalid expression');
    }

    state.nextToken();
    return array;
  }

  private parseUnaryFactor(state: ParserState): any {
    const token = state.currentToken;

    if (token === '!') {
      state.nextToken();
      const factor = this.parseUnaryFactor(state);
      return !factor;
    }

    return this.parseFactor(state);
  }

  private parseObject(state: ParserState): object {
    const obj: { [key: string]: any } = {};
    while (true) {
      const key = state.currentToken;
      if (typeof key !== 'string') {
        throw new Error('Invalid object literal');
      }
      state.nextToken();
      if (state.currentToken !== ':') {
        throw new Error('Invalid object literal');
      }

      state.nextToken();

      const value = this.parseExpression(state);
      obj[key] = value;

      if (state.currentToken as any === '}') {
        break;
      }

      if (state.currentToken as any !== ',') {
        throw new Error('Invalid object literal');
      }

      state.nextToken();
    }

    if (state.currentToken as any !== '}') {
      throw new Error('Invalid object literal');
    }

    state.nextToken();

    return obj;
  }

  private parseFunction(state: ParserState): any {
    const token = state.currentToken;
    const func = state.functions[token];
    state.nextToken();

    if (state.currentToken !== '(') {
      throw new Error('Invalid expression');
    }

    state.nextToken();

    const args: any[] = [];
    while (state.currentToken as any !== ')') {
      args.push(this.parseExpression(state));

      if (state.currentToken as any === ',') {
        state.nextToken();
      }
    }

    if (state.currentToken as any !== ')') {
      throw new Error('Invalid expression');
    }

    state.nextToken();

    return func(...args);
  }

  private parseFactor(state: ParserState): ValueType {
    let value: ValueType = 0;
    const token = state.currentToken;

    if (token === undefined) {
      throw new Error('Invalid expression');
    }
    if (token === '(') {
      state.nextToken();
      value = this.parseExpression(state);

      if (state.currentToken !== ')') {
        throw new Error('Invalid expression');
      }

      state.nextToken();
    } else if (!isNaN(Number(token))) {
      value = this.parseNumber(state);
    } else if (token.startsWith('"') && token.endsWith('"')) {
      value = this.parseString(state, '"');
    } else if (token.startsWith('\'') && token.endsWith('\'')) {
      value = this.parseString(state, '\'');
    } else if (token === 'true' || token === 'false') {
      value = this.parseBoolean(state);
    } else if (token === '[') {
      value = this.parseArray(state);
    } else if (token === '{') {
      state.nextToken()
      value = this.parseObject(state);
    } else if (token.includes('.')) {
      const objectPath = token.split('.');
      let objectValue = state.variables as any

      for (const path of objectPath) {
        if (typeof objectValue !== 'object' || objectValue === null || !objectValue.hasOwnProperty(path)) {
          throw new Error('Invalid object path');
        } else {
          objectValue = objectValue[path];
        }
      }

      value = objectValue;
      state.nextToken();
    } else if (state.variables.hasOwnProperty(token)) {
      value = state.variables[token];
      state.nextToken();
    } else if (state.functions.hasOwnProperty(token)) {
      value = this.parseFunction(state);
    } else if (state.operators.hasOwnProperty(token)) {
      const operator = state.operators[token];
      state.nextToken();

      const factor = this.parseFactor(state);

      value = operator(0, factor);
    } else {
      throw new Error('Invalid expression');
    }

    return value;
  }

  private parseTerm(state: ParserState): number {
    let value = this.parseUnaryFactor(state) as any;
    while (true) {
      const token = state.currentToken;
      if (token === '*' || token === '/') {
        const operator = token;
        state.nextToken();
        const factor = this.parseUnaryFactor(state);
        if (operator === '*') {
          value *= factor as number;
        } else {
          value /= factor as number;
        }
      } else {
        break;
      }
    }

    return value;
  }

  private parseExpression(state: ParserState): any {
    let value = this.parseTerm(state);

    while (true) {
      const token = state.currentToken;
      if (token in state.operators) {
        const operator = token;
        state.nextToken();
        const term = this.parseTerm(state);
        value = state.operators[operator](value, term);
      } else {
        break;
      }
    }

    return value;
  }

  public evaluate(
    expression: string,
    tempVariables?: VariableMap,
    tempFunctions?: FunctionMap,
    tempOperators?: OperatorMap,
  ): any {
    const variables = { ...this.variables, ...(tempVariables || {}) };
    const functions = { ...this.functions, ...(tempFunctions || {}) };
    const operators = { ...this.operators, ...(tempOperators || {}) };

    const state: ParserState = {
      tokens: this.tokenize(expression),
      currentTokenIndex: 0,
      get currentToken() {
        return this.tokens[this.currentTokenIndex];
      },
      nextToken() {
        this.currentTokenIndex++;
      },
      variables,
      functions,
      operators
    };

    const result = this.parseExpression(state);

    if (state.currentToken !== undefined) {
      throw new Error('Invalid expression');
    }

    return result;
  }
}

export default ExpressionParser;