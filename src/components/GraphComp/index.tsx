import { useCallback, useState, useRef, useEffect, type FormEvent, type MouseEventHandler, useMemo } from "react";
import { bfs } from "./utils/bfs";
import { getId } from "./utils/functions";
import Canvas, { type CanvasRefInterface } from "../Canvas";
import NormalButton from "../UI/Button";
import NormalInput from "../UI/Input";

const CELL_SIZE = 8; // Smaller cells for better performance

interface GridType {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
}

export default function GraphComp() {
    const [grid, setGrid] = useState<GridType[][]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [start, setStart] = useState({ i: 0, j: 0 })
    const [end, setEnd] = useState({ i: 0, j: 0 })
    const [status, setStatus] = useState<null | "select_start" | "select_end">(null)
    const canvasRef = useRef<CanvasRefInterface>(null);
    const animationRef = useRef<number | null>(null);

    const nonBlockedGrids = useMemo(() => {
        const result: (typeof grid[0][0] & { i: number; j: number })[] = []

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const item = grid[i][j]
                result.push({
                    ...item,
                    i, j
                })
            }
        }

        return result;
    }, [grid])

    const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const rows = Number(formData.get("rows"));
        const cols = Number(formData.get("cols"));

        const gridArr: typeof grid = [];
        const scores = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];

        for (let i = 0; i < rows; i++) {
            const arr: typeof grid[0] = [];
            for (let j = 0; j < cols; j++) {
                const index = Math.floor(Math.random() * scores.length);
                const score = scores[index];
                const x = j * CELL_SIZE;
                const y = i * CELL_SIZE;
                const width = CELL_SIZE;
                const height = CELL_SIZE
                arr.push({ score, x, y, width, height });
            }
            gridArr.push(arr);
        }
        setGrid(gridArr);
        drawGrid(gridArr);
    }, []);

    const drawGrid = useCallback((gridToDraw: typeof grid, colors?: Map<string, string>) => {
        const canvas = canvasRef.current?.getCanvas("main");
        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx || !gridToDraw.length) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < gridToDraw.length; i++) {
            for (let j = 0; j < gridToDraw[i].length; j++) {
                const { score, x, y, width, height } = gridToDraw[i][j];
                const key = getId(i, j);

                let color = 'white';
                if (score === 0) color = 'black';
                else if (colors && colors.has(key)) color = colors.get(key)!;

                ctx.fillStyle = color;
                ctx.fillRect(x, y, width, height);

                // Draw border
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(x, y, width, height);
            }
        }
    }, []);

    const solveUsingBfs = useCallback(() => {
        if (grid.length === 0 || isAnimating) return;

        setIsAnimating(true);
        const g = bfs(
            grid.map(e => e.map(e => e.score)),
            start,
            end
        );

        const animate = () => {
            const { done, value } = (() => {
                let obj = g.next()
                for (let i = 0; i < 20; i++) {
                    if (!obj.done) {
                        obj = g.next();
                    } else {
                        break;
                    }
                }
                return obj
            })();

            if ((done || !value) && animationRef.current) {
                setIsAnimating(false);
                cancelAnimationFrame(animationRef.current)
            }

            if (!value) return

            const { pos, path, visited } = value;
            const colorMap = new Map<string, string>();

            // Color visited nodes
            for (let key in visited) {
                if (visited[key]) colorMap.set(key, 'yellow');
            }

            // Color path
            for (let p of path) {
                const { i, j } = p;
                colorMap.set(getId(i, j), 'blue');
            }

            // Color current position
            const { i, j } = pos;
            colorMap.set(getId(i, j), 'red');

            drawGrid(grid, colorMap);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [grid, isAnimating, drawGrid, start, end]);

    const resetGridColors = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsAnimating(false);
        drawGrid(grid);
    }, [grid, drawGrid]);

    const canvasMouseClickMove = useCallback<(event: "click" | "move") => MouseEventHandler<HTMLCanvasElement>>((event) => (e) => {
        const { clientX, clientY } = e
        const rect = e.currentTarget.getBoundingClientRect()
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const cell = nonBlockedGrids.find(item => {
            const xStart = item.x;
            const xEnd = item.x + item.width;
            const yStart = item.y;
            const yEnd = item.y + item.height;

            return xStart <= x && x <= xEnd && yStart <= y && y <= yEnd
        })

        const isBlocked = cell?.score === 0;

        const temp = canvasRef.current?.getCanvas("temp");
        const tempCtx = temp?.getContext("2d");
        tempCtx?.clearRect(0, 0, temp?.width || 0, temp?.height || 0)
        if (cell && temp && tempCtx && !isBlocked) {
            const { x, y, width, height } = cell;
            tempCtx.beginPath();
            tempCtx.rect(x, y, width, height);
            tempCtx.fillStyle = "green";
            tempCtx.fill();
        }

        const canvas = canvasRef.current?.getCanvas("main");
        if (cell && canvas) {
            canvas.style.cursor = isBlocked ? "default" : "pointer"
        }

        const arr: (typeof status)[] = ['select_end', 'select_start']

        if (cell && !isBlocked && event === "click" && arr.includes(status)) {
            if (status === "select_start") {
                setStart({ i: cell.i, j: cell.j })
            } else {
                setEnd({ i: cell.i, j: cell.j })
            }
            setStatus(null)
        }

    }, [nonBlockedGrids, status])

    const canvasMouseOut = useCallback<MouseEventHandler<HTMLCanvasElement>>(() => {
        const temp = canvasRef.current?.getCanvas("temp");
        const tempCtx = temp?.getContext("2d");
        if (temp && tempCtx) {
            tempCtx.clearRect(0, 0, temp.width, temp.height)
        }
    }, [status])

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (grid.length > 0) {
            drawGrid(grid);
        }
    }, [grid, drawGrid]);

    useEffect(() => {
        const drawRect = (pArr: (typeof start & { color: string })[]) => {
            const canvas = canvasRef.current?.getCanvas("dest");
            const ctx = canvas?.getContext("2d");
            ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
            pArr.forEach((p) => {
                const { i, j, color } = p
                if (!grid || !grid[i] || !grid[i][j]) {
                    return
                }
                const { x, y, width, height } = grid[i][j]


                if (ctx) {
                    ctx.beginPath();
                    ctx.rect(x, y, width, height);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            })
        }
        const arr = []
        if (start) arr.push({ ...start, color: "pink" });
        if (end) arr.push({ ...end, color: "orange" });

        drawRect(arr)

    }, [start, end, grid])

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={handleFormSubmit}>
                <NormalInput name="rows" type="number" min={0} defaultValue={50} required />
                <NormalInput name="cols" type="number" min={0} defaultValue={50} required />
                <NormalButton type="submit">Generate Grid</NormalButton>
            </form>

            <div style={{ margin: "10px 0", display: "flex", gap: "10px", flexDirection: "row" }}>
                <NormalButton
                    onClick={solveUsingBfs}
                    disabled={grid.length === 0 || isAnimating}
                >
                    {isAnimating ? "Solving..." : "Solve with BFS"}
                </NormalButton>
                <NormalButton
                    onClick={resetGridColors}
                    disabled={grid.length === 0}
                >
                    Reset Colors
                </NormalButton>
                <NormalButton onClick={() => { setStatus("select_start") }} disabled={grid.length === 0 || status === "select_start"} >
                    Select Start {start && `(${start.i}, ${start.j})`}
                </NormalButton>
                <NormalButton onClick={() => { setStatus("select_end") }} disabled={grid.length === 0 || status === "select_end"} >
                    Select End {end && `(${end.i}, ${end.j})`}
                </NormalButton>
            </div>

            <div style={{ position: "relative", display: "inline-block" }} >
                <Canvas
                    ref={canvasRef}
                    defaultLayers={['temp', 'dest']}
                    canvasProps={{
                        width: grid[0] ? grid[0].length * CELL_SIZE : 0,
                        height: grid.length * CELL_SIZE
                    }}
                    otherCanvasProps={{
                        style: { pointerEvents: "none" }
                    }}
                    mainCanvasProps={{
                        onMouseMove: canvasMouseClickMove("move"),
                        onClick: canvasMouseClickMove("click"),
                        onMouseOut: canvasMouseOut
                    }}
                    onLayerUpdate={({ allCanvas }) => {
                        console.log("on layer update: ", allCanvas)
                    }}
                />
            </div>
        </div>
    );
}