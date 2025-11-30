import { render, fireEvent } from "@testing-library/react"
import { PersonnelSelector } from "@/components/events/allocation/PersonnelSelector"

vi.mock("@/contexts/TeamContext", () => ({ useTeam: () => ({ userRole: "admin" }) }))
vi.mock("@/components/personnel/PersonnelForm", () => ({ PersonnelForm: () => <div>Salvar</div> }))

const personnel = [
  { id: "p1", name: "Ana", email: "ana@example.com", functions: [] },
]
const functions = [
  { id: "f1", name: "Produtor" },
]

describe("PersonnelSelector CTA de criar pessoa", () => {
  it("exibe '+ Cadastrar nova pessoa' e abre formulário", () => {
    const { getAllByRole, getByText, queryByText } = render(
      <PersonnelSelector
        personnel={personnel as any}
        functions={functions as any}
        selectedPersonnel=""
        selectedFunction=""
        onPersonnelChange={() => {}}
        onFunctionChange={() => {}}
      />
    )
    const trigger = getAllByRole("combobox")[0]
    fireEvent.click(trigger)
    const cta = getByText("+ Cadastrar nova pessoa")
    expect(cta).toBeTruthy()
    fireEvent.click(cta)
    // Após clicar, deve existir o formulário de pessoa em tela
    expect(queryByText(/Salvar/i)).toBeTruthy()
  })
})

