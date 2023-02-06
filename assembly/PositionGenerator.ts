import { Position } from "@steerprotocol/strategy-utils/assembly";
import { PositionStyle } from "./types";

export class PositionGenerator {
  private mean: number;
  private stdDeviation: number;
  private segments: number;

  constructor(mean: number, stdDeviation: number, segments: number) {
    this.mean = mean;
    this.stdDeviation = stdDeviation;
    this.segments = segments;
  }

  private normalize(x: number): number {
    const numerator = Math.exp(
      (-1 * (x - this.mean) ** 2) / (2 * this.stdDeviation ** 2)
    );
    const denominator = Math.sqrt(2 * Math.PI * this.stdDeviation ** 2);
    return numerator / denominator;
  }

  private segmentize(): Array<f64> {
    let step: f64 = (4.0 * this.stdDeviation) / this.segments;
    let xMin: f64 = this.mean - 2.0 * this.stdDeviation;
    let xMax: f64 = this.mean + 2.0 * this.stdDeviation;
    let xValuesArray = new Array<f64>(i32(this.segments) + i32(1));
    for (let i: i32 = 0; i < xValuesArray.length; i++) {
      xValuesArray[i] = xMin + i * step;
    }
    let xValues: Array<f64> = [];
    for (let i: i32 = 0; i < xValuesArray.length; i++) {
      xValues[i] = xValuesArray[i];
    }
    let normalizedXValues: Array<f64> = [];
    for (let i: i32 = 0; i < xValues.length; i++) {
      normalizedXValues[i] = this.normalize(xValues[i]);
    }
    return normalizedXValues;
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
    style: PositionStyle
  ): Position[] {
    switch (style) {
      case PositionStyle.ABSOLUTE:
        return [new Position(lowerBound, upperBound, 1)];
      case PositionStyle.NORMALIZED: {
        const segments = this.createPositionByBounds(
          upperBound,
          lowerBound,
          width
        );
        const weights = this.convertSegmentsToWeights(this.segmentize());

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
