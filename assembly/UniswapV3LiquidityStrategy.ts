import { BaseStrategy } from '@steerprotocol/base-strategy/assembly';

export class UniswapV3LiquidityStrategy extends BaseStrategy {
  private LIQUIDITY_PRECISION: f64 = 2 ** 16 - 2; 
  private startTick: f64;
  public binWidth: f64 = 600;

  constructor(binWidth: f64) {
    super();
    this.binWidth = binWidth;
  }
}