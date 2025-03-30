import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Get a specific business
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const business = await prisma.business.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 })
  }
}

// Update a business
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "category", "address", "latitude", "longitude"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if business exists
    const existingBusiness = await prisma.business.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Update business
    const business = await prisma.business.update({
      where: {
        id: params.id,
      },
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

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 })
  }
}

// Delete a business
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if business exists
    const existingBusiness = await prisma.business.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Delete business
    await prisma.business.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json({ error: "Failed to delete business" }, { status: 500 })
  }
}

