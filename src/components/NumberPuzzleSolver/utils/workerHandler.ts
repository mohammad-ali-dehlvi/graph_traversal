
function getWorker() {
    return new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
}

function getUniqueId() {
    const aCode = 97
    const zCode = 122
    const TOTAL_LENGTH = 30
    let code = ""
    const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;
    for (let i = 0; i < TOTAL_LENGTH; i++) {
        code += String.fromCharCode(getRandom(aCode, zCode))
    }
    return code
}

export async function workerSolvePuzzle(grid: number[][]) {
    return new Promise((resolve, reject) => {
        const id = getUniqueId()
        const worker = getWorker()
        worker.onmessage = (e) => {
            const data = e.data
            if ("id" in data && data['id'] === id) {
                worker.terminate()
                resolve(data['data'])
            }
        }
        try {
            worker.postMessage({ type: "solve_puzzle", id, data: grid })
        } catch (err) {
            worker.terminate()
            reject(err)
        }
    })
}