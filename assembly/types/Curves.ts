import {JSON} from 'json-as/assembly'
import { PositionStyle } from './PositionStyle';

@json
export class LinearOptions {
}

@json
export class ExponentialDecayOptions {
  rate: f64 = 0;
}

@json
export class NormalOptions {
  mean: f64 = 5;
  stdDev: f64 = 2;
}

@json
export class SigmoidOptions {
  k: f64 = 1;
}

@json
export class LogarithmicOptions {
  base: f64 = 0;
}

@json
export class PowerLawOptions {
  exponent: f64 = 0;
}

@json
export class StepOptions {
  threshold: f64 = 0;
}

@json
export class SineOptions {
  amplitude: f64 = 0;
  frequency: f64 = 0;
  phase: f64 = 0;
}

@json
export class TriangleOptions {
  amplitude: f64 = 0;
  period: f64 = 0;
  phase: f64 = 0;
}

@json
export class QuadraticOptions {
  a: f64 = 0;
  b: f64 = 0;
  c: f64 = 0;
}

@json
export class CubicOptions {
  a: f64 = 0;
  b: f64 = 0;
  c: f64 = 0;
  d: f64 = 0;
}

@json
export class ExponentialGrowthOptions {
  rate: f64 = 0;
}

@json
export class LogarithmicDecayOptions {
  rate: f64 = 0;
  base: f64 = 0;
}

@json
export class SawtoothOptions {
  amplitude: f64 = 0;
  period: f64 = 0;
  phase: f64 = 0;
}

@json
export class SquareWaveOptions {
  amplitude: f64 = 0;
  period: f64 = 0;
  phase: f64 = 0;
}

@json
export class CurvesConfigHelper {
  // ExponentialDecayOptions
  rate: f64 = 0;
  // NormalOptions
  mean: f64 = 0;
  stdDev: f64 = 0;
  // SigmoidOptions
  k: f64 = 0;
  // LogarithmicOptions
  base: f64 = 0;
  // PowerLawOptions
  exponent: f64 = 0;
  // StepOptions
  threshold: f64 = 0;
  // SineOptions
  amplitude: f64 = 0;
  frequency: f64 = 0;
  phase: f64 = 0;
  // TriangleOptions
  period: f64 = 0;
  // QuadraticOptions
  a: f64 = 0;
  b: f64 = 0;
  c: f64 = 0;
  // CubicOptions
  d: f64 = 0;
  // ExponentialGrowthOptions
  // rate: f64 = 0; // rate is already included above
  // LogarithmicDecayOptions
  // rate: f64 = 0; // rate is already included above
  // base: f64 = 0; // base is already included above
  // SawtoothOptions
  // amplitude: f64 = 0; // amplitude is already included above
  // period: f64 = 0; // period is already included above
  // phase: f64 = 0; // phase is already included above
}