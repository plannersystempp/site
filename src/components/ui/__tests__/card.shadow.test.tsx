import { render } from "@testing-library/react"
import { Card } from "@/components/ui/card"

describe("Card sombras", () => {
  it("usa shadow-md por padrão", () => {
    const { container } = render(<Card>conteúdo</Card>)
    const el = container.firstChild as HTMLElement
    expect(el).toBeTruthy()
    expect(el).toHaveClass("shadow-md")
  })
})

