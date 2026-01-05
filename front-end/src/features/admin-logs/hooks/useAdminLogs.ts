import { useState, useEffect } from 'react'
import { AuditLog, Filters } from '../types'
import { fetchAuditLogs } from '../services/adminLogService'

const pageSize = 20

export const useAdminLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<Filters>({
    username: '',
    resource: '',
    startDate: '',
    endDate: '',
  })

  // Initialize default dates
  useEffect(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const defaultStartDate = sevenDaysAgo.toISOString().split('T')[0]
    const defaultEndDate = now.toISOString().split('T')[0]

    setFilters(prev => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }))
  }, [])

  // Fetch logs when page or filters change
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true)
        const data = await fetchAuditLogs(currentPage, pageSize, filters)
        setLogs(data.logs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [currentPage, filters])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const resetPage = () => {
    setCurrentPage(1)
  }

  return {
    logs,
    loading,
    currentPage,
    totalPages,
    total,
    filters,
    handleFilterChange,
    handlePageChange,
    resetPage,
  }
}