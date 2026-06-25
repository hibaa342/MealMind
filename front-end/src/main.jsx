import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProvider } from './context/UserContext'
import './index.css'

const savedToken = localStorage.getItem('token')
const savedUserText = localStorage.getItem('user')

let savedUser = null
if (savedToken && savedUserText) {
  try {
    savedUser = JSON.parse(savedUserText)
  } catch {
    savedUser = null
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider sessionUser={savedUser}>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
)