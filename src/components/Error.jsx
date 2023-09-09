import React from 'react'

export default function Error({children}) {
  return (
    <div className="px-2 py-1 w-full rounded bg-rose-700 text-white font-bold uppercase text-center">
      {children}
    </div>
  )
}
