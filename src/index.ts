export type VariableMap = { [key: string]: number | string | boolean };
export type FunctionMap = { [key: string]: (...args: (any)[]) => any };
export type OperatorMap = { [key: string]: (a: any, b: any) => any };

type OwnState = {
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
      ...variables
    };
    this.functions = {
      ...functions,
    };
    this.operators = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
      AND: (a, b) => a && b,
      OR: (a, b) => a || b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      '==': (a, b) => a === b,
      '!=': (a, b) => a !== b,
      '^': (a, b) => Math.pow(a, b),
      ...operators,
    };
  }

  private tokenize(expression: string): string[] {
    const regex = /([-+*/(),<>!=])|\b(?:\d+(\.\d+)?)|(?:"[^"]*")|(?:\w+)/g;
    return expression.match(regex) || [];
  }

  private parseNumber(ownState: OwnState): number {
    const token = ownState.currentToken;
    if (token === undefined || isNaN(Number(token))) {
      throw new Error('Invalid expression');
    }

    ownState.nextToken()
    return parseFloat(token);
  }

  private parseString(ownState: OwnState): string {
    const token = ownState.currentToken;
    if (token === undefined || !token.startsWith('"') || !token.endsWith('"')) {
      throw new Error('Invalid expression');
    }

    ownState.nextToken()
    return token.slice(1, -1);
  }

  private parseBoolean(ownState: OwnState): boolean {
    const token = ownState.currentToken;
    if (token === undefined || (token !== 'true' && token !== 'false')) {
      throw new Error('Invalid expression');
    }

    ownState.nextToken()
    return token === 'true';
  }


  private parseFactor(ownState: OwnState): number | string | boolean {
    let value: number | string | boolean = 0;
    const token = ownState.currentToken;

    if (token === undefined) {
      throw new Error('Invalid expression');
    }

    if (token === '(') {
      ownState.nextToken()
      value = this.parseExpression(ownState);

      if (ownState.currentToken !== ')') {
        throw new Error('Invalid expression');
      }

      ownState.nextToken()
    } else if (!isNaN(Number(token))) {
      value = this.parseNumber(ownState);
    } else if (token.startsWith('"') && token.endsWith('"')) {
      value = this.parseString(ownState);
    } else if (token === 'true' || token === 'false') {
      value = this.parseBoolean(ownState);
    } else if (ownState.variables.hasOwnProperty(token)) {
      value = ownState.variables[token];
      ownState.nextToken()
    } else if (ownState.functions.hasOwnProperty(token)) {
      const func = ownState.functions[token];
      ownState.nextToken()

      if (ownState.currentToken !== '(') {
        throw new Error('Invalid expression');
      }

      ownState.nextToken()

      const args: (number | string | boolean)[] = [];
      while (ownState.currentToken as any !== ')') {
        args.push(this.parseExpression(ownState));

        if (ownState.currentToken as any === ',') {
          ownState.nextToken()
        }
      }

      ownState.nextToken()

      value = func(...args);
    } else if (ownState.operators.hasOwnProperty(token)) {
      const operator = ownState.operators[token];
      ownState.nextToken()

      const factor = this.parseFactor(ownState);

      value = operator(0, factor as number | boolean);
    } else {
      throw new Error('Invalid expression');
    }

    return value;
  }

  private parseTerm(ownState: OwnState): number {
    let value = this.parseFactor(ownState) as number;

    while (true) {
      const token = ownState.currentToken;
      if (token === '*' || token === '/') {
        const operator = token;
        ownState.nextToken()
        const factor = this.parseFactor(ownState);
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

  private parseExpression(ownState: OwnState): number | string | boolean {
    let value = this.parseTerm(ownState);

    while (true) {
      const token = ownState.currentToken as string;
      if (token in ownState.operators) {
        const operator = token;
        ownState.nextToken()
        const term = this.parseTerm(ownState);
        if (operator === '+') {
          value += term as number;
        } else if (operator === '-') {
          value -= term as number;
        } else {
          value = ownState.operators[operator as any](value, term);
        }
      } else {
        break;
      }
    }

    return value as number | string | boolean;
  }

  public evaluate(
    expression: string,
    tempVariables?: VariableMap,
    tempFunctions?: FunctionMap,
    tempOperators?: OperatorMap,
  ): number | string | boolean {
    const variables = { ...this.variables, ...(tempVariables || {}) };
    const functions = { ...this.functions, ...(tempFunctions || {}) };
    const operators = { ...this.operators, ...(tempOperators || {}) };

    const ownState: OwnState = {
      tokens: this.tokenize(expression),
      currentTokenIndex: 0,
      get currentToken() {
        return this.tokens[this.currentTokenIndex]
      },
      nextToken() {
        this.currentTokenIndex++;
      },
      variables,
      functions,
      operators
    }

    const result = this.parseExpression(ownState);

    if (ownState.currentToken !== undefined) {
      throw new Error('Invalid expression');
    }

    return result;
  }
}


export default ExpressionParser