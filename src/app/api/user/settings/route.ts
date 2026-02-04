import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// GET /api/user/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get existing settings
    let settings = await prisma.user_settings.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    // If no settings exist, return defaults
    if (!settings) {
      const defaultSettings = {
        displayName: session.user.name || '',
        bio: '',
        themeColor: 'green',
        notifications: true,
        emailUpdates: true,
        orderUpdates: true,
        promotionalEmails: false,
        smsNotifications: false,
        inAppNotifications: true,
        showProfile: true,
        showOrders: false,
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        defaultAddress: '',
        preferredTimeSlot: 'anytime',
        specialInstructions: '',
        storeHours: '9:00 AM - 6:00 PM',
        shippingTime: '1-3 business days',
        returnPolicy: '7 days return policy',
        minimumOrder: null,
        freeShippingThreshold: null,
      }
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userId = parseInt(session.user.id)

    // Prepare the data for upsert
    const settingsData = {
      displayName: body.displayName || null,
      bio: body.bio || null,
      themeColor: body.themeColor || 'green',
      notifications: body.notifications ?? true,
      emailUpdates: body.emailUpdates ?? true,
      orderUpdates: body.orderUpdates ?? true,
      promotionalEmails: body.promotionalEmails ?? false,
      smsNotifications: body.smsNotifications ?? false,
      inAppNotifications: body.inAppNotifications ?? true,
      showProfile: body.privacySettings?.showProfile ?? body.showProfile ?? true,
      showOrders: body.privacySettings?.showOrders ?? body.showOrders ?? false,
      fontSize: body.accessibility?.fontSize ?? body.fontSize ?? 'medium',
      highContrast: body.accessibility?.highContrast ?? body.highContrast ?? false,
      reducedMotion: body.accessibility?.reducedMotion ?? body.reducedMotion ?? false,
      defaultAddress: body.shippingPreferences?.defaultAddress ?? body.defaultAddress ?? null,
      preferredTimeSlot: body.shippingPreferences?.preferredTimeSlot ?? body.preferredTimeSlot ?? 'anytime',
      specialInstructions: body.shippingPreferences?.specialInstructions ?? body.specialInstructions ?? null,
      storeHours: body.storeSettings?.storeHours ?? body.storeHours ?? null,
      shippingTime: body.storeSettings?.shippingTime ?? body.shippingTime ?? null,
      returnPolicy: body.storeSettings?.returnPolicy ?? body.returnPolicy ?? null,
      minimumOrder: body.storeSettings?.minimumOrder ? parseFloat(body.storeSettings.minimumOrder) : body.minimumOrder ? parseFloat(body.minimumOrder) : null,
      freeShippingThreshold: body.storeSettings?.freeShippingThreshold ? parseFloat(body.storeSettings.freeShippingThreshold) : body.freeShippingThreshold ? parseFloat(body.freeShippingThreshold) : null,
    }

    // Upsert the settings (create if not exists, update if exists)
    const settings = await prisma.user_settings.upsert({
      where: { userId },
      create: {
        userId,
        ...settingsData
      },
      update: settingsData
    })

    // Also update user's name if displayName changed
    if (body.displayName) {
      await prisma.users.update({
        where: { userId },
        data: { name: body.displayName }
      })
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
