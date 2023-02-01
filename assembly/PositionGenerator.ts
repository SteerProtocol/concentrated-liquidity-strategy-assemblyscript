import { Position } from "@steerprotocol/strategy-utils";
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

  private segmentize(): number[] {
    const step = (4 * this.stdDeviation) / this.segments;
    const xMin = this.mean - 2 * this.stdDeviation;
    const xMax = this.mean + 2 * this.stdDeviation;
    const xValues = new Array(this.segments + 1).map((_, i) => xMin + i * step);
    return xValues.map((x) => this.normalize(x));
  }

  private floatToUint16(value: number): number {
    return value < 0 ? 0 : value > 65535 ? 65535 : Math.floor(value);
  }

  private convertSegmentsToWeights(segments: number[]): number[] {
    return segments.map((val) => this.floatToUint16(val * 10000));
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
    upperBound: number,
    lowerBound: number,
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

        return segments.map((segment, index) => {
          return new Position(segment[0], segment[1], weights[index]);
        });
      }
      default:
        throw new Error("Position style not supported");
    }
  }
}
