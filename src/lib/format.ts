const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

export function formatMileage(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} mi`;
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
}

export function formatPctChange(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
