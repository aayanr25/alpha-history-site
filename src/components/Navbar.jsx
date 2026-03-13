import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home', exact: true },
  { to: '/timeline', label: 'Timeline' },
  { to: '/family-tree', label: 'Family Tree' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  const isActive = (to, exact) =>
    exact ? pathname === to : pathname.startsWith(to)

  return (
    <nav className="navbar">
      <div className="nav-links-left">
        <Link
          to="/"
          className={`nav-link ${isActive('/', true) ? 'nav-link-active' : ''}`}
        >
          Home
        </Link>
      </div>
      <span className="nav-center">Chi Psi • Alpha Epsilon Tau • Est. 2023</span>
      <div className="nav-links-right">
        {links.slice(1).map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${isActive(to) ? 'nav-link-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}