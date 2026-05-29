
type ScreenSummaryProps = {
    title: string
    description: string
}

export default function ScreenSummary({title, description} : ScreenSummaryProps) {
return (
  <div>
    <h1 className="text-2xl font-bold leading-tight text-white">
      {title}
    </h1>

    <p className="mt-2 text-base leading-snug text-white/80">
      {description}
    </p>
  </div>
)
}