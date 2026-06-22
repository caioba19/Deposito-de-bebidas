export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      {message}
    </div>
  )
}
