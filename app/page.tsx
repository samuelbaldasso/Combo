"use client"

import { useState, useEffect } from "react"
import { Search, MapIcon, ListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessCard } from "@/components/business-card"
import { BusinessMap } from "@/components/business-map"
import { LocationSearch } from "@/components/location-search"
import { useGeolocation } from "@/hooks/use-geolocation"
import { loadGoogleMapsScript } from "@/lib/google-maps"
import { searchBusinesses } from "@/lib/api"
import type { Business } from "@/types/business"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const { location, isLocating, error, locateUser, setLocation } = useGeolocation()
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsGoogleMapsLoaded(true))
      .catch((err) => console.error("Failed to load Google Maps:", err))
  }, [])

  // Auto-locate user on first load
  useEffect(() => {
    if (!location && !isLocating && !error) {
      locateUser()
    }
  }, [location, isLocating, error, locateUser])

  const handleSearch = async () => {
    if (!location) {
      await locateUser()
      return
    }

    setIsLoading(true)
    try {
      const results = await searchBusinesses({
        query: searchQuery,
        lat: location.latitude,
        lng: location.longitude,
        city: location.city,
      })
      setBusinesses(results)
      setSelectedBusiness(null)
    } catch (error) {
      console.error("Error searching businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (newLocation: {
    latitude: number
    longitude: number
    city: string
    state: string
  }) => {
    // Update location and clear previous results
    setLocation({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      city: newLocation.city,
      state: newLocation.state,
    })
    setBusinesses([])
    setSelectedBusiness(null)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Encontre Negócios Próximos</h1>

      <div className="mb-6">
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          placeholder="Digite um endereço ou cidade"
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar (ex: pizzaria, farmácia, etc)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || isLocating || !location}
            className="flex items-center gap-2"
          >
            <Search size={18} />
            {isLocating ? "Obtendo localização..." : "Buscar"}
          </Button>
        </div>
      </div>

      {location && (
        <p className="text-sm text-muted-foreground mb-4">
          Buscando em: {location.city}, {location.state}
        </p>
      )}

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">{error}</div>}

      {businesses.length > 0 && (
        <div className="mb-6">
          <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as "list" | "map")}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Resultados ({businesses.length})</h2>
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-1">
                  <ListIcon size={16} />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1">
                  <MapIcon size={16} />
                  <span className="hidden sm:inline">Mapa</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              {isGoogleMapsLoaded ? (
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-2/3">
                    <BusinessMap
                      businesses={businesses}
                      userLocation={location}
                      onBusinessSelect={setSelectedBusiness}
                    />
                  </div>
                  <div className="w-full lg:w-1/3">
                    {selectedBusiness ? (
                      <BusinessCard business={selectedBusiness} />
                    ) : (
                      <div className="border rounded-lg p-6 text-center text-muted-foreground">
                        Selecione um negócio no mapa para ver detalhes
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Carregando mapa...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {businesses.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nenhum resultado encontrado" : "Faça uma busca para encontrar negócios próximos"}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Buscando negócios próximos...</p>
        </div>
      )}
    </main>
  )
}

