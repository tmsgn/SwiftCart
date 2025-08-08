import { Loader2 } from 'lucide-react'
import React from 'react'

export default function AdminLoading(){
  return (
    <div className='h-full w-full flex items-center justify-center'>
        <Loader2 size={50} className='animate-spin'/>
    </div>
  )
}
