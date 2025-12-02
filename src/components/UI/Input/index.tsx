import type { DetailedHTMLProps, InputHTMLAttributes } from "react";


interface NormalInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {

}

export default function NormalInput(props: NormalInputProps) {
    const { style, ...rest } = props

    return (
        <input {...rest} style={{ outline: "none", padding: "10px 15px", borderRadius: "10px", border: "1px solid grey", ...style }} />
    )
}