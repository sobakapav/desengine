import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="ghost">shadcn/ui</Badge>
      <Button variant="secondary" size="sm">
        Кнопка
      </Button>
    </div>
  )
}

