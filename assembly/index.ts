import { Bins, BinsResult } from "./Bins";
import { Price } from "./Price";

export { Bins, BinsResult, Price };
export class UniswapV3LiquidityStrategy {
  private LIQUIDITY_PRECISION: f32 = 2 ** 16 - 2; 
  private startTick: f32;
  public binWidth: f32 = 600;
  private bins: Bins = [];

  constructor(binWidth: f32) {
    this.binWidth = binWidth;
  }

  calculateBins(upper: f32, lower: f32): BinsResult {
    const bins: Bins = [];
    const upperTick = f32(Math.round(this.getTickFromPrice(upper)));
    const lowerTick = f32(Math.round(this.getTickFromPrice(lower)));
    const width = this.binWidth;
    const range = (upperTick - lowerTick)+width;

    let startTick = lowerTick;

    while (startTick % width !== 0) {
      startTick--;
    }

    let indexTick = startTick + width;
    
    bins.push(
      f32(
        Math.abs(
          Math.floor(
            
            (this.LIQUIDITY_PRECISION * (indexTick - startTick)) / range
          )
        )
      )
    );

    while (indexTick < upperTick) {
      if (upperTick < indexTick + width) {
        bins.push(
          f32(
            Math.abs(
              Math.floor(
                (this.LIQUIDITY_PRECISION * (upperTick - indexTick)) / range
              )
            )
          )
        );
        break;
      } else {
        bins.push(
          f32(Math.abs(Math.floor((this.LIQUIDITY_PRECISION * width) / range)))
        );
        indexTick += width;
      }
    }

    this.startTick = startTick;
    this.bins = bins;

    return new BinsResult(this.startTick, this.bins);
  }

  _normalDensity(std: f32, mean: f32, x: f32): f32 {
    return f32(
      (f32(Math.E) ** (((x - mean) / std) ** 2 / -2) / std) *
        Math.sqrt(2 * f32(Math.PI))
    );
  }

  calculateNormalisedBins(prices: Array<Price>, upper: f32, lower: f32): BinsResult {
    const bins: Bins = [];
    let upperTick = this.getTickFromPrice(upper);
    let lowerTick = this.getTickFromPrice(lower);
    let cpTick = this.getTickFromPrice(prices[prices.length - 1].close);

    // let tickRange = upperTick - lowerTick;
    let startTick = lowerTick;
    while (i32(startTick) % i32(this.binWidth) != 0) {
      startTick -= 1;
    }
    let indexTick = startTick + this.binWidth;
    let std: f32;
    //Find the std dev
    if (abs(cpTick - lowerTick) > abs(upperTick - cpTick)) {
      std = (cpTick - lowerTick) / 3.0;
    } else {
      std = (upperTick - cpTick) / 3.0;
    }
    let binPrecision = f32(2 ** 16 - 2);
    //add the first bin
    bins[0] = f32(
      Math.floor(
        this._normalDensity(std, cpTick, indexTick - this.binWidth / 2) *
          binPrecision
      )
    );
    let iter = 1;

    while (indexTick <= upperTick) {
      bins[iter] = f32(
        Math.floor(
          this._normalDensity(std, cpTick, indexTick + this.binWidth / 2) *
            binPrecision
        )
      );
      iter++;
      indexTick += this.binWidth;
    }

    return new BinsResult(startTick, bins);
  }

  // TODO: Needs to be rewritten for all assets
  // Price must be in the native token
  // token0 for token1
  private getTickFromPrice(price: f32): f32 {
    const tick = Math.log(price) / Math.log(f32(1.0001));
    return f32(tick);
  } //Depends on the asset we are working with

  convertBins(oldResult: BinsResult): Position[]{
    const positions: Array<Position> = [];
    let indexTick: f32 = floor(oldResult.startTick);
    for (let i = 0; i < oldResult.bins.length; i++) {
      const position = new Position(indexTick, indexTick + this.binWidth, oldResult.bins[i]);
      positions.push(position);
      indexTick += this.binWidth;
    }
  return positions;
  }

}
export class Position 
{
  constructor(
    public startTick : f32,
    public endTick : f32,
    public weight : f32)
    {}
}