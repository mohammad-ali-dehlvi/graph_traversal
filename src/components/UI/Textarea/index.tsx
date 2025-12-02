import type { DetailedHTMLProps, TextareaHTMLAttributes } from "react";

interface NormalTextareaProps extends DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> { }

export default function NormalTextarea(props: NormalTextareaProps) {

    const { style, ...rest } = props

    return (
        <textarea {...rest} style={{ outline: "none", padding: "10px 15px", borderRadius: "10px", border: "1px solid grey", ...style }} />
    )
}