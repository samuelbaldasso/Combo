import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Get all businesses for admin
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}

// Create a new business
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

