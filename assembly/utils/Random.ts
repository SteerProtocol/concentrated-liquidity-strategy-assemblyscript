export class Random {
    private seed: number;

    constructor() {
        this.seed = Math.floor(Math.random() * 2147483647);
    }

    private next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed;
    }

    public nextInt(max: number): number {
        return Math.floor(this.next() % max);
    }

    public nextDouble(): number {
        return this.next() / 2147483647;
    }

    public nextBoolean(): boolean {
        return this.next() % 2 === 0;
    }
}