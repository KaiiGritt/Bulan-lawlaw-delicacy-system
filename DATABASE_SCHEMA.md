# Lawlaw Delights - Database Schema & Queries

## Database Information
- **Database Type:** MySQL
- **Host:** Railway (hopper.proxy.rlwy.net:33001)
- **Database Name:** railway

---

## Table of Contents
1. [Database Tables Overview](#database-tables-overview)
2. [Table Definitions](#table-definitions)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Common SQL Queries](#common-sql-queries)

---

## Database Tables Overview

| Table Name | Description | Primary Key |
|------------|-------------|-------------|
| `users` | User accounts (buyers, sellers, admins) | userId |
| `products` | Product listings | productId |
| `recipes` | Cooking recipes | recipeId |
| `recipe_ingredients` | Ingredients for recipes | ingredientId |
| `recipe_instructions` | Step-by-step instructions | instructionId |
| `recipe_reviews` | User reviews on recipes | reviewId |
| `saved_recipes` | User's saved/favorite recipes | savedRecipeId |
| `cart_items` | Shopping cart items | cartItemId |
| `orders` | Customer orders | orderId |
| `order_items` | Items within orders | orderItemId |
| `order_tracking_history` | Order tracking timeline | trackingHistoryId |
| `addresses` | User shipping addresses | addressId |
| `comments` | Product reviews/ratings | commentId |
| `conversations` | Chat conversations | conversationId |
| `messages` | Chat messages | messageId |
| `notifications` | User notifications | notificationId |
| `seller_applications` | Seller registration requests | applicationId |
| `user_settings` | User preferences | settingsId |
| `otps` | OTP codes for verification | otpId |
| `pending_registrations` | Unverified registrations | registrationId |

---

## Table Definitions

### 1. users
Stores all user accounts including buyers, sellers, and administrators.

```sql
CREATE TABLE `users` (
    `userId`           INT AUTO_INCREMENT PRIMARY KEY,
    `email`            VARCHAR(255) NOT NULL UNIQUE,
    `phoneNumber`      VARCHAR(255) UNIQUE,
    `name`             VARCHAR(255),
    `password`         VARCHAR(255) NOT NULL,
    `role`             VARCHAR(50) DEFAULT 'user',  -- 'user', 'seller', 'admin'
    `remarks`          TEXT,
    `profilePicture`   LONGTEXT,
    `emailVerified`    BOOLEAN DEFAULT FALSE,
    `resetToken`       VARCHAR(255),
    `resetTokenExpiry` DATETIME,
    `createdAt`        DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`        DATETIME
);
```

### 2. products
Product listings created by sellers.

```sql
CREATE TABLE `products` (
    `productId`   INT AUTO_INCREMENT PRIMARY KEY,
    `name`        VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price`       FLOAT NOT NULL,
    `category`    VARCHAR(255) NOT NULL,
    `image`       LONGTEXT NOT NULL,
    `stock`       INT DEFAULT 0,
    `userId`      INT NOT NULL,
    `featured`    BOOLEAN DEFAULT FALSE,
    `rating`      FLOAT DEFAULT 0,
    `createdAt`   DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`   DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 3. recipes
Cooking recipes with metadata.

```sql
CREATE TABLE `recipes` (
    `recipeId`    INT AUTO_INCREMENT PRIMARY KEY,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image`       LONGTEXT NOT NULL,
    `prepTime`    INT NOT NULL,           -- in minutes
    `cookTime`    INT NOT NULL,           -- in minutes
    `servings`    INT NOT NULL,
    `difficulty`  VARCHAR(50) NOT NULL,   -- 'Easy', 'Medium', 'Hard'
    `rating`      FLOAT DEFAULT 0,
    `userId`      INT,
    `createdAt`   DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`   DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
);
```

### 4. recipe_ingredients
Ingredients linked to recipes.

```sql
CREATE TABLE `recipe_ingredients` (
    `ingredientId` INT AUTO_INCREMENT PRIMARY KEY,
    `recipeId`     INT NOT NULL,
    `name`         VARCHAR(255) NOT NULL,
    `quantity`     VARCHAR(255),
    `order`        INT NOT NULL,
    FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`recipeId`) ON DELETE CASCADE
);
```

### 5. recipe_instructions
Step-by-step cooking instructions.

```sql
CREATE TABLE `recipe_instructions` (
    `instructionId` INT AUTO_INCREMENT PRIMARY KEY,
    `recipeId`      INT NOT NULL,
    `stepNumber`    INT NOT NULL,
    `instruction`   TEXT NOT NULL,
    FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`recipeId`) ON DELETE CASCADE
);
```

### 6. recipe_reviews
User reviews and ratings for recipes.

```sql
CREATE TABLE `recipe_reviews` (
    `reviewId`  INT AUTO_INCREMENT PRIMARY KEY,
    `recipeId`  INT NOT NULL,
    `userId`    INT NOT NULL,
    `rating`    INT NOT NULL,             -- 1-5 stars
    `content`   VARCHAR(255) NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME,
    FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`recipeId`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    UNIQUE (`recipeId`, `userId`)
);
```

### 7. saved_recipes
User's saved/favorited recipes.

```sql
CREATE TABLE `saved_recipes` (
    `savedRecipeId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId`        INT NOT NULL,
    `recipeId`      INT NOT NULL,
    `notes`         TEXT,
    `createdAt`     DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`     DATETIME,
    FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`recipeId`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    UNIQUE (`userId`, `recipeId`)
);
```

### 8. cart_items
Shopping cart items for users.

```sql
CREATE TABLE `cart_items` (
    `cartItemId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId`     INT NOT NULL,
    `productId`  INT NOT NULL,
    `quantity`   INT DEFAULT 1,
    `createdAt`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`  DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON DELETE CASCADE,
    UNIQUE (`userId`, `productId`)
);
```

### 9. orders
Customer order records.

```sql
CREATE TABLE `orders` (
    `orderId`               INT AUTO_INCREMENT PRIMARY KEY,
    `userId`                INT NOT NULL,
    `status`                VARCHAR(50) DEFAULT 'pending',  -- pending, processing, shipped, delivered, cancelled
    `totalAmount`           FLOAT NOT NULL,
    `shippingAddress`       TEXT NOT NULL,
    `billingAddress`        TEXT NOT NULL,
    `paymentMethod`         VARCHAR(50) NOT NULL,           -- COD, GCash, Card
    `adminApprovalRequired` BOOLEAN DEFAULT FALSE,
    `cancellationReason`    VARCHAR(255),
    `cancelledAt`           DATETIME,
    `trackingNumber`        VARCHAR(255),
    `estimatedDeliveryDate` DATETIME,
    `shippedAt`             DATETIME,
    `deliveredAt`           DATETIME,
    `createdAt`             DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`             DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 10. order_items
Individual items within an order.

```sql
CREATE TABLE `order_items` (
    `orderItemId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId`     INT NOT NULL,
    `productId`   INT NOT NULL,
    `quantity`    INT NOT NULL,
    `price`       FLOAT NOT NULL,
    `createdAt`   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE,
    FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON DELETE CASCADE
);
```

### 11. order_tracking_history
Timeline of order status changes.

```sql
CREATE TABLE `order_tracking_history` (
    `trackingHistoryId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId`           INT NOT NULL,
    `status`            VARCHAR(50) NOT NULL,
    `location`          VARCHAR(255),
    `description`       VARCHAR(255) NOT NULL,
    `createdAt`         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE
);
```

### 12. addresses
User shipping addresses (Philippines format).

```sql
CREATE TABLE `addresses` (
    `addressId`     INT AUTO_INCREMENT PRIMARY KEY,
    `userId`        INT NOT NULL,
    `fullName`      VARCHAR(255) NOT NULL,
    `phoneNumber`   VARCHAR(50) NOT NULL,
    `region`        VARCHAR(255) NOT NULL,
    `province`      VARCHAR(255) NOT NULL,
    `city`          VARCHAR(255) NOT NULL,
    `barangay`      VARCHAR(255) NOT NULL,
    `streetAddress` VARCHAR(255) NOT NULL,
    `postalCode`    VARCHAR(20) NOT NULL,
    `landmark`      VARCHAR(255),
    `isDefault`     BOOLEAN DEFAULT FALSE,
    `createdAt`     DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`     DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 13. comments
Product reviews and ratings.

```sql
CREATE TABLE `comments` (
    `commentId`     INT AUTO_INCREMENT PRIMARY KEY,
    `productId`     INT NOT NULL,
    `userId`        INT NOT NULL,
    `rating`        INT NOT NULL,              -- 1-5 stars
    `content`       VARCHAR(255) NOT NULL,
    `sellerReply`   VARCHAR(255),
    `sellerReplyAt` DATETIME,
    `createdAt`     DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`     DATETIME,
    FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    UNIQUE (`productId`, `userId`)
);
```

### 14. conversations
Chat conversations between buyers and sellers.

```sql
CREATE TABLE `conversations` (
    `conversationId` INT AUTO_INCREMENT PRIMARY KEY,
    `sellerId`       INT NOT NULL,
    `buyerId`        INT NOT NULL,
    `productId`      INT NOT NULL,
    `status`         VARCHAR(50) DEFAULT 'active',
    `createdAt`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`      DATETIME,
    FOREIGN KEY (`sellerId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    FOREIGN KEY (`buyerId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON DELETE CASCADE,
    UNIQUE (`sellerId`, `buyerId`, `productId`)
);
```

### 15. messages
Individual chat messages.

```sql
CREATE TABLE `messages` (
    `messageId`      INT AUTO_INCREMENT PRIMARY KEY,
    `conversationId` INT NOT NULL,
    `senderId`       INT NOT NULL,
    `content`        VARCHAR(255) NOT NULL,
    `isRead`         BOOLEAN DEFAULT FALSE,
    `createdAt`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`conversationId`) ON DELETE CASCADE,
    FOREIGN KEY (`senderId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 16. notifications
System notifications for users.

```sql
CREATE TABLE `notifications` (
    `notificationId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId`         INT NOT NULL,
    `title`          VARCHAR(255) NOT NULL,
    `message`        VARCHAR(255) NOT NULL,
    `type`           VARCHAR(50) NOT NULL,     -- order, message, system, etc.
    `isRead`         BOOLEAN DEFAULT FALSE,
    `createdAt`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 17. seller_applications
Applications for seller accounts.

```sql
CREATE TABLE `seller_applications` (
    `applicationId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId`        INT NOT NULL UNIQUE,
    `businessName`  VARCHAR(255) NOT NULL,
    `businessType`  VARCHAR(255) NOT NULL,
    `description`   VARCHAR(255) NOT NULL,
    `contactNumber` VARCHAR(50) NOT NULL,
    `address`       VARCHAR(255) NOT NULL,
    `businessLogo`  LONGTEXT,
    `primaryId`     LONGTEXT,
    `secondaryId`   LONGTEXT,
    `status`        VARCHAR(50) DEFAULT 'pending',  -- pending, approved, rejected
    `createdAt`     DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`     DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 18. user_settings
User preferences and settings.

```sql
CREATE TABLE `user_settings` (
    `settingsId`            INT AUTO_INCREMENT PRIMARY KEY,
    `userId`                INT NOT NULL UNIQUE,
    `displayName`           VARCHAR(255),
    `bio`                   TEXT,
    `themeColor`            VARCHAR(50) DEFAULT 'green',
    `notifications`         BOOLEAN DEFAULT TRUE,
    `emailUpdates`          BOOLEAN DEFAULT TRUE,
    `orderUpdates`          BOOLEAN DEFAULT TRUE,
    `promotionalEmails`     BOOLEAN DEFAULT FALSE,
    `smsNotifications`      BOOLEAN DEFAULT FALSE,
    `inAppNotifications`    BOOLEAN DEFAULT TRUE,
    `showProfile`           BOOLEAN DEFAULT TRUE,
    `showOrders`            BOOLEAN DEFAULT FALSE,
    `fontSize`              VARCHAR(20) DEFAULT 'medium',
    `highContrast`          BOOLEAN DEFAULT FALSE,
    `reducedMotion`         BOOLEAN DEFAULT FALSE,
    `defaultAddress`        TEXT,
    `preferredTimeSlot`     VARCHAR(50) DEFAULT 'anytime',
    `specialInstructions`   TEXT,
    `storeHours`            VARCHAR(255),
    `shippingTime`          VARCHAR(255),
    `returnPolicy`          TEXT,
    `minimumOrder`          FLOAT,
    `freeShippingThreshold` FLOAT,
    `createdAt`             DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`             DATETIME,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);
```

### 19. otps
OTP codes for email verification.

```sql
CREATE TABLE `otps` (
    `otpId`     INT AUTO_INCREMENT PRIMARY KEY,
    `userId`    INT,
    `email`     VARCHAR(255) NOT NULL,
    `code`      VARCHAR(10) NOT NULL,
    `verified`  BOOLEAN DEFAULT FALSE,
    `attempts`  INT DEFAULT 0,
    `expiresAt` DATETIME NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    INDEX (`email`)
);
```

### 20. pending_registrations
Temporary storage for unverified registrations.

```sql
CREATE TABLE `pending_registrations` (
    `registrationId` INT AUTO_INCREMENT PRIMARY KEY,
    `email`          VARCHAR(255) NOT NULL UNIQUE,
    `name`           VARCHAR(255) NOT NULL,
    `password`       VARCHAR(255) NOT NULL,
    `phoneNumber`    VARCHAR(50),
    `role`           VARCHAR(50) DEFAULT 'user',
    `expiresAt`      DATETIME NOT NULL,
    `createdAt`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`      DATETIME
);
```

---

## Entity Relationship Diagram

```
                                    ┌─────────────────┐
                                    │     users       │
                                    ├─────────────────┤
                                    │ userId (PK)     │
                                    │ email           │
                                    │ name            │
                                    │ role            │
                                    └────────┬────────┘
                                             │
         ┌───────────────┬───────────────────┼───────────────────┬───────────────┐
         │               │                   │                   │               │
         ▼               ▼                   ▼                   ▼               ▼
┌────────────────┐ ┌───────────┐    ┌───────────────┐    ┌───────────┐   ┌───────────────┐
│   products     │ │  orders   │    │  addresses    │    │  recipes  │   │ user_settings │
├────────────────┤ ├───────────┤    ├───────────────┤    ├───────────┤   ├───────────────┤
│ productId (PK) │ │orderId(PK)│    │addressId (PK) │    │recipeId   │   │settingsId(PK) │
│ userId (FK)    │ │userId(FK) │    │userId (FK)    │    │userId(FK) │   │userId (FK)    │
└───────┬────────┘ └─────┬─────┘    └───────────────┘    └─────┬─────┘   └───────────────┘
        │                │                                     │
        │                ▼                                     │
        │         ┌─────────────┐                              │
        │         │ order_items │                              │
        │         ├─────────────┤                              ▼
        │         │orderItemId  │                    ┌───────────────────┐
        │         │orderId (FK) │                    │recipe_ingredients │
        │         │productId(FK)│                    ├───────────────────┤
        │         └─────────────┘                    │ingredientId (PK)  │
        │                                            │recipeId (FK)      │
        │                                            └───────────────────┘
        ▼
┌────────────────┐                               ┌───────────────────┐
│   comments     │                               │recipe_instructions│
├────────────────┤                               ├───────────────────┤
│commentId (PK)  │                               │instructionId (PK) │
│productId (FK)  │                               │recipeId (FK)      │
│userId (FK)     │                               └───────────────────┘
└────────────────┘
```

---

## Common SQL Queries

### User Queries

```sql
-- Get all users
SELECT * FROM users;

-- Get user by email
SELECT * FROM users WHERE email = 'example@email.com';

-- Get all sellers
SELECT * FROM users WHERE role = 'seller';

-- Get all admins
SELECT * FROM users WHERE role = 'admin';

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Get recently registered users
SELECT * FROM users ORDER BY createdAt DESC LIMIT 10;
```

### Product Queries

```sql
-- Get all products
SELECT * FROM products;

-- Get products by seller
SELECT * FROM products WHERE userId = 1;

-- Get featured products
SELECT * FROM products WHERE featured = TRUE;

-- Get products by category
SELECT * FROM products WHERE category = 'Fresh Fish';

-- Get products with seller info
SELECT p.*, u.name as sellerName
FROM products p
JOIN users u ON p.userId = u.userId;

-- Get top rated products
SELECT * FROM products ORDER BY rating DESC LIMIT 10;

-- Get low stock products
SELECT * FROM products WHERE stock < 10 AND stock > 0;

-- Get out of stock products
SELECT * FROM products WHERE stock = 0;

-- Search products by name
SELECT * FROM products WHERE name LIKE '%lawlaw%';
```

### Recipe Queries

```sql
-- Get all recipes
SELECT * FROM recipes;

-- Get recipes by user
SELECT * FROM recipes WHERE userId = 1;

-- Get recipes with ingredients
SELECT r.*, ri.name as ingredient, ri.quantity
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.recipeId = ri.recipeId
ORDER BY r.recipeId, ri.order;

-- Get recipes with instructions
SELECT r.*, rin.stepNumber, rin.instruction
FROM recipes r
LEFT JOIN recipe_instructions rin ON r.recipeId = rin.recipeId
ORDER BY r.recipeId, rin.stepNumber;

-- Get recipes by difficulty
SELECT * FROM recipes WHERE difficulty = 'Easy';

-- Get quick recipes (under 30 min total)
SELECT * FROM recipes WHERE (prepTime + cookTime) <= 30;

-- Get top rated recipes
SELECT * FROM recipes ORDER BY rating DESC LIMIT 10;

-- Count recipes by difficulty
SELECT difficulty, COUNT(*) as count FROM recipes GROUP BY difficulty;
```

### Order Queries

```sql
-- Get all orders
SELECT * FROM orders;

-- Get orders by user
SELECT * FROM orders WHERE userId = 1;

-- Get orders by status
SELECT * FROM orders WHERE status = 'pending';

-- Get recent orders
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 20;

-- Get orders with items
SELECT o.*, oi.quantity, oi.price, p.name as productName
FROM orders o
JOIN order_items oi ON o.orderId = oi.orderId
JOIN products p ON oi.productId = p.productId;

-- Get total sales
SELECT SUM(totalAmount) as totalSales FROM orders WHERE status = 'delivered';

-- Get sales by day
SELECT DATE(createdAt) as date, SUM(totalAmount) as dailySales
FROM orders
WHERE status = 'delivered'
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- Get order tracking history
SELECT oth.*, o.status as currentStatus
FROM order_tracking_history oth
JOIN orders o ON oth.orderId = o.orderId
WHERE oth.orderId = 1
ORDER BY oth.createdAt;
```

### Cart Queries

```sql
-- Get user's cart
SELECT ci.*, p.name, p.price, p.image, p.stock
FROM cart_items ci
JOIN products p ON ci.productId = p.productId
WHERE ci.userId = 1;

-- Get cart total
SELECT SUM(ci.quantity * p.price) as total
FROM cart_items ci
JOIN products p ON ci.productId = p.productId
WHERE ci.userId = 1;

-- Clear user's cart
DELETE FROM cart_items WHERE userId = 1;
```

### Comment/Review Queries

```sql
-- Get product reviews
SELECT c.*, u.name as userName
FROM comments c
JOIN users u ON c.userId = u.userId
WHERE c.productId = 1
ORDER BY c.createdAt DESC;

-- Get average rating for product
SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
FROM comments WHERE productId = 1;

-- Get all reviews by user
SELECT c.*, p.name as productName
FROM comments c
JOIN products p ON c.productId = p.productId
WHERE c.userId = 1;
```

### Chat/Message Queries

```sql
-- Get user's conversations
SELECT c.*,
       seller.name as sellerName,
       buyer.name as buyerName,
       p.name as productName
FROM conversations c
JOIN users seller ON c.sellerId = seller.userId
JOIN users buyer ON c.buyerId = buyer.userId
JOIN products p ON c.productId = p.productId
WHERE c.sellerId = 1 OR c.buyerId = 1;

-- Get messages in conversation
SELECT m.*, u.name as senderName
FROM messages m
JOIN users u ON m.senderId = u.userId
WHERE m.conversationId = 1
ORDER BY m.createdAt;

-- Get unread message count
SELECT COUNT(*) as unreadCount
FROM messages m
JOIN conversations c ON m.conversationId = c.conversationId
WHERE (c.sellerId = 1 OR c.buyerId = 1)
  AND m.senderId != 1
  AND m.isRead = FALSE;
```

### Seller Application Queries

```sql
-- Get pending applications
SELECT sa.*, u.email, u.name
FROM seller_applications sa
JOIN users u ON sa.userId = u.userId
WHERE sa.status = 'pending';

-- Get approved sellers
SELECT sa.*, u.email, u.name
FROM seller_applications sa
JOIN users u ON sa.userId = u.userId
WHERE sa.status = 'approved';
```

### Analytics Queries

```sql
-- Get overall stats
SELECT
    (SELECT COUNT(*) FROM users) as totalUsers,
    (SELECT COUNT(*) FROM users WHERE role = 'seller') as totalSellers,
    (SELECT COUNT(*) FROM products) as totalProducts,
    (SELECT COUNT(*) FROM orders) as totalOrders,
    (SELECT COUNT(*) FROM recipes) as totalRecipes;

-- Get sales summary
SELECT
    COUNT(*) as totalOrders,
    SUM(totalAmount) as totalRevenue,
    AVG(totalAmount) as avgOrderValue
FROM orders WHERE status = 'delivered';

-- Get top selling products
SELECT p.name, SUM(oi.quantity) as totalSold
FROM order_items oi
JOIN products p ON oi.productId = p.productId
JOIN orders o ON oi.orderId = o.orderId
WHERE o.status = 'delivered'
GROUP BY p.productId
ORDER BY totalSold DESC
LIMIT 10;

-- Get monthly sales
SELECT
    YEAR(createdAt) as year,
    MONTH(createdAt) as month,
    COUNT(*) as orders,
    SUM(totalAmount) as revenue
FROM orders
WHERE status = 'delivered'
GROUP BY YEAR(createdAt), MONTH(createdAt)
ORDER BY year DESC, month DESC;
```

### Address Queries

```sql
-- Get user's addresses
SELECT * FROM addresses WHERE userId = 1;

-- Get default address
SELECT * FROM addresses WHERE userId = 1 AND isDefault = TRUE;
```

### Saved Recipes Queries

```sql
-- Get user's saved recipes
SELECT sr.*, r.title, r.image, r.difficulty, r.prepTime, r.cookTime
FROM saved_recipes sr
JOIN recipes r ON sr.recipeId = r.recipeId
WHERE sr.userId = 1;

-- Check if recipe is saved
SELECT * FROM saved_recipes WHERE userId = 1 AND recipeId = 1;
```

---

## Indexes

The following indexes exist for query optimization:

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Product indexes
CREATE INDEX idx_products_userId ON products(userId);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);

-- Recipe indexes
CREATE INDEX idx_recipes_userId ON recipes(userId);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);

-- Order indexes
CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);

-- Cart indexes
CREATE INDEX idx_cart_items_userId ON cart_items(userId);

-- Message indexes
CREATE INDEX idx_messages_conversationId ON messages(conversationId);
```

---

*Last Updated: December 2025*
