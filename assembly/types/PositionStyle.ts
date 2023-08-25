export const enum PositionStyle {
    Basic,
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
      case PositionStyle.Basic:
        return "Basic";
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

  export function stringToPositionStyle(positionStyleString: string): PositionStyle {
    if (positionStyleString === "Basic") {
      return PositionStyle.Basic;
    }
    if (positionStyleString === "Linear") {
      return PositionStyle.Linear;
    }
    if (positionStyleString === "Normalized") {
      return PositionStyle.Normalized;
    }
    if (positionStyleString === "Sigmoid") {
      return PositionStyle.Sigmoid;
    }
    if (positionStyleString === "ExponentialDecay") {
      return PositionStyle.ExponentialDecay;
    }
    if (positionStyleString === "Logarithmic") {
      return PositionStyle.Logarithmic;
    }
    if (positionStyleString === "PowerLaw") {
      return PositionStyle.PowerLaw;
    }
    if (positionStyleString === "Step") {
      return PositionStyle.Step;
    }
    if (positionStyleString === "Sine") {
      return PositionStyle.Sine;
    }
    if (positionStyleString === "Triangle") {
      return PositionStyle.Triangle;
    }
    if (positionStyleString === "Quadratic") {
      return PositionStyle.Quadratic;
    }
    if (positionStyleString === "Cubic") {
      return PositionStyle.Cubic;
    }
    if (positionStyleString === "ExponentialGrowth") {
      return PositionStyle.ExponentialGrowth;
    }
    if (positionStyleString === "LogarithmicDecay") {
      return PositionStyle.LogarithmicDecay;
    }
    if (positionStyleString === "Sawtooth") {
      return PositionStyle.Sawtooth;
    }
    if (positionStyleString === "SquareWave") {
      return PositionStyle.SquareWave;
    }
    return PositionStyle.Basic;
  }
  