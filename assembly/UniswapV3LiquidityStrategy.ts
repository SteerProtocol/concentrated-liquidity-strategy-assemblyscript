import { BaseStrategy } from '@steerprotocol/base-strategy/assembly';

export class UniswapV3LiquidityStrategy extends BaseStrategy {
  private LIQUIDITY_PRECISION: i64 = 2 ** 16 - 2; 
  private startTick: i32;
  public binWidth: i32 = 600;

  constructor(binWidth: i32) {
    super();
    this.binWidth = binWidth;
  }
}