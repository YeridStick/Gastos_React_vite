import React from 'react'

export default function Mensaje({children, tipo}) {
  return (
    <div className={`mt-4 text-blue-800 font-bold uppercase text-center rounded relative`}>
      {children}
    </div>
  )
}

