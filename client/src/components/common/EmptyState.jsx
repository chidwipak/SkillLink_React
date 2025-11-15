import PropTypes from 'prop-types'

/**
 * EmptyState Component
 * Displays a friendly message when there's no data to show
 */
const EmptyState = ({ 
  icon = 'fa-inbox',
  title = 'No Data Found',
  message = 'There are no items to display at the moment.',
  actionText,
  onAction,
  actionIcon
}) => {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className={`fas ${icon} fa-4x text-muted opacity-50`}></i>
      </div>
      <h5 className="text-muted mb-2">{title}</h5>
      <p className="text-muted mb-4">{message}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionIcon && <i className={`fas ${actionIcon} me-2`}></i>}
          {actionText}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  actionIcon: PropTypes.string,
}

export default EmptyState
