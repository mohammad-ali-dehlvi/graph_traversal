import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import NormalButton from "../UI/Button";
import NormalTextarea from "../UI/Textarea";
import Canvas, { type CanvasRefInterface } from "../Canvas";
import { FlowField } from "./utils/FlowField";
import NormalInput from "../UI/Input";


export default function VectorFlowField() {
    const canvasRef = useRef<CanvasRefInterface>(null)
    const [xFlow, setXFlow] = useState("x")
    const [yFlow, setYFlow] = useState("y")
    const [pointCount, setPointCount] = useState({ x: 20, y: 20 })

    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const xFlow = formData.get("x_flow")
        const yFlow = formData.get("y_flow")
        const xPointCount = Number(formData.get("x_count") || 20)
        const yPointCount = Number(formData.get("y_count") || 20)
        if (!xFlow || !yFlow) {
            alert("Both equations are mandatory")
            return
        }
        setXFlow(xFlow.toString())
        setYFlow(yFlow.toString())
        setPointCount({
            x: xPointCount,
            y: yPointCount
        })
    }, [xFlow, yFlow, pointCount])

    useEffect(() => {
        // setTimeout(() => {
        const canvasManager = canvasRef.current
        const mainCanvas = canvasManager?.getCanvas("main")
        const vectorCanvas = canvasManager?.getCanvas("vector_layer")
        const flowField = new FlowField({ xFlow, yFlow })
        if (vectorCanvas) {
            flowField.drawVectorField(vectorCanvas, {
                center: "center",
                clearBeforeDraw: true,
                pointField: {
                    xCount: pointCount.x,
                    yCount: pointCount.y
                }
            })
        }


        let cleanup = () => { }
        if (mainCanvas) {
            cleanup = flowField.animateParticles(mainCanvas, { center: "center" })
        }

        return () => {
            cleanup()
        }
    }, [xFlow, yFlow, pointCount])

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
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }} >
                        <label htmlFor="x_count">X point count</label>
                        <NormalInput id="x_count" name="x_count" required type="number" defaultValue={pointCount.x} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }} >
                        <label htmlFor="y_count">Y point count</label>
                        <NormalInput id="y_count" name="y_count" required type="number" defaultValue={pointCount.y} />
                    </div>
                </div>
                <NormalButton type="submit" style={{ marginTop: "10px" }} >Submit</NormalButton>
            </form>

            <div>
                <Canvas ref={canvasRef} defaultLayers={["vector_layer"]} autoDimensions rootStyle={{ width: "100%", height: "500px" }} />
            </div>
        </div>
    )
}