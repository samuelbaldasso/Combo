import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lng = Number.parseFloat(searchParams.get("lng") || "0")
  const radius = Number.parseFloat(searchParams.get("radius") || "10") // Default 10km radius

  try {
    // Using Prisma with PostgreSQL and PostGIS extension
    // Note: This requires the PostGIS extension to be enabled in your PostgreSQL database
    const businesses = await prisma.$queryRaw`
      SELECT 
        b.id,
        b.name,
        b.category,
        b.address,
        b.phone,
        b.latitude,
        b.longitude,
        b."openingHours", 
        ST_Distance(
          ST_MakePoint(${lng}, ${lat})::geography,
          ST_MakePoint(b.longitude, b.latitude)::geography
        ) / 1000 as distance
      FROM "Business" b
      WHERE ST_DWithin(
        ST_MakePoint(${lng}, ${lat})::geography,
        ST_MakePoint(b.longitude, b.latitude)::geography,
        ${radius * 1000}
      )
      AND (
        b.name ILIKE ${`%${query}%`} OR 
        b.category ILIKE ${`%${query}%`}
      )
      ORDER BY distance ASC
      LIMIT 50
    `

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error("Error searching businesses:", error)
    return NextResponse.json({ error: "Failed to search businesses" }, { status: 500 })
  }
}

// API endpoint to add a new business
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "category", "address", "latitude", "longitude"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new business
    const business = await prisma.business.create({
      data: {
        name: body.name,
        category: body.category,
        address: body.address,
        phone: body.phone || null,
        latitude: Number.parseFloat(body.latitude),
        longitude: Number.parseFloat(body.longitude),
        openingHours: body.openingHours || null,
      },
    })

    return NextResponse.json({ business }, { status: 201 })
  } catch (error) {
    console.error("Error creating business:", error)
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
  }
}

