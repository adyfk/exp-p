import ExpressionParser, { ExpressionParserConstructor, FunctionMap, OperatorMap } from "./ExpressionParser"

export function createParser(props: ExpressionParserConstructor = {}) {
  const parser = new ExpressionParser({
    ...props,
    variables: {
      pi: Math.PI,
      ...props.variables,
    }
  });
  const operators: OperatorMap = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '==': (a, b) => a === b,
    '!=': (a, b) => a !== b,
    '^': (a, b) => Math.pow(a, b)
  }
  const functions: FunctionMap = {
    // NUMBER
    ceil: (_, value: number) => Math.ceil(value),
    round: (_, value: number) => Math.round(value),
    random: () => Math.random(),
    floor: (_, value: number) => Math.floor(value),
    abs: (_, value: number) => Math.abs(value),
    // STRING
    split: (_, arr: string, arg: string) => arr.split(arg),
    // CONDITION
    if: (_, condition: boolean, truthy: any, falsy) => {
      return (condition) ? truthy : falsy
    },
    // ARRAY
    min: (_, ...args) => Math.min(...args),
    max: (_, ...args) => Math.max(...args),
    sum: (_, arr) => arr.reduce((prev: number, curr: number) => prev + curr, 0),
    length: (_, value) => value.length,
    join: (_, arr: string[], arg: string) => arr.join(arg),
    filter: (state, items: any[], filterExpression: string) => {
      const filteredItems = items?.filter((item: any, index) => {
        const result = parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            _item_: item,
            _index_: index
          },
        );
        return result === true;
      });

      return filteredItems || []
    },
    map: (state, items: any[], filterExpression: string) => {
      const filteredItems = items?.map((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            _item_: item,
            _index_: index
          }
        );
      });

      return filteredItems || []
    },
    some: (state, items: any[], filterExpression: string) => {
      const filteredItems = items?.some((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            _item_: item,
            _index_: index
          },

        );
      });

      return filteredItems;
    },
    find: (state, items: any[], filterExpression: string) => {
      const filteredItems = items?.find((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            _item_: item,
            _index_: index
          }
        );
      });

      return filteredItems;
    },
    reduce: (state, items: any[], filterExpression: string, initial: any) => {
      const filteredItems = items?.reduce(
        (curr: any, item: any, index) => {
          return parser.evaluate(
            filterExpression,
            {
              ...state.variables,
              _curr_: curr,
              _item_: item,
              _index_: index
            }
          );
        },
        initial
      );

      return filteredItems;
    }
  }

  parser.setFunctions(functions)
  parser.setOperators(operators)
  return parser;
}

export default createParser;