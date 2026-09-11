export const paginate = <T>(items: T[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export const totalPages = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize))
