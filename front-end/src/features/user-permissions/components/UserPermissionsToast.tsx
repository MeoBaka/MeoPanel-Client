import { Toast } from '../types'

interface UserPermissionsToastProps {
  toast: Toast | null
}

/**
 * Render a bottom-right toast notification when a toast is provided.
 *
 * @param toast - Toast data to display; if `null`, the component renders nothing.
 * @returns A positioned toast element showing `toast.message` with a green background for `toast.type === 'success'` and red otherwise, or `null` when no toast is provided.
 */
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