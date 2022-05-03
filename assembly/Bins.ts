export type Bins = Array<f32>;

export class BinsResult {
  constructor(
      public startTick : f32,
      public bins: Bins
  ) {}
}