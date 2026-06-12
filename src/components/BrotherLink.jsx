import { Link } from 'react-router-dom'
import { useBrothers } from '../hooks/useBrothers'
import './BrotherLink.css'

export default function BrotherLink({ id }) {
  const { brothersByNumber } = useBrothers()
  const brother = brothersByNumber.get(Number(id))
  if (!brother) return null
  return (
    <Link to={`/brothers/${id}`} className="brother-link">
      {brother.first_name} {brother.last_name}
    </Link>
  )
}
