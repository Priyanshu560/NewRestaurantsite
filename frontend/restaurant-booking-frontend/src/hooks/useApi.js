import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic async data fetching hook.
 * @param {Function} fetchFn  - async function returning { data }
 * @param {Array}    deps     - dependency array (re-fetches when changed)
 * @param {boolean}  immediate - fetch on mount (default true)
 */
export function useApi(fetchFn, deps = [], immediate = true) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)
  const abortRef = useRef(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn(...args)
      setData(response.data?.data ?? response.data)
      return response.data?.data ?? response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, execute, setData }
}

/** Paginated variant */
export function usePaginatedApi(fetchFn, initialParams = {}) {
  const [params,  setParams]  = useState({ page: 0, size: 10, ...initialParams })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async (overrides = {}) => {
    const merged = { ...params, ...overrides }
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn(merged)
      setResult(res.data?.data ?? res.data)
      setParams(merged)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [])  // eslint-disable-line

  return {
    data:       result?.content ?? [],
    totalPages: result?.totalPages ?? 0,
    totalElements: result?.totalElements ?? 0,
    currentPage: params.page,
    loading, error,
    fetch,
    nextPage: () => fetch({ page: params.page + 1 }),
    prevPage: () => fetch({ page: Math.max(0, params.page - 1) }),
    setPageSize: (size) => fetch({ page: 0, size }),
  }
}
