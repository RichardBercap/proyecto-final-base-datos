export const formatCurrency = (value: number, currency = 'BOB') =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value)

export const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined
  }).format(new Date(value))
}
