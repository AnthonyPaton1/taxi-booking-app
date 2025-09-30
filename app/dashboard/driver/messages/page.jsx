import React from 'react'
import CheckoutSteps from '@/components/shared/header/driverSteps'

const MessagesPage = () => {
  return (
    <>
    <CheckoutSteps current={4} />
    <div>View your messages here</div>
    </>
  )
}

export default MessagesPage