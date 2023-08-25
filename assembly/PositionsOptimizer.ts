import { Position } from "@steerprotocol/strategy-utils/assembly";

export class PositionOptimizer {
    constructor() {

    }

    static optimize(positions: Array<Position>, numBins: number): Array<Position> {
        let sortedPositions = positions.sort((a, b) => a.weight - b.weight);
        let binSize = sortedPositions.length / numBins;
        let bins = new Array<Array<Position>>(numBins);
        let binIndex = 0;
        let currentBinSize = 0;
        for (let i = 0; i < sortedPositions.length; i++) {
            if (currentBinSize >= binSize && binIndex < numBins - 1) {
                binIndex++;
                currentBinSize = 0;
            }
            if (!bins[binIndex]) {
                bins[binIndex] = new Array<Position>();
            }
            bins[binIndex].push(sortedPositions[i]);
            currentBinSize++;
        }
        let result = new Array<Position>();
        for (let i = 0; i < bins.length; i++) {
            let bin = bins[i];
            if (bin) {
                let binWeight = bin.reduce((sum, p) => sum + p.weight, 0);
                let binStartTick = bin[0].startTick;
                let binEndTick = bin[bin.length - 1].endTick;
                result.push(new Position(binStartTick, binEndTick, binWeight));
            }
        }
        return result;
    }
}

export function simplifyPositions(positions: Array<Position>): Array<Position> {

    // loop through and try to combine if the weights are the same
    const newPositions: Position[] = []
    for (let i = 0; i < positions.length; i++) {
        let matchingBins = 0
        let lastTick = positions[i].endTick
        // check how many match
        for (let j = i+1; j < positions.length; j++) {
            if (positions[i].weight == positions[j].weight) {
                matchingBins += 1
                lastTick = positions[j].endTick
            }
            else {
                break
            }
            
        }
        // add matching to positions
        newPositions.push(new Position(positions[i].startTick, lastTick, positions[i].weight))
        i += matchingBins
    }
    return newPositions
}