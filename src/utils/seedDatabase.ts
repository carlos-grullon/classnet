import { getCollection } from './MongoDB';

/**
 * Seeds initial data into collections if they are empty.
 * Safe to run multiple times (idempotent).
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    // Example for subjects collection
    // const subjectsCollection = await getCollection('subjects');
    // const subjectCount = await subjectsCollection.countDocuments();
    
    // if (subjectCount === 0) {
    //   console.log('Seeding subjects collection...');
    // }

    // Add similar logic for other collections (countries, etc.)
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
