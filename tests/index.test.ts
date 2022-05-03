const myModule = require("../index");

describe("WASM Module", () => {
  describe("keltnerChannels", () => {
    it("execute should show not implemented", async () => {
      const strategy = myModule.UniswapV3LiquidityStrategy(1);
      expect(strategy.binWidth).toBe(1);
    });
  });
});
