import React from 'react'
// import SelectSource from '@/components/SelectSource'
import dynamic from 'next/dynamic'
 
// Client Components:
const SelectSource = dynamic(() => import('../../components/SelectSource'),{ ssr: false })



export function Drive() {
  

  return (
    <>
      <SelectSource />
    </>
  )
}
export default Drive