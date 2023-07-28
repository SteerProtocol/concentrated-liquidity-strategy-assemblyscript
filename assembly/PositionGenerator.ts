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
import { PositionOptimizer } from "./PositionsOptimizer";

export class PositionGenerator {
  constructor() {}

  public generate(
    upperBound: number,
    lowerBound: number,
    segmentWidth: number,
    style: PositionStyle,
    options: string
  ): Array<Position> {
    const positions: Array<Position> = [];
    const weights: Array<f64> = [];
    let minY = Infinity;
    
    for (
      let i = lowerBound;
      i < upperBound;
      i += segmentWidth
    ) {
      
      console.log('generating position')
      
      const startx = i;
      const endx = startx + segmentWidth;
      const midPoint = (startx + endx) / 2;

      let y: f64;
      
      console.log('midPoint: ' + midPoint.toString())
      
      const tranposedX = this.computeCloseness(midPoint, lowerBound, upperBound);

      console.log(': ' + tranposedX.toString())

      switch (style) {
        case PositionStyle.Absolute:
          y = 1;
          break;
        case PositionStyle.Linear:
          y = tranposedX
          break;
        case PositionStyle.Normalized:
          const parsedOptions = JSON.parse<NormalOptions>(options)
          parsedOptions.mean = this.computeCloseness((upperBound + lowerBound) / 2, lowerBound, upperBound);
          y = Curves.normal(tranposedX, parsedOptions);
          break;
        case PositionStyle.Sigmoid:
          // +5 shifts and makes the curve always positive
          // perfect for 0-10 plots
          y = Curves.sigmoid(tranposedX - 5, JSON.parse<SigmoidOptions>(options));
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
          const transposedTriangleY = Math.abs(Curves.triangle(tranposedX, parsedTriangleOptions));
          y = transposedTriangleY;
          break;
        case PositionStyle.Quadratic:
          y = Curves.quadratic(tranposedX, JSON.parse<QuadraticOptions>(options));
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
          y = Curves.squareWave(tranposedX, JSON.parse<SquareWaveOptions>(options));
          break;
        default:
          y = 0;
          break;
      }

      weights.push(y * 100);
      const newPosition = new Position(i32(startx), i32(endx), i32(y * 100));
      positions.push(newPosition);
      console.log('generated position')
    }

    // const scalingFactor: f64 = 0.0001;
    // const newMin: f64 = 1; // Set your desired minimum value
    // const newMax: f64 = 10000; // Set your desired maximum value
    // let maxWeight: f64 = -Infinity;

    // for (let i = 0; i < weights.length; i++) {
    //   const weight = weights[i];
    //   minY = Math.min(minY, weight);
    //   maxWeight = Math.max(maxWeight, weight);
    // }

    // // Normalize positions based on minY, newMin, and newMax
    // for (let i = 0; i < positions.length; i++) {
    //   const normalizedWeight = i32(
    //     ((weights[i] - minY) * (newMax - newMin)) / (maxWeight - minY) + newMin
    //   );
    //   positions[i].weight = normalizedWeight;
    // }

    return positions;
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
      case PositionStyle.Absolute: {
        positions = [new Position(i32(lowerTick), i32(upperTick), 1)]
        break;
      }
      case PositionStyle.Linear: {
        const options = new LinearOptions();
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          liquidityShape,
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
          JSON.stringify(options)
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
    for(let curve = 0; curve < include.length; curve++){
      filteredCurves.push(PositionStyleLookup(include[curve]));
    }
    return `"liquidityShape": {
      "enum": ${JSON.stringify(filteredCurves)},
      "title": "Liquidity Shape",
      "type": "string",
      "default": "Linear"
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
          "title": "Positions"
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
          "title": "Positions"
        },
        "stdDev": {
          "type": "number",
          "title": "Standard Deviation"
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
          "description": "Rate of decay",
          "detailedDescription": "The higher the rate, the faster the decay."
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
          "title": "Positions"
        },
        "k": {
          "type": "number",
          "title": "K"
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
          "title": "Positions"
        },
        "base": {
          "type": "number",
          "title": "Base"
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
          "title": "Positions"
        },
        "exponent": {
          "type": "number",
          "title": "Exponent"
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
          "title": "Positions"
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
          "title": "Positions"
        },
        "amplitude": {
          "type": "number",
          "title": "Amplitude"
        },
        "frequency": {
          "type": "number",
          "title": "Frequency"
        },
        "phase": {
          "type": "number",
          "title": "Phase"
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
          "title": "Positions"
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
          "const": "Quadratic"
        }
      }
    },
    "then": {
      "properties": {
        "bins": {
          "type": "number",
          "title": "Positions"
        },
        "a": {
          "type": "number",
          "title": "A"
        },
        "b": {
          "type": "number",
          "title": "B"
        },
        "c": {
          "type": "number",
          "title": "C"
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
          "title": "Positions"
        },
        "a": {
          "type": "number",
          "title": "A"
        },
        "b": {
          "type": "number",
          "title": "B"
        },
        "c": {
          "type": "number",
          "title": "C"
        },
        "d": {
          "type": "number",
          "title": "D"
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
          "title": "Positions"
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
          "title": "Positions"
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
          "title": "Positions"
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
          "title": "Positions"
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

  private computeCloseness(current: number, lowerBound: number, upperBound: number): number {

    if (upperBound === lowerBound) {

      console.log("Bounds cannot be equal")
      throw new Error("Bounds cannot be equal");
    }
    if (current > upperBound || current < lowerBound) {
      
      if(current > upperBound){
        return 10
      }
      
      if(current < lowerBound){
        console.log('current: ' + current.toString())
        console.log('lowerBound: ' + lowerBound.toString())
        return 0
      }
      
    }
  
    // Calculate the total distance between bounds
    const totalDistance = difference(i32(upperBound), i32(lowerBound));

    // Calculate how far the current is from the upper bound
    const distanceFromUpper = difference(i32(current), i32(upperBound));

    // Calculate relative closeness to upper bound
    let closeness = 1.0 + 9.0 * f32(f32(distanceFromUpper) /f32(totalDistance));
    
    return closeness;
  }
}

export function generatePositions(
  upperBound: number,
  lowerBound: number,
  width: number,
  style: PositionStyle,
  options: string
): String {
  const generator = new PositionGenerator();
  const positions = generator.generate(
    i32(upperBound),
    i32(lowerBound),
    width,
    style,
    options
  );
  return JSON.stringify(positions);
}

function difference(a: i32, b: i32): i32 {
  let diff: i32;
  if (a < 0 && b < 0) {
    diff = ((a)) - ((b));
  } else if (a < 0) {
    diff = ((a)) + b;
  } else if (b < 0) {
    diff = a + ((b));
  } else {
    diff = a - b;
  }
  
  return abs(diff);
}

function abs(x: i32): i32 {
  return x < 0 ? -x : x;
}