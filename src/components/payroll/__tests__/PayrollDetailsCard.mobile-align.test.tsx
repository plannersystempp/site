import { render } from "@testing-library/react"
import { PayrollDetailsCard } from "@/components/payroll/PayrollDetailsCard"
import { formatCurrency } from "@/utils/formatters"

vi.mock("@/contexts/TeamContext", () => ({ useTeam: () => ({ userRole: "admin" }) }))
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }))
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => true }))

const detail = {
  id: "1",
  personName: "Mobile User",
  personType: "freelancer",
  workDays: 2,
  cachePay: 450,
  totalOvertimeHours: 0,
  overtimeRate: 0,
  overtimePay: 0,
  overtimeConversionApplied: false,
  overtimeCachesUsed: 0,
  overtimeRemainingHours: 0,
  totalPay: 900,
  paidAmount: 0,
  pendingAmount: 900,
  paid: false,
  absencesCount: 0,
  absences: [],
  paymentHistory: [],
  personnelId: "p1",
} as const

describe("PayrollDetailsCard mobile alinhamento", () => {
  it("centraliza o total a pagar no mobile", () => {
    const { container } = render(
      <PayrollDetailsCard
        detail={detail as any}
        onRegisterPayment={() => {}}
        onRegisterPartialPayment={() => {}}
        onCancelPayment={() => {}}
        loading={false}
      />
    )
    // Verifica que o texto do total e rótulo aparecem e que envoltório contém classe text-center
    const text = container.textContent ?? ""
    expect(text).toContain(formatCurrency(900))
    expect(text).toContain("Total a Pagar")
    const wrappers = Array.from(container.querySelectorAll("div"))
    const hasCenter = wrappers.some((el) => el.className?.includes("text-center"))
    expect(hasCenter).toBe(true)
  })
})

