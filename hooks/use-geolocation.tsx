"use client"

import { useState, useCallback, useEffect } from "react"
import { getCityFromCoordinates, loadGoogleMapsScript } from "@/lib/google-maps"
import { set } from "date-fns"

interface Location {
  latitude: number
  longitude: number
  city: string
  state: string
  country?: string
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Load Google Maps script on component mount
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsGoogleMapsLoaded(true))
      .catch((err) => {
        console.error("Failed to load Google Maps:", err)
        setError("Falha ao carregar o Google Maps")
      })
  }, [])

  const locateUser = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador")
      return
    }

    setIsLocating(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Get city name from coordinates using reverse geocoding
      const locationInfo = await getCityFromCoordinates(latitude, longitude)

      setLocation({
        latitude,
        longitude,
        city: locationInfo.city,
        state: locationInfo.state,
        country: locationInfo.country,
      })
    } catch (err: any) {
      let errorMessage = "Não foi possível obter sua localização"

      // Handle specific geolocation errors
      if (err.code === 1) {
        errorMessage = "Permissão de localização negada"
      } else if (err.code === 2) {
        errorMessage = "Localização indisponível"
      } else if (err.code === 3) {
        errorMessage = "Tempo esgotado ao obter localização"
      }

      setError(errorMessage)
      console.error("Geolocation error:", err)
    } finally {
      setIsLocating(false)
    }
  }, [])

  return { location, isLocating, error, locateUser, isGoogleMapsLoaded, setLocation }
}

