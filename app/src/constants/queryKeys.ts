export const QUERY_KEYS = {
    occasions: ['occasions'],
    occasion: (id: string) => ['occasions', id],
    occasionsByDate: (date: string) => ['occasions', 'date', date],
    occasionsByMonth: (month: string) => ['occasions', 'month', month],
    occasionsByYear: (year: string) => ['occasions', 'year', year],
    occasionGroups: ['occasions', 'groups'],
    pendingOccasions: (statuses: string[]) => ['occasions', ...statuses],
  };
  