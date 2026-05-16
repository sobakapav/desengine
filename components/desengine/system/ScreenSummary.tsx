
type ScreenSummaryProps = {
    title: string
    description: string
}

export default function ScreenSummary({title, description} : ScreenSummaryProps) {
    return (
        <div>
            <h1 className="text-6xl">
                {title}
            </h1>
            <h2 className="text-4xl">
                {description}
            </h2>
        </div>
    )
}