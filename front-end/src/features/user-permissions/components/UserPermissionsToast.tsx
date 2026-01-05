import { Toast } from '../types'

interface UserPermissionsToastProps {
  toast: Toast | null
}

export default function UserPermissionsToast({ toast }: UserPermissionsToastProps) {
  if (!toast) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded shadow-lg text-white ${
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}>
        {toast.message}
      </div>
    </div>
  )
}