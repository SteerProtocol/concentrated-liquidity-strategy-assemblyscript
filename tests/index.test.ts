import fs from 'fs';
import { WasmModule, loadWasm } from "@steerprotocol/app-loader";

describe("WASM Module", () => {
  let myModule: WasmModule;
  
  beforeEach(async () => {
    myModule = await loadWasm(fs.readFileSync(__dirname + "/./stable-debug-v2.wasm"), {})
  });
  describe("Curve Lib", () => {

    // Curve shapes
    // =-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // PositionStyle.Normalized
    test("liquidity shape Normalized", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Normalized", "bins": 10, "mean": 5, "stdDev": 2}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[2,5,10,15,19,19,15,10,5,2]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

        // PositionStyle.Normalized
        test("Invert - Normalized", async () => {
          // The actual strategy instantiation and execution
          myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Normalized", "bins": 10, "mean": 5, "stdDev": 2, "invert": true}`);
          // Call the config function on the strategy bundle
          const result = myModule.execute();
          // Pull the result from memory and parse the result
          const parsedResult = JSON.parse(result);
          // The result should match the given config
          expect(JSON.stringify(parsedResult)).toStrictEqual(
            `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[19,16,11,6,2,2,6,11,16,19]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
          );
        });

    // PositionStyle.Linear
    test("liquidity shape Linear", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 9, "liquidityShape": "Linear", "bins": 7}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[10,30,50,70],[30,50,70,90],[887,662,437,212]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

      // PositionStyle.Linear
      test("Reflect - Linear", async () => {
        // The actual strategy instantiation and execution
        myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 9, "liquidityShape": "Linear", "bins": 7, "reflect": true}`);
        // Call the config function on the strategy bundle
        const result = myModule.execute();
        // Pull the result from memory and parse the result
        const parsedResult = JSON.parse(result);
        // The result should match the given config
        expect(JSON.stringify(parsedResult)).toStrictEqual(
          `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[10,30,50,70],[30,50,70,90],[212,437,662,887]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
        );
      });

    // // PositionStyle.ExponentialDecay
    // test("liquidity shape Exponential Decay", async () => {
    //   // The actual strategy instantiation and execution
    //   myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "ExponentialDecay",   "binSizeMultiplier": 10,
    //   "mean": 1,
    //   "stdDev": 2}`);
    //   // Call the config function on the strategy bundle
    //   const result = myModule.execute();
    //   // Pull the result from memory and parse the result
    //   const parsedResult = JSON.parse(result);
    //   // The result should match the given config
    //   expect(JSON.stringify(parsedResult)).toStrictEqual(
    //     `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[-30],[40],[1]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
    //   );
    // });

    // PositionStyle.Normalized,
    // PositionStyle.Absolute,
    // PositionStyle.Linear,
    // PositionStyle.Sigmoid,
    // PositionStyle.PowerLaw,
    // // PositionStyle.Step,
    // // PositionStyle.Sine,
    // PositionStyle.Triangle,

    // PositionStyle.Sigmoid
    test("liquidity shape Sigmoid", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Sigmoid",   "bins": 10, "k": 1}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[98,97,93,86,72,51,29,14,6,2]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

    // PositionStyle.Logarithmic
    test("liquidity shape logarithmic", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Logarithmic",   "bins" 10, "base": 10,  "reflect": false, "invert": false}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[98,93,88,83,77,70,61,51,37,16]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

        // PositionStyle.Quadratic
        test("liquidity shape Quadratic", async () => {
          // The actual strategy instantiation and execution
          myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Quadratic",   "bins" 10, "a": 0, "b": 0, "c": 10}`);
          // Call the config function on the strategy bundle
          const result = myModule.execute();
          // Pull the result from memory and parse the result
          const parsedResult = JSON.parse(result);
          // The result should match the given config
          expect(JSON.stringify(parsedResult)).toStrictEqual(
            `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[10120,8482,7006,5692,4540,3550,2722,2056,1552,1210]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
          );
        });

        // // PositionStyle.Quadratic
        // test("liquidity shape Cubic", async () => {
        //   // The actual strategy instantiation and execution
        //   myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Cubic",   "bins" 10, "a": 1, "b": 1, "c": 10, "d":10}`);
        //   // Call the config function on the strategy bundle
        //   const result = myModule.execute();
        //   // Pull the result from memory and parse the result
        //   const parsedResult = JSON.parse(result);
        //   // The result should match the given config
        //   expect(JSON.stringify(parsedResult)).toStrictEqual(
        //     `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[11075,9347,7781,6377,5135,4055,3137,2381,1787,1355]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
        //   );
        // });

    // PositionStyle.PowerLaw
    test("liquidity shape PowerLaw", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "PowerLaw",   "bins": 10, "exponent":2}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[9120,7482,6006,4692,3540,2550,1722,1056,552,210]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

    // PositionStyle.Step
    // test("liquidity shape step", async () => {
    //   // The actual strategy instantiation and execution
    //   myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Step",   "bins": 10, "threshold": 10}`);
    //   // Call the config function on the strategy bundle
    //   const result = myModule.execute();
    //   // Pull the result from memory and parse the result
    //   const parsedResult = JSON.parse(result);
    //   // The result should match the given config
    //   expect(JSON.stringify(parsedResult)).toStrictEqual(
    //     `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[-30],[40],[1]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
    //   );
    // });

    // PositionStyle.Sine
    test("liquidity shape sine", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10, "liquidityShape": "Sine",   "bins": 10,
      "amplitude": 1,
      "frequency": 1,
    "phase": 0}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[70,20,0,20,70,130,180,200,180,130]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

    // PositionStyle.Triangle
    test("liquidity shape triangle", async () => {
      // The actual strategy instantiation and execution
      myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 10,  "liquidityShape": "Triangle",   "bins": 10,}`);
      // Call the config function on the strategy bundle
      const result = myModule.execute();
      // Pull the result from memory and parse the result
      const parsedResult = JSON.parse(result);
      // The result should match the given config
      expect(JSON.stringify(parsedResult)).toStrictEqual(
        `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[0,10,20,30,40,50,60,70,80,90],[10,20,30,40,50,60,70,80,90,100],[90,73,55,36,19,0,17,35,52,70]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
      );
    });

        // PositionStyle.Linear
        test("linear tricky bins", async () => {
          // The actual strategy instantiation and execution
          myModule.initialize(`{"centerTick": 50,"poolFee":500, "spaceSpread": 9, "liquidityShape": "Linear", "bins": 7}`);
          // Call the config function on the strategy bundle
          const result = myModule.execute();
          // Pull the result from memory and parse the result
          const parsedResult = JSON.parse(result);
          // The result should match the given config
          expect(JSON.stringify(parsedResult)).toStrictEqual(
            `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[10,30,50,70],[30,50,70,90],[887,662,437,212]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
          );
        });
    
            test("liquidity shape Linear - check neg inversion", async () => {
              // The actual strategy instantiation and execution
              myModule.initialize(`{"centerTick": 0,"poolFee":100, "spaceSpread": 50, "liquidityShape": "Linear", "bins": 50}`);
              // Call the config function on the strategy bundle
              const result = myModule.execute();
              // Pull the result from memory and parse the result
              const parsedResult = JSON.parse(result);
              // The result should match the given config
              expect(JSON.stringify(parsedResult)).toStrictEqual(
                `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],[-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],[991,973,954,937,919,900,883,865,846,829,811,792,775,757,738,720,703,684,666,649,630,612,595,576,558,541,522,504,487,468,450,433,414,397,379,360,343,325,307,288,270,253,235,216,198,181,163,145,126,108]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
              );
            });

                      // PositionStyle.Quadratic
          test("quadratic large numbers", async () => {
            // The actual strategy instantiation and execution
            myModule.initialize(`{"centerTick": 0,"poolFee":500, "spaceSpread": 100, "liquidityShape": "Quadratic",   "bins" 10, "a": 1000, "b": 100, "c": 100}`);
            // Call the config function on the strategy bundle
            const result = myModule.execute();
            // Pull the result from memory and parse the result
            const parsedResult = JSON.parse(result);
            // The result should match the given config
            expect(JSON.stringify(parsedResult)).toStrictEqual(
              `{\"functionName\":\"tend(uint256,(int24[],int24[],uint16[]),bytes)\",\"typesArray\":[\"uint256\",\"tuple(int24[],int24[],uint16[])\",\"bytes\"],\"valuesArray\":[10000,[[-500,-400,-300,-200,-100,0,100,200,300,400],[-400,-300,-200,-100,0,100,200,300,400,500],[59520,48895,39314,30779,23288,16843,11443,7088,3779,1514]],\"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff\"]}`
            );
          });
  });
});

