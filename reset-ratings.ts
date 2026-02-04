import * as fs from 'fs'
import * as path from 'path'
import mariadb from 'mariadb'

// Load .env file manually BEFORE doing anything
const envPath = path.resolve(__dirname, '.env')
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
    connectTimeout: 30000,
  }
}

async function resetRatings() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL not found in environment')
  }

  console.log('Connecting to database...')
  const config = parseConnectionUrl(dbUrl)
  const conn = await mariadb.createConnection(config)

  console.log('Connected! Starting ratings reset...\n')

  try {
    // Delete all product comments/reviews
    const commentsResult = await conn.query('DELETE FROM comments')
    console.log(`Deleted ${commentsResult.affectedRows} product comments/reviews`)

    // Delete all recipe reviews
    const recipeReviewsResult = await conn.query('DELETE FROM recipe_reviews')
    console.log(`Deleted ${recipeReviewsResult.affectedRows} recipe reviews`)

    // Reset all product ratings to 0
    const productsResult = await conn.query('UPDATE products SET rating = 0')
    console.log(`Reset ratings for ${productsResult.affectedRows} products`)

    // Reset all recipe ratings to 0
    const recipesResult = await conn.query('UPDATE recipes SET rating = 0')
    console.log(`Reset ratings for ${recipesResult.affectedRows} recipes`)

    console.log('\nRatings reset complete!')
  } finally {
    await conn.end()
  }
}

resetRatings()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
