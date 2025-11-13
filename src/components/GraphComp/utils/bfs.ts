import { getId } from "./functions";

export function* bfs(
    grid: number[][],
    start: { i: number; j: number },
    end: { i: number; j: number }
) {
    //   debugger;
    if (
        grid[start.i][start.j] === 0 ||
        grid[end.i][end.j] === 0 ||
        grid.length === 0 ||
        grid[0].length === 0
    )
        return null;
    const queue = [{
        pos: start, path: [start]
        // , visited: { [getId(start.i, start.j)]: true } 
    }];

    const rows = grid.length;
    const cols = grid[0].length;

    const directions = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        // [1, 1],
        // [1, -1],
        // [-1, 1],
        // [-1, -1],
    ];

    const visited: { [id: string]: boolean } = {};
    visited[getId(start.i, start.j)] = true;

    yield { ...queue[0], visited };
    // yield { ...queue[0] }

    while (queue.length > 0) {
        const obj = queue.shift()!;
        const { pos, path } = obj;

        if (pos.i === end.i && pos.j === end.j) return { ...obj, visited };
        else yield { ...obj, visited };

        for (const d of directions) {
            const [dI, dJ] = d;
            const newI = pos.i + dI;
            const newJ = pos.j + dJ;
            const newId = getId(newI, newJ);
            if (
                ((newI < 0 ||
                    newI >= rows ||
                    newJ < 0 ||
                    newJ >= cols) ||
                    grid[newI][newJ] === 0) ||
                visited[newId]
            )
                continue;

            visited[newId] = true;
            // const newVisited = { ...visited, [newId]: true };
            const newPos = { i: newI, j: newJ };

            queue.push({
                pos: newPos,
                path: [...path, newPos],
                // visited: newVisited
            });
        }
    }
    return null;
}
