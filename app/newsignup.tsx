import { SignupProvider } from '@/components/signup/SignupContext'
import SignupFlow from '@/components/signup/SignupFlow'
import React from 'react'


function newsignup() {
  return (
    <SignupProvider>
      <SignupFlow />
    </SignupProvider>
  )
}

export default newsignup