import ExpressionParser, { ExpressionParserConstructor, FunctionMap, OperatorMap } from "./ExpressionParser"
import moment from 'moment'

type Unit = "year" | "years" | "y" | "month" | "months" | "M" | "week" | "weeks" | "w" | "day" | "days" | "d" | "hour" | "hours" | "h" | "minute" | "minutes" | "m" | "second" | "seconds" | "s" | "millisecond" | "milliseconds" | "ms"

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
    is_email: (_, value: any) => {
      try {
        return !!value?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/g);
      } catch (error) {
        return false;
      }
    },
    is_html_empty: (_, value: any) => {
      try {
        if (!value) return true;
        if (value === "<div></div>") return true;
        if (value === "<span></span>") return true;
        return false;
      } catch (error) {
        return false;
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
    replace: (_, value: string, replaceValue: string, searchValue: string) => {
      return (value || '')?.replace?.(searchValue, replaceValue) || ''
    },
    replace_regex: (_, value: string, replaceValue: string, regex: string, flags?: string) => {
      return (value || '')?.replace?.(new RegExp(regex, flags), replaceValue) || ''
    },
    // DATE ==================================================================================
    date: (_, date: string) => date ? moment(date).toISOString() : moment().toISOString(),
    date_day: (_, date: string) => date ? moment(date).date() : moment().date(),
    date_month: (_, date: string) => date ? moment(date).month() + 1 : moment().month() + 1,
    date_year: (_, date: string) => date ? moment(date).year() : moment().year(),
    date_hour: (_, date: string) => date ? moment(date).hour() : moment().hour(),
    date_minute: (_, date: string) => date ? moment(date).minute() : moment().minute(),
    date_format: (_, format: string, date: string) => date ? moment(date).format(format).toString() : moment().format(format).toString(),
    date_in_format: (_, format: string, date: string) => date ? moment(date, format).toISOString() : moment().toISOString(),
    date_in_millis: (_, date: number) => moment(date).toISOString(),
    date_millis: (_, date: string) => date ? moment(date).valueOf() : moment().valueOf(),
    date_plus: (_, amount: number, unit: Unit, date: string) => date ? moment(date).add(amount, unit).toISOString() : moment().add(amount, unit).toISOString(),
    date_minus: (_, amount: number, unit: Unit, date: string) => date ? moment(date).subtract(amount, unit).toISOString() : moment().subtract(amount, unit).toISOString(),
    date_is_before: (_, date1: string, date2: string) => moment(date1).isBefore(date2),
    date_is_after: (_, date1: string, date2: string) => moment(date1).isAfter(date2),

    // CONDITION ==================================================================================
    if: (_, condition: boolean, truthy: any, falsy) => {
      return (condition) ? truthy : falsy
    },
    // OBJECT ==================================================================================
    assign: (_, source: Object, target: Object) => Object.assign(source, target),
    // ARRAY | STRING ===================================================================================
    includes: (_, arr: any[] | string, value: any,) => {
      if (typeof arr === 'string') return arr.includes(value)
      if (Array.isArray(arr)) return arr.includes(value);
      return false;
    },
    // ARRAY ===================================================================================
    min: (_, ...args) => Math.min(...args),
    max: (_, ...args) => Math.max(...args),
    sum: (state, arr, filterExpression: string, key = ['_item_', '_index_']) => arr.reduce((prev: number, curr: number, index: number) => {
      if (!filterExpression) return prev + curr;

      const result = parser.evaluate(
        filterExpression,
        {
          ...state.variables,
          [key[0]]: curr,
          [key[1]]: index
        },
      );
      return prev + result;
    }, 0),
    length: (_, value) => value?.length || 0,
    join: (_, arr: string[], arg: string) => arr.join(arg),
    filter: (state, items: any[], filterExpression: string, key = ['_item_', '_index_']) => {
      const filteredItems = items?.filter((item: any, index) => {
        const result = parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            [key[0]]: item,
            [key[1]]: index
          },
        );
        return result === true;
      });

      return filteredItems || []
    },
    map: (state, items: any[], filterExpression: string, key = ['_item_', '_index_']) => {
      const filteredItems = items?.map((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            [key[0]]: item,
            [key[1]]: index
          }
        );
      });

      return filteredItems || []
    },
    some: (state, items: any[], filterExpression: string, key = ['_item_', '_index_']) => {
      const filteredItems = items?.some((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            [key[0]]: item,
            [key[1]]: index
          },

        );
      });

      return filteredItems;
    },
    find: (state, items: any[], filterExpression: string, key = ['_item_', '_index_']) => {
      const filteredItems = items?.find((item: any, index) => {
        return parser.evaluate(
          filterExpression,
          {
            ...state.variables,
            [key[0]]: item,
            [key[1]]: index
          }
        );
      });

      return filteredItems;
    },
    reduce: (state, items: any[], filterExpression: string, initial: any, key = ['_item_', '_curr_', '_index_']) => {
      const filteredItems = items?.reduce(
        (curr: any, item: any, index) => {
          return parser.evaluate(
            filterExpression,
            {
              ...state.variables,
              [key[0]]: item,
              [key[1]]: curr,
              [key[2]]: index
            }
          );
        },
        initial
      );

      return filteredItems;
    },
    unique: (state, items: any[], filterExpression?: string, key = ['_item_', '_index_']) => {
      const filteredItems = items?.reduce(
        (uniqueList: any[], item: any, index) => {
          if (!filterExpression) {
            if (uniqueList.includes(item)) return uniqueList;
            return [...uniqueList, item]
          } else {
            const hasIncluded = uniqueList.some((uniqueItem) => {
              const uniqueItemValue = parser.evaluate(
                filterExpression,
                {
                  ...state.variables,
                  [key[0]]: uniqueItem,
                  [key[1]]: index
                }
              )
              const currValue = parser.evaluate(
                filterExpression,
                {
                  ...state.variables,
                  [key[0]]: item,
                  [key[1]]: index
                }
              )
              return uniqueItemValue === currValue
            })

            if (hasIncluded) {
              return uniqueList;
            } else {
              return [...uniqueList, item]
            }
          }
        },
        []
      );

      return filteredItems;

    }
  }

  parser.setFunctions(functions)
  parser.setOperators(operators)
  return parser;
}

export default createParser;