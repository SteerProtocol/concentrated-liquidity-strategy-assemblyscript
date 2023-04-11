
import { JSON } from 'json-as/assembly';

@json
export class NormalOptions {
  peak: f64 = 0.0;
  stdDev: f64 = 0.0;
}

@json
export class SigmoidOptions {
  steepness: f64 = 0.0;
}

@json
export class ExponentialDecayOptions {
  rate: f64 = 0.0;
}

@json
export class LogarithmicOptions {
  base: f64 = 0.0;
}

@json
export class PowerLawOptions {
  exponent: f64 = 0.0;
}

@json
export class StepOptions {
  threshold: f64 = 0.0;
}

@json
export class SineOptions {
  amplitude: f64 = 0.0;
  frequency: f64 = 0.0;
  phase: f64 = 0.0;
}

@json
export class TriangleOptions {
  amplitude: f64 = 0.0;
  frequency: f64 = 0.0;
  phase: f64 = 0.0;
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
  base: f64 = 0;
}

@json 
export class SawtoothOptions {
  amplitude: f64 = 0;
  frequency: f64 = 0;
  phase: f64 = 0;
}

@json 
export class SquareWaveOptions {
  amplitude: f64 = 0;
  frequency: f64 = 0;
  dutyCycle: f64 = 0;
  phase: f64 = 0;
}
