//app/dashboard/driver/active-bids
import React from 'react'
import CheckoutSteps from '@/components/shared/header/driverSteps'

const ActiveBids = () => {
  return (
    <>
    <CheckoutSteps current={3} />
    <div>Active Bids are placed here</div>
    </>
  )
}

export default ActiveBids