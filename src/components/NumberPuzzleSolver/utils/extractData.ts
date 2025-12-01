import type { PuzzleResultType } from "./solvePuzzle";

export type ExtractDataType = {
    cols: number[];
    rows: number[];
    grid: number[][];
}

export function extractData(data: number[][]): ExtractDataType {
    const cols: number[] = data[0].slice(1)
    const rows: number[] = data.reduce((acc, curr, i) => {
        if (i > 0) {
            acc.push(curr[0])
        }
        return acc
    }, [])
    const grid: number[][] = data.slice(1).reduce((acc, curr) => {
        acc.push(curr.slice(1))
        return acc
    }, [] as number[][])

    return { cols, rows, grid }
}

export function retractData(data: PuzzleResultType[]): PuzzleResultType[] {
    return data.map((e) => {
        return {
            ...e,
            colIndex: e.colIndex + 1,
            rowIndex: e.rowIndex + 1
        }
    })
}