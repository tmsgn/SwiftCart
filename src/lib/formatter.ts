const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

export function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatDate(date: Date | string): string {
  return DATE_FORMATTER.format(new Date(date))
}
