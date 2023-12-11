import { JSON } from "json-as/assembly";
import { ExecutionContext, Position } from "@steerprotocol/strategy-utils/assembly";

@json
export class ALMExecutionContext extends ExecutionContext {
  positions: Array<Position> = [];
  currentTick: number = 0;
  lastExecutionTime: number = 0;
}