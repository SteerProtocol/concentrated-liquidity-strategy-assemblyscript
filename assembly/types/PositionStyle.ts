export const enum PositionStyle {
    Absolute,
    Linear,
    Normalized,
    Sigmoid,
    ExponentialDecay,
    Logarithmic,
    PowerLaw,
    Step,
    Sine,
    Triangle,
    Quadratic,
    Cubic,
    ExponentialGrowth,
    LogarithmicDecay,
    Sawtooth,
    SquareWave,
}

export function PositionStyleLookup(positionStyle: PositionStyle): string {
    switch (positionStyle) {
      case PositionStyle.Absolute:
        return "Absolute";
      case PositionStyle.Linear:
        return "Linear";
      case PositionStyle.Normalized:
        return "Normalized";
      case PositionStyle.Sigmoid:
        return "Sigmoid";
      case PositionStyle.ExponentialDecay:
        return "ExponentialDecay";
      case PositionStyle.Logarithmic:
        return "Logarithmic";
      case PositionStyle.PowerLaw:
        return "PowerLaw";
      case PositionStyle.Step:
        return "Step";
      case PositionStyle.Sine:
        return "Sine";
      case PositionStyle.Triangle:
        return "Triangle";
      case PositionStyle.Quadratic:
        return "Quadratic";
      case PositionStyle.Cubic:
        return "Cubic";
      case PositionStyle.ExponentialGrowth:
        return "ExponentialGrowth";
      case PositionStyle.LogarithmicDecay:
        return "LogarithmicDecay";
      case PositionStyle.Sawtooth:
        return "Sawtooth";
      case PositionStyle.SquareWave:
        return "SquareWave";
      default:
        throw new Error(`Unknown position style: ${positionStyle}`);
    }
  }