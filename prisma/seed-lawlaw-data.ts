import * as fs from 'fs'

import * as path from 'path'
import mariadb from 'mariadb'

// Load .env file manually BEFORE doing anything
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

function parseConnectionUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  }
}

const databaseUrl = process.env.DATABASE_URL!
const connectionConfig = parseConnectionUrl(databaseUrl)

// Create a connection pool using mariadb directly
const pool = mariadb.createPool({
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  connectionLimit: 5,
  connectTimeout: 30000,
})

// Helper to escape strings for SQL
function escape(str: string): string {
  return str.replace(/'/g, "''")
}

// Wrapper object to simulate prisma-like interface using raw SQL
const prisma = {
  user: {
    async findUnique({ where }: { where: { email: string } }) {
      const conn = await pool.getConnection()
      try {
        const rows = await conn.query(
          `SELECT userId, email, name, role FROM users WHERE email = ?`,
          [where.email]
        )
        return rows[0] || null
      } finally {
        conn.release()
      }
    }
  },
  recipe: {
    async create({ data }: { data: any }) {
      const conn = await pool.getConnection()
      try {
        const result = await conn.query(
          `INSERT INTO recipes (userId, title, description, image, prepTime, cookTime, servings, difficulty, rating, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [data.userId, data.title, data.description, data.image, data.prepTime, data.cookTime, data.servings, data.difficulty, data.rating]
        )
        const recipeId = Number(result.insertId)

        // Insert ingredients
        if (data.ingredients?.create) {
          for (const ing of data.ingredients.create) {
            await conn.query(
              `INSERT INTO recipe_ingredients (recipeId, name, quantity, \`order\`) VALUES (?, ?, ?, ?)`,
              [recipeId, ing.name, ing.quantity, ing.order]
            )
          }
        }

        // Insert instructions
        if (data.instructions?.create) {
          for (const inst of data.instructions.create) {
            await conn.query(
              `INSERT INTO recipe_instructions (recipeId, stepNumber, instruction) VALUES (?, ?, ?)`,
              [recipeId, inst.stepNumber, inst.instruction]
            )
          }
        }

        return { id: recipeId, title: data.title }
      } finally {
        conn.release()
      }
    }
  },
  product: {
    async create({ data }: { data: any }) {
      const conn = await pool.getConnection()
      try {
        const result = await conn.query(
          `INSERT INTO products (userId, name, description, price, category, image, stock, rating, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [data.userId, data.name, data.description, data.price, data.category, data.image, data.stock, data.rating]
        )
        return { id: Number(result.insertId), name: data.name }
      } finally {
        conn.release()
      }
    }
  },
  async $disconnect() {
    await pool.end()
  }
}

// Placeholder image (a simple base64 gray placeholder)
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhd2xhdyBGaXNoPC90ZXh0Pjwvc3ZnPg=='

// Lawlaw fish recipes data
const lawlawRecipes = [
  {
    title: 'Classic Lawlaw Fish Sinigang',
    description: 'A traditional Filipino sour soup featuring fresh Lawlaw fish from Bulan, Sorsogon. The natural sweetness of the fish perfectly complements the tangy tamarind broth.',
    prepTime: 20,
    cookTime: 40,
    servings: 6,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Fresh Lawlaw fish', quantity: '1 kg', order: 1 },
      { name: 'Tamarind paste', quantity: '3 tbsp', order: 2 },
      { name: 'Tomatoes', quantity: '3 medium, quartered', order: 3 },
      { name: 'Onion', quantity: '1 large, sliced', order: 4 },
      { name: 'Kangkong (water spinach)', quantity: '1 bunch', order: 5 },
      { name: 'String beans', quantity: '1 cup, cut', order: 6 },
      { name: 'Radish', quantity: '1 medium, sliced', order: 7 },
      { name: 'Fish sauce', quantity: '3 tbsp', order: 8 },
      { name: 'Water', quantity: '8 cups', order: 9 },
      { name: 'Green chili', quantity: '2 pcs', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean the Lawlaw fish thoroughly, removing scales and innards. Cut into serving pieces.' },
      { stepNumber: 2, instruction: 'In a large pot, bring water to a boil. Add tomatoes and onion, simmer for 5 minutes.' },
      { stepNumber: 3, instruction: 'Add the tamarind paste and stir until dissolved.' },
      { stepNumber: 4, instruction: 'Gently add the Lawlaw fish pieces. Cook for 10-15 minutes until fish is tender.' },
      { stepNumber: 5, instruction: 'Add radish and string beans. Cook for 5 minutes.' },
      { stepNumber: 6, instruction: 'Season with fish sauce and add green chili.' },
      { stepNumber: 7, instruction: 'Add kangkong last, cook for 2 minutes until wilted. Serve hot with steamed rice.' },
    ],
  },
  {
    title: 'Grilled Lawlaw Fish (Inihaw na Lawlaw)',
    description: 'Simple yet flavorful grilled Lawlaw fish stuffed with tomatoes, onions, and native herbs. A Bicolano favorite perfect for outdoor cooking.',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Whole Lawlaw fish', quantity: '2 medium', order: 1 },
      { name: 'Tomatoes', quantity: '2, sliced', order: 2 },
      { name: 'Onion', quantity: '1, sliced', order: 3 },
      { name: 'Garlic', quantity: '4 cloves, minced', order: 4 },
      { name: 'Calamansi juice', quantity: '4 tbsp', order: 5 },
      { name: 'Salt', quantity: '1 tsp', order: 6 },
      { name: 'Black pepper', quantity: '1/2 tsp', order: 7 },
      { name: 'Cooking oil', quantity: '2 tbsp', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean the Lawlaw fish and make diagonal slits on both sides.' },
      { stepNumber: 2, instruction: 'Rub salt, pepper, and calamansi juice all over the fish, including the cavity.' },
      { stepNumber: 3, instruction: 'Stuff the fish cavity with tomatoes, onion, and garlic.' },
      { stepNumber: 4, instruction: 'Brush the fish with cooking oil.' },
      { stepNumber: 5, instruction: 'Grill over medium-hot coals for 10-12 minutes per side until cooked through.' },
      { stepNumber: 6, instruction: 'Serve with soy sauce and calamansi dipping sauce.' },
    ],
  },
  {
    title: 'Lawlaw Fish Paksiw',
    description: 'A savory-sour braised Lawlaw fish dish cooked in vinegar with bitter gourd. A healthy and appetizing dish from Sorsogon province.',
    prepTime: 15,
    cookTime: 30,
    servings: 5,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g, cut into pieces', order: 1 },
      { name: 'Native vinegar', quantity: '1/2 cup', order: 2 },
      { name: 'Water', quantity: '1 cup', order: 3 },
      { name: 'Garlic', quantity: '1 head, crushed', order: 4 },
      { name: 'Ginger', quantity: '2 inches, sliced', order: 5 },
      { name: 'Bitter gourd (ampalaya)', quantity: '1 medium, sliced', order: 6 },
      { name: 'Long green pepper', quantity: '3 pcs', order: 7 },
      { name: 'Salt', quantity: 'to taste', order: 8 },
      { name: 'Whole peppercorns', quantity: '1 tsp', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'In a pan, combine vinegar, water, garlic, ginger, and peppercorns. Bring to a boil.' },
      { stepNumber: 2, instruction: 'Add bitter gourd slices and cook for 3 minutes.' },
      { stepNumber: 3, instruction: 'Arrange Lawlaw fish pieces on top. Do not stir to prevent fish from breaking.' },
      { stepNumber: 4, instruction: 'Cover and simmer for 15-20 minutes.' },
      { stepNumber: 5, instruction: 'Add long green peppers and season with salt.' },
      { stepNumber: 6, instruction: 'Simmer for another 5 minutes. Serve with steamed rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Kinilaw (Ceviche)',
    description: 'Fresh raw Lawlaw fish "cooked" in vinegar and citrus juices with coconut milk. A refreshing Bicolano appetizer perfect for hot days.',
    prepTime: 30,
    cookTime: 0,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Fresh Lawlaw fish fillet', quantity: '500g, cubed', order: 1 },
      { name: 'Native vinegar', quantity: '1/2 cup', order: 2 },
      { name: 'Calamansi juice', quantity: '1/4 cup', order: 3 },
      { name: 'Coconut milk', quantity: '1/2 cup', order: 4 },
      { name: 'Red onion', quantity: '1, thinly sliced', order: 5 },
      { name: 'Ginger', quantity: '2 tbsp, julienned', order: 6 },
      { name: 'Red chili', quantity: '2 pcs, sliced', order: 7 },
      { name: 'Salt', quantity: '1 tsp', order: 8 },
      { name: 'Green onion', quantity: '2 stalks, chopped', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Ensure Lawlaw fish is extremely fresh. Cut into 1-inch cubes.' },
      { stepNumber: 2, instruction: 'In a bowl, combine vinegar and calamansi juice. Add fish cubes and marinate for 15 minutes.' },
      { stepNumber: 3, instruction: 'Add ginger, onion, and chili. Mix gently.' },
      { stepNumber: 4, instruction: 'Drain excess liquid and add coconut milk. Season with salt.' },
      { stepNumber: 5, instruction: 'Refrigerate for 10 minutes before serving.' },
      { stepNumber: 6, instruction: 'Garnish with green onions and serve immediately.' },
    ],
  },
  {
    title: 'Lawlaw Fish Tinola',
    description: 'A light and healthy ginger-based soup with Lawlaw fish, green papaya, and chili leaves. Perfect comfort food from Bulan.',
    prepTime: 15,
    cookTime: 35,
    servings: 6,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg, cut into pieces', order: 1 },
      { name: 'Ginger', quantity: '3 inches, sliced', order: 2 },
      { name: 'Onion', quantity: '1 large, sliced', order: 3 },
      { name: 'Garlic', quantity: '4 cloves, crushed', order: 4 },
      { name: 'Green papaya', quantity: '2 cups, cubed', order: 5 },
      { name: 'Chili leaves (dahon ng sili)', quantity: '2 cups', order: 6 },
      { name: 'Fish sauce', quantity: '3 tbsp', order: 7 },
      { name: 'Water', quantity: '8 cups', order: 8 },
      { name: 'Cooking oil', quantity: '2 tbsp', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Heat oil in a pot. Sauté ginger, garlic, and onion until fragrant.' },
      { stepNumber: 2, instruction: 'Add water and bring to a boil.' },
      { stepNumber: 3, instruction: 'Add green papaya and cook for 10 minutes until slightly tender.' },
      { stepNumber: 4, instruction: 'Gently add Lawlaw fish pieces. Simmer for 15 minutes.' },
      { stepNumber: 5, instruction: 'Season with fish sauce.' },
      { stepNumber: 6, instruction: 'Add chili leaves and cook for 2 minutes. Serve hot.' },
    ],
  },
  {
    title: 'Fried Lawlaw Fish with Garlic',
    description: 'Crispy fried Lawlaw fish with lots of golden garlic. A simple but satisfying dish that brings out the natural flavor of fresh Lawlaw.',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '4 medium pieces', order: 1 },
      { name: 'Garlic', quantity: '2 heads, minced', order: 2 },
      { name: 'Salt', quantity: '1 tsp', order: 3 },
      { name: 'Black pepper', quantity: '1/2 tsp', order: 4 },
      { name: 'Cooking oil', quantity: 'for frying', order: 5 },
      { name: 'Calamansi', quantity: '4 pcs, for serving', order: 6 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean Lawlaw fish and pat dry. Season with salt and pepper.' },
      { stepNumber: 2, instruction: 'Heat oil in a pan over medium-high heat.' },
      { stepNumber: 3, instruction: 'Fry fish for 5-7 minutes per side until golden and crispy.' },
      { stepNumber: 4, instruction: 'Remove fish and set aside. Drain excess oil, leaving about 2 tbsp.' },
      { stepNumber: 5, instruction: 'Fry minced garlic until golden and crispy.' },
      { stepNumber: 6, instruction: 'Top fried fish with crispy garlic. Serve with calamansi.' },
    ],
  },
  {
    title: 'Lawlaw Fish Escabeche',
    description: 'Sweet and sour Lawlaw fish with colorful bell peppers. A festive dish often served during special occasions in Sorsogon.',
    prepTime: 20,
    cookTime: 30,
    servings: 6,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Whole Lawlaw fish', quantity: '1 kg', order: 1 },
      { name: 'Bell peppers (assorted)', quantity: '2 pcs, sliced', order: 2 },
      { name: 'Carrots', quantity: '1 medium, julienned', order: 3 },
      { name: 'Onion', quantity: '1 large, sliced', order: 4 },
      { name: 'Ginger', quantity: '2 inches, julienned', order: 5 },
      { name: 'Garlic', quantity: '5 cloves, minced', order: 6 },
      { name: 'Vinegar', quantity: '1/4 cup', order: 7 },
      { name: 'Sugar', quantity: '3 tbsp', order: 8 },
      { name: 'Ketchup', quantity: '3 tbsp', order: 9 },
      { name: 'Cornstarch', quantity: '2 tbsp', order: 10 },
      { name: 'Water', quantity: '1 cup', order: 11 },
      { name: 'Salt', quantity: 'to taste', order: 12 },
      { name: 'Cooking oil', quantity: 'for frying', order: 13 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean and score the Lawlaw fish. Season with salt and deep fry until golden. Set aside.' },
      { stepNumber: 2, instruction: 'Sauté garlic, ginger, and onion in 2 tbsp oil.' },
      { stepNumber: 3, instruction: 'Add carrots and bell peppers. Cook for 2 minutes.' },
      { stepNumber: 4, instruction: 'Mix water, vinegar, sugar, and ketchup. Pour into the pan and bring to a boil.' },
      { stepNumber: 5, instruction: 'Dissolve cornstarch in 2 tbsp water, add to sauce to thicken.' },
      { stepNumber: 6, instruction: 'Pour the sweet and sour sauce over the fried fish. Serve immediately.' },
    ],
  },
  {
    title: 'Lawlaw Fish Sarciado',
    description: 'Fried Lawlaw fish smothered in a rich tomato and egg sauce. A hearty breakfast dish loved by Bicolanos.',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '4 pieces', order: 1 },
      { name: 'Eggs', quantity: '3, beaten', order: 2 },
      { name: 'Tomatoes', quantity: '4, chopped', order: 3 },
      { name: 'Onion', quantity: '1, sliced', order: 4 },
      { name: 'Garlic', quantity: '4 cloves, minced', order: 5 },
      { name: 'Fish sauce', quantity: '2 tbsp', order: 6 },
      { name: 'Black pepper', quantity: '1/2 tsp', order: 7 },
      { name: 'Cooking oil', quantity: '4 tbsp', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Season Lawlaw fish with salt and fry until golden. Set aside.' },
      { stepNumber: 2, instruction: 'In the same pan, sauté garlic and onion until softened.' },
      { stepNumber: 3, instruction: 'Add tomatoes and cook until soft and saucy, about 5 minutes.' },
      { stepNumber: 4, instruction: 'Season with fish sauce and pepper.' },
      { stepNumber: 5, instruction: 'Pour beaten eggs over the sauce, let it set slightly, then scramble gently.' },
      { stepNumber: 6, instruction: 'Pour sauce over fried fish and serve with garlic rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Adobo',
    description: 'The classic Filipino adobo made with Lawlaw fish. Braised in vinegar, soy sauce, and garlic for a savory and tangy flavor.',
    prepTime: 10,
    cookTime: 35,
    servings: 5,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg, cut into pieces', order: 1 },
      { name: 'Soy sauce', quantity: '1/3 cup', order: 2 },
      { name: 'Vinegar', quantity: '1/3 cup', order: 3 },
      { name: 'Garlic', quantity: '1 head, crushed', order: 4 },
      { name: 'Bay leaves', quantity: '3 pcs', order: 5 },
      { name: 'Whole peppercorns', quantity: '1 tsp', order: 6 },
      { name: 'Water', quantity: '1/2 cup', order: 7 },
      { name: 'Sugar', quantity: '1 tsp', order: 8 },
      { name: 'Cooking oil', quantity: '3 tbsp', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Combine soy sauce, vinegar, water, garlic, bay leaves, peppercorns, and sugar in a pot.' },
      { stepNumber: 2, instruction: 'Bring to a boil, then reduce heat to simmer.' },
      { stepNumber: 3, instruction: 'Carefully add Lawlaw fish pieces. Do not stir to prevent breaking.' },
      { stepNumber: 4, instruction: 'Cover and braise for 20-25 minutes, occasionally spooning sauce over fish.' },
      { stepNumber: 5, instruction: 'For crispy version, remove fish and fry briefly in oil.' },
      { stepNumber: 6, instruction: 'Reduce remaining sauce until slightly thickened. Pour over fish and serve.' },
    ],
  },
  {
    title: 'Lawlaw Fish with Coconut Milk (Ginataang Lawlaw)',
    description: 'Creamy coconut milk stew with Lawlaw fish, a signature Bicolano dish highlighting the regions love for gata.',
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg, cut into pieces', order: 1 },
      { name: 'Coconut milk', quantity: '2 cups', order: 2 },
      { name: 'Coconut cream', quantity: '1 cup', order: 3 },
      { name: 'Garlic', quantity: '5 cloves, minced', order: 4 },
      { name: 'Onion', quantity: '1, sliced', order: 5 },
      { name: 'Ginger', quantity: '2 inches, sliced', order: 6 },
      { name: 'Long green chili', quantity: '4 pcs', order: 7 },
      { name: 'Fish sauce', quantity: '2 tbsp', order: 8 },
      { name: 'String beans', quantity: '1 cup, cut', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'In a pan, sauté garlic, onion, and ginger until fragrant.' },
      { stepNumber: 2, instruction: 'Pour in coconut milk and bring to a simmer.' },
      { stepNumber: 3, instruction: 'Add string beans and cook for 5 minutes.' },
      { stepNumber: 4, instruction: 'Gently add Lawlaw fish pieces. Simmer for 15 minutes.' },
      { stepNumber: 5, instruction: 'Add coconut cream and long green chili. Season with fish sauce.' },
      { stepNumber: 6, instruction: 'Simmer until sauce thickens slightly. Serve with steamed rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Sinigang sa Miso',
    description: 'A unique twist on sinigang using miso paste for extra depth of flavor. The umami-rich broth complements the fresh Lawlaw fish beautifully.',
    prepTime: 20,
    cookTime: 40,
    servings: 6,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg', order: 1 },
      { name: 'Miso paste', quantity: '4 tbsp', order: 2 },
      { name: 'Tamarind paste', quantity: '2 tbsp', order: 3 },
      { name: 'Tomatoes', quantity: '3, quartered', order: 4 },
      { name: 'Onion', quantity: '1, sliced', order: 5 },
      { name: 'Eggplant', quantity: '2, sliced', order: 6 },
      { name: 'Kangkong', quantity: '1 bunch', order: 7 },
      { name: 'Water', quantity: '8 cups', order: 8 },
      { name: 'Green chili', quantity: '3 pcs', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Boil water with tomatoes and onion for 10 minutes.' },
      { stepNumber: 2, instruction: 'Dissolve miso and tamarind paste in the broth.' },
      { stepNumber: 3, instruction: 'Add eggplant and cook for 5 minutes.' },
      { stepNumber: 4, instruction: 'Add Lawlaw fish pieces gently. Simmer for 15 minutes.' },
      { stepNumber: 5, instruction: 'Add green chili and kangkong.' },
      { stepNumber: 6, instruction: 'Cook for 2-3 more minutes. Adjust seasoning and serve.' },
    ],
  },
  {
    title: 'Lawlaw Fish Lumpia (Spring Rolls)',
    description: 'Crispy spring rolls filled with flaked Lawlaw fish and vegetables. A perfect appetizer or merienda snack.',
    prepTime: 45,
    cookTime: 20,
    servings: 8,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish fillet', quantity: '300g, flaked', order: 1 },
      { name: 'Lumpia wrapper', quantity: '20 pcs', order: 2 },
      { name: 'Carrots', quantity: '1 cup, julienned', order: 3 },
      { name: 'Bean sprouts', quantity: '1 cup', order: 4 },
      { name: 'Green onion', quantity: '1/2 cup, chopped', order: 5 },
      { name: 'Garlic', quantity: '3 cloves, minced', order: 6 },
      { name: 'Soy sauce', quantity: '2 tbsp', order: 7 },
      { name: 'Egg', quantity: '1, beaten (for sealing)', order: 8 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 9 },
      { name: 'Cooking oil', quantity: 'for frying', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Steam or poach Lawlaw fish until cooked. Flake the meat, removing bones.' },
      { stepNumber: 2, instruction: 'Sauté garlic, add carrots, bean sprouts, and green onion. Cook briefly.' },
      { stepNumber: 3, instruction: 'Add flaked fish, season with soy sauce, salt, and pepper. Cool completely.' },
      { stepNumber: 4, instruction: 'Place 2 tbsp filling on each wrapper. Roll tightly, sealing with beaten egg.' },
      { stepNumber: 5, instruction: 'Deep fry until golden brown and crispy.' },
      { stepNumber: 6, instruction: 'Serve with sweet chili sauce or spiced vinegar.' },
    ],
  },
  {
    title: 'Lawlaw Fish Bicol Express',
    description: 'A fiery Bicolano dish featuring Lawlaw fish cooked in spicy coconut milk with lots of chili. Not for the faint-hearted!',
    prepTime: 20,
    cookTime: 35,
    servings: 5,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g, cubed', order: 1 },
      { name: 'Coconut milk', quantity: '2 cups', order: 2 },
      { name: 'Coconut cream', quantity: '1 cup', order: 3 },
      { name: 'Siling labuyo (bird eye chili)', quantity: '15-20 pcs', order: 4 },
      { name: 'Garlic', quantity: '1 head, minced', order: 5 },
      { name: 'Onion', quantity: '1, chopped', order: 6 },
      { name: 'Ginger', quantity: '2 inches, minced', order: 7 },
      { name: 'Shrimp paste', quantity: '2 tbsp', order: 8 },
      { name: 'Cooking oil', quantity: '2 tbsp', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic, onion, and ginger until fragrant.' },
      { stepNumber: 2, instruction: 'Add shrimp paste and cook for 1 minute.' },
      { stepNumber: 3, instruction: 'Pour in coconut milk and half of the chilies. Simmer for 10 minutes.' },
      { stepNumber: 4, instruction: 'Add Lawlaw fish pieces. Cook for 15 minutes until fish is done.' },
      { stepNumber: 5, instruction: 'Add remaining chilies and coconut cream.' },
      { stepNumber: 6, instruction: 'Simmer until sauce thickens and oil separates. Serve very hot.' },
    ],
  },
  {
    title: 'Lawlaw Fish Soup with Moringa',
    description: 'A nutritious and flavorful soup combining fresh Lawlaw fish with malunggay (moringa) leaves. A healthy Filipino comfort food.',
    prepTime: 15,
    cookTime: 25,
    servings: 5,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g', order: 1 },
      { name: 'Moringa leaves', quantity: '3 cups', order: 2 },
      { name: 'Ginger', quantity: '2 inches, sliced', order: 3 },
      { name: 'Onion', quantity: '1, quartered', order: 4 },
      { name: 'Tomatoes', quantity: '2, quartered', order: 5 },
      { name: 'Fish sauce', quantity: '3 tbsp', order: 6 },
      { name: 'Water', quantity: '6 cups', order: 7 },
      { name: 'Black pepper', quantity: '1/2 tsp', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Boil water with ginger, onion, and tomatoes.' },
      { stepNumber: 2, instruction: 'Add Lawlaw fish and simmer for 15 minutes.' },
      { stepNumber: 3, instruction: 'Season with fish sauce and pepper.' },
      { stepNumber: 4, instruction: 'Add moringa leaves and cook for 2 minutes until wilted.' },
      { stepNumber: 5, instruction: 'Adjust seasoning to taste.' },
      { stepNumber: 6, instruction: 'Serve hot with steamed rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Nilaga',
    description: 'A clear and simple boiled Lawlaw fish soup with vegetables. Light yet satisfying, showcasing the natural taste of fresh Lawlaw.',
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg', order: 1 },
      { name: 'Potatoes', quantity: '3, quartered', order: 2 },
      { name: 'Cabbage', quantity: '1/4 head, wedged', order: 3 },
      { name: 'Corn on the cob', quantity: '2, cut into pieces', order: 4 },
      { name: 'Onion', quantity: '1, quartered', order: 5 },
      { name: 'Whole peppercorns', quantity: '1 tbsp', order: 6 },
      { name: 'Fish sauce', quantity: '3 tbsp', order: 7 },
      { name: 'Water', quantity: '10 cups', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Bring water to a boil with onion and peppercorns.' },
      { stepNumber: 2, instruction: 'Add corn and potatoes. Cook for 10 minutes.' },
      { stepNumber: 3, instruction: 'Add Lawlaw fish pieces. Simmer for 12-15 minutes.' },
      { stepNumber: 4, instruction: 'Add cabbage and cook until just tender.' },
      { stepNumber: 5, instruction: 'Season with fish sauce.' },
      { stepNumber: 6, instruction: 'Serve hot with fish sauce and calamansi on the side.' },
    ],
  },
  {
    title: 'Lawlaw Fish Sisig',
    description: 'A seafood twist on the famous Filipino sisig, using grilled and chopped Lawlaw fish with onions and chili on a sizzling plate.',
    prepTime: 25,
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish fillet', quantity: '500g', order: 1 },
      { name: 'Onion', quantity: '2, finely chopped', order: 2 },
      { name: 'Green chili', quantity: '4 pcs, chopped', order: 3 },
      { name: 'Calamansi juice', quantity: '4 tbsp', order: 4 },
      { name: 'Mayonnaise', quantity: '3 tbsp', order: 5 },
      { name: 'Soy sauce', quantity: '2 tbsp', order: 6 },
      { name: 'Egg', quantity: '1 (optional)', order: 7 },
      { name: 'Butter', quantity: '2 tbsp', order: 8 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Grill Lawlaw fish until cooked. Chop into small pieces.' },
      { stepNumber: 2, instruction: 'Heat butter on a sizzling plate or pan.' },
      { stepNumber: 3, instruction: 'Add chopped fish, onion, and half of the chili. Sauté briefly.' },
      { stepNumber: 4, instruction: 'Add soy sauce, calamansi juice, and mayonnaise. Mix well.' },
      { stepNumber: 5, instruction: 'Season with salt and pepper. Top with remaining chili.' },
      { stepNumber: 6, instruction: 'Crack an egg on top if desired. Serve sizzling hot.' },
    ],
  },
  {
    title: 'Lawlaw Fish Fried Rice',
    description: 'Delicious fried rice loaded with flaked Lawlaw fish, garlic, and vegetables. A complete meal in one pan.',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Cooked rice (day-old)', quantity: '4 cups', order: 1 },
      { name: 'Lawlaw fish fillet', quantity: '200g, flaked', order: 2 },
      { name: 'Eggs', quantity: '2, beaten', order: 3 },
      { name: 'Garlic', quantity: '6 cloves, minced', order: 4 },
      { name: 'Green peas', quantity: '1/2 cup', order: 5 },
      { name: 'Green onion', quantity: '3 stalks, chopped', order: 6 },
      { name: 'Soy sauce', quantity: '2 tbsp', order: 7 },
      { name: 'Cooking oil', quantity: '3 tbsp', order: 8 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Heat oil and fry garlic until golden. Remove half for topping.' },
      { stepNumber: 2, instruction: 'Add beaten eggs, scramble, then push to the side.' },
      { stepNumber: 3, instruction: 'Add flaked Lawlaw fish and green peas. Stir-fry for 2 minutes.' },
      { stepNumber: 4, instruction: 'Add rice, breaking any clumps. Mix everything together.' },
      { stepNumber: 5, instruction: 'Season with soy sauce, salt, and pepper.' },
      { stepNumber: 6, instruction: 'Add green onions, top with crispy garlic, and serve.' },
    ],
  },
  {
    title: 'Lawlaw Fish Tausi',
    description: 'Steamed Lawlaw fish with fermented black beans (tausi). A Chinese-Filipino fusion dish with rich umami flavor.',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Whole Lawlaw fish', quantity: '1 medium', order: 1 },
      { name: 'Fermented black beans (tausi)', quantity: '3 tbsp', order: 2 },
      { name: 'Ginger', quantity: '2 inches, julienned', order: 3 },
      { name: 'Garlic', quantity: '5 cloves, minced', order: 4 },
      { name: 'Green onion', quantity: '2 stalks, cut into 2-inch pieces', order: 5 },
      { name: 'Soy sauce', quantity: '2 tbsp', order: 6 },
      { name: 'Sesame oil', quantity: '1 tbsp', order: 7 },
      { name: 'Cooking oil', quantity: '2 tbsp', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean Lawlaw fish and place on a steaming plate.' },
      { stepNumber: 2, instruction: 'Rinse black beans and mash slightly. Mix with garlic and ginger.' },
      { stepNumber: 3, instruction: 'Spread the black bean mixture over the fish.' },
      { stepNumber: 4, instruction: 'Steam for 15-18 minutes until fish is cooked through.' },
      { stepNumber: 5, instruction: 'Heat cooking oil until smoking and pour over the fish.' },
      { stepNumber: 6, instruction: 'Drizzle with soy sauce and sesame oil. Garnish with green onions.' },
    ],
  },
  {
    title: 'Lawlaw Fish Curry',
    description: 'A flavorful curry dish featuring Lawlaw fish in a spiced coconut-based sauce. Inspired by both Filipino and Indian cuisines.',
    prepTime: 20,
    cookTime: 35,
    servings: 5,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g, cubed', order: 1 },
      { name: 'Coconut milk', quantity: '2 cups', order: 2 },
      { name: 'Curry powder', quantity: '3 tbsp', order: 3 },
      { name: 'Potatoes', quantity: '2, cubed', order: 4 },
      { name: 'Carrots', quantity: '1, sliced', order: 5 },
      { name: 'Onion', quantity: '1, chopped', order: 6 },
      { name: 'Garlic', quantity: '4 cloves, minced', order: 7 },
      { name: 'Fish sauce', quantity: '2 tbsp', order: 8 },
      { name: 'Cooking oil', quantity: '2 tbsp', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic and onion until softened.' },
      { stepNumber: 2, instruction: 'Add curry powder and cook for 1 minute until fragrant.' },
      { stepNumber: 3, instruction: 'Add potatoes, carrots, and coconut milk. Simmer for 15 minutes.' },
      { stepNumber: 4, instruction: 'Add Lawlaw fish pieces. Cook for another 12-15 minutes.' },
      { stepNumber: 5, instruction: 'Season with fish sauce.' },
      { stepNumber: 6, instruction: 'Serve hot over steamed rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Empanada',
    description: 'Crispy fried pastry pockets filled with seasoned Lawlaw fish, vegetables, and egg. A popular street food with a seafood twist.',
    prepTime: 60,
    cookTime: 30,
    servings: 10,
    difficulty: 'Hard',
    ingredients: [
      { name: 'Lawlaw fish fillet', quantity: '300g, flaked', order: 1 },
      { name: 'All-purpose flour', quantity: '3 cups', order: 2 },
      { name: 'Water', quantity: '1 cup', order: 3 },
      { name: 'Annatto oil', quantity: '1/4 cup', order: 4 },
      { name: 'Egg', quantity: '3 hard-boiled, chopped', order: 5 },
      { name: 'Green papaya', quantity: '1 cup, grated', order: 6 },
      { name: 'Onion', quantity: '1, minced', order: 7 },
      { name: 'Garlic', quantity: '4 cloves, minced', order: 8 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 9 },
      { name: 'Cooking oil', quantity: 'for frying', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Make dough: Mix flour, annatto oil, and water. Knead until smooth. Rest for 30 minutes.' },
      { stepNumber: 2, instruction: 'For filling: Sauté garlic, onion, then add flaked fish and papaya. Season and cool.' },
      { stepNumber: 3, instruction: 'Roll dough thin and cut into circles.' },
      { stepNumber: 4, instruction: 'Place filling and chopped egg on one half. Fold and seal edges.' },
      { stepNumber: 5, instruction: 'Deep fry until golden brown and crispy.' },
      { stepNumber: 6, instruction: 'Serve with spiced vinegar dipping sauce.' },
    ],
  },
]

// Lawlaw fish products data
const lawlawProducts = [
  {
    name: 'Fresh Whole Lawlaw Fish - 1kg',
    description: 'Freshly caught Lawlaw fish from the pristine waters of Bulan, Sorsogon. Perfect for sinigang, grilling, or any Filipino fish dish. Our fish are caught daily and delivered fresh to ensure the best quality.',
    price: 250,
    category: 'Fresh Fish',
    stock: 50,
  },
  {
    name: 'Premium Lawlaw Fish Fillet - 500g',
    description: 'Boneless and skinless Lawlaw fish fillet, carefully prepared for your convenience. Ideal for kinilaw, fish curry, or quick stir-fry dishes. Vacuum-sealed for freshness.',
    price: 320,
    category: 'Fresh Fish',
    stock: 35,
  },
  {
    name: 'Dried Lawlaw Fish (Daing) - 250g',
    description: 'Sun-dried Lawlaw fish prepared the traditional Bicolano way. Salted and dried to perfection, ready to fry for a delicious breakfast. A Bulan specialty.',
    price: 180,
    category: 'Dried Fish',
    stock: 100,
  },
  {
    name: 'Smoked Lawlaw Fish - 400g',
    description: 'Artisan smoked Lawlaw fish using coconut husk and native wood. Rich, smoky flavor perfect for appetizers or salads. Traditional Sorsogon smoking technique.',
    price: 280,
    category: 'Processed Fish',
    stock: 40,
  },
  {
    name: 'Lawlaw Fish Tinapa (Smoked) - 3pcs Pack',
    description: 'Classic Filipino smoked fish made from fresh Lawlaw. Golden-brown and flaky, best served with eggs and garlic rice for breakfast.',
    price: 220,
    category: 'Processed Fish',
    stock: 60,
  },
  {
    name: 'Lawlaw Fish Belly - 500g',
    description: 'The most flavorful part of the Lawlaw fish! Fatty and tender belly cuts perfect for grilling or sinigang. Limited availability.',
    price: 350,
    category: 'Fresh Fish',
    stock: 25,
  },
  {
    name: 'Marinated Lawlaw Fish (Ready to Grill) - 600g',
    description: 'Pre-marinated Lawlaw fish in calamansi, garlic, and native spices. Just grill and serve! Perfect for BBQ parties and outdoor cooking.',
    price: 290,
    category: 'Marinated',
    stock: 30,
  },
  {
    name: 'Lawlaw Fish Balls - 500g Pack',
    description: 'Homemade fish balls made from 100% fresh Lawlaw fish meat. No fillers or artificial ingredients. Perfect for soups or as street food style snacks.',
    price: 150,
    category: 'Processed Fish',
    stock: 80,
  },
  {
    name: 'Lawlaw Fish Flakes in Oil - 220g Jar',
    description: 'Bottled Lawlaw fish flakes sautéed in garlic and preserved in coconut oil. Ready to eat with rice or use as pasta topping. Shelf-stable pantry essential.',
    price: 165,
    category: 'Bottled',
    stock: 120,
  },
  {
    name: 'Spicy Lawlaw Fish Flakes - 220g Jar',
    description: 'Lawlaw fish flakes with Bicolano-level spiciness! Cooked with siling labuyo and coconut oil. For those who love heat with their seafood.',
    price: 175,
    category: 'Bottled',
    stock: 90,
  },
  {
    name: 'Lawlaw Fish Head (for Sinigang) - 2pcs',
    description: 'Large Lawlaw fish heads perfect for making rich and flavorful sinigang broth. The head contains the most gelatin for a silky soup base.',
    price: 120,
    category: 'Fresh Fish',
    stock: 40,
  },
  {
    name: 'Lawlaw Fish Roe (Eggs) - 150g',
    description: 'Fresh Lawlaw fish roe, a delicacy prized for its briny flavor and creamy texture. Pan-fry with garlic or add to pasta. Seasonal availability.',
    price: 280,
    category: 'Specialty',
    stock: 15,
  },
  {
    name: 'Frozen Lawlaw Fish Steaks - 4pcs Pack',
    description: 'Thick-cut Lawlaw fish steaks, individually frozen for convenience. Perfect portion control for family meals. Thaw and cook your favorite recipe.',
    price: 380,
    category: 'Frozen',
    stock: 45,
  },
  {
    name: 'Lawlaw Fish Sisig Mix - 350g',
    description: 'Ready-to-cook sisig mix featuring grilled and chopped Lawlaw fish with onions. Just heat on a sizzling plate and add egg. Restaurant quality at home!',
    price: 240,
    category: 'Ready-to-Cook',
    stock: 35,
  },
  {
    name: 'Lawlaw Fish Longganisa - 500g',
    description: 'Unique fish sausage made from Lawlaw fish and native spices. A healthier alternative to pork longganisa. Perfect for breakfast or pulutan.',
    price: 195,
    category: 'Processed Fish',
    stock: 50,
  },
  {
    name: 'Lawlaw Fish Embutido - 1 Roll',
    description: 'Steamed fish meatloaf made with ground Lawlaw fish, vegetables, and hard-boiled eggs. A healthier version of the classic Filipino embutido.',
    price: 220,
    category: 'Ready-to-Eat',
    stock: 25,
  },
  {
    name: 'Crispy Lawlaw Fish Skin - 100g',
    description: 'Deep-fried Lawlaw fish skin seasoned with sea salt. Crunchy, addictive snack or chicharon alternative. High in collagen!',
    price: 120,
    category: 'Snacks',
    stock: 70,
  },
  {
    name: 'Lawlaw Fish Lumpia (Frozen) - 10pcs',
    description: 'Frozen spring rolls filled with Lawlaw fish and vegetables. Just deep fry from frozen for crispy appetizers. Great for parties!',
    price: 260,
    category: 'Frozen',
    stock: 40,
  },
  {
    name: 'Lawlaw Fish Paksiw in Pouch - 300g',
    description: 'Ready-to-heat Lawlaw fish paksiw in convenient pouch packaging. Traditional recipe with vinegar and bitter gourd. Heat and serve!',
    price: 145,
    category: 'Ready-to-Eat',
    stock: 55,
  },
  {
    name: 'Lawlaw Fish Gift Box Set',
    description: 'Premium gift set containing: 1 jar fish flakes, 1 pack dried fish, and 1 pack smoked fish. Beautifully packaged, perfect for pasalubong or gifts.',
    price: 550,
    category: 'Gift Sets',
    stock: 20,
  },
]

// Additional recipes for acefin24@gmail.com (10 different recipes)
const acefinRecipes = [
  {
    title: 'Lawlaw Fish Pinaputok',
    description: 'Whole Lawlaw fish stuffed with tomatoes, onions, and wrapped in banana leaves then grilled until smoky and tender. A traditional Visayan cooking method.',
    prepTime: 25,
    cookTime: 35,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Whole Lawlaw fish', quantity: '1 large', order: 1 },
      { name: 'Tomatoes', quantity: '3, sliced', order: 2 },
      { name: 'Onion', quantity: '2, sliced', order: 3 },
      { name: 'Ginger', quantity: '2 inches, sliced', order: 4 },
      { name: 'Banana leaves', quantity: '4 large pieces', order: 5 },
      { name: 'Salt', quantity: '1 tsp', order: 6 },
      { name: 'Pepper', quantity: '1/2 tsp', order: 7 },
      { name: 'Calamansi juice', quantity: '3 tbsp', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Clean Lawlaw fish thoroughly and season inside and out with salt, pepper, and calamansi.' },
      { stepNumber: 2, instruction: 'Stuff the cavity with tomatoes, onion, and ginger.' },
      { stepNumber: 3, instruction: 'Wrap fish tightly in banana leaves, securing with toothpicks or string.' },
      { stepNumber: 4, instruction: 'Grill over medium heat for 15-18 minutes per side.' },
      { stepNumber: 5, instruction: 'The leaves will char - this is normal and adds smoky flavor.' },
      { stepNumber: 6, instruction: 'Unwrap and serve immediately with steamed rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Pochero',
    description: 'A hearty Filipino stew with Lawlaw fish, vegetables, and chickpeas in a tomato-based broth. Comfort food at its finest.',
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g, cut into chunks', order: 1 },
      { name: 'Chickpeas', quantity: '1 can, drained', order: 2 },
      { name: 'Potatoes', quantity: '2, cubed', order: 3 },
      { name: 'Saba bananas', quantity: '3, sliced', order: 4 },
      { name: 'Cabbage', quantity: '1/4 head', order: 5 },
      { name: 'Tomato sauce', quantity: '1 cup', order: 6 },
      { name: 'Fish sauce', quantity: '3 tbsp', order: 7 },
      { name: 'Garlic', quantity: '5 cloves', order: 8 },
      { name: 'Onion', quantity: '1, chopped', order: 9 },
      { name: 'Water', quantity: '6 cups', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic and onion until fragrant.' },
      { stepNumber: 2, instruction: 'Add tomato sauce and cook for 3 minutes.' },
      { stepNumber: 3, instruction: 'Pour in water and bring to a boil. Add potatoes and chickpeas.' },
      { stepNumber: 4, instruction: 'Simmer for 15 minutes, then add Lawlaw fish and saba bananas.' },
      { stepNumber: 5, instruction: 'Cook for another 15 minutes. Season with fish sauce.' },
      { stepNumber: 6, instruction: 'Add cabbage last and cook until just wilted. Serve hot.' },
    ],
  },
  {
    title: 'Lawlaw Fish Caldereta',
    description: 'Rich and savory Lawlaw fish stew in a thick tomato and liver spread sauce. A seafood version of the beloved Filipino caldereta.',
    prepTime: 25,
    cookTime: 40,
    servings: 5,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '1 kg, cubed', order: 1 },
      { name: 'Tomato sauce', quantity: '1 cup', order: 2 },
      { name: 'Liver spread', quantity: '1/4 cup', order: 3 },
      { name: 'Bell peppers', quantity: '2, sliced', order: 4 },
      { name: 'Potatoes', quantity: '2, cubed', order: 5 },
      { name: 'Carrots', quantity: '1, sliced', order: 6 },
      { name: 'Green olives', quantity: '1/4 cup', order: 7 },
      { name: 'Garlic', quantity: '1 head, minced', order: 8 },
      { name: 'Onion', quantity: '1, chopped', order: 9 },
      { name: 'Cooking oil', quantity: '3 tbsp', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic and onion until soft.' },
      { stepNumber: 2, instruction: 'Add tomato sauce, potatoes, and carrots. Simmer for 10 minutes.' },
      { stepNumber: 3, instruction: 'Add Lawlaw fish pieces. Cook for 15 minutes.' },
      { stepNumber: 4, instruction: 'Stir in liver spread and mix well.' },
      { stepNumber: 5, instruction: 'Add bell peppers and olives. Cook for 5 more minutes.' },
      { stepNumber: 6, instruction: 'Adjust seasoning and serve with hot rice.' },
    ],
  },
  {
    title: 'Lawlaw Fish Kilawin sa Gata',
    description: 'A creamy version of kinilaw with fresh Lawlaw fish cured in vinegar and mixed with rich coconut cream. Pure Bicolano indulgence.',
    prepTime: 35,
    cookTime: 0,
    servings: 4,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Fresh Lawlaw fish fillet', quantity: '400g, cubed', order: 1 },
      { name: 'Coconut cream', quantity: '1 cup', order: 2 },
      { name: 'Native vinegar', quantity: '1/2 cup', order: 3 },
      { name: 'Red onion', quantity: '1, sliced thin', order: 4 },
      { name: 'Ginger', quantity: '3 tbsp, julienned', order: 5 },
      { name: 'Siling labuyo', quantity: '5 pcs', order: 6 },
      { name: 'Salt', quantity: '1 tsp', order: 7 },
      { name: 'Calamansi', quantity: '4 pcs, juiced', order: 8 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Cube the fresh Lawlaw fish fillet into bite-sized pieces.' },
      { stepNumber: 2, instruction: 'Marinate in vinegar and calamansi juice for 20 minutes.' },
      { stepNumber: 3, instruction: 'Drain most of the liquid, leaving about 2 tbsp.' },
      { stepNumber: 4, instruction: 'Add onion, ginger, and chili. Mix gently.' },
      { stepNumber: 5, instruction: 'Pour coconut cream and season with salt.' },
      { stepNumber: 6, instruction: 'Chill for 10 minutes and serve immediately.' },
    ],
  },
  {
    title: 'Lawlaw Fish Relleno',
    description: 'Whole deboned Lawlaw fish stuffed with a savory mixture of vegetables and eggs, then fried until golden. A festive Filipino dish.',
    prepTime: 60,
    cookTime: 30,
    servings: 8,
    difficulty: 'Hard',
    ingredients: [
      { name: 'Whole Lawlaw fish', quantity: '1.5 kg', order: 1 },
      { name: 'Ground pork', quantity: '200g', order: 2 },
      { name: 'Carrots', quantity: '1, diced small', order: 3 },
      { name: 'Green peas', quantity: '1/2 cup', order: 4 },
      { name: 'Raisins', quantity: '1/4 cup', order: 5 },
      { name: 'Hard-boiled eggs', quantity: '3, sliced', order: 6 },
      { name: 'Onion', quantity: '1, minced', order: 7 },
      { name: 'Beaten egg', quantity: '2', order: 8 },
      { name: 'Flour', quantity: 'for dredging', order: 9 },
      { name: 'Cooking oil', quantity: 'for frying', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Carefully debone the Lawlaw fish keeping the skin intact.' },
      { stepNumber: 2, instruction: 'Flake the fish meat and mix with ground pork, carrots, peas, raisins, and onion.' },
      { stepNumber: 3, instruction: 'Stuff the mixture back into the fish skin, layering with egg slices.' },
      { stepNumber: 4, instruction: 'Sew or secure the opening with toothpicks.' },
      { stepNumber: 5, instruction: 'Dredge in flour, then beaten egg. Fry until golden on both sides.' },
      { stepNumber: 6, instruction: 'Slice and serve with banana ketchup or gravy.' },
    ],
  },
  {
    title: 'Lawlaw Fish Afritada',
    description: 'Lawlaw fish braised in a rich tomato sauce with potatoes and bell peppers. A colorful and flavorful one-pot meal.',
    prepTime: 20,
    cookTime: 35,
    servings: 5,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '800g, cut into pieces', order: 1 },
      { name: 'Tomato sauce', quantity: '1 cup', order: 2 },
      { name: 'Potatoes', quantity: '2, cubed', order: 3 },
      { name: 'Red bell pepper', quantity: '1, sliced', order: 4 },
      { name: 'Green bell pepper', quantity: '1, sliced', order: 5 },
      { name: 'Onion', quantity: '1, sliced', order: 6 },
      { name: 'Garlic', quantity: '4 cloves', order: 7 },
      { name: 'Fish sauce', quantity: '2 tbsp', order: 8 },
      { name: 'Water', quantity: '1 cup', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic and onion until fragrant.' },
      { stepNumber: 2, instruction: 'Add tomato sauce and water. Bring to a simmer.' },
      { stepNumber: 3, instruction: 'Add potatoes and cook for 10 minutes.' },
      { stepNumber: 4, instruction: 'Gently add Lawlaw fish pieces. Simmer for 15 minutes.' },
      { stepNumber: 5, instruction: 'Add bell peppers and cook for 5 more minutes.' },
      { stepNumber: 6, instruction: 'Season with fish sauce and serve.' },
    ],
  },
  {
    title: 'Lawlaw Fish Torta',
    description: 'Filipino-style omelette with flaked Lawlaw fish and vegetables. Quick, easy, and perfect for breakfast or lunch.',
    prepTime: 15,
    cookTime: 15,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish fillet', quantity: '200g, flaked', order: 1 },
      { name: 'Eggs', quantity: '4', order: 2 },
      { name: 'Tomato', quantity: '1, diced', order: 3 },
      { name: 'Onion', quantity: '1 small, diced', order: 4 },
      { name: 'Salt', quantity: '1/2 tsp', order: 5 },
      { name: 'Pepper', quantity: '1/4 tsp', order: 6 },
      { name: 'Cooking oil', quantity: '3 tbsp', order: 7 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Steam or poach Lawlaw fish until cooked, then flake.' },
      { stepNumber: 2, instruction: 'Beat eggs and mix with fish, tomato, onion, salt, and pepper.' },
      { stepNumber: 3, instruction: 'Heat oil in a pan over medium heat.' },
      { stepNumber: 4, instruction: 'Pour egg mixture and cook until bottom is set.' },
      { stepNumber: 5, instruction: 'Flip and cook the other side until golden.' },
      { stepNumber: 6, instruction: 'Serve hot with ketchup or spiced vinegar.' },
    ],
  },
  {
    title: 'Lawlaw Fish Sinuglaw',
    description: 'A combination dish featuring both grilled (sinugba) and raw (kilaw) Lawlaw fish in one flavorful appetizer. Best of both worlds!',
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish fillet (for grilling)', quantity: '250g', order: 1 },
      { name: 'Lawlaw fish fillet (for kilaw)', quantity: '250g, cubed', order: 2 },
      { name: 'Vinegar', quantity: '1/2 cup', order: 3 },
      { name: 'Calamansi juice', quantity: '1/4 cup', order: 4 },
      { name: 'Ginger', quantity: '3 tbsp, julienned', order: 5 },
      { name: 'Red onion', quantity: '1, sliced', order: 6 },
      { name: 'Coconut cream', quantity: '1/2 cup', order: 7 },
      { name: 'Chili', quantity: '3 pcs', order: 8 },
      { name: 'Salt', quantity: 'to taste', order: 9 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Grill one portion of fish until charred and cooked. Cube it.' },
      { stepNumber: 2, instruction: 'Cure the raw fish portion in vinegar and calamansi for 15 minutes.' },
      { stepNumber: 3, instruction: 'Drain the raw fish and combine with grilled fish.' },
      { stepNumber: 4, instruction: 'Add ginger, onion, and chili.' },
      { stepNumber: 5, instruction: 'Pour coconut cream over and mix gently.' },
      { stepNumber: 6, instruction: 'Season with salt and serve chilled.' },
    ],
  },
  {
    title: 'Lawlaw Fish Sopas',
    description: 'Creamy macaroni soup with Lawlaw fish flakes and vegetables. A comforting rainy day meal loved by kids and adults alike.',
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Lawlaw fish fillet', quantity: '300g, flaked', order: 1 },
      { name: 'Elbow macaroni', quantity: '1 cup', order: 2 },
      { name: 'Evaporated milk', quantity: '1 cup', order: 3 },
      { name: 'Cabbage', quantity: '2 cups, shredded', order: 4 },
      { name: 'Carrots', quantity: '1, diced', order: 5 },
      { name: 'Celery', quantity: '2 stalks, sliced', order: 6 },
      { name: 'Onion', quantity: '1, chopped', order: 7 },
      { name: 'Garlic', quantity: '4 cloves', order: 8 },
      { name: 'Water/broth', quantity: '8 cups', order: 9 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Sauté garlic and onion until soft.' },
      { stepNumber: 2, instruction: 'Add water/broth and bring to a boil.' },
      { stepNumber: 3, instruction: 'Add macaroni and carrots. Cook for 10 minutes.' },
      { stepNumber: 4, instruction: 'Add flaked Lawlaw fish and celery. Simmer for 5 minutes.' },
      { stepNumber: 5, instruction: 'Pour in evaporated milk and add cabbage.' },
      { stepNumber: 6, instruction: 'Season with salt and pepper. Serve warm.' },
    ],
  },
  {
    title: 'Lawlaw Fish Chowder',
    description: 'A Filipino-inspired creamy fish chowder featuring chunks of Lawlaw fish with potatoes and corn. Hearty and satisfying.',
    prepTime: 20,
    cookTime: 35,
    servings: 6,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Lawlaw fish', quantity: '500g, cubed', order: 1 },
      { name: 'Potatoes', quantity: '3, cubed', order: 2 },
      { name: 'Corn kernels', quantity: '1 cup', order: 3 },
      { name: 'Evaporated milk', quantity: '1 can', order: 4 },
      { name: 'Butter', quantity: '3 tbsp', order: 5 },
      { name: 'Onion', quantity: '1, diced', order: 6 },
      { name: 'Celery', quantity: '2 stalks, diced', order: 7 },
      { name: 'Fish stock', quantity: '4 cups', order: 8 },
      { name: 'Flour', quantity: '2 tbsp', order: 9 },
      { name: 'Salt and pepper', quantity: 'to taste', order: 10 },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Melt butter and sauté onion and celery until soft.' },
      { stepNumber: 2, instruction: 'Add flour and stir for 1 minute to make a roux.' },
      { stepNumber: 3, instruction: 'Gradually add fish stock, stirring to prevent lumps.' },
      { stepNumber: 4, instruction: 'Add potatoes and corn. Simmer for 15 minutes.' },
      { stepNumber: 5, instruction: 'Add Lawlaw fish and cook for 10 minutes until fish is done.' },
      { stepNumber: 6, instruction: 'Stir in evaporated milk, season, and serve hot.' },
    ],
  },
]

async function main() {
  console.log('Starting to seed Lawlaw fish data...')

  // Find users
  const johnloyd = await prisma.user.findUnique({
    where: { email: 'johnloydserapion96@gmail.com' }
  })

  const acefin = await prisma.user.findUnique({
    where: { email: 'acefin24@gmail.com' }
  })

  if (!johnloyd) {
    console.error('User johnloydserapion96@gmail.com not found!')
    return
  }

  if (!acefin) {
    console.error('User acefin24@gmail.com not found!')
    return
  }

  console.log(`Found johnloyd (ID: ${johnloyd.userId}) and acefin (ID: ${acefin.userId})`)

  // Add 20 recipes for johnloyd
  console.log('Adding 20 recipes for johnloydserapion96@gmail.com...')
  for (const recipeData of lawlawRecipes) {
    const recipe = await prisma.recipe.create({
      data: {
        userId: johnloyd.userId,
        title: recipeData.title,
        description: recipeData.description,
        image: placeholderImage,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0 and 5.0
        ingredients: {
          create: recipeData.ingredients
        },
        instructions: {
          create: recipeData.instructions
        }
      }
    })
    console.log(`  Created recipe: ${recipe.title}`)
  }

  // Add 20 products for johnloyd
  console.log('Adding 20 products for johnloydserapion96@gmail.com...')
  for (const productData of lawlawProducts) {
    const product = await prisma.product.create({
      data: {
        userId: johnloyd.userId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image: placeholderImage,
        stock: productData.stock,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0 and 5.0
      }
    })
    console.log(`  Created product: ${product.name}`)
  }

  // Add 10 recipes for acefin
  console.log('Adding 10 recipes for acefin24@gmail.com...')
  for (const recipeData of acefinRecipes) {
    const recipe = await prisma.recipe.create({
      data: {
        userId: acefin.userId,
        title: recipeData.title,
        description: recipeData.description,
        image: placeholderImage,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0 and 5.0
        ingredients: {
          create: recipeData.ingredients
        },
        instructions: {
          create: recipeData.instructions
        }
      }
    })
    console.log(`  Created recipe: ${recipe.title}`)
  }

  console.log('\nSeeding completed!')
  console.log(`- Added 20 recipes for johnloydserapion96@gmail.com`)
  console.log(`- Added 20 products for johnloydserapion96@gmail.com`)
  console.log(`- Added 10 recipes for acefin24@gmail.com`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
