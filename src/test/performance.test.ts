
import Benchmark from "benchmark";
import { init, formula } from "expressionparser";
import { createParser } from "..";

test('test', () => {
  const p2 = init(formula, (): any => {
    return null;
  });

  const p = createParser();

  const suite = new Benchmark.Suite();

  suite.add("expressionparser", () => {
    p2.expressionToValue("[1,2,3,4,5,6,7,1,3,5, 5 + 5 + 5 + ( 2 * 4 + 2)]");
  });
  suite.add("exp-p", () => {
    p.evaluate("[1,2,3,4,5,6,7,1,3,5, 5 + 5 + 5 + ( 2 * 4 + 2)]");
  });


  suite.on('cycle', function (event: any) {
    console.log(String(event.target));
  })

  suite.on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })

  suite.run();
})

test("x", () => { })
