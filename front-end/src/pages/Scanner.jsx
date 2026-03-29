import React from 'react'
import Scanner from '../components/Scanner'

const ScannerPage = () => {
  return (
    <div className="cookpal-page">
      <h1 className="cookpal-page__title">Fridge scan</h1>
      <p className="cookpal-page__lead">Scan ingredients to get recipe ideas.</p>
      <Scanner />
    </div>
  )
}

export default ScannerPage
