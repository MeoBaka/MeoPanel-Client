'use client'

interface InstanceTabProps {
  activeTab: string
}

export default function InstanceTab({ activeTab }: InstanceTabProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-white mb-4">Instance Management</h3>
      <p className="text-gray-400">Instance management features coming soon...</p>
    </div>
  )
}