import { BaseStrategy } from '@steerprotocol/base-strategy/assembly';

export class UniswapV3LiquidityStrategy extends BaseStrategy {
  private LIQUIDITY_PRECISION: f32 = 2 ** 16 - 2; 
  private startTick: f32;
  public binWidth: f32 = 600;

  constructor(binWidth: f32) {
    super();
    this.binWidth = binWidth;
  }
}