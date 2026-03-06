import { Outlet } from 'react-router-dom'
import './Settings.css'

export function Settings() {
  return (
    <div className="settings">
      <Outlet />
    </div>
  )
}
