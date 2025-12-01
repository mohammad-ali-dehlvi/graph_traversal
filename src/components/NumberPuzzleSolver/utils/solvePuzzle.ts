import { combinations, type ResultType } from "./combinations";
import type { ExtractDataType } from "./extractData";

export type PuzzleResultType = {
    value: number;
    colIndex: number;
    rowIndex: number;
}

export function solvePuzzle(obj: ExtractDataType) {
    const { cols, rows, grid } = obj

    const rowCombinations: { comb: ResultType<number>[][] }[] = []

    for (let i = 0; i < rows.length; i++) {
        const sum = rows[i]
        const arr = grid[i];
        const comb = combinations(arr, (a) => {
            const s = a.reduce((acc, c) => acc + c.value, 0)
            if (sum === s) {
                return true
            }
            return false
        })
        if (comb.length === 0) {
            throw Error(`Solution is not valid for ${i}th row, sum: ${sum}`)
        } else {
            rowCombinations.push({ comb })
        }
    }
    let colIndex = 0;
    const rowIndexes = rowCombinations.map(_ => 0)

    while (true) {
        const colSum = cols[colIndex]
        const sum = rowCombinations.reduce((acc, curr, i) => {
            const activeComp = curr.comb[rowIndexes[i]]
            const item = activeComp.find(e => e.index === colIndex)
            if (item) {
                acc += item.value
            }
            return acc
        }, 0)
        if (colSum === sum) {
            colIndex += 1
            if (colIndex >= cols.length) {
                break
            }
        } else {
            colIndex = 0
            if (rowIndexes.every((index, i) => rowCombinations[i].comb.length - 1 === index)) {
                throw Error("No solutions is been found")
            }
            for (let i = rowIndexes.length - 1; i >= 0; i--) {
                const comb = rowCombinations[i].comb
                if (rowIndexes[i] < comb.length - 1) {
                    rowIndexes[i] += 1
                    break;
                } else {
                    rowIndexes[i] = 0
                }
            }
        }
    }

    const result = rowCombinations.map<PuzzleResultType[]>((item, i) => {
        const comb = item.comb;

        return comb[rowIndexes[i]].map(item => {
            return {
                value: item.value,
                colIndex: item.index,
                rowIndex: i
            }
        })
    }).flat()
    return result
}