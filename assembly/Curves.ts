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
} from "./types";

export class Curves {
  static normal(t: f64, options: NormalOptions): f64 {
    return (
      Math.exp(-0.5 * Math.pow((t - options.peak) / options.stdDev, 2)) * 10000
    );
  }

  static sigmoid(t: f64, options: SigmoidOptions): f64 {
    return (1 / (1 + Math.exp(-options.steepness * (t - 0.5)))) * 10000;
  }

  static exponentialDecay(t: f64, options: ExponentialDecayOptions): f64 {
    return Math.exp(-options.rate * t) * 10000;
  }

  static logarithmic(t: f64, options: LogarithmicOptions): f64 {
    return Math.log(options.base + t * 100) * 10000;
  }

  static powerLaw(t: f64, options: PowerLawOptions): f64 {
    return Math.pow(t, options.exponent) * 10000;
  }

  static step(t: f64, options: StepOptions): f64 {
    return t < options.threshold ? 0 : 10000;
  }

  static sine(t: f64, options: SineOptions): f64 {
    return (
      options.amplitude *
        Math.sin(options.frequency * t * 2 * Math.PI + options.phase) +
      10000
    );
  }

  static triangle(t: f64, options: TriangleOptions): f64 {
    return (
      options.amplitude *
        (2 * Math.abs(((options.frequency * t + options.phase) % 1) - 0.5) -
          0.5) +
      10000
    );
  }

  static quadratic(t: f64, options: QuadraticOptions): f64 {
    return (options.a * Math.pow(t, 2) + options.b * t + options.c) * 10000;
  }

  static cubic(t: f64, options: CubicOptions): f64 {
    return (
      options.a * Math.pow(t, 3) +
      options.b * Math.pow(t, 2) +
      options.c * t +
      options.d
    ) * 10000;
  }

  static exponentialGrowth(t: f64, options: ExponentialGrowthOptions): f64 {
    return Math.exp(options.rate * t) * 10000;
  }

  static logarithmicDecay(t: f64, options: LogarithmicDecayOptions): f64 {
    return Math.log(options.base + (1 - t) * 100) * 10000;
  }

  static sawtooth(t: f64, options: SawtoothOptions): f64 {
    return (
      options.amplitude *
        (2 * (((options.frequency * t + options.phase) % 1) - 0.5)) +
      10000
    );
  }

  static squareWave(t: f64, options: SquareWaveOptions): f64 {
    const positionInPeriod = (options.frequency * t + options.phase) % 1;
    return (
      (positionInPeriod < options.dutyCycle ? options.amplitude : -options.amplitude) +
      10000
    );
  }
}
