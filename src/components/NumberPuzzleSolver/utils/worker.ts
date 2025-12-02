import { extractData, retractData } from "./extractData"
import { solvePuzzle } from "./solvePuzzle"

self.onmessage = (e) => {
    if (e.data['type'] === 'solve_puzzle') {
        const id = e.data['id']
        const data = retractData(solvePuzzle(extractData(e.data['data'])))
        self.postMessage({ id, data })
        return
    }
    self.postMessage(e.data)
}