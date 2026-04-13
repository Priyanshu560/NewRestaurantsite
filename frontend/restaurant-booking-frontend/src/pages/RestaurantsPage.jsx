import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { restaurantService } from '../services'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import { SkeletonCard, EmptyState, Pagination } from '../components/common'
import { useApi, usePaginatedApi } from '../hooks/useApi'

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search,   setSearch]   = useState(searchParams.get('name') || '')
  const [city,     setCity]     = useState(searchParams.get('city') || '')
  const [cuisine,  setCuisine]  = useState(searchParams.get('cuisine') || '')
  const [showFilters, setShowFilters] = useState(false)

  const { data: cuisines } = useApi(() => restaurantService.getCuisines())

  const { data, loading, error, currentPage, totalPages, fetch, nextPage, prevPage } =
    usePaginatedApi((params) => restaurantService.search(params), {
      name:    searchParams.get('name') || '',
      city:    searchParams.get('city') || '',
      cuisine: searchParams.get('cuisine') || '',
      size: 9,
    })

  const handleSearch = (e) => {
    e.preventDefault()
    const p = {}
    if (search)  p.name    = search
    if (city)    p.city    = city
    if (cuisine) p.cuisine = cuisine
    setSearchParams(p)
    fetch({ name: search, city, cuisine, page: 0 })
  }

  const clearFilters = () => {
    setSearch(''); setCity(''); setCuisine('')
    setSearchParams({})
    fetch({ name: '', city: '', cuisine: '', page: 0 })
  }

  const hasFilters = search || city || cuisine

  return (
    <div className="section-sm">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-100 mb-1">Restaurants</h1>
        <p className="text-slate-500 font-body text-sm">
          {loading ? 'Searching…' : `Discover great places to eat`}
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants…"
              className="input pl-10 h-11"
            />
          </div>
          <button type="button" onClick={() => setShowFilters(f => !f)}
            className={`btn-secondary h-11 px-4 ${showFilters ? 'border-brand-600/60 text-brand-400' : ''}`}>
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button type="submit" className="btn-primary h-11 px-5">Search</button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 animate-fade-in">
            <div>
              <label className="label">City</label>
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. New York" className="input h-10" />
            </div>
            <div>
              <label className="label">Cuisine</label>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)}
                className="input h-10">
                <option value="">All cuisines</option>
                {(cuisines || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-body">Active filters:</span>
            {search  && <FilterTag label={`"${search}"`}  onRemove={() => { setSearch('');  fetch({ name: '', city, cuisine, page: 0 }) }} />}
            {city    && <FilterTag label={city}           onRemove={() => { setCity('');    fetch({ name: search, city: '', cuisine, page: 0 }) }} />}
            {cuisine && <FilterTag label={cuisine}        onRemove={() => { setCuisine(''); fetch({ name: search, city, cuisine: '', page: 0 }) }} />}
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-400 font-body transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <EmptyState title="Failed to load restaurants" description={error} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Try adjusting your search or filters."
          action={hasFilters && (
            <button onClick={clearFilters} className="btn-secondary mt-2 text-sm">
              Clear filters
            </button>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={nextPage}
            onPrev={prevPage}
          />
        </>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     bg-brand-500/10 text-brand-400 border border-brand-500/20
                     text-xs font-body">
      {label}
      <button onClick={onRemove} className="hover:text-brand-200">
        <X size={10} />
      </button>
    </span>
  )
}
