import type { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const usersRaw = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        remarks: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Map to expected format with 'id' field and 'blocked' status for frontend compatibility
    const users = usersRaw.map(user => ({
      id: String(user.userId),
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.remarks === 'Blocked by admin',
    }))

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
