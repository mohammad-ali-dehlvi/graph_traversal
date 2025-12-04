import { EquationParser, type MathFunction } from "./equationParser";
import { scaleVectorToRange } from "./functions";
// import { commonDivisorAt, lowestCommonDivisor } from "./functions";
import { Point, Vector, VectorPoint, type PointType } from "./Point";

type CenterType = "center" | "top" | "right" | "bottom" | "left" | "top_left" | "top_right" | "bottom_left" | "bottom_right" | PointType

export class FlowField {
    xFlow: string
    yFlow: string
    xEquation: MathFunction
    yEquation: MathFunction
    constructor(obj: { xFlow: string; yFlow: string }) {
        const { xFlow, yFlow } = obj
        this.xFlow = xFlow
        this.yFlow = yFlow
        const eqParser = new EquationParser()
        this.xEquation = eqParser.parseEquation(xFlow)
        this.yEquation = eqParser.parseEquation(yFlow)
    }

    private getCanvasDimensions(canvas: HTMLCanvasElement) {
        const width = canvas.width || canvas.offsetWidth
        const height = canvas.height || canvas.offsetHeight
        return { width, height }
    }

    private getCenter(canvas: HTMLCanvasElement, c: CenterType) {
        const { width, height } = this.getCanvasDimensions(canvas)
        if (c === "center") {
            return new Point({ x: width / 2, y: height / 2 })
        }
        else if (c === "top") {
            return new Point({ x: width / 2, y: 0 })
        } else if (c === "bottom") {
            return new Point({ x: width / 2, y: height })
        } else if (c === "right") {
            return new Point({ x: width, y: height / 2 })
        } else if (c === "left") {
            return new Point({ x: width / 2, y: height / 2 })
        } else if (c === "top_left") {
            return new Point({ x: 0, y: 0 })
        } else if (c === "top_right") {
            return new Point({ x: width, y: 0 })
        } else if (c === "bottom_right") {
            return new Point({ x: width, y: height })
        } else if (c === "bottom_left") {
            return new Point({ x: 0, y: height })
        } else {
            return new Point(c)
        }
    }

    drawVectorField(canvas: HTMLCanvasElement, options?: { center?: CenterType; clearBeforeDraw?: boolean; pointField?: { xCount?: number; yCount?: number } }) {
        const {
            center: c = "center",
            clearBeforeDraw = false,
            pointField = {}
        } = options || {}
        const { xCount = 20, yCount = 20 } = pointField
        const { width, height } = this.getCanvasDimensions(canvas)

        const ctx = canvas.getContext("2d")

        if (!ctx) return

        if (clearBeforeDraw) {
            ctx.clearRect(0, 0, width, height)
        }

        const center = this.getCenter(canvas, c)

        const a = width / xCount
        const b = height / yCount

        const n = Math.min(a, b)

        const vectorPoints: VectorPoint[] = []
        for (let i = 0; i < yCount; i++) {
            for (let j = 0; j < xCount; j++) {
                const x = (j * a) + (a / 2)
                const y = (i * b) + (b / 2)

                const p = (new Point({ x, y }))

                const tempP = p.willBehaveAs(center)
                const { x: tempX, y: tempY } = tempP

                const vi = this.xEquation(tempX, tempY)
                const vj = this.yEquation(tempX, tempY)

                const v = (new Vector({ i: vi, j: vj }))

                const vp = new VectorPoint({ vector: v, point: p })

                vp.draw(ctx, { pointStyle: { radius: n / 15, fillStyle: "rgba(0,0,0,0.5)" }, vectorStyle: { length: n / 2, strokeStyle: "black" } })

                // ctx.beginPath()
                // ctx.font = "10px serif"
                // ctx.fillText(`(${tempX.toFixed(2)}, ${tempY.toFixed(2)})`, p.x, p.y)

                vectorPoints.push(vp)
            }
        }
    }

    animateParticles(canvas: HTMLCanvasElement, options?: { center?: CenterType }) {
        const { center: c = "center" } = options || {}
        const { width, height } = this.getCanvasDimensions(canvas)
        const center = this.getCenter(canvas, c)
        const ctx = canvas.getContext("2d")
        let particles: Point[] = []

        const LIMITER = 1
        let animationFrameId: number

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)

            ctx?.clearRect(0, 0, width, height)
            particles.forEach((item) => {
                // draw code
                item.draw(ctx, { radius: 5, fillStyle: "red", })

                // update code
                const tempP = item.willBehaveAs(center)
                const tempX = tempP.x
                const tempY = tempP.y

                const tempDx = this.xEquation(tempX, tempY)
                const tempDy = this.yEquation(tempX, tempY)

                const { dx, dy } = scaleVectorToRange(item, { x: item.x + tempDx, y: item.y + tempDy })

                item.x += dx / LIMITER;
                item.y += dy / LIMITER;
            })
        }
        animate()

        const getRandom = (min: number, max: number) => (Math.random() * (max - min)) + min

        const d = Math.max(width, height)

        for (let i = 0; i < 500; i++) {
            const p = new Point({
                x: getRandom(0, d),
                y: getRandom(0, d)
            })
            particles.push(p)
            // setTimeout(() => {
            //     particles = particles.filter(e => e != p)
            // }, getRandom(15 * 1000, 30 * 1000))
        }

        // let intervalId = setInterval(() => {
        //     for (let i = 0; i < 5; i++) {
        //         const p = new Point({
        //             x: getRandom(0, width),
        //             y: getRandom(0, height)
        //         })
        //         particles.push(p)
        //         setTimeout(() => {
        //             particles = particles.filter(e => e != p)
        //         }, getRandom(15 * 1000, 30 * 1000))
        //     }
        // }, 2 * 1000)

        return function cleanup() {
            cancelAnimationFrame(animationFrameId)
            // clearInterval(intervalId)
            ctx?.clearRect(0, 0, width, height)
        }
    }
}