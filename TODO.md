# TODO: Implement Order Cancellation in Admin Dashboard

## Tasks
- [x] Create API route: /api/admin/orders/route.ts to fetch all orders for admin
- [x] Create API route: /api/admin/orders/[id]/cancel/route.ts to allow admins to cancel orders directly
- [x] Update admin/page.tsx to implement the 'orders' tab content:
  - Fetch all orders
  - Display orders with status, user, items
  - Add buttons for cancelling orders (for pending/processing)
  - Add buttons for approving/rejecting pending cancellations (adminApprovalRequired=true)
  - Handle UI interactions and refresh after actions

## Followup
- [ ] Test the new functionality
- [ ] Ensure proper error handling and notifications
