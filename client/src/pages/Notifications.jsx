import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchNotifications, markAsRead } from '../store/slices/notificationSlice'

const Notifications = () => {
  const { items, isLoading } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  if (isLoading) {
    return <div className="card">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {items.map((notification) => (
          <div
            key={notification._id}
            className={`card cursor-pointer ${!notification.isRead ? 'bg-primary-50' : ''}`}
            onClick={() => handleMarkAsRead(notification._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.isRead && (
                <span className="badge badge-info ml-4">New</span>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
