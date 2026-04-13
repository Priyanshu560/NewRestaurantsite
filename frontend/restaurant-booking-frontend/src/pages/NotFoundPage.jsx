import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-brand-500/60 text-8xl font-bold mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-slate-100 mb-2">
          Table not found
        </h1>
        <p className="text-slate-500 font-body mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/"           className="btn-secondary">Go Home</Link>
          <Link to="/restaurants" className="btn-primary">
            <UtensilsCrossed size={16} /> Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}
