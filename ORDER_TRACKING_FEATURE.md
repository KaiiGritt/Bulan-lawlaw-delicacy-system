# Order Tracking System Feature

## Overview
Comprehensive order tracking system with real-time status updates, email notifications, and detailed tracking history.

## Features Implemented

### 1. Database Schema Updates
- **Order Model**: Added tracking fields
  - `trackingNumber`: Courier tracking number
  - `estimatedDeliveryDate`: Expected delivery date
  - `shippedAt`: Timestamp when order was shipped
  - `deliveredAt`: Timestamp when order was delivered

- **OrderTrackingHistory Model**: New table for tracking timeline
  - Stores complete tracking history for each order
  - Includes status, location, description, and timestamp
  - Ordered chronologically for timeline display

### 2. API Endpoints

#### GET /api/orders/[id]/tracking
- Retrieve order tracking information and history
- Accessible by order owner and admins
- Returns tracking number, courier, delivery date, and full history

#### POST /api/orders/[id]/tracking
- Add new tracking status update (Seller/Admin only)
- Automatically sends email notification to customer
- Creates tracking history entry

#### PUT /api/orders/[id]/tracking
- Update tracking information (Seller/Admin only)
- Update tracking number, courier, delivery date, or status
- Auto-sets shipped/delivered timestamps
- Sends email notification on status changes

### 3. UI Components

#### OrderTracking Component
**Location**: `src/app/components/OrderTracking.tsx`
- Beautiful timeline view of tracking history
- Color-coded status badges
- Icons for each status type
- Location and timestamp display
- Responsive design with dark mode support

**Features**:
- Real-time tracking information
- Visual timeline with connecting lines
- Estimated delivery date display
- Tracking number and courier info
- Empty state when no tracking updates

#### SellerTrackingManager Component
**Location**: `src/app/components/SellerTrackingManager.tsx`
- Seller-facing tracking management interface
- Two main forms:
  1. Update Tracking Info (tracking number, courier, delivery date)
  2. Add Status Update (with location and description)

**Features**:
- Easy-to-use forms with validation
- Philippine courier services dropdown
- Date picker for estimated delivery
- Rich status descriptions
- Loading states and error handling

### 4. Email Notification System

#### Implementation
**Location**: `src/app/lib/notifications.ts`

**Features**:
- Beautifully designed HTML email templates
- Plain text fallback
- Color-coded status badges in emails
- Tracking information display
- Direct link to order details
- Professional branding

**Supported Status Messages**:
- Pending: Order received and processing
- Processing: Being prepared for shipment
- Shipped: On its way to customer
- Out for Delivery: Arriving soon
- Delivered: Successfully delivered
- Cancelled: Order cancelled

#### Configuration
Add to `.env.local`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

### 5. Order Status Flow

```
pending → processing → shipped → out_for_delivery → delivered
                    ↘ cancelled
```

## Usage Guide

### For Customers
1. Go to Orders page
2. Click on an order to view details
3. See tracking information and status timeline
4. Receive email notifications on status updates

### For Sellers
1. Navigate to seller dashboard
2. Go to Orders tab
3. Select an order
4. Use "Update Tracking Info" to add tracking number and courier
5. Use "Add Status Update" to log new tracking events
6. Customer receives automatic email notification

### For Admins
- Same as sellers, with access to all orders
- Can manage tracking for any order in the system

## Courier Services Supported

- J&T Express
- LBC
- Lalamove
- Grab Express
- Flash Express
- Ninja Van
- GoGo Express
- Other (custom)

## Future Enhancements

### Ready to Implement
1. **SMS Notifications**: Integration with Twilio/Semaphore
2. **Push Notifications**: Browser push notifications
3. **Courier API Integration**: Auto-fetch tracking from courier APIs
4. **Estimated Delivery Calculations**: Smart delivery date predictions
5. **Tracking Page**: Public tracking page with order ID
6. **WhatsApp Notifications**: Send updates via WhatsApp Business API

### Additional Ideas
- Package photos at each checkpoint
- Signature on delivery
- Delivery instructions
- Reschedule delivery
- Proof of delivery
- Real-time GPS tracking (if supported by courier)

## Testing

### Test the Feature
1. Create a test order
2. As seller, add tracking information
3. Add status updates
4. Check email inbox for notifications
5. View tracking timeline as customer

### Email Testing
If email credentials are not configured, the system will log warnings but continue to work (emails won't be sent).

## Technical Notes

### Database
- Uses Prisma ORM
- MySQL database
- Cascade delete ensures tracking history is removed with orders

### Email Service
- Uses Nodemailer
- Supports any SMTP service
- Graceful fallback if email fails
- Doesn't block API requests if email service is down

### Security
- Customers can only view their own order tracking
- Sellers and admins can update any order tracking
- All endpoints require authentication
- Input validation on all fields

## API Response Examples

### GET /api/orders/[id]/tracking
```json
{
  "orderId": "cm4abc123",
  "status": "shipped",
  "trackingNumber": "JT1234567890",
  "courier": "J&T Express",
  "estimatedDeliveryDate": "2024-12-15T00:00:00.000Z",
  "shippedAt": "2024-12-10T08:30:00.000Z",
  "deliveredAt": null,
  "trackingHistory": [
    {
      "id": "cm4xyz789",
      "status": "shipped",
      "location": "Manila Sorting Facility",
      "description": "Package has been shipped",
      "createdAt": "2024-12-10T08:30:00.000Z"
    }
  ]
}
```

## Integration with Existing Features

- ✅ Integrates with existing Order system
- ✅ Works with seller dashboard
- ✅ Compatible with admin panel
- ✅ Uses existing authentication
- ✅ Maintains existing order flow

## Support

For questions or issues with the order tracking system:
1. Check logs for error messages
2. Verify email configuration
3. Ensure database is up to date
4. Review API permissions

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Status**: ✅ Production Ready
