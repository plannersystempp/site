import { render } from "@testing-library/react"
import { PayrollDetailsCard } from "@/components/payroll/PayrollDetailsCard"
import { formatCurrency } from "@/utils/formatters"

vi.mock("@/contexts/TeamContext", () => ({ useTeam: () => ({ userRole: "admin" }) }))
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }))
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }))

const baseDetail = {
  id: "1",
  personName: "Profissional",
  personType: "freelancer",
  workDays: 3,
  cachePay: 900,
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

describe("PayrollDetailsCard breakdown", () => {
  it("exibe breakdown usando cacheRate quando disponível", () => {
    const detail = { ...baseDetail, cacheRate: 300 } as any
    const { container } = render(
      <PayrollDetailsCard
        detail={detail}
        onRegisterPayment={() => {}}
        onRegisterPartialPayment={() => {}}
        onCancelPayment={() => {}}
        loading={false}
      />
    )
    const expected = `${formatCurrency(300)} × 3 dias`
    expect(container.textContent).toContain(expected)
  })

  it("exibe breakdown derivado de cachePay/workDays quando cacheRate não existe", () => {
    const detail = { ...baseDetail } as any
    const { container } = render(
      <PayrollDetailsCard
        detail={detail}
        onRegisterPayment={() => {}}
        onRegisterPartialPayment={() => {}}
        onCancelPayment={() => {}}
        loading={false}
      />
    )
    const expected = `${formatCurrency(300)} × 3 dias`
    expect(container.textContent).toContain(expected)
  })

  it("prioriza eventSpecificCacheRate quando marcado como específico", () => {
    const detail = { ...baseDetail } as any
    const { container } = render(
      <PayrollDetailsCard
        detail={detail}
        onRegisterPayment={() => {}}
        onRegisterPartialPayment={() => {}}
        onCancelPayment={() => {}}
        loading={false}
        pixKey={"chave"}
        hasEventSpecificCache={true}
        eventSpecificCacheRate={350}
      />
    )
    const expected = `${formatCurrency(350)} × 3 dias`
    expect(container.textContent).toContain(expected)
  })
})

