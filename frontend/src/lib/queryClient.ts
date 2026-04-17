import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long before the data is considered "old" and needs refetching
      staleTime: 1000 * 60 * 5, // 5 minutes
      // How many times to retry a failed request before throwing an error
      retry: 1, 
      // Prevents refetching every time the user clicks away and clicks back to the tab
      refetchOnWindowFocus: false, 
    },
  },
})