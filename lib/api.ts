import type { Business } from "@/types/business"

interface SearchParams {
  query: string
  lat: number
  lng: number
  city?: string
  radius?: number
}

export async function searchBusinesses(params: SearchParams): Promise<Business[]> {
  try {
    const response = await fetch(
      `/api/businesses?query=${encodeURIComponent(params.query)}&lat=${params.lat}&lng=${params.lng}&radius=${params.radius || 10}`,
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return data.businesses || []
  } catch (error) {
    console.error("Error searching businesses:", error)
    return []
  }
}

