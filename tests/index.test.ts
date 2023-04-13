
import { generatePositions, PositionStyle } from '../build/debug'

describe("WASM Module", () => {
  describe("keltnerChannels", () => {
    it("execute should show not implemented", async () => {
      const strategy = generatePositions(100, 0, 1, PositionStyle.ABSOLUTE);
      console.log("🧙‍♂️ 🔎 -> ~ file: index.test.ts:8 ~ it ~ strategy:", strategy)
      expect(strategy).toBe(1);
    });
  });
});
