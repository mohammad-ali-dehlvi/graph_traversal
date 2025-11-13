import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type CanvasHTMLAttributes, type CSSProperties, type DetailedHTMLProps } from "react";


export interface CanvasRefInterface {
    getCanvas: (id: string) => HTMLCanvasElement | null;
    getContext: (id?: string) => CanvasRenderingContext2D | null
    getAllCanvases: () => Map<string, HTMLCanvasElement>;
    addLayer: (id: string) => void;
    removeLayer: (id: string) => void;
    hasLayer: (id: string) => boolean;
    getLayerIds: () => Set<string>
}

interface CanvasPropsInterface {
    rootStyle?: CSSProperties;
    mainCanvasProps?: DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    otherCanvasProps?: DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    canvasProps?: DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    defaultLayers?: string[]
    onLayerUpdate?: (obj: { layerIds: Set<string>, allCanvas: Map<string, HTMLCanvasElement> }) => void
}

const Canvas = forwardRef<CanvasRefInterface, CanvasPropsInterface>((props, ref) => {
    const { defaultLayers = [], rootStyle = {}, mainCanvasProps = {}, otherCanvasProps = {}, canvasProps = {}, onLayerUpdate } = props
    const [layerIds, setLayerIds] = useState(new Set(["main", ...defaultLayers]))
    const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

    const layerIdsArr = useMemo(() => {
        return Array.from(layerIds)
    }, [layerIds])

    const getCanvas = useCallback((id: string = "main") => {
        return canvasRefs.current.get(id) || null
    }, [layerIds])

    const getContext = useCallback((id: string = "main") => {
        const canvas = getCanvas(id);
        if (canvas) return canvas.getContext("2d");
        return null
    }, [getCanvas])

    const getAllCanvases = useCallback(() => {
        return canvasRefs.current
    }, [layerIds])

    const addLayer = useCallback((id: string) => {
        setLayerIds(prev => new Set([...prev, id]))
    }, [layerIds])

    const removeLayer = useCallback((id: string) => {
        if (id === "main") {
            console.warn("Cannoe remove main layer");
            return
        }
        setLayerIds(prev => {
            const newIds = new Set(prev);
            newIds.delete(id);
            return newIds;
        })
    }, [layerIds])

    const hasLayer = useCallback((id: string) => {
        return layerIds.has(id);
    }, [layerIds])

    const getLayerIds = useCallback(() => layerIds, [layerIds])

    useImperativeHandle(ref, () => {
        return {
            getCanvas, getContext, getAllCanvases, addLayer, removeLayer, hasLayer, getLayerIds
        }
    }, [getCanvas, getContext, getAllCanvases, addLayer, removeLayer, hasLayer, getLayerIds])

    useEffect(() => {
        if (onLayerUpdate) {
            onLayerUpdate({ layerIds, allCanvas: canvasRefs.current })
        }
    }, [layerIds])

    return (
        <div style={{ ...rootStyle, position: "relative", display: "inline-block" }} >
            {layerIdsArr.map((id, i) => {
                const isMain = id === "main";
                const props = isMain ? { ...canvasProps, ...mainCanvasProps } : { ...canvasProps, ...otherCanvasProps }
                return (
                    <canvas
                        key={id}
                        id={id}
                        {...props}
                        ref={(ele) => {
                            if (ele) canvasRefs.current.set(id, ele);
                            else canvasRefs.current.delete(id);
                        }}
                        style={{
                            ...(props.style || {}),
                            ...(isMain ? {} : {
                                position: "absolute",
                                inset: 0
                            }),
                            zIndex: i + 1
                        }}
                    />
                )
            })}
        </div>
    )
})

export default Canvas