import { setContextOptions, type ContextOptionsType } from "./functions";
import { Line } from "./Line";

export type PointType = { x: number; y: number }

export class Point {
    x: number;
    y: number;
    center: PointType;

    constructor(obj: PointType | Point,) {
        const { x, y } = obj
        this.x = x
        this.y = y
        this.center = { x: 0, y: 0 }
    }

    clone() {
        return new Point(this)
    }

    add(p: PointType | Point, options?: { modifyOriginal?: boolean }) {
        const { modifyOriginal = false } = options || {}
        const point = modifyOriginal ? this : new Point(this)
        point.x = point.x + p.x;
        point.y = point.y + p.y;

        return point
    }

    isEqual(p: PointType | Point) {
        return p.x === this.x && p.y === this.y;
    }

    slope(p: PointType | Point) {
        const { x: x1, y: y1 } = this
        const { x: x2, y: y2 } = p

        return (y2 - y1) / (x2 - x1)
    }

    distance(p: PointType | Point) {
        const { x: x1, y: y1 } = this;
        const { x: x2, y: y2 } = p
        return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))
    }

    toVector() {
        return new Vector({ i: this.x, j: this.y })
    }

    transformCenter(c: PointType | Point) {
        const p = new Point(this)
        const newCenter = new Point(c)
        const oldCenter = new Point(this.center)
        if (!oldCenter.isEqual(newCenter)) {
            p.x = p.x + (oldCenter.x - oldCenter.x)
            p.y = p.y + (newCenter.y - oldCenter.y)
            p.center = newCenter
        }
        return p
    }

    willBehaveAs(center: PointType | Point) {
        const newCenter = new Point(center)
        const { x, y } = this
        return new Point({
            x: x - newCenter.x,
            y: y - newCenter.y
        })
    }

    draw(ctx: CanvasRenderingContext2D | null, options?: { radius?: number } & ContextOptionsType) {
        const { radius = 2, ...rest } = options || {}
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
        setContextOptions(ctx, rest)
    }
}


export type VectorType = { i: number; j: number }

export class Vector {
    i: number;
    j: number;
    center = new Point({ x: 0, y: 0 })
    constructor(obj: VectorType | Vector) {
        const { i, j } = obj
        this.i = i;
        this.j = j;
    }

    add(v: VectorType | Vector, options?: { modifyOriginal?: boolean }) {
        const { modifyOriginal = false } = options || {}
        v = new Vector(v)

        const vec = modifyOriginal ? this : new Vector(this)

        vec.i = vec.i + v.i
        vec.j = vec.j + v.j

        return vec
    }

    subtract(v: VectorType | Vector, options?: { modifyOriginal?: boolean }) {
        const { modifyOriginal = false } = options || {}
        v = new Vector(v);

        const vec = modifyOriginal ? this : new Vector(this)

        vec.i = vec.i - v.i
        vec.j = vec.j - v.j

        return vec
    }

    toPoint() {
        return new Point({
            x: this.i,
            y: this.j
        })
    }

    transformCenter(c: { x: 0, y: 0 } | Point) {
        c = new Point(c)
        const v = new Vector(this)
        const newCenterVector = c.toVector()
        const oldCenterVector = v.center.toVector()
        if (!c.isEqual(v.center)) {

            v.add(oldCenterVector.subtract(newCenterVector), { modifyOriginal: true })
            v.center = c;
        }
        return v
    }

    draw(ctx: CanvasRenderingContext2D | null, fromPoint: Point, options?: ContextOptionsType) {
        if (!ctx) return

        const { x, y } = fromPoint

        ctx.beginPath()
        ctx.moveTo(x, y)


        setContextOptions(ctx, options)
    }
}

export class VectorPoint {
    vector: Vector;
    point: Point;

    constructor(obj: { vector: VectorType | Vector; point: PointType | Point }) {
        const { vector, point } = obj
        this.point = new Point(point)
        this.vector = new Vector(vector)
    }

    draw(ctx: CanvasRenderingContext2D | null, options?: { pointStyle?: { radius?: number } & ContextOptionsType; vectorStyle?: { length: number } & ContextOptionsType }) {
        const { pointStyle, vectorStyle } = options || {}
        if (!ctx) return

        this.point.draw(ctx, pointStyle)

        const p1 = this.point;
        const p2 = this.point.add(this.vector.toPoint())

        if (vectorStyle) {
            const startPoint = p1;
            const endPoint = (() => {
                const line = new Line({ p1, p2 })
                const { p1: tempP1, p2: tempP2 } = line.getPointsAtDistance(p1, vectorStyle?.length || 5)
                const dist1 = p2.distance(tempP1)
                const dist2 = p2.distance(tempP2)

                if (dist1 < dist2) {
                    return tempP1
                }
                return tempP2
            })()

            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)

            const { x: x1, y: y1 } = startPoint
            const { x: x2, y: y2 } = endPoint
            const headLength = startPoint.distance(endPoint) * 0.5
            const angle = Math.atan2(y2 - y1, x2 - x1);
            // Draw arrow head
            ctx.lineTo(
                x2 - headLength * Math.cos(angle - Math.PI / 6),
                y2 - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(x2, y2);
            ctx.lineTo(
                x2 - headLength * Math.cos(angle + Math.PI / 6),
                y2 - headLength * Math.sin(angle + Math.PI / 6)
            );
            setContextOptions(ctx, vectorStyle)
        }
    }
}