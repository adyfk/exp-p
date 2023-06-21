
// import { init, formula } from "expressionparser";
// import { createParser } from "..";
// import b from 'benny';

test("x", () => { })


// test('test performance', () => {
//   const p2 = init(formula, (): any => {
//     return null;
//   });

//   const p = createParser();

//   return new Promise((resolve) => {
//     b.suite(
//       'expression-parser-performance-test',
//       b.add('exp-p', () => {
//         p.evaluate("[1,2,3,4,5,6,7,1,3,5, 5 + 5 + 5 + ( 2 * 4 + 2)]")
//       }),
//       b.add('expression-parser', () => {
//         p2.expressionToValue("[1,2,3,4,5,6,7,1,3,5, 5 + 5 + 5 + ( 2 * 4 + 2)]");
//       }),
//       b.cycle(),
//       b.complete(resolve),
//     )
//   })
// }, 15000)