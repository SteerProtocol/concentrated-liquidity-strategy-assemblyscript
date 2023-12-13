import { console, Position } from "@steerprotocol/strategy-utils/assembly";
import { JSON } from "json-as/assembly";
import { Curves } from "./Curves";
import {
  CubicOptions,
  CurvesConfigHelper,
  ExponentialDecayOptions,
  ExponentialGrowthOptions,
  LinearOptions,
  LogarithmicDecayOptions,
  LogarithmicOptions,
  NormalOptions,
  PositionStyle,
  PositionStyleLookup,
  PowerLawOptions,
  QuadraticOptions,
  SawtoothOptions,
  SigmoidOptions,
  SineOptions,
  SquareWaveOptions,
  StepOptions,
  TriangleOptions,
} from "./types";
import { simplifyPositions } from "./PositionsOptimizer";

export class PositionGenerator {

  constructor() {}

  public generate(
    upperBound: number,
    lowerBound: number,
    segmentWidth: number,
    style: PositionStyle,
    options: string,
    reflect: boolean,
    invert: boolean
  ): Array<Position> {
    let positions: Array<Position> = [];
    const weights: Array<f64> = [];
    let minY = Infinity;

    for (let i = lowerBound; i < upperBound; i += segmentWidth) {
      const startx = i;
      const endx = startx + segmentWidth;
      const midPoint = (startx + endx) / 2;

      let y: f64;

      const tranposedX = this.computeCloseness(
        midPoint,
        lowerBound,
        upperBound
      );

      switch (style) {
        case PositionStyle.Basic:
          y = 1;
          break;
        case PositionStyle.Linear:
          y = tranposedX;
          break;
        case PositionStyle.Normalized:
          const parsedOptions = JSON.parse<NormalOptions>(options);
          // unsure why we would do this
          parsedOptions.mean = this.computeCloseness(
            (upperBound + lowerBound) / 2,
            lowerBound,
            upperBound
          );
          y = Curves.normal(tranposedX, parsedOptions);
          break;
        case PositionStyle.Sigmoid:
          // +5 shifts and makes the curve always positive
          // perfect for 0-10 plots
          y = Curves.sigmoid(
            tranposedX - 5,
            JSON.parse<SigmoidOptions>(options)
          );
          break;
        case PositionStyle.ExponentialDecay:
          y = Curves.exponentialDecay(
            tranposedX,
            JSON.parse<ExponentialDecayOptions>(options)
          );
          break;
        case PositionStyle.Logarithmic:
          y = Curves.logarithmic(
            tranposedX,
            JSON.parse<LogarithmicOptions>(options)
          );
          break;
        case PositionStyle.PowerLaw:
          y = Curves.powerLaw(tranposedX, JSON.parse<PowerLawOptions>(options));
          break;
        case PositionStyle.Step:
          y = Curves.step(tranposedX, JSON.parse<StepOptions>(options));
          break;
        case PositionStyle.Sine:
          y = Curves.sine(tranposedX, JSON.parse<SineOptions>(options));
          break;
        case PositionStyle.Triangle:
          const parsedTriangleOptions = JSON.parse<TriangleOptions>(options);

          // We are using the transposed y, which means that the period will be the max of
          // transposedX which is 10
          parsedTriangleOptions.period = 10;
          parsedTriangleOptions.amplitude = 1;
          parsedTriangleOptions.phase = 0;

          // Transpose so that we leave the magnitude of each value the same
          const transposedTriangleY = Math.abs(
            Curves.triangle(tranposedX, parsedTriangleOptions)
          );
          y = transposedTriangleY;
          break;
        case PositionStyle.Quadratic:
          y = Curves.quadratic(
            tranposedX,
            JSON.parse<QuadraticOptions>(options)
          );
          break;
        case PositionStyle.Cubic:
          y = Curves.cubic(tranposedX, JSON.parse<CubicOptions>(options));
          break;
        case PositionStyle.ExponentialGrowth:
          y = Curves.exponentialGrowth(
            tranposedX,
            JSON.parse<ExponentialGrowthOptions>(options)
          );
          break;
        case PositionStyle.LogarithmicDecay:
          y = Curves.logarithmicDecay(
            tranposedX,
            JSON.parse<LogarithmicDecayOptions>(options)
          );
          break;
        case PositionStyle.Sawtooth:
          y = Curves.sawtooth(tranposedX, JSON.parse<SawtoothOptions>(options));
          break;
        case PositionStyle.SquareWave:
          y = Curves.squareWave(
            tranposedX,
            JSON.parse<SquareWaveOptions>(options)
          );
          break;
        default:
          y = 0;
          break;
      }

      weights.push(y * 100);
      const newPosition = new Position(i32(startx), i32(endx), i32(y * 100));
      positions.push(newPosition);
    }

    if (reflect) {positions = PositionGenerator.reflectPositions(positions)}
    if (invert)  {positions = PositionGenerator.invertPositions(positions)}
    positions = PositionGenerator.floatNegativePositions(positions)
    positions = PositionGenerator.scaleWeightRange(positions)
    positions = simplifyPositions(positions)

    PositionGenerator.checkTickBounds(positions)
    PositionGenerator.checkWeightRange(positions)
    return positions;
  }

  // flip weights over y axis
  static reflectPositions(
    positions: Position[]
  ): Position[] {
    // for some reason other implementations struggled
    const newPositions = positions
    const newWeights:i32[] = []
    for (let i:i32 = positions.length -1; i > -1; i--) {
      newWeights.push(positions[i].weight)
    }
    for (let i:i32 = 0; i < positions.length; i++) {
      newPositions[i].weight = newWeights[i]
    }
    return newPositions
  }

  // flip weights over x axis
  static invertPositions(positions: Position[]): Position[] {
    // get high and low
    const newPositions = positions
    let high: i32 = positions[0].weight
    let low: i32 = positions[0].weight
    for (let i:i32 = 1; i < positions.length; i++) {
      if (positions[i].weight > high) high = positions[i].weight
      if (positions[i].weight < low) low = positions[i].weight
    }
    // reassign
    const ceilling = low + high
    for (let i:i32 = 0; i < positions.length; i++) {
      newPositions[i].weight = ceilling - positions[i].weight
    }
    return newPositions
  }

  // If we have negative weights, rise the magnitude of the negative
  static floatNegativePositions(positions: Position[]): Position[] {
    const newPositions = positions
    // get lowest weight
    let lowest = newPositions[0].weight
    for (let i:i32 = 0; i < positions.length; i++) {
      if (lowest > newPositions[i].weight) {
        lowest = newPositions[i].weight
      }
    }
    // if we have negatives, float up
    if (lowest < 0) {
      const rise = i32(Math.abs(lowest))
      for (let i:i32 = 0; i < positions.length; i++) {
        newPositions[i].weight = newPositions[i].weight + rise
      }
    }
    return newPositions
  }

  // Cannot exceed the tick bounds of 887272
  static checkTickBounds(positions: Position[]): void {
    // assuming ordered positions
    if ((positions[0].startTick < -887272) || positions[positions.length-1].endTick > 887272) throw new Error("Position's ticks out of range");
  }

  // Position's relative weight cannot exceed uint16 max value 65535
  static checkWeightRange(positions: Position[]): void {
    for (let i:i32 = 0; i < positions.length; i++) {
      if (positions[i].weight > 65535) throw new Error("Position weight overflow");
    }
  }

    // Position's relative weight cannot exceed uint16 max value 65535
    static scaleWeightRange(positions: Position[]): Position[] {
      const MAX_WEIGHT = 60000 // actually 65535 but just to be safe
      // get max and min values
      let high: i32 = positions[0].weight
      let low: i32 = positions[0].weight
      for (let i:i32 = 1; i < positions.length; i++) {
        if (positions[i].weight > high) high = positions[i].weight
        if (positions[i].weight < low) low = positions[i].weight
      }
      // determine if scaling necessary
      if (high <= MAX_WEIGHT) return positions
      // scale down
      const divisor = i32(Math.ceil(high / MAX_WEIGHT) + 2)
      const newPositions: Position[] = positions
      for (let i:i32 = 0; i < positions.length; i++) {
        newPositions[i].weight = newPositions[i].weight / divisor
      }
      return newPositions
    }

  static applyLiquidityShape(
    upperTick: number,
    lowerTick: number,
    configJson: CurvesConfigHelper,
    binWidth: i32,
    liquidityShape: PositionStyle
  ): Array<Position> {
    const positionGenerator = new PositionGenerator();
    let positions = new Array<Position>();
    switch (liquidityShape) {
      case PositionStyle.Basic: {
        positions = [new Position(i32(lowerTick), i32(upperTick), 1)];
        break;
      }
      case PositionStyle.Linear: {
        const options = new LinearOptions();
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Normalized: {
        const options = new NormalOptions();
        options.mean = upperTick + lowerTick / 2;
        options.stdDev = configJson.stdDev;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Sigmoid: {
        const options = new SigmoidOptions();
        options.k = configJson.k;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.ExponentialDecay: {
        const options = new ExponentialDecayOptions();
        options.rate = configJson.rate;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Logarithmic: {
        const options = new LogarithmicOptions();
        options.base = configJson.base;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.PowerLaw: {
        const options = new PowerLawOptions();
        options.exponent = configJson.exponent;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Step: {
        const options = new StepOptions();
        options.threshold = configJson.threshold;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Sine: {
        const options = new SineOptions();
        options.amplitude = configJson.amplitude;
        options.phase = configJson.phase;
        options.frequency = configJson.frequency;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Triangle: {
        const options = new TriangleOptions();
        options.amplitude = configJson.amplitude;
        options.phase = configJson.phase;
        options.period = configJson.period;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Quadratic: {
        const options = new QuadraticOptions();
        options.a = configJson.a;
        options.b = configJson.b;
        options.c = configJson.c;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Cubic: {
        const options = new CubicOptions();
        options.a = configJson.a;
        options.b = configJson.b;
        options.c = configJson.c;
        options.d = configJson.d;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.ExponentialGrowth: {
        const options = new ExponentialGrowthOptions();
        options.rate = configJson.rate;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.LogarithmicDecay: {
        const options = new LogarithmicDecayOptions();
        options.base = configJson.base;
        options.rate = configJson.rate;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.Sawtooth: {
        const options = new SawtoothOptions();
        options.amplitude = configJson.amplitude;
        options.phase = configJson.phase;
        options.period = configJson.period;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      case PositionStyle.SquareWave: {
        const options = new SquareWaveOptions();
        options.amplitude = configJson.amplitude;
        options.period = configJson.period;
        options.phase = configJson.phase;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options),
          configJson.reflect,
          configJson.invert
        );
        break;
      }
      default: {
        break;
      }
    }
    return positions;
  }

  static propertyHelper(include: PositionStyle[] = []): string {
    const filteredCurves: string[] = [];
    for (let curve = 0; curve < include.length; curve++) {
      filteredCurves.push(PositionStyleLookup(include[curve]));
    }
    return `"liquidityShape": {
      "enum": ${JSON.stringify(filteredCurves)},
      "title": "Liquidity Shape",
      "type": "string",
      "default": "Basic"
    }`;
  }

  static allOf(): string {
    return `{
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Linear"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean"
        }
      },
      "required": ["bins"]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Normalized"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "stdDev": {
          "type": "number",
          "title": "Standard Deviation",
          "description": "The value to use as the standard deviation when forming the Gaussian curve.",
          "detailedDescription": "The value in ticks representing the average distance from the center of the curve. Increasing this value will increase the spread or coverage of the curve.",
          "default": 5
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "stdDev"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "ExponentialDecay"
        }
      }
    },
    "then": {
      "properties": {
        "rate": {
          "type": "number",
          "title": "Rate",
          "description": "The decay constant, related to the half-life of the substance",
          "detailedDescription": "The higher the rate, the faster the decay of quantity, giving a more dramatic and steep curve."
        }
      },
      "required": [
        "rate"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Sigmoid"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "k": {
          "type": "number",
          "title": "Slope (k)",
          "default": 5,
          "description": "The slope of the curve or the steepness of the sigmoid function."
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean",
          "default": false
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "k"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Logarithmic"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "base": {
          "type": "number",
          "title": "Base",
          "description": "The base of the logarithm.",
          "detailedDescription": "Increasing this value will give the curve a sharper angle and flatten out sooner. ",
          "default": 2
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean",
          "default": false
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "base"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "PowerLaw"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "exponent": {
          "type": "number",
          "title": "Exponent",
          "description": "The exponent of the power law",
          "detailedDescription": "The inverse of this value is applied to the x value, larger values will lead to steeper curves.",
          "default": 2
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean",
          "default": false
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "exponent"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Step"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "threshold": {
          "type": "number",
          "title": "Threshold"
        }
      },
      "required": [
        "bins",
        "threshold"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Sine"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "amplitude": {
          "type": "number",
          "title": "Amplitude",
          "default": 1,
          "description": "The amplitude determines the maximum height of the sine curve. Larger numbers will result in more dramatic highs.",
          "detailedDescription": "The amplitude determines the maximum height of the sine curve. Larger numbers will result in more dramatic highs."
        },
        "frequency": {
          "type": "number",
          "title": "Frequency",
          "default": 0.5,
          "description": "The frequency determines the number of cycles (complete oscillations) the sine curve completes in one unit of distance along the x-axis. In the case of frequency 1, the sine curve completes one full cycle in one unit of distance along the x-axis.",
          "detailedDescription": "The frequency determines the number of cycles (complete oscillations) the sine curve completes in one unit of distance along the x-axis. In the case of frequency 1, the sine curve completes one full cycle in one unit of distance along the x-axis."
        },
        "phase": {
          "type": "number",
          "title": "Phase",
          "default": 0,
          "description": "The phase represents a horizontal shift of the sine curve. When the phase is 0, the curve starts at its highest point (the peak).",
          "detailedDescription": "The phase represents a horizontal shift of the sine curve. When the phase is 0, the curve starts at its highest point (the peak)."
        }
      },
      "required": [
        "bins",
        "amplitude",
        "frequency",
        "phase"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Triangle"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "amplitude": {
          "type": "number",
          "title": "Amplitude",
          "description": "The height of the triangle given on the y-axis.",
          "detailedDescription": "The amplitude of a triangle wave refers to the distance from the baseline (midpoint) of the wave to its peak (or trough). It represents the maximum deviation of the waveform from its average value."
        },
        "period": {
          "type": "number",
          "title": "Period",
          "description": "The distance taken to complete a single cycle of the triangle pattern.",
          "detailedDescription": "The period of a triangle wave is the time it takes for the wave to complete one full cycle. In other words, it's the distance along the time axis between two consecutive points that correspond to identical positions in the waveform."
        },
        "phase": {
          "type": "number",
          "title": "Phase",
          "description": "X-axis offset to the waveform cycle.",
          "detailedDescription": "Phase refers to the position of a waveform within its cycle at a specific point in time."
        }
      },
      "required": [
        "bins",
        "amplitude",
        "period",
        "phase"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Quadratic"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "a": {
          "type": "number",
          "title": "A",
          "default": 1,
          "description": "Ref: ax^2 + bx + c"
        },
        "b": {
          "type": "number",
          "title": "B",
          "default": 1,
          "description": "Ref: ax^2 + bx + c"
        },
        "c": {
          "type": "number",
          "title": "C",
          "default": 1,
          "description": "Ref: ax^2 + bx + c"
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean",
          "default": false
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "a",
        "b",
        "c"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Cubic"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "a": {
          "type": "number",
          "title": "A",
          "default": 1,
          "description": "Ref: ax^3 + bx^2 + cx + d"
        },
        "b": {
          "type": "number",
          "title": "B",
          "default": 1,
          "description": "Ref: ax^3 + bx^2 + cx + d"
        },
        "c": {
          "type": "number",
          "title": "C",
          "default": 1,
          "description": "Ref: ax^3 + bx^2 + cx + d"
        },
        "d": {
          "type": "number",
          "title": "D",
          "default": 1,
          "description": "Ref: ax^3 + bx^2 + cx + d"
        },
        "reflect": {
          "title": "Reflect Curve Over Y-Axis",
          "type": "boolean",
          "default": false
        },
        "invert": {
          "title": "Invert Curve Over X-Axis",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "bins",
        "a",
        "b",
        "c",
        "d"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "ExponentialGrowth"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "rate": {
          "type": "number",
          "title": "Rate"
        }
      },
      "required": [
        "bins",
        "rate"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "LogarithmicDecay"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "rate": {
          "type": "number",
          "title": "Rate"
        },
        "base": {
          "type": "number",
          "title": "Base"
        }
      },
      "required": [
        "bins",
        "rate",
        "base"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "Sawtooth"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "amplitude": {
          "type": "number",
          "title": "Amplitude"
        },
        "period": {
          "type": "number",
          "title": "Period"
        },
        "phase": {
          "type": "number",
          "title": "Phase"
        }
      },
      "required": [
        "bins",
        "amplitude",
        "period",
        "phase"
      ]
    }
  },
  {
    "if": {
      "properties": {
        "liquidityShape": {
          "const": "SquareWave"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions",
          "description": "The max number of positions the strategy will make to achieve the desired curve.",
          "detailedDescription": "The strategy will attempt to make this number of positions, but can be limited by available range and pool spacing"
        },
        "amplitude": {
          "type": "number",
          "title": "Amplitude"
        },
        "period": {
          "type": "number",
          "title": "Period"
        },
        "phase": {
          "type": "number",
          "title": "Phase"
        }
      },
      "required": [
        "bins",
        "amplitude",
        "period",
        "phase"
      ]
    }
  },
  {
    "required": [
      "liquidityShape"
    ]
  }`;
  }

  private computeCloseness(current: f64, lowerBound: f64, upperBound: f64): f64 {
    if (upperBound == lowerBound) {
        throw new Error("Bounds cannot be equal");
    }

    let totalDistance: f64 = f64(difference(i32(upperBound), i32(lowerBound)));
    let closeness: f64;

    if (current > upperBound) {
        let distanceFromBound: f64 = f64(difference(i32(current), i32(upperBound)));
        closeness = 1 - Math.min(distanceFromBound / totalDistance, 1.0) * 9.0;
    } else if (current < lowerBound) {
        let distanceFromBound: f64 = f64(difference(i32(lowerBound), i32(current)));
        closeness = Math.min(distanceFromBound / totalDistance, 1.0) * 9.0;
    } else {
        let distanceFromUpper: f64 = f64(difference(i32(current), i32(upperBound)));
        closeness = 1.0 + 9.0 * (distanceFromUpper / totalDistance);
    }

    return closeness > 0 ? abs(closeness) : 0;
  }
}

// export function generatePositions(
//   upperBound: number,
//   lowerBound: number,
//   width: number,
//   style: PositionStyle,
//   options: string
// ): String {
//   const generator = new PositionGenerator();
//   const positions = generator.generate(
//     i32(upperBound),
//     i32(lowerBound),
//     width,
//     style,
//     options,
    
//   );
//   return JSON.stringify(positions);
// }

function difference(a: i64, b: i64): i64 {
  let diff: i64;
  if (a < 0 && b < 0) {
    diff = a - b;
  } else if (a < 0) {
    diff = a + b;
  } else if (b < 0) {
    diff = a + b;
  } else {
    diff = a - b;
  }

  return abs(f64(diff));
}

function abs(x: f64): f64 {
  return x < 0 ? -x : x;
}


