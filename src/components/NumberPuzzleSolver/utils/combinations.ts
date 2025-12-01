

export type ResultType<T> = {
    value: T;
    index: number;
}

export function combinations<T>(arr: T[], callback?: (a: ResultType<T>[]) => boolean) {
    const result: ResultType<T>[][] = []

    function backtrack(start = 0, curr: { value: T, index: number }[] = []) {
        if (curr.length > 0 && (callback ? callback(curr) : true)) {
            result.push([...curr])
        }
        for (let i = start; i < arr.length; i++) {
            curr.push({ value: arr[i], index: i })
            backtrack(i + 1, curr)
            curr.pop()
        }
    }
    backtrack()
    return result
}