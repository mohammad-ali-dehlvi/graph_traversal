import type { PointType } from "./Point";
import { Point } from "./Point";


type LineType = {
    a: number;
    b: number;
    c: number;
} | {
    m: number;
    c: number;
} | {
    p1: PointType | Point
    p2: PointType | Point
}

export class Line {
    // ax+by+c=0
    a: number;
    b: number;
    c: number;
    constructor(obj: LineType) {
        if ("a" in obj) {
            const { a, b, c } = obj
            this.a = a;
            this.b = b;
            this.c = c;
        } else if ("m" in obj) {
            const { m, c } = obj
            this.a = m;
            this.b = -1;
            this.c = c
        } else {
            const { p1, p2 } = obj
            const { x: x1, y: y1 } = p1
            const { x: x2, y: y2 } = p2

            if ((new Point(p1)).isEqual(p2)) {
                throw Error("Points must be different")
            }

            this.a = y1 - y2;
            this.b = x2 - x1;
            this.c = x1 * y2 - x2 * y1
        }
    }

    getPointsAtDistance(point: PointType | Point, d: number) {
        const { x: x0, y: y0 } = point;

        // Denominator for projection and normalization
        const denom = this.a * this.a + this.b * this.b;

        if (denom === 0) {
            throw new Error("Invalid line: a and b cannot both be zero.");
        }

        // 1. Project point onto the line
        const k = (this.a * x0 + this.b * y0 + this.c) / denom;

        const xp = x0 - this.a * k;
        const yp = y0 - this.b * k;

        // 2. Unit direction vector of the line
        const mag = Math.sqrt(denom);
        const ux = this.b / mag;
        const uy = -this.a / mag;

        // 3. Two points at ± d
        return {
            p1: new Point({ x: xp + d * ux, y: yp + d * uy }),
            p2: new Point({ x: xp - d * ux, y: yp - d * uy })
        };
    }
}