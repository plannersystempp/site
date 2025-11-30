import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button sombras", () => {
  it("default possui shadow-sm", () => {
    render(<Button>Enviar</Button>)
    const btn = screen.getByRole("button", { name: /enviar/i })
    expect(btn).toHaveClass("shadow-sm")
  })

  it("link não possui sombra padrão", () => {
    render(<Button variant="link">Abrir</Button>)
    const btn = screen.getByRole("button", { name: /abrir/i })
    expect(btn).toHaveClass("shadow-none")
    expect(btn).not.toHaveClass("shadow-sm")
  })
})

