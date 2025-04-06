import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lng = Number.parseFloat(searchParams.get("lng") || "0")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  try {
    // Call the Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Geocoding API error: ${data.status}`)
    }

    // Parse the response to extract city, state, and country
    const locationInfo = extractLocationInfo(data.results)

    return NextResponse.json(locationInfo)
  } catch (error) {
    console.error("Error geocoding coordinates:", error)
    return NextResponse.json({ error: "Failed to geocode coordinates" }, { status: 500 })
  }
}

function extractLocationInfo(results: any[]) {
  // Default values
  let city = "Unknown"
  let state = "Unknown"
  let country = "Unknown"

  if (!results || results.length === 0) {
    return { city, state, country }
  }

  // Find address components from results
  for (const result of results) {
    const addressComponents = result.address_components || []

    for (const component of addressComponents) {
      const types = component.types || []

      // Extract city
      if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name
      }

      // Extract state
      if (types.includes("administrative_area_level_1")) {
        state = component.short_name
      }

      // Extract country
      if (types.includes("country")) {
        country = component.long_name
      }
    }

    // If we found all components, break the loop
    if (city !== "Unknown" && state !== "Unknown" && country !== "Unknown") {
      break
    }
  }

  return { city, state, country }
}

