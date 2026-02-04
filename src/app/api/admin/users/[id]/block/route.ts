import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'

// PATCH /api/admin/users/[id]/block - Block or unblock a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { blocked } = await request.json()

    if (typeof blocked !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid blocked status' },
        { status: 400 }
      )
    }

    const { id } = await params

    const user = await prisma.users.update({
      where: { userId: parseInt(id) },
      data: { remarks: blocked ? 'Blocked by admin' : null },
      select: {
        userId: true,
        name: true,
        email: true,
        remarks: true,
        role: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user block status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
