import React from 'react'

interface TerminalProps {
  className?: string
}

export const Terminal: React.FC<TerminalProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-1 flex-col bg-[#121728] ${className}`}>
      <div
        className="padding-8px-16px border-b border-slate-700 bg-[#1e293b] text-sm font-medium text-[#94a3b8]"
        style={{ padding: '8px 16px' }}
      >
        <span>Terminal</span>
      </div>
      <div
        id="runner-container"
        className="flex-1 overflow-hidden"
        style={{
          backgroundColor: '#121728',
          padding: '8px'
        }}
      />
    </div>
  )
}
