import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react"

interface NormalButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> { }


export default function NormalButton(props: NormalButtonProps) {
    const { style } = props

    return (
        <button {...props} style={{ padding: "10px 12px", border: "none", borderRadius: "10px", ...style }} />
    )
}