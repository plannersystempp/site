import { render } from "@testing-library/react"
import { PayrollDetailsCard } from "@/components/payroll/PayrollDetailsCard"

vi.mock("@/contexts/TeamContext", () => ({ useTeam: () => ({ userRole: "admin" }) }))
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }))
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }))

const detail = {
  id: "1",
  personName: "Profissional",
  personType: "freelancer",
  baseSalary: 0,
  workDays: 3,
  cachePay: 900,
  totalOvertimeHours: 2,
  overtimeRate: 65,
  overtimePay: 130,
  overtimeConversionApplied: false,
  overtimeCachesUsed: 0,
  overtimeRemainingHours: 0,
  totalPay: 1030,
  paidAmount: 0,
  pendingAmount: 1030,
  paid: false,
  absencesCount: 0,
  absences: [],
  paymentHistory: [],
  personnelId: "p1",
} as const

describe("PayrollDetailsCard sombras", () => {
  it("aplica shadow-lg no Card", () => {
    const { container } = render(
      <PayrollDetailsCard
        detail={detail as any}
        onRegisterPayment={() => {}}
        onRegisterPartialPayment={() => {}}
        onCancelPayment={() => {}}
        loading={false}
      />
    )
    const card = container.querySelector(".shadow-lg") as HTMLElement
    expect(card).toBeTruthy()
  })
})

