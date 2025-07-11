import 'dotenv/config';
import { getCollection } from "@/utils/MongoDB";
import * as dataSeed from "../lib/dataSeed";
/**
 * Seeds initial data into collections if they are empty.
 * Safe to run multiple times (idempotent).
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    const collections = [
      { name: 'class_contents', data: dataSeed.class_contents },
      { name: 'classes', data: dataSeed.classes },
      { name: 'enrollments', data: dataSeed.enrollments },
      { name: 'users', data: dataSeed.users },
      { name: 'weeks', data: dataSeed.weeks },
      { name: 'submittedAssignments', data: dataSeed.submittedAssignments }
    ];

    for (const { name, data } of collections) {
      const collection = await getCollection(name);
      console.log(`Seeding ${name} collection...`);
      await collection.deleteMany({});
      const result = await collection.insertMany(data);
      console.log(`Inserted ${result.insertedCount} documents into ${name}`);
    }

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
