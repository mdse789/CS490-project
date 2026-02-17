import React from 'react'
import ReactDom from 'react-dom'

// 1. Define the look of the popup
const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFF',
  padding: '50px',
  zIndex: 1000,
}


const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(75, 96, 93, 0.7)',
  zIndex: 1000
}

export default function Modal({ open, children, onClose }) {
  if (!open) return null


  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} />
      <div style={MODAL_STYLES}>
        <button 
           onClick={onClose} 
           style={{ marginBottom: '10px', cursor: 'pointer' }}
        >
          Close
        </button>
        {children}
      </div>
    </>,
    document.getElementById('portal')
  )
}
