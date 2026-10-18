import { LoaderIcon } from 'lucide-react'
import React from 'react'

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
     <LoaderIcon className='h-8 w-8 animate-spin text-green-500'/>
    </div>
  )
}

export default Loading