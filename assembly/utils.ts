import { Position } from "@steerprotocol/strategy-utils/assembly";

export function getTickSpacing(poolFee: i32): i32 {
  let spacing = 0;
  switch (poolFee) {
    case 100:
      spacing = 1;
      break;
    case 500:
      spacing = 10;
      break;
    case 3000:
      spacing = 60;
      break;
    default:
      spacing = 200;
  }
  return spacing;
}

// Function shaped for making positions with the UniLiquidityManager contract for ease
export function renderULMResult(
  positions: Array<Position>,
  totalLiquidity1e4: number
): string {
  // Construct necessary object
  const lowerTicks: Array<i32> = [];
  const upperTicks: Array<i32> = [];
  const weights: Array<i32> = [];

  for (let i = 0; i < positions.length; i++) {
    lowerTicks.push(positions[i].startTick);
    upperTicks.push(positions[i].endTick);
    weights.push(positions[i].weight);
  }

  return (
    `{"functionName":"tend(uint256,(int24[],int24[],uint16[]),bytes)",
    "typesArray":["uint256","tuple(int24[],int24[],uint16[])","bytes"],
    "valuesArray":[` +
    totalLiquidity1e4.toString() +
    `, [[` +
    lowerTicks.toString() +
    "],[" +
    upperTicks.toString() +
    "],[" +
    weights.toString() +
    `]], "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000ffffffffffffffffffffffffffffffffffffffff"]
    }`
  );
  // The bytes value here is a placeholder for encoding that gets replaced with time-sensitive data upon execution. It will actually be the swap amount for re-balancing (int256) and slippage limit (uint160)
}

// TODO: Might need to be rewritten for assets
// Price must be in the native token
// token0 for token1
export function getTickFromPrice(price: f64): i32 {
  const tick = Math.log(price) / Math.log(f64(1.0001));
  return i32(tick);
}

export function formatTick(expandedUpperLimit: number, expandedLowerLimit: number, poolFee: number): Array<number> {
  const upperTick = closestDivisibleNumber(i32(Math.round(getTickFromPrice(f64(expandedUpperLimit)))), getTickSpacing(i32(poolFee)), false);
  const lowerTick = closestDivisibleNumber(i32(Math.round(getTickFromPrice(f64(expandedLowerLimit)))), getTickSpacing(i32(poolFee)), true);
  return [ upperTick, lowerTick ];
}

function closestDivisibleNumber(num: number, divisor: number, floor: boolean): number {
  if (floor) return Math.floor(num / divisor) * divisor;
  return Math.ceil(num / divisor) * divisor;
}