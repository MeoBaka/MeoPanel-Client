'use client'

import { useState, useEffect } from 'react'
import { AuditLog, AdminLogTabProps, Filters } from './types'
import { useAdminLogs } from './hooks/useAdminLogs'
import AdminLogFilters from './components/AdminLogFilters'
import AdminLogTable from './components/AdminLogTable'
import AdminLogPagination from './components/AdminLogPagination'
import AdminLogModal from './components/AdminLogModal'

export default function AdminLogTab({ activeTab }: AdminLogTabProps) {
  const {
    logs,
    loading,
    currentPage,
    totalPages,
    total,
    filters,
    handleFilterChange,
    handlePageChange,
    resetPage,
  } = useAdminLogs()

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [tempFilters, setTempFilters] = useState<Filters>({
    username: '',
    resource: '',
    startDate: '',
    endDate: '',
  })

  // Sync tempFilters with filters when filters change
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  const handleRowDoubleClick = (log: AuditLog) => {
    setSelectedLog(log)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLog(null)
  }

  const handleApplyFilters = () => {
    handleFilterChange(tempFilters)
    resetPage()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Admin Log</h3>

      <AdminLogFilters
        filters={filters}
        tempFilters={tempFilters}
        onTempFiltersChange={setTempFilters}
        onApplyFilters={handleApplyFilters}
      />

      <AdminLogTable
        logs={logs}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <AdminLogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        logsCount={logs.length}
        onPageChange={handlePageChange}
      />

      <AdminLogModal
        selectedLog={selectedLog}
        isOpen={showModal}
        onClose={closeModal}
      />
    </div>
  )
}