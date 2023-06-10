export type VariableMap = { [key: string]: number | string | boolean };
export type FunctionMap = { [key: string]: (...args: (any)[]) => any };
export type OperatorMap = { [key: string]: (a: any, b: any) => any };

class ExpressionParser {
  private tokens: string[];
  private currentTokenIndex: number;
  private variables: VariableMap;
  private functions: FunctionMap;
  private operators: OperatorMap;

  constructor(variables?: VariableMap, functions?: FunctionMap, operators?: OperatorMap) {
    this.tokens = [];
    this.currentTokenIndex = 0;
    this.variables = variables || {};
    this.functions = functions || {};
    this.operators = operators || {
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
    };
  }

  private tokenize(expression: string): string[] {
    const regex = /([-+*/(),<>!=])|\b(?:\d+(\.\d+)?)|(?:"[^"]*")|(?:\w+)/g;
    return expression.match(regex) || [];
  }

  private getCurrentToken(): string | undefined {
    return this.tokens[this.currentTokenIndex];
  }

  private getNextToken(): string | undefined {
    this.currentTokenIndex++;
    return this.getCurrentToken();
  }

  private parseNumber(): number {
    const token = this.getCurrentToken();
    if (token === undefined || isNaN(Number(token))) {
      throw new Error('Invalid expression');
    }

    this.getNextToken();
    return parseFloat(token);
  }

  private parseString(): string {
    const token = this.getCurrentToken();
    if (token === undefined || !token.startsWith('"') || !token.endsWith('"')) {
      throw new Error('Invalid expression');
    }

    this.getNextToken();
    return token.slice(1, -1);
  }

  private parseBoolean(): boolean {
    const token = this.getCurrentToken();
    if (token === undefined || (token !== 'true' && token !== 'false')) {
      throw new Error('Invalid expression');
    }

    this.getNextToken();
    return token === 'true';
  }


  private parseFactor(): number | string | boolean {
    let value: number | string | boolean = 0;
    const token = this.getCurrentToken();

    if (token === undefined) {
      throw new Error('Invalid expression');
    }

    if (token === '(') {
      this.getNextToken();
      value = this.parseExpression();

      if (this.getCurrentToken() !== ')') {
        throw new Error('Invalid expression');
      }

      this.getNextToken();
    } else if (!isNaN(Number(token))) {
      value = this.parseNumber();
    } else if (token.startsWith('"') && token.endsWith('"')) {
      value = this.parseString();
    } else if (token === 'true' || token === 'false') {
      value = this.parseBoolean();
    } else if (this.variables.hasOwnProperty(token)) {
      value = this.variables[token];
      this.getNextToken();
    } else if (this.functions.hasOwnProperty(token)) {
      const func = this.functions[token];
      this.getNextToken();

      if (this.getCurrentToken() !== '(') {
        throw new Error('Invalid expression');
      }

      this.getNextToken();

      const args: (number | string | boolean)[] = [];
      while (this.getCurrentToken() !== ')') {
        args.push(this.parseExpression());

        if (this.getCurrentToken() === ',') {
          this.getNextToken();
        }
      }

      this.getNextToken();

      value = func(...args);
    } else if (this.operators.hasOwnProperty(token)) {
      const operator = this.operators[token];
      this.getNextToken();

      const factor = this.parseFactor();

      value = operator(0, factor as number | boolean);
    } else {
      throw new Error('Invalid expression');
    }

    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor() as number;

    while (true) {
      const token = this.getCurrentToken();
      if (token === '*' || token === '/') {
        const operator = token;
        this.getNextToken();
        const factor = this.parseFactor();
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

  private parseExpression(): number | string | boolean {
    let value = this.parseTerm();

    while (true) {
      const token = this.getCurrentToken() as string;
      if (token in this.operators) {
        const operator = token;
        this.getNextToken();
        const term = this.parseTerm();
        if (operator === '+') {
          value += term as number;
        } else if (operator === '-') {
          value -= term as number;
        } else {
          value = this.operators[operator as any](value, term);
        }
      } else {
        break;
      }
    }

    return value as number | string | boolean;
  }

  public evaluate(expression: string, tempVariables?: VariableMap, tempFunctions?: FunctionMap): number | string | boolean {
    const temporaryVariables = { ...this.variables, ...(tempVariables || {}) };
    const temporaryFunctions = { ...this.functions, ...(tempFunctions || {}) };

    this.tokens = this.tokenize(expression);
    this.currentTokenIndex = 0;

    const evaluateInternal = () => {
      const originalVariables = this.variables;
      const originalFunctions = this.functions;

      this.variables = { ...temporaryVariables };
      this.functions = { ...temporaryFunctions };

      const result = this.parseExpression();

      this.variables = originalVariables;
      this.functions = originalFunctions;

      return result;
    };

    const result = evaluateInternal();

    if (this.getCurrentToken() !== undefined) {
      throw new Error('Invalid expression');
    }

    return result;
  }
}


export default ExpressionParser