import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import style from "./style.module.css"
import { extractData, retractData } from "./utils/extractData"
import { solvePuzzle, type PuzzleResultType } from "./utils/solvePuzzle"
import NormalButton from "../UI/Button"
import NormalInput from "../UI/Input"

export default function NumberPuzzleSolver() {
    // const [grid, setGrid] = useState<number[][]>(JSON.parse(localStorage.getItem("num_puzzle_grid")!))
    const [grid, setGrid] = useState<number[][]>([[0]])
    const [result, setResult] = useState<PuzzleResultType[]>([])
    const [activeCell, setActiveCell] = useState([0, 0])
    const [focused, setFocused] = useState(false)

    const isCompleted = useMemo(() => {
        if (grid.length <= 1 && grid[0].length <= 1) return false
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                if (grid[i][j] === 0) {
                    return false
                }
            }
        }
        return true
    }, [grid])

    const resultObj = useMemo(() => {
        if (!result) return {}
        return result.reduce((acc, curr) => {
            acc[`${curr.rowIndex}-${curr.colIndex}`] = curr;
            return acc
        }, {} as { [key: string]: typeof result[0] })
    }, [result])

    const reset = useCallback(() => {
        setGrid([[0]])
        setActiveCell([0, 0])
        setResult([])
    }, [grid, result, activeCell])

    const addCol = useCallback(() => {
        setGrid(prev => {
            const newGrid = [...prev];
            for (let i = 0; i < newGrid.length; i++) {
                newGrid[i].push(0)
            }
            return newGrid
        })
    }, [grid])

    const removeCol = useCallback(() => {
        setGrid(prev => {
            const newGrid = [...prev];
            for (let i = 0; i < newGrid.length; i++) {
                newGrid[i].pop()
            }
            return newGrid
        })
    }, [grid])

    const addRow = useCallback(() => {
        setGrid(prev => {
            const newGrid = [...prev];
            const arr = []
            for (let i = 0; i < newGrid[0].length; i++) {
                arr.push(0)
            }
            newGrid.push(arr)
            return newGrid
        })
    }, [grid])

    const removeRow = useCallback(() => {
        setGrid(prev => {
            const newGrid = [...prev];
            newGrid.pop()
            return newGrid
        })
    }, [grid])

    const inputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const n = Number(e.currentTarget.value)
        setGrid((prev) => {
            const arr = [...prev]
            const [i, j] = activeCell
            if (i !== 0 || j !== 0) {
                arr[i][j] = isNaN(n) ? 0 : n
            }
            return arr
        })
    }, [activeCell, grid])

    const solveGrid = useCallback(() => {
        try {
            const result = retractData(solvePuzzle(extractData(grid)))
            setResult(result)
        } catch (err) {
            alert((err as Error).message)
        }
        // localStorage.setItem("num_puzzle_grid", JSON.stringify(grid))
    }, [grid])

    useEffect(() => {

        if (grid.length <= activeCell[0] || grid[0].length <= activeCell[1]) {
            setActiveCell(() => {
                return [
                    Math.min(activeCell[0], grid.length - 1),
                    Math.min(activeCell[1], grid[0].length - 1)
                ]
            })
        }
    }, [grid])

    useEffect(() => {
        if (!focused) return
        const dirObj = {
            arrowright: [0, 1],
            arrowleft: [0, -1],
            arrowup: [-1, 0],
            arrowdown: [1, 0]
        }
        const keyboardEventHandler = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (key in dirObj) {
                setActiveCell((prev) => {
                    const dir = dirObj[(key as keyof typeof dirObj)]

                    let a = dir[0] + prev[0]
                    let b = dir[1] + prev[1]

                    a = a < 0 ? grid.length - 1 : a > grid.length - 1 ? 0 : a
                    b = b < 0 ? grid[0].length - 1 : b > grid[0].length - 1 ? 0 : b

                    const newActiveCell = [
                        a, b
                    ];
                    return newActiveCell
                })
            }
        }
        window.addEventListener("keydown", keyboardEventHandler)

        return () => {
            window.removeEventListener("keydown", keyboardEventHandler)
        }
    }, [focused, activeCell])

    return (
        <div tabIndex={0} onFocus={() => { setFocused(true) }} onBlur={() => { setFocused(false) }} >
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "10px" }} >
                <NormalButton onClick={addCol} >Add Column</NormalButton>
                <NormalButton onClick={removeCol} disabled={grid[0].length <= 1} >Remove Column</NormalButton>
                <NormalButton onClick={addRow} >Add Row</NormalButton>
                <NormalButton onClick={removeRow} disabled={grid.length <= 1} >Remove Row</NormalButton>
                {isCompleted &&
                    <NormalButton onClick={solveGrid} >Solve</NormalButton>
                }
                <NormalButton onClick={reset} >Reset</NormalButton>
            </div>
            <table  >
                <tbody>

                    {grid.map((arr, i) => {
                        return (
                            <tr key={`${i}`} >
                                {arr.map((n, j) => {
                                    const isActive = activeCell[0] === i && activeCell[1] === j
                                    const isInResult = `${i}-${j}` in resultObj
                                    return (
                                        <td key={`${i}-${j}`} onClick={() => { setActiveCell([i, j]) }} >
                                            <div style={{ width: "20px", height: "20px", textAlign: "center", overflow: "hidden", border: "1px solid black", background: isInResult ? "green" : isActive ? "yellow" : i === 0 || j === 0 ? "rgba(0,0,0,0.2)" : "#FFF" }} >
                                                {isActive && focused && !isInResult && (i > 0 || j > 0) ? <NormalInput id={`num-input`} className={style["num_input"]} autoFocus defaultValue={n} type="number" min={0} onChange={inputChange} style={{ width: "100%", height: "100%", padding: "0px", borderRadius: 0 }} /> :
                                                    n !== 0 ? n : ""
                                                }
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}