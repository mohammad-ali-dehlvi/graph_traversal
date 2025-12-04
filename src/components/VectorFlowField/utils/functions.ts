import type { PointType } from "./Point";

// Helper: check if a number is prime
function isPrime(n: number) {
    if (n <= 1) return false;
    if (n <= 3) return true;

    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

export function commonDivisorAt(position: number, nums: number[]) {
    if (!Array.isArray(nums) || nums.length === 0) throw Error("At least one number is required");

    // If there's only one number and it's prime → return the number itself
    if (nums.length === 1 && isPrime(nums[0])) {
        return nums[0];
    }

    // Find the smallest number in the list (upper bound for divisors)
    const minVal = Math.min(...nums);

    let count = 0

    // Test divisors starting from 2 upward
    for (let d = 2; d <= minVal; d++) {
        if (nums.every(n => n % d === 0)) {
            if (count === position) {
                return d;  // the smallest common divisor > 1
            } else {
                count++
            }
        }
    }

    return 1; // no common divisor > 1
}

// Main: lowest common divisor > 1
export function lowestCommonDivisor(...nums: number[]) {
    return commonDivisorAt(0, nums)
}




export type ContextOptionsType = { fillStyle?: string; lineWidth?: number; strokeStyle?: string }

export function setContextOptions(ctx: CanvasRenderingContext2D, options?: ContextOptionsType) {
    const { fillStyle, lineWidth, strokeStyle } = options || {}

    if (fillStyle) {
        ctx.fillStyle = fillStyle
        ctx.fill()
    }
    if (lineWidth || strokeStyle) {
        ctx.lineWidth = lineWidth || 1
        ctx.strokeStyle = strokeStyle || "black"
        ctx.stroke()
    }
}

export function scaleVectorToRange(p1: PointType, p2: PointType, min = 2, max = 5) {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    const mag = Math.hypot(dx, dy);

    // If magnitude is zero, return zero vector (or you could choose any default)
    if (mag === 0) {
        return { dx: 0, dy: 0 };
    }

    if (mag < min) {
        const scale = min / mag;
        dx *= scale;
        dy *= scale;
    } else if (mag > max) {
        const scale = max / mag;
        dx *= scale;
        dy *= scale;
    }

    return { dx, dy };
}