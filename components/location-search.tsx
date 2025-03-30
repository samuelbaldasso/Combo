"use client"

import { useRef, useEffect, useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LocationSearchProps {
  onLocationSelect: (location: {
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
  }) => void
  placeholder?: string
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export function LocationSearch({
  onLocationSelect,
  placeholder = "Buscar localização",
  className = "",
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return
    }

    setIsLoaded(true)

    if (!inputRef.current) return

    // Initialize Google Places Autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "br" }, // Restrict to Brazil
      fields: ["address_components", "geometry", "formatted_address"],
    })

    autocompleteRef.current = autocomplete

    // Add listener for place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        console.error("No location data for this place")
        return
      }

      // Extract city and state from address components
      let city = ""
      let state = ""

      if (place.address_components) {
        for (const component of place.address_components) {
          const types = component.types

          if (types.includes("locality") || types.includes("administrative_area_level_2")) {
            city = component.long_name
          }

          if (types.includes("administrative_area_level_1")) {
            state = component.short_name
          }
        }
      }

      // Call the callback with location data
      onLocationSelect({
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        address: place.formatted_address || "",
        city,
        state,
      })
    })

    return () => {
      // Clean up
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onLocationSelect])

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocode to get address details
            const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
            const data = await response.json()

            onLocationSelect({
              latitude,
              longitude,
              address: `${data.city}, ${data.state}`,
              city: data.city,
              state: data.state,
            })

            // Update input value with location name
            if (inputRef.current) {
              inputRef.current.value = `${data.city}, ${data.state}`
            }
          } catch (error) {
            console.error("Error getting location details:", error)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
      )
    }
  }

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input ref={inputRef} type="text" placeholder={placeholder} className="pl-9" disabled={!isLoaded} />
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleUseCurrentLocation}
        title="Usar minha localização atual"
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  )
}

