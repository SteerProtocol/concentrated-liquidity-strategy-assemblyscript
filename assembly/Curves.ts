import { JSON } from "json-as/assembly";

import {
  ExponentialDecayOptions,
  NormalOptions,
  SigmoidOptions,
  LogarithmicOptions,
  PowerLawOptions,
  StepOptions,
  SineOptions,
  TriangleOptions,
  QuadraticOptions,
  CubicOptions,
  ExponentialGrowthOptions,
  LogarithmicDecayOptions,
  SawtoothOptions,
  SquareWaveOptions,
  PositionStyle,
} from "./types";
import { PositionGenerator } from "./PositionGenerator";
import { Position } from "@steerprotocol/strategy-utils/assembly";

export class Curves {
  static exponentialDecay(x: f64, options: ExponentialDecayOptions): f64 {
    const rate = options.rate || 1;
    return Math.exp(-rate * x);
  }

  static normal(x: f64, options: NormalOptions): f64 {
    const mean = options.mean || 0;
    const stdDev = options.stdDev || 1;
    return (
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
    );
  }

  static sigmoid(x: f64, options: SigmoidOptions): f64 {
    const k = options.k || 1;
    return 1 / (1 + Math.exp(-k * x));
  }

  static logarithmic(x: f64, options: LogarithmicOptions): f64 {
    const base = options.base || Math.E;
    if (x < 0) {
      const absX = Math.abs(x);
      const argX = Math.atan2(0, x);
      return (
        Math.log(absX) / Math.log(base) +
        (argX / (2 * Math.PI)) * Math.log(base)
      );
    } else if (x == 0) {
      return 0;
    } else {
      return Math.log(x) / Math.log(base);
    }
  }

  static powerLaw(x: f64, options: PowerLawOptions): f64 {
    const exponent = options.exponent || 1;
    return Math.pow(x, exponent);
  }

  static step(x: f64, options: StepOptions): f64 {
    const threshold = options.threshold || 0;
    return x < threshold ? 0 : 1;
  }

  static sine(x: f64, options: SineOptions): f64 {
    const amplitude = options.amplitude || 1;
    const frequency = options.frequency || 1;
    const phase = options.phase || 0;
    return amplitude * Math.sin(2 * Math.PI * frequency * x + phase);
  }

  static triangle(x: f64, options: TriangleOptions): f64 {
    const amplitude = options.amplitude || 1;
    const period = options.period || Math.PI * 2;
    const phase = options.phase || 0;
    const t = (x - phase) % period;
    const adjustedT = t + (t < 0 ? period : 0);
    return (
      ((2 * amplitude) / period) *
        (period / 2 - Math.abs(adjustedT - period / 2)) -
      amplitude
    );
  }

  static quadratic(x: f64, options: QuadraticOptions): f64 {
    const a = options.a || 1;
    const b = options.b || 0;
    const c = options.c || 0;
    return a * Math.pow(x, 2) + b * x + c;
  }

  static cubic(x: f64, options: CubicOptions): f64 {
    const a = options.a || 1;
    const b = options.b || 0;
    const c = options.c || 0;
    const d = options.d || 0;
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  }

  static exponentialGrowth(x: f64, options: ExponentialGrowthOptions): f64 {
    const rate = options.rate || 1;
    return Math.exp(rate * x);
  }

  static logarithmicDecay(x: f64, options: LogarithmicDecayOptions): f64 {
    const rate = options.rate || 1;
    const base = options.base || Math.E;
    return Math.pow(base, -rate * x);
  }

  static sawtooth(x: number, options: SawtoothOptions): number {
    const amplitude = options.amplitude || 1;
    const period = options.period || Math.PI * 2;
    const phase = options.phase || 0;
    const t = (x - phase) % period;
    const adjustedT = t + (t < 0 ? period : 0);
    return ((2 * amplitude) / period) * adjustedT - amplitude;
  }

  static squareWave(x: f64, options: SquareWaveOptions): f64 {
    const amplitude = options.amplitude || 1;
    const period = options.period || Math.PI * 2;
    const phase = options.phase || 0;
    return Math.sin((2 * Math.PI * (x + phase)) / period) >= 0
      ? amplitude
      : -amplitude;
  }
}

