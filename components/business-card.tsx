import Image from "next/image"
import { MapPin, Phone, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Business } from "@/types/business"

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{business.name}</h3>
          <Badge variant="outline">{business.distance}km</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{business.category}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-muted-foreground" />
            <span>{business.address}</span>
          </div>
          {business.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-muted-foreground" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.openingHours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-muted-foreground" />
              <span>{business.openingHours}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  )
}

