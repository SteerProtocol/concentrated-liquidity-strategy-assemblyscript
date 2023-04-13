import { Position } from "@steerprotocol/strategy-utils/assembly";
import { JSON } from "json-as/assembly";
import { Curves } from "./Curves";
import {
  CubicOptions,
  CurvesConfigHelper,
  ExponentialDecayOptions,
  ExponentialGrowthOptions,
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

export class PositionGenerator {
  constructor() {}

  public generate(
    upperBound: number,
    lowerBound: number,
    segmentWidth: number,
    style: PositionStyle,
    options: string
  ): Array<Position> {
    const numberOfPoints = 200;
    const positions: Array<Position> = [];
    const weights: Array<f64> = [];
    let minY = Infinity;

    for (
      let i = Math.ceil(lowerBound / segmentWidth) * segmentWidth;
      i < upperBound;
      i += segmentWidth
    ) {
      const startx = i;
      const endx = startx + segmentWidth;
      let y: f64;

      switch (style) {
        case PositionStyle.Absolute:
        case PositionStyle.Linear:
          y = 10000;
          break;
        case PositionStyle.Normalized:
          y = Curves.normal(startx, JSON.parse<NormalOptions>(options));
          break;
        case PositionStyle.Sigmoid:
          y = Curves.sigmoid(startx, JSON.parse<SigmoidOptions>(options));
          break;
        case PositionStyle.ExponentialDecay:
          y = Curves.exponentialDecay(
            startx,
            JSON.parse<ExponentialDecayOptions>(options)
          );
          break;
        case PositionStyle.Logarithmic:
          y = Curves.logarithmic(
            startx,
            JSON.parse<LogarithmicOptions>(options)
          );
          break;
        case PositionStyle.PowerLaw:
          y = Curves.powerLaw(startx, JSON.parse<PowerLawOptions>(options));
          break;
        case PositionStyle.Step:
          y = Curves.step(startx, JSON.parse<StepOptions>(options));
          break;
        case PositionStyle.Sine:
          y = Curves.sine(startx, JSON.parse<SineOptions>(options));
          break;
        case PositionStyle.Triangle:
          y = Curves.triangle(startx, JSON.parse<TriangleOptions>(options));
          break;
        case PositionStyle.Quadratic:
          y = Curves.quadratic(startx, JSON.parse<QuadraticOptions>(options));
          break;
        case PositionStyle.Cubic:
          y = Curves.cubic(startx, JSON.parse<CubicOptions>(options));
          break;
        case PositionStyle.ExponentialGrowth:
          y = Curves.exponentialGrowth(
            startx,
            JSON.parse<ExponentialGrowthOptions>(options)
          );
          break;
        case PositionStyle.LogarithmicDecay:
          y = Curves.logarithmicDecay(
            startx,
            JSON.parse<LogarithmicDecayOptions>(options)
          );
          break;
        case PositionStyle.Sawtooth:
          y = Curves.sawtooth(startx, JSON.parse<SawtoothOptions>(options));
          break;
        case PositionStyle.SquareWave:
          y = Curves.squareWave(startx, JSON.parse<SquareWaveOptions>(options));
          break;
        default:
          y = 0;
          break;
      }

      weights.push(y);
      const newPosition = new Position(i32(startx), i32(endx), i32(y));
      positions.push(newPosition);
    }

    const scalingFactor: f64 = 0.0001;
    const newMin: f64 = 1; // Set your desired minimum value
    const newMax: f64 = 10000; // Set your desired maximum value
    let maxWeight: f64 = -Infinity;

    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      minY = Math.min(minY, weight);
      maxWeight = Math.max(maxWeight, weight);
    }

    // Normalize positions based on minY, newMin, and newMax
    for (let i = 0; i < positions.length; i++) {
      const normalizedWeight = i32(
        ((weights[i] - minY) * (newMax - newMin)) / (maxWeight - minY) + newMin
      );
      positions[i].weight = normalizedWeight;
    }

    return positions;
  }

  static applyLiquidityShape(
    upperTick: number,
    lowerTick: number,
    configJson: CurvesConfigHelper,
    binWidth: i32
  ): Array<Position> {
    const positionGenerator = new PositionGenerator();
    let positions = new Array<Position>();
    switch (configJson.liquidityShape) {
      case PositionStyle.Absolute:
      case PositionStyle.Linear:
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          configJson.liquidityShape,
          ""
        );
        break;
      case PositionStyle.Normalized: {
        const options = new NormalOptions();
        options.mean = configJson.mean;
        options.stdDev = configJson.stdDev;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          configJson.liquidityShape,
          JSON.stringify(options)
        );
      }
      case PositionStyle.Sigmoid: {
        const options = new SigmoidOptions();
        options.k = configJson.k;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          configJson.liquidityShape,
          JSON.stringify(options)
        );
      }
      case PositionStyle.ExponentialDecay: {
        const options = new ExponentialDecayOptions();
        options.rate = configJson.rate;
        positions = positionGenerator.generate(
          i32(upperTick),
          i32(lowerTick),
          binWidth,
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
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
          configJson.liquidityShape,
          JSON.stringify(options)
        );
        break;
      }
    }
    return positions;
  }

  static propertyHelper(omit: PositionStyle[] = []): string {
    const curveList = [
      PositionStyle.Normalized,
      PositionStyle.Linear,
      PositionStyle.ExponentialDecay,
      PositionStyle.Sigmoid,
      PositionStyle.Logarithmic,
      PositionStyle.PowerLaw,
      PositionStyle.Step,
      PositionStyle.Sine,
      PositionStyle.Triangle,
      PositionStyle.Quadratic,
      PositionStyle.Cubic,
      PositionStyle.ExponentialGrowth,
      PositionStyle.LogarithmicDecay,
      PositionStyle.Sawtooth,
      PositionStyle.SquareWave,
    ];

    const filteredCurves: string[] = [];
    for(let curve = 0; curve < curveList.length; curve++){
      if (!omit.includes(curveList[curve])) {
        filteredCurves.push(PositionStyleLookup(curveList[curve]));
      }
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
      "properties": {},
      "required": []
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "mean": {
          "type": "number",
          "title": "Mean"
        },
        "stdDev": {
          "type": "number",
          "title": "Standard Deviation"
        }
      },
      "required": [
        "binSizeMultiplier",
        "mean",
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
          "title": "Rate"
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "k": {
          "type": "number",
          "title": "K"
        }
      },
      "required": [
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "base": {
          "type": "number",
          "title": "Base"
        }
      },
      "required": [
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "exponent": {
          "type": "number",
          "title": "Exponent"
        }
      },
      "required": [
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "threshold": {
          "type": "number",
          "title": "Threshold"
        }
      },
      "required": [
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
        },
        "rate": {
          "type": "number",
          "title": "Rate"
        }
      },
      "required": [
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
        "binSizeMultiplier": {
          "type": "number",
          "title": "Position Scale"
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
        "binSizeMultiplier",
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
