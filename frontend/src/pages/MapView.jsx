import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getRegions } from '../services/promiseService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import 'leaflet/dist/leaflet.css'

const getColor = (score) => {
  // If score is null, undefined, or exactly 0, show "No Data" grey
  if (score === undefined || score === null || score === 0) return '#e5e7eb'
  if (score >= 70) return '#16a34a'
  if (score >= 50) return '#65a30d'
  if (score >= 30) return '#ca8a04'
  if (score >= 10) return '#ea580c'
  return '#dc2626'
}

const NAME_MAP = {
  'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS',
  'Bihar': 'BR', 'Chhattisgarh': 'CG', 'Goa': 'GA', 'Gujarat': 'GJ',
  'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jharkhand': 'JH',
  'Karnataka': 'KA', 'Kerala': 'KL', 'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML',
  'Mizoram': 'MZ', 'Nagaland': 'NL', 'Odisha': 'OD', 'Punjab': 'PB',
  'Rajasthan': 'RJ', 'Sikkim': 'SK', 'Tamil Nadu': 'TN',
  'Telangana': 'TG', 'Tripura': 'TR', 'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK', 'West Bengal': 'WB', 'Delhi': 'DL',
  'Jammu and Kashmir': 'JK', 'Ladakh': 'LA'
}

export default function MapView() {
  const navigate = useNavigate()
  const [geoData, setGeoData] = useState(null)
  const [regionStats, setRegionStats] = useState({})
  const [selected, setSelected] = useState(null)

  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: getRegions
  })

  // 1. Load GeoJSON once on mount
  useEffect(() => {
    fetch('/india.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load GeoJSON:', err))
  }, [])

  // 2. Load stats when regions list is available
  useEffect(() => {
    if (!regions) return
    
    const stateRegions = regions.filter(r => r.level === 'STATE')
    
    Promise.all(
      stateRegions.map(region =>
        fetch(`http://localhost:3001/api/regions/${region.code}/stats`)
          .then(res => res.json())
          .then(data => ({ code: region.code, ...data }))
          // CRITICAL: Return score: null so getColor() knows it's "No Data"
          .catch(() => ({ code: region.code, score: null, total: 0 }))
      )
    ).then(results => {
      const stats = {}
      results.forEach(r => { stats[r.code] = r })
      setRegionStats(stats)
    })
  }, [regions])

  const getStateCode = (feature) => {
    const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || ''
    return NAME_MAP[name.trim()] || null
  }

  const styleFeature = (feature) => {
    const code = getStateCode(feature)
    const stats = code ? regionStats[code] : null
    return {
      fillColor: getColor(stats?.score),
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.75,
    }
  }

  const onEachFeature = (feature, layer) => {
    const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || 'Unknown'
    const code = getStateCode(feature)
    const stats = code ? regionStats[code] : null

    layer.bindTooltip(
      `<div style="font-family:sans-serif;padding:4px">
        <strong style="font-size:14px">${name}</strong><br/>
        ${stats && stats.score !== null 
          ? `<span style="color:#2563eb">Score: ${stats.score}%</span> | Promises: ${stats.total}` 
          : '<span style="color:#9ca3af">No data yet</span>'}
      </div>`,
      { sticky: true, direction: 'auto' }
    )

    layer.on({
      mouseover: (e) => {
        const el = e.target
        el.setStyle({ fillOpacity: 0.9, weight: 2, color: '#6366f1' })
        el.bringToFront()
        setSelected({ name, code, stats })
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.75, weight: 1, color: '#ffffff' })
      },
      click: () => {
        if (code) navigate(`/states/${code}`)
      }
    })
  }

  // Force Leaflet to re-draw when data arrives by changing the component key
  const mapKey = useMemo(() => {
    return `map-${Object.keys(regionStats).length}-${!!geoData}`
  }, [regionStats, geoData])

  if (regionsLoading || !geoData) {
    return <LoadingSpinner message="Loading Manifesto Data..." />
  }

  return (
    <div className="flex h-screen bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Main Map Container */}
      <div className="flex-1 relative bg-white">
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            opacity={0.4}
          />
          <GeoJSON 
            key={mapKey}
            data={geoData} 
            style={styleFeature} 
            onEachFeature={onEachFeature} 
          />
        </MapContainer>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-[1000]">
        <div className="bg-slate-900 text-white p-5">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <span>📍</span> India Map
          </h2>
          <p className="text-slate-400 text-xs mt-1 italic">
            Visualizing government accountability by state
          </p>
        </div>

        {/* Legend */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Delivery Score Key
          </h3>
          <div className="space-y-2">
            {[
              { color: '#16a34a', label: '70%+ Delivered' },
              { color: '#65a30d', label: '50–70% Delivered' },
              { color: '#ca8a04', label: '30–50% Delivered' },
              { color: '#ea580c', label: '10–30% Delivered' },
              { color: '#dc2626', label: 'Below 10%' },
              { color: '#e5e7eb', label: 'No data yet' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* State Detail View */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <h3 className="text-2xl font-black text-slate-800 mb-1">{selected.name}</h3>
              <p className="text-xs text-gray-400 mb-6 uppercase tracking-tighter font-bold">State Profile</p>
              
              {selected.stats && selected.stats.score !== null ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-slate-900 leading-none">
                      {selected.stats.score}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-2">Current Delivery Rate</div>
                  </div>
                  
                  <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500 text-sm">Total Promises</span>
                    <span className="font-bold text-slate-800">{selected.stats.total}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/states/${selected.code}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    Explore Promises <span>→</span>
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-4 opacity-20">📊</div>
                  <p className="text-gray-400 text-sm italic">
                    Data for this region is currently being audited or is unavailable.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4">🖱️</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Select a state on the map to view detailed manifesto tracking data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}