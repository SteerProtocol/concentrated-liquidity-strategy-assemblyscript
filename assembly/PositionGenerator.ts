import { Position } from "@steerprotocol/strategy-utils/assembly";
import { CubicOptions, ExponentialGrowthOptions, LogarithmicDecayOptions, NormalOptions, PositionStyle, QuadraticOptions, SawtoothOptions, SquareWaveOptions } from "./types";
import { JSON } from "json-as/assembly";
import { Curves } from "./Curves";
import {
  SigmoidOptions,
  ExponentialDecayOptions,
  LogarithmicOptions,
  PowerLawOptions,
  StepOptions,
  SineOptions,
  TriangleOptions,
} from "./types";

export class PositionGenerator {

  constructor() {}

  segmentize(
    numSegments: i32,
    curveType: PositionStyle,
    options: string
  ): Array<f64> {
    const curve: Array<f64> = [];
    const interval = 1 / numSegments;

    for (let i = 0; i <= numSegments; i++) {
      const t = i * interval;
      let y: f64;
      switch (curveType) {
        case PositionStyle.Normalized:
          y = Curves.normal(t, JSON.parse<NormalOptions>(options));
          break;
        case PositionStyle.Sigmoid:
          y = Curves.sigmoid(t, JSON.parse<SigmoidOptions>(options))
          break;
        case PositionStyle.ExponentialDecay:
          y = Curves.exponentialDecay(t, JSON.parse<ExponentialDecayOptions>(options))
          break;
        case PositionStyle.Logarithmic:
          y = Curves.logarithmic(t, JSON.parse<LogarithmicOptions>(options))
          break;
        case PositionStyle.PowerLaw:
          y = Curves.powerLaw(t, JSON.parse<PowerLawOptions>(options))
          break;
        case PositionStyle.Step:
          y = Curves.step(t, JSON.parse<StepOptions>(options))
          break;
        case PositionStyle.Sine:
          y = Curves.sine(t, JSON.parse<SineOptions>(options))
          break;
        case PositionStyle.Triangle:
          y = Curves.triangle(t, JSON.parse<TriangleOptions>(options))
          break;
        case PositionStyle.Quadratic:
          y = Curves.quadratic(t, JSON.parse<QuadraticOptions>(options));
          break;
        case PositionStyle.Cubic:
          y = Curves.cubic(t, JSON.parse<CubicOptions>(options));
          break;
        case PositionStyle.ExponentialGrowth:
          y = Curves.exponentialGrowth(t, JSON.parse<ExponentialGrowthOptions>(options));
          break;
        case PositionStyle.LogarithmicDecay:
          y = Curves.logarithmicDecay(t, JSON.parse<LogarithmicDecayOptions>(options));
          break;
        case PositionStyle.Sawtooth:
          y = Curves.sawtooth(t, JSON.parse<SawtoothOptions>(options));
          break;
        case PositionStyle.SquareWave:
          y = Curves.squareWave(t, JSON.parse<SquareWaveOptions>(options));
          break;
        default:
          y = 0;
          break;
      }

      curve.push(y);
    }

    return curve;
  }

  private floatToUint16(value: number): number {
    return value < 0 ? 0 : value > 65535 ? 65535 : Math.floor(value);
  }

  private convertSegmentsToWeights(segments: Array<f64>): Array<u16> {
    let weights: Array<u16> = [];
    for (let i: i32 = 0; i < segments.length; i++) {
      weights[i] = u16(this.floatToUint16(segments[i] * 10000.0));
    }
    return weights;
  }

  private createPositionByBounds(
    upperBound: number,
    lowerBound: number,
    width: number
  ): number[][] {
    let segments: number[][] = [];
    let currentStart = lowerBound;

    while (currentStart + width <= upperBound) {
      let currentEnd = currentStart + width;
      segments.push([currentStart, currentEnd]);
      currentStart = currentEnd;
    }

    if (currentStart < upperBound) {
      segments.push([currentStart, upperBound]);
    }

    return segments;
  }

  public generate(
    upperBound: i32,
    lowerBound: i32,
    width: number,
    style: PositionStyle,
    options: string
  ): Position[] {
    switch (style) {
      case PositionStyle.Absolute:
        return [new Position(lowerBound, upperBound, 1)];
      case PositionStyle.Normalized: {
        const segments = this.createPositionByBounds(
          upperBound,
          lowerBound,
          width
        );
        const weights = this.convertSegmentsToWeights(
          this.segmentize(segments.length, style, options)
        );
        let positions: Array<Position> = [];
        for (let i: i32 = 0; i < segments.length; i++) {
          let segment = segments[i];
          let startBound = i32(segment[0]);
          let endBound = i32(segment[1]);
          let weight = i32(weights[i]);
          positions[i] = new Position(startBound, endBound, weight);
        }
        return positions;
      }
      default:
        throw new Error("Position style not supported");
    }
  }
}

export function generatePositions(upperBound: number, lowerBound: number, width: number, style: PositionStyle, options: string): Position[] {
  const generator = new PositionGenerator();
  return generator.generate(i32(upperBound), i32(lowerBound), width, style, options);
}  