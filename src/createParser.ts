import ExpressionParser, { ExpressionParserConstructor, FunctionMap, OperatorMap } from "./ExpressionParser"
import { DateTime } from 'luxon'

export function createParser(props: ExpressionParserConstructor = {}) {
  const luxonConfigToISO = props.luxon?.toISO
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
    // DATATYPE ==================================================================================
    is_string: (_, value: any) => typeof value === 'string',
    is_boolean: (_, value: any) => typeof value === 'boolean',
    is_array: (_, value: any) => Array.isArray(value),
    is_object: (_, value: any) => typeof value === 'object' && value !== null,
    is_number: (_, value: any) => {
      try {
        return !Number.isNaN(+value);
      } catch (error) {
        return false
      }
    },
    // NUMBER ==================================================================================
    ceil: (_, value: number) => Math.ceil(value),
    round: (_, value: number) => Math.round(value),
    random: () => Math.random(),
    floor: (_, value: number) => Math.floor(value),
    abs: (_, value: number) => Math.abs(value),
    precision: (_, value: number, precision: number) => +value.toPrecision(precision),
    fixed: (_, value: number, fractionDigits: number) => +value.toFixed(fractionDigits),
    // STRING ==================================================================================
    split: (_, value: string, arg: string) => value.split(arg),
    upper: (_, value: string) => value.toUpperCase(),
    lower: (_, value: string) => value.toLowerCase(),
    regex: (_, value: any, regex: string, flags?: string) => new RegExp(regex, flags).test(value),
    // DATE ==================================================================================
    date: (_, value: string,) => DateTime.fromISO(value).toISO(luxonConfigToISO) || DateTime.now().toISO(luxonConfigToISO),
    date_day: (_, value: string,) => DateTime.fromISO(value).day || DateTime.now().day,
    date_month: (_, value: string,) => DateTime.fromISO(value).month || DateTime.now().month,
    date_year: (_, value: string,) => DateTime.fromISO(value).year || DateTime.now().year,
    date_hour: (_, value: string,) => DateTime.fromISO(value).hour || DateTime.now().hour,
    date_minute: (_, value: string,) => DateTime.fromISO(value).minute,
    date_format: (_, value: string, format: string) => DateTime.fromISO(value).toFormat(format).toString(),
    date_in_format: (_, value: string, format: string) => DateTime.fromFormat(value, format).toISO(luxonConfigToISO),
    date_in_millis: (_, value: number) => DateTime.fromMillis(value).toISO(),
    date_millis: (_, value: string) => DateTime.fromISO(value).toMillis(),
    date_plus: (_, value: string) => DateTime.fromISO(value),

    // CONDITION ==================================================================================
    if: (_, condition: boolean, truthy: any, falsy) => {
      return (condition) ? truthy : falsy
    },
    // ARRAY ==================================================================================
    includes: (_, value, arr: any[]) => arr.includes(value),
    min: (_, ...args) => Math.min(...args),
    max: (_, ...args) => Math.max(...args),
    sum: (_, arr) => arr.reduce((prev: number, curr: number) => prev + curr, 0),
    length: (_, value) => value?.length || 0,
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
    },
  }

  parser.setFunctions(functions)
  parser.setOperators(operators)
  return parser;
}

export default createParser;