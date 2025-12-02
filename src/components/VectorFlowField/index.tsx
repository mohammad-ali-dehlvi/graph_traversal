import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import NormalButton from "../UI/Button";
import NormalTextarea from "../UI/Textarea";
import { EquationParser } from "./utils/equationParser";


export default function VectorFlowField() {
    const [xFlow, setXFlow] = useState("x")
    const [yFlow, setYFlow] = useState("y")

    const xFlowFunc = useMemo(() => {
        const equationParser = new EquationParser()
        return equationParser.parseEquation(xFlow)
    }, [xFlow])

    const yFlowFunc = useMemo(() => {
        const equationParser = new EquationParser()
        return equationParser.parseEquation(yFlow)
    }, [xFlow])

    useEffect(() => {
        console.log({ xFlowFunc, yFlowFunc })
    }, [xFlowFunc, yFlowFunc])

    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const xFlow = formData.get("x_flow")
        const yFlow = formData.get("y_flow")
        if (!xFlow || !yFlow) {
            alert("Both equations are mandatory")
            return
        }
        setXFlow(xFlow.toString())
        setYFlow(yFlow.toString())
    }, [])

    return (
        <div>
            <form onSubmit={handleSubmit} >
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }} >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }} >
                        <label htmlFor="x_flow">X flow</label>
                        {/* <textarea id="x_flow" name="x_flow" /> */}
                        <NormalTextarea id="x_flow" name="x_flow" required defaultValue={xFlow} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }} >
                        <label htmlFor="y_flow">Y flow</label>
                        <NormalTextarea id="y_flow" name="y_flow" required defaultValue={yFlow} />
                    </div>
                </div>
                <NormalButton type="submit" style={{ marginTop: "10px" }} >Submit</NormalButton>
            </form>
        </div>
    )
}