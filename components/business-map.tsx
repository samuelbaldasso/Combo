"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import type { Business } from "@/types/business"

interface BusinessMapProps {
  businesses: Business[]
  userLocation: { latitude: number; longitude: number }
  onBusinessSelect?: (business: Business) => void
}

export function BusinessMap({ businesses, userLocation, onBusinessSelect }: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return

    // Center map on user location or first business
    const center = userLocation
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : businesses.length > 0
        ? { lat: businesses[0].latitude || 0, lng: businesses[0].longitude || 0 }
        : { lat: -22.371, lng: -41.786 } // Default to Macaé, RJ

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    })

    setMap(mapInstance)
    setInfoWindow(new google.maps.InfoWindow())

    // Add user location marker if available
    if (userLocation) {
      new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Sua localização",
      })
    }

    return () => {
      // Clean up markers when component unmounts
      markers.forEach((marker) => marker.setMap(null))
    }
  }, [mapRef, userLocation])

  // Add business markers when map or businesses change
  useEffect(() => {
    if (!map || !infoWindow) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    // Add markers for each business
    businesses.forEach((business) => {
      if (!business.latitude || !business.longitude) return

      const marker = new window.google.maps.Marker({
        position: { lat: business.latitude, lng: business.longitude },
        map,
        title: business.name,
        animation: window.google.maps.Animation.DROP,
      })

      // Create info window content
      const content = `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px; font-weight: bold;">${business.name}</h3>
          <p style="margin: 0 0 8px; font-size: 12px;">${business.category}</p>
          <p style="margin: 0; font-size: 12px;">${business.address}</p>
        </div>
      `

      // Add click listener to show info window
      marker.addListener("click", () => {
        infoWindow.setContent(content)
        infoWindow.open(map, marker)

        if (onBusinessSelect) {
          onBusinessSelect(business)
        }
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Fit bounds to include all markers if there are businesses
    if (businesses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()

      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude })
      }

      // Add all business locations to bounds
      businesses.forEach((business) => {
        if (business.latitude && business.longitude) {
          bounds.extend({ lat: business.latitude, lng: business.longitude })
        }
      })

      map.fitBounds(bounds)

      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 16) map.setZoom(16)
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [map, businesses, infoWindow, onBusinessSelect, userLocation])

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
      {userLocation && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 z-10 shadow-md"
          onClick={() => {
            if (map && userLocation) {
              map.panTo({ lat: userLocation.latitude, lng: userLocation.longitude })
              map.setZoom(15)
            }
          }}
        >
          <MapPin size={16} className="mr-2" />
          Minha Localização
        </Button>
      )}
    </div>
  )
}

