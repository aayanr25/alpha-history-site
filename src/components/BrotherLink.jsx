import { Link } from 'react-router-dom'
import brothers from '../data/brothers.json'
import './BrotherLink.css'

export default function BrotherLink({ id }) {
  const brother = brothers.find(b => b.id === id)
  if (!brother) return null
  return (
    <Link to={`/brothers/${id}`} className="brother-link">
      {brother.firstName} {brother.lastName}
    </Link>
  )
}