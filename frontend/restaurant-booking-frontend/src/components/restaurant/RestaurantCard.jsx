import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, ChefHat } from 'lucide-react'
import { truncate } from '../../utils/helpers'
import { StarRating } from '../common'

export default function RestaurantCard({ restaurant }) {
  const { id, name, city, cuisine, description, imageUrl, averageRating, openingTime, closingTime } = restaurant

  return (
    <Link to={`/restaurants/${id}`} className="card-hover group block">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl} alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={40} className="text-slate-700" />
          </div>
        )}
        {/* Cuisine tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-xs font-medium
                           text-brand-300 backdrop-blur-sm border border-slate-700/50 font-body">
            {cuisine}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-semibold text-slate-100 text-lg leading-tight group-hover:text-brand-300 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StarRating rating={averageRating} size={12} />
            <span className="text-xs text-slate-400 font-body ml-1">
              {parseFloat(averageRating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <MapPin size={12} />
          <span className="text-xs font-body">{city}</span>
        </div>

        {description && (
          <p className="text-xs text-slate-500 font-body leading-relaxed line-clamp-2">
            {truncate(description, 100)}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={12} />
            <span className="text-xs font-body">{openingTime} – {closingTime}</span>
          </div>
          <span className="text-xs text-brand-400 font-medium font-body group-hover:underline">
            Reserve →
          </span>
        </div>
      </div>
    </Link>
  )
}
