// Google Maps API utilities

// Load the Google Maps API script dynamically
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return resolve()
    }

    // If the script is already loaded, resolve immediately
    if (window.google && window.google.maps) {
      return resolve()
    }

    // Create script element
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    // Set up callbacks
    script.onload = () => resolve()
    script.onerror = (error) => reject(new Error(`Google Maps script loading failed: ${error}`))

    // Add script to document
    document.head.appendChild(script)
  })
}

// Get city and state from coordinates using Google Maps Geocoding API
export async function getCityFromCoordinates(lat: number, lng: number) {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
    if (!response.ok) {
      throw new Error("Failed to fetch location data")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting city from coordinates:", error)
    return { city: "Unknown", state: "Unknown" }
  }
}

// Calculate distance between two points using the Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

