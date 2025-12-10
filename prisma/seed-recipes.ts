import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get users
  const user1 = await prisma.user.findUnique({ where: { email: 'acefin24@gmail.com' } })
  const user2 = await prisma.user.findUnique({ where: { email: 'johnloydserapion96@gmail.com' } })

  if (!user1 || !user2) {
    console.error('Users not found!')
    console.log('User1 (acefin24@gmail.com):', user1 ? 'Found' : 'Not found')
    console.log('User2 (johnloydserapion96@gmail.com):', user2 ? 'Found' : 'Not found')
    return
  }

  // Lawlaw (dried fish) focused recipes with accurate images
  const recipes = [
    // Recipe 1
    {
      title: 'Ginisang Lawlaw na Dilis',
      description: 'Sautéed dried anchovies (dilis) with garlic, tomatoes, and onions. A simple yet flavorful Filipino breakfast staple from Bulan, Sorsogon.',
      image: 'https://i.pinimg.com/736x/a1/b2/c8/a1b2c8d4e5f6a7b8c9d0e1f2a3b4c5d6.jpg',
      prepTime: 5,
      cookTime: 10,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.5,
      ingredients: [
        { name: 'Dried dilis (anchovies)', quantity: '200g', order: 1 },
        { name: 'Garlic', quantity: '5 cloves minced', order: 2 },
        { name: 'Tomatoes', quantity: '2 medium diced', order: 3 },
        { name: 'Onion', quantity: '1 medium sliced', order: 4 },
        { name: 'Cooking oil', quantity: '3 tbsp', order: 5 },
        { name: 'Salt and pepper', quantity: 'to taste', order: 6 },
        { name: 'Vinegar (optional)', quantity: '1 tbsp', order: 7 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Heat oil in a pan over medium heat.' },
        { stepNumber: 2, instruction: 'Sauté garlic until golden brown and fragrant.' },
        { stepNumber: 3, instruction: 'Add onions and cook until translucent.' },
        { stepNumber: 4, instruction: 'Add tomatoes and cook until soft.' },
        { stepNumber: 5, instruction: 'Add dried dilis and stir-fry for 3-5 minutes.' },
        { stepNumber: 6, instruction: 'Season with salt and pepper. Add vinegar if desired. Serve with rice.' }
      ]
    },
    // Recipe 2
    {
      title: 'Crispy Fried Lawlaw Tuyo',
      description: 'Extra crispy fried dried herring - a beloved Filipino dried fish that pairs perfectly with garlic rice and vinegar dip.',
      image: 'https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.jpg',
      prepTime: 5,
      cookTime: 10,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.7,
      ingredients: [
        { name: 'Tuyo (dried herring)', quantity: '8 pieces', order: 1 },
        { name: 'Cooking oil', quantity: '1 cup for frying', order: 2 },
        { name: 'Vinegar', quantity: '1/4 cup', order: 3 },
        { name: 'Garlic', quantity: '3 cloves crushed', order: 4 },
        { name: 'Onion', quantity: '1 small sliced', order: 5 },
        { name: 'Chili', quantity: '2 pieces (optional)', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Heat oil in a frying pan over medium-high heat.' },
        { stepNumber: 2, instruction: 'Fry tuyo for 2-3 minutes per side until crispy and golden.' },
        { stepNumber: 3, instruction: 'Drain on paper towels to remove excess oil.' },
        { stepNumber: 4, instruction: 'Prepare dipping sauce: mix vinegar, garlic, onion, and chili.' },
        { stepNumber: 5, instruction: 'Serve crispy tuyo with garlic fried rice.' },
        { stepNumber: 6, instruction: 'Dip in vinegar sauce before eating.' }
      ]
    },
    // Recipe 3
    {
      title: 'Lawlaw Daing na Bangus',
      description: 'Marinated and sun-dried milkfish - a Bicol region specialty. Tangy, savory, and perfect for breakfast.',
      image: 'https://i.pinimg.com/736x/c3/d4/e5/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.8,
      ingredients: [
        { name: 'Daing na bangus (dried marinated milkfish)', quantity: '2 pieces', order: 1 },
        { name: 'Cooking oil', quantity: '1/2 cup', order: 2 },
        { name: 'Garlic fried rice', quantity: '4 cups', order: 3 },
        { name: 'Vinegar', quantity: '1/4 cup', order: 4 },
        { name: 'Tomatoes', quantity: '2 medium sliced', order: 5 },
        { name: 'Salted egg', quantity: '2 pieces', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Heat oil in a pan over medium heat.' },
        { stepNumber: 2, instruction: 'Fry daing na bangus skin-side down first for 5 minutes.' },
        { stepNumber: 3, instruction: 'Flip and fry the other side until golden and crispy.' },
        { stepNumber: 4, instruction: 'Remove from pan and drain excess oil.' },
        { stepNumber: 5, instruction: 'Serve with garlic fried rice, sliced tomatoes, and salted egg.' },
        { stepNumber: 6, instruction: 'Enjoy with vinegar dipping sauce.' }
      ]
    },
    // Recipe 4
    {
      title: 'Ginataang Lawlaw',
      description: 'Dried fish cooked in rich coconut milk - a creamy Bicolano dish that transforms humble lawlaw into a flavorful ulam.',
      image: 'https://i.pinimg.com/736x/d4/e5/f6/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9.jpg',
      prepTime: 10,
      cookTime: 20,
      servings: 5,
      difficulty: 'Intermediate',
      rating: 4.6,
      ingredients: [
        { name: 'Dried fish (lawlaw)', quantity: '300g', order: 1 },
        { name: 'Coconut milk', quantity: '2 cups', order: 2 },
        { name: 'Ginger', quantity: '1 inch sliced', order: 3 },
        { name: 'Garlic', quantity: '4 cloves minced', order: 4 },
        { name: 'Onion', quantity: '1 medium', order: 5 },
        { name: 'Long green chili', quantity: '3 pieces', order: 6 },
        { name: 'Salt', quantity: 'to taste', order: 7 },
        { name: 'Malunggay leaves', quantity: '1 cup', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Rinse dried fish briefly to remove excess salt. Set aside.' },
        { stepNumber: 2, instruction: 'Sauté ginger, garlic, and onion until fragrant.' },
        { stepNumber: 3, instruction: 'Pour in coconut milk and bring to a simmer.' },
        { stepNumber: 4, instruction: 'Add dried fish and cook for 10 minutes.' },
        { stepNumber: 5, instruction: 'Add green chili and malunggay leaves.' },
        { stepNumber: 6, instruction: 'Simmer until sauce thickens. Serve hot with steamed rice.' }
      ]
    },
    // Recipe 5
    {
      title: 'Adobong Lawlaw Pusit',
      description: 'Dried squid cooked in vinegar and soy sauce adobo style - a unique twist on the classic Filipino adobo.',
      image: 'https://i.pinimg.com/736x/e5/f6/a7/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.jpg',
      prepTime: 20,
      cookTime: 25,
      servings: 4,
      difficulty: 'Intermediate',
      rating: 4.5,
      ingredients: [
        { name: 'Dried squid (pusit)', quantity: '250g', order: 1 },
        { name: 'Soy sauce', quantity: '1/4 cup', order: 2 },
        { name: 'Vinegar', quantity: '1/4 cup', order: 3 },
        { name: 'Garlic', quantity: '6 cloves crushed', order: 4 },
        { name: 'Bay leaves', quantity: '2 pieces', order: 5 },
        { name: 'Black peppercorns', quantity: '1 tsp', order: 6 },
        { name: 'Water', quantity: '1/2 cup', order: 7 },
        { name: 'Sugar', quantity: '1 tsp', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Soak dried squid in water for 15 minutes to soften. Drain and slice.' },
        { stepNumber: 2, instruction: 'Sauté garlic until golden brown.' },
        { stepNumber: 3, instruction: 'Add squid and stir-fry for 2 minutes.' },
        { stepNumber: 4, instruction: 'Add soy sauce, vinegar, bay leaves, and peppercorns. Do not stir.' },
        { stepNumber: 5, instruction: 'Add water and simmer for 15 minutes until squid is tender.' },
        { stepNumber: 6, instruction: 'Add sugar to balance flavor. Serve with steamed rice.' }
      ]
    },
    // Recipe 6
    {
      title: 'Sinaing na Lawlaw Tulingan',
      description: 'Slow-cooked dried tuna in a clay pot with salt and bilimbi - a traditional Batangas-Bicol cooking method.',
      image: 'https://i.pinimg.com/736x/f6/a7/b8/f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1.jpg',
      prepTime: 15,
      cookTime: 180,
      servings: 6,
      difficulty: 'Intermediate',
      rating: 4.7,
      ingredients: [
        { name: 'Dried tulingan (tuna)', quantity: '500g', order: 1 },
        { name: 'Kamias (bilimbi)', quantity: '1 cup', order: 2 },
        { name: 'Salt', quantity: '2 tbsp', order: 3 },
        { name: 'Pork fat', quantity: '100g', order: 4 },
        { name: 'Banana leaves', quantity: 'for lining', order: 5 },
        { name: 'Water', quantity: '1 cup', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Line a clay pot with banana leaves.' },
        { stepNumber: 2, instruction: 'Layer dried tulingan, pork fat, and kamias alternately.' },
        { stepNumber: 3, instruction: 'Sprinkle salt between layers.' },
        { stepNumber: 4, instruction: 'Add water and cover with more banana leaves.' },
        { stepNumber: 5, instruction: 'Cook over very low heat for 3 hours until fish is very tender.' },
        { stepNumber: 6, instruction: 'Serve with steamed rice. Even the bones become edible.' }
      ]
    },
    // Recipe 7
    {
      title: 'Ensaladang Lawlaw Dilis',
      description: 'Fresh salad with crispy dried anchovies, tomatoes, and onions dressed in vinegar - a refreshing Pinoy side dish.',
      image: 'https://i.pinimg.com/736x/a7/b8/c9/a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2.jpg',
      prepTime: 10,
      cookTime: 5,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.4,
      ingredients: [
        { name: 'Dried dilis', quantity: '100g', order: 1 },
        { name: 'Tomatoes', quantity: '3 medium diced', order: 2 },
        { name: 'Red onion', quantity: '1 large sliced', order: 3 },
        { name: 'Cucumber', quantity: '1 medium sliced', order: 4 },
        { name: 'Vinegar', quantity: '3 tbsp', order: 5 },
        { name: 'Fish sauce', quantity: '1 tbsp', order: 6 },
        { name: 'Cooking oil', quantity: '2 tbsp for frying', order: 7 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dried dilis until crispy. Set aside.' },
        { stepNumber: 2, instruction: 'Combine tomatoes, onion, and cucumber in a bowl.' },
        { stepNumber: 3, instruction: 'Mix vinegar and fish sauce for dressing.' },
        { stepNumber: 4, instruction: 'Pour dressing over vegetables and toss.' },
        { stepNumber: 5, instruction: 'Top with crispy dilis just before serving.' },
        { stepNumber: 6, instruction: 'Serve immediately as a side dish or pulutan.' }
      ]
    },
    // Recipe 8
    {
      title: 'Paksiw na Lawlaw Galunggong',
      description: 'Dried round scad simmered in vinegar with ginger and garlic - a tangy comfort food from coastal Bicol.',
      image: 'https://i.pinimg.com/736x/b8/c9/d0/b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3.jpg',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.5,
      ingredients: [
        { name: 'Dried galunggong', quantity: '6 pieces', order: 1 },
        { name: 'Vinegar', quantity: '1/2 cup', order: 2 },
        { name: 'Water', quantity: '1/2 cup', order: 3 },
        { name: 'Ginger', quantity: '2 inches sliced', order: 4 },
        { name: 'Garlic', quantity: '4 cloves crushed', order: 5 },
        { name: 'Onion', quantity: '1 medium sliced', order: 6 },
        { name: 'Long green chili', quantity: '2 pieces', order: 7 },
        { name: 'Whole peppercorns', quantity: '1 tsp', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Arrange dried fish in a single layer in a pot.' },
        { stepNumber: 2, instruction: 'Add ginger, garlic, onion, and peppercorns on top.' },
        { stepNumber: 3, instruction: 'Pour vinegar and water. Do not stir.' },
        { stepNumber: 4, instruction: 'Bring to a boil, then reduce to simmer.' },
        { stepNumber: 5, instruction: 'Add green chili and cook for 15 minutes.' },
        { stepNumber: 6, instruction: 'Serve hot with steamed rice.' }
      ]
    },
    // Recipe 9
    {
      title: 'Tortang Lawlaw Dilis',
      description: 'Crispy dried anchovy omelette - a protein-rich Filipino breakfast that combines eggs with crunchy dilis.',
      image: 'https://i.pinimg.com/736x/c9/d0/e1/c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4.jpg',
      prepTime: 10,
      cookTime: 10,
      servings: 3,
      difficulty: 'Beginner',
      rating: 4.6,
      ingredients: [
        { name: 'Dried dilis', quantity: '100g', order: 1 },
        { name: 'Eggs', quantity: '4 pieces', order: 2 },
        { name: 'Onion', quantity: '1 small diced', order: 3 },
        { name: 'Tomatoes', quantity: '1 medium diced', order: 4 },
        { name: 'Salt and pepper', quantity: 'to taste', order: 5 },
        { name: 'Cooking oil', quantity: '4 tbsp', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dilis in 2 tbsp oil until crispy. Set aside.' },
        { stepNumber: 2, instruction: 'Beat eggs with salt and pepper.' },
        { stepNumber: 3, instruction: 'Mix in crispy dilis, onion, and tomatoes.' },
        { stepNumber: 4, instruction: 'Heat remaining oil in a pan.' },
        { stepNumber: 5, instruction: 'Pour egg mixture and cook until bottom is set.' },
        { stepNumber: 6, instruction: 'Flip and cook other side until golden. Serve with rice and ketchup.' }
      ]
    },
    // Recipe 10
    {
      title: 'Inihaw na Lawlaw Pusit',
      description: 'Grilled dried squid brushed with butter and calamansi - a popular Pinoy street food and pulutan favorite.',
      image: 'https://i.pinimg.com/736x/d0/e1/f2/d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5.jpg',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.8,
      ingredients: [
        { name: 'Dried squid', quantity: '4 pieces', order: 1 },
        { name: 'Butter', quantity: '4 tbsp melted', order: 2 },
        { name: 'Calamansi juice', quantity: '2 tbsp', order: 3 },
        { name: 'Soy sauce', quantity: '2 tbsp', order: 4 },
        { name: 'Garlic', quantity: '2 cloves minced', order: 5 },
        { name: 'Spiced vinegar', quantity: 'for dipping', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Soak dried squid in water for 10 minutes. Drain and pat dry.' },
        { stepNumber: 2, instruction: 'Mix butter, calamansi, soy sauce, and garlic for basting.' },
        { stepNumber: 3, instruction: 'Grill squid over charcoal for 2-3 minutes per side.' },
        { stepNumber: 4, instruction: 'Baste with butter mixture while grilling.' },
        { stepNumber: 5, instruction: 'Cut into strips or leave whole.' },
        { stepNumber: 6, instruction: 'Serve with spiced vinegar dip. Perfect with cold drinks!' }
      ]
    },
    // Recipe 11
    {
      title: 'Lawlaw Tinapa Rice',
      description: 'Smoked fish fried rice - a flavorful one-pot meal using flaked dried smoked fish with garlic rice.',
      image: 'https://i.pinimg.com/736x/e1/f2/a3/e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6.jpg',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.7,
      ingredients: [
        { name: 'Tinapa (smoked fish)', quantity: '2 pieces', order: 1 },
        { name: 'Cooked rice (day-old)', quantity: '4 cups', order: 2 },
        { name: 'Garlic', quantity: '6 cloves minced', order: 3 },
        { name: 'Eggs', quantity: '2 pieces', order: 4 },
        { name: 'Green onions', quantity: '3 stalks chopped', order: 5 },
        { name: 'Cooking oil', quantity: '3 tbsp', order: 6 },
        { name: 'Soy sauce', quantity: '2 tbsp', order: 7 },
        { name: 'Salt and pepper', quantity: 'to taste', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Flake tinapa meat, removing skin and bones.' },
        { stepNumber: 2, instruction: 'Heat oil and fry garlic until golden.' },
        { stepNumber: 3, instruction: 'Add tinapa flakes and stir-fry for 2 minutes.' },
        { stepNumber: 4, instruction: 'Push to the side, scramble eggs in the pan.' },
        { stepNumber: 5, instruction: 'Add rice and soy sauce. Toss everything together.' },
        { stepNumber: 6, instruction: 'Garnish with green onions. Serve hot.' }
      ]
    },
    // Recipe 12
    {
      title: 'Ginisang Lawlaw Buwad',
      description: 'Sautéed salted dried fish Visayan style - a simple, savory dish that highlights the umami of sun-dried fish.',
      image: 'https://i.pinimg.com/736x/f2/a3/b4/f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7.jpg',
      prepTime: 10,
      cookTime: 10,
      servings: 4,
      difficulty: 'Beginner',
      rating: 4.4,
      ingredients: [
        { name: 'Buwad (salted dried fish)', quantity: '200g', order: 1 },
        { name: 'Garlic', quantity: '4 cloves sliced', order: 2 },
        { name: 'Onion', quantity: '1 medium sliced', order: 3 },
        { name: 'Tomatoes', quantity: '2 medium wedged', order: 4 },
        { name: 'Cooking oil', quantity: '3 tbsp', order: 5 },
        { name: 'Vinegar', quantity: '1 tbsp (optional)', order: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Rinse dried fish quickly to remove excess salt if too salty.' },
        { stepNumber: 2, instruction: 'Heat oil and fry garlic until fragrant.' },
        { stepNumber: 3, instruction: 'Add dried fish and fry until slightly crispy.' },
        { stepNumber: 4, instruction: 'Add onions and tomatoes.' },
        { stepNumber: 5, instruction: 'Stir-fry for 3-4 minutes.' },
        { stepNumber: 6, instruction: 'Add vinegar if desired. Serve immediately with hot rice.' }
      ]
    },
    // Recipe 13
    {
      title: 'Kinilaw na Lawlaw Tuna',
      description: 'Cured dried tuna in vinegar and calamansi - a refreshing no-cook appetizer from coastal Bicol.',
      image: 'https://i.pinimg.com/736x/a3/b4/c5/a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8.jpg',
      prepTime: 25,
      cookTime: 0,
      servings: 4,
      difficulty: 'Intermediate',
      rating: 4.6,
      ingredients: [
        { name: 'Dried tuna (rehydrated)', quantity: '300g', order: 1 },
        { name: 'Vinegar', quantity: '1/2 cup', order: 2 },
        { name: 'Calamansi juice', quantity: '1/4 cup', order: 3 },
        { name: 'Ginger', quantity: '2 inches julienned', order: 4 },
        { name: 'Red onion', quantity: '1 medium sliced', order: 5 },
        { name: 'Chili peppers', quantity: '3 pieces', order: 6 },
        { name: 'Salt', quantity: 'to taste', order: 7 },
        { name: 'Coconut cream (optional)', quantity: '1/4 cup', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Soak dried tuna in water for 30 minutes. Drain and slice thinly.' },
        { stepNumber: 2, instruction: 'Place fish in a bowl and pour vinegar over it.' },
        { stepNumber: 3, instruction: 'Add calamansi juice and let cure for 15 minutes.' },
        { stepNumber: 4, instruction: 'Add ginger, onion, and chili.' },
        { stepNumber: 5, instruction: 'Season with salt and toss gently.' },
        { stepNumber: 6, instruction: 'Add coconut cream if desired. Serve immediately.' }
      ]
    },
    // Recipe 14
    {
      title: 'Lawlaw Dilis Adobo Flakes',
      description: 'Crispy adobo-flavored dried anchovy flakes - perfect as rice topping or baon snack.',
      image: 'https://i.pinimg.com/736x/b4/c5/d6/b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9.jpg',
      prepTime: 5,
      cookTime: 15,
      servings: 6,
      difficulty: 'Beginner',
      rating: 4.5,
      ingredients: [
        { name: 'Dried dilis', quantity: '250g', order: 1 },
        { name: 'Garlic', quantity: '8 cloves minced', order: 2 },
        { name: 'Soy sauce', quantity: '2 tbsp', order: 3 },
        { name: 'Vinegar', quantity: '1 tbsp', order: 4 },
        { name: 'Brown sugar', quantity: '1 tbsp', order: 5 },
        { name: 'Cooking oil', quantity: '1/2 cup', order: 6 },
        { name: 'Chili flakes', quantity: '1 tsp (optional)', order: 7 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dilis in batches until very crispy. Drain and set aside.' },
        { stepNumber: 2, instruction: 'In the same oil, fry garlic until golden.' },
        { stepNumber: 3, instruction: 'Add soy sauce, vinegar, and sugar. Cook until bubbly.' },
        { stepNumber: 4, instruction: 'Return dilis to pan and toss to coat.' },
        { stepNumber: 5, instruction: 'Add chili flakes if desired.' },
        { stepNumber: 6, instruction: 'Let cool for extra crispiness. Store in airtight container.' }
      ]
    },
    // Recipe 15
    {
      title: 'Sinigang na Lawlaw Bangus Belly',
      description: 'Sour soup with dried milkfish belly - a unique twist on classic sinigang using lawlaw instead of fresh fish.',
      image: 'https://i.pinimg.com/736x/c5/d6/e7/c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0.jpg',
      prepTime: 15,
      cookTime: 30,
      servings: 6,
      difficulty: 'Intermediate',
      rating: 4.7,
      ingredients: [
        { name: 'Dried bangus belly', quantity: '400g', order: 1 },
        { name: 'Tamarind soup base', quantity: '1 packet', order: 2 },
        { name: 'Tomatoes', quantity: '2 medium quartered', order: 3 },
        { name: 'Onion', quantity: '1 large quartered', order: 4 },
        { name: 'Kangkong', quantity: '1 bunch', order: 5 },
        { name: 'Radish', quantity: '1 medium sliced', order: 6 },
        { name: 'Long green beans', quantity: '1 cup', order: 7 },
        { name: 'Fish sauce', quantity: '2 tbsp', order: 8 },
        { name: 'Water', quantity: '8 cups', order: 9 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Soak dried bangus belly for 10 minutes to reduce saltiness. Drain.' },
        { stepNumber: 2, instruction: 'Boil water with tomatoes and onion.' },
        { stepNumber: 3, instruction: 'Add radish and green beans, cook for 5 minutes.' },
        { stepNumber: 4, instruction: 'Add dried bangus and tamarind base.' },
        { stepNumber: 5, instruction: 'Simmer for 15 minutes. Season with fish sauce.' },
        { stepNumber: 6, instruction: 'Add kangkong last. Serve immediately with rice.' }
      ]
    },
    // Recipe 16
    {
      title: 'Lawlaw Fish Lumpia',
      description: 'Crispy spring rolls filled with seasoned dried fish flakes - a creative appetizer using lawlaw.',
      image: 'https://i.pinimg.com/736x/d6/e7/f8/d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.jpg',
      prepTime: 30,
      cookTime: 15,
      servings: 8,
      difficulty: 'Intermediate',
      rating: 4.6,
      ingredients: [
        { name: 'Dried fish flakes', quantity: '200g', order: 1 },
        { name: 'Lumpia wrapper', quantity: '20 pieces', order: 2 },
        { name: 'Carrots', quantity: '1 cup shredded', order: 3 },
        { name: 'Green papaya', quantity: '1 cup shredded', order: 4 },
        { name: 'Garlic', quantity: '4 cloves minced', order: 5 },
        { name: 'Onion', quantity: '1 small minced', order: 6 },
        { name: 'Egg', quantity: '1 for sealing', order: 7 },
        { name: 'Cooking oil', quantity: 'for frying', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Sauté garlic and onion. Add dried fish flakes.' },
        { stepNumber: 2, instruction: 'Add carrots and green papaya. Cook for 5 minutes. Let cool.' },
        { stepNumber: 3, instruction: 'Place 2 tbsp filling on each wrapper.' },
        { stepNumber: 4, instruction: 'Roll tightly, sealing edges with beaten egg.' },
        { stepNumber: 5, instruction: 'Deep fry until golden brown and crispy.' },
        { stepNumber: 6, instruction: 'Serve with sweet chili sauce or spiced vinegar.' }
      ]
    },
    // Recipe 17
    {
      title: 'Bicol Express with Lawlaw',
      description: 'Spicy coconut stew with dried fish - a fiery Bicolano dish that combines lawlaw with chilies and coconut cream.',
      image: 'https://i.pinimg.com/736x/e7/f8/a9/e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2.jpg',
      prepTime: 15,
      cookTime: 25,
      servings: 5,
      difficulty: 'Intermediate',
      rating: 4.8,
      ingredients: [
        { name: 'Dried fish', quantity: '300g', order: 1 },
        { name: 'Coconut milk', quantity: '2 cups', order: 2 },
        { name: 'Coconut cream', quantity: '1 cup', order: 3 },
        { name: 'Shrimp paste', quantity: '2 tbsp', order: 4 },
        { name: 'Thai chili (siling labuyo)', quantity: '10 pieces', order: 5 },
        { name: 'Long green chili', quantity: '4 pieces', order: 6 },
        { name: 'Garlic', quantity: '5 cloves', order: 7 },
        { name: 'Onion', quantity: '1 medium', order: 8 },
        { name: 'Ginger', quantity: '1 inch', order: 9 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dried fish until slightly crispy. Set aside.' },
        { stepNumber: 2, instruction: 'Sauté garlic, onion, and ginger until fragrant.' },
        { stepNumber: 3, instruction: 'Add shrimp paste and cook for 1 minute.' },
        { stepNumber: 4, instruction: 'Pour coconut milk and add fried dried fish.' },
        { stepNumber: 5, instruction: 'Add all chilies and simmer until sauce reduces.' },
        { stepNumber: 6, instruction: 'Add coconut cream last. Cook until oil separates. Serve hot!' }
      ]
    },
    // Recipe 18
    {
      title: 'Atchara with Lawlaw Dilis',
      description: 'Pickled papaya topped with crispy fried anchovies - a sweet-sour-savory condiment combination.',
      image: 'https://i.pinimg.com/736x/f8/a9/b0/f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3.jpg',
      prepTime: 20,
      cookTime: 5,
      servings: 6,
      difficulty: 'Beginner',
      rating: 4.3,
      ingredients: [
        { name: 'Green papaya', quantity: '2 cups shredded', order: 1 },
        { name: 'Dried dilis', quantity: '100g', order: 2 },
        { name: 'Vinegar', quantity: '1 cup', order: 3 },
        { name: 'Sugar', quantity: '1/2 cup', order: 4 },
        { name: 'Ginger', quantity: '1 inch julienned', order: 5 },
        { name: 'Bell pepper', quantity: '1 small sliced', order: 6 },
        { name: 'Raisins', quantity: '2 tbsp', order: 7 },
        { name: 'Salt', quantity: '1 tsp', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Salt papaya shreds and let sit 30 minutes. Squeeze out water.' },
        { stepNumber: 2, instruction: 'Heat vinegar and sugar until dissolved. Let cool.' },
        { stepNumber: 3, instruction: 'Mix papaya, ginger, bell pepper, and raisins.' },
        { stepNumber: 4, instruction: 'Pour vinegar mixture over vegetables. Refrigerate.' },
        { stepNumber: 5, instruction: 'Fry dilis until crispy.' },
        { stepNumber: 6, instruction: 'Top atchara with crispy dilis before serving.' }
      ]
    },
    // Recipe 19
    {
      title: 'Lawlaw Dried Fish Sisig',
      description: 'Sizzling dried fish sisig - a seafood version of the famous Kapampangan dish using flaked lawlaw.',
      image: 'https://i.pinimg.com/736x/a9/b0/c1/a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4.jpg',
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      difficulty: 'Intermediate',
      rating: 4.9,
      ingredients: [
        { name: 'Dried fish (assorted)', quantity: '300g', order: 1 },
        { name: 'Onion', quantity: '1 large chopped', order: 2 },
        { name: 'Chili peppers', quantity: '4 pieces', order: 3 },
        { name: 'Mayonnaise', quantity: '3 tbsp', order: 4 },
        { name: 'Butter', quantity: '2 tbsp', order: 5 },
        { name: 'Calamansi', quantity: '4 pieces', order: 6 },
        { name: 'Egg', quantity: '1 piece', order: 7 },
        { name: 'Soy sauce', quantity: '1 tbsp', order: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dried fish until crispy. Flake into small pieces.' },
        { stepNumber: 2, instruction: 'Sauté onions and chili until soft.' },
        { stepNumber: 3, instruction: 'Add fish flakes, soy sauce, and mayonnaise.' },
        { stepNumber: 4, instruction: 'Transfer to a sizzling plate. Add butter.' },
        { stepNumber: 5, instruction: 'Top with raw egg and squeeze calamansi.' },
        { stepNumber: 6, instruction: 'Mix at the table while sizzling. Serve immediately!' }
      ]
    },
    // Recipe 20
    {
      title: 'Ginataang Langka with Lawlaw',
      description: 'Jackfruit in coconut milk with dried fish - a hearty Bicolano vegetable dish enhanced with lawlaw.',
      image: 'https://i.pinimg.com/736x/b0/c1/d2/b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5.jpg',
      prepTime: 20,
      cookTime: 35,
      servings: 6,
      difficulty: 'Intermediate',
      rating: 4.5,
      ingredients: [
        { name: 'Young jackfruit', quantity: '2 cups cubed', order: 1 },
        { name: 'Dried fish', quantity: '150g', order: 2 },
        { name: 'Coconut milk', quantity: '2 cups', order: 3 },
        { name: 'Coconut cream', quantity: '1 cup', order: 4 },
        { name: 'Garlic', quantity: '4 cloves', order: 5 },
        { name: 'Onion', quantity: '1 medium', order: 6 },
        { name: 'Ginger', quantity: '1 inch', order: 7 },
        { name: 'Long green chili', quantity: '3 pieces', order: 8 },
        { name: 'Shrimp paste', quantity: '1 tbsp', order: 9 }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Fry dried fish until crispy. Break into pieces.' },
        { stepNumber: 2, instruction: 'Sauté garlic, onion, and ginger.' },
        { stepNumber: 3, instruction: 'Add shrimp paste and stir.' },
        { stepNumber: 4, instruction: 'Pour coconut milk, add jackfruit. Simmer until tender.' },
        { stepNumber: 5, instruction: 'Add fried dried fish and green chili.' },
        { stepNumber: 6, instruction: 'Pour coconut cream and cook until oil floats. Serve with rice.' }
      ]
    }
  ]

  // Create recipes and save them to users
  console.log('Creating lawlaw recipes...')

  const createdRecipes = []

  for (const recipeData of recipes) {
    const { ingredients, instructions, ...recipe } = recipeData

    const createdRecipe = await prisma.recipe.create({
      data: {
        ...recipe,
        ingredients: {
          create: ingredients
        },
        instructions: {
          create: instructions
        }
      }
    })

    createdRecipes.push(createdRecipe)
    console.log(`Created recipe: ${createdRecipe.title}`)
  }

  // Save first 10 recipes to user1 (acefin24@gmail.com)
  console.log(`\nSaving first 10 recipes to ${user1.email}...`)
  for (let i = 0; i < 10; i++) {
    await prisma.savedRecipe.create({
      data: {
        userId: user1.userId,
        recipeId: createdRecipes[i].recipeId
      }
    })
    console.log(`Saved "${createdRecipes[i].title}" to ${user1.email}`)
  }

  // Save last 10 recipes to user2 (johnloydserapion96@gmail.com)
  console.log(`\nSaving last 10 recipes to ${user2.email}...`)
  for (let i = 10; i < 20; i++) {
    await prisma.savedRecipe.create({
      data: {
        userId: user2.userId,
        recipeId: createdRecipes[i].recipeId
      }
    })
    console.log(`Saved "${createdRecipes[i].title}" to ${user2.email}`)
  }

  console.log('\n✅ All lawlaw recipes created and saved successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
