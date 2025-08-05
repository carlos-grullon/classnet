import 'dotenv/config'; // Carga variables de entorno desde .env
import { getCollection } from './MongoDB';
import { subjects, countries } from '../lib/data';

/**
 * Creates necessary indexes and inserts initial data if collections are empty.
 * This function is idempotent and safe to run multiple times.
 */
export async function createIndexesAndSeedData(): Promise<void> {
  try {
    console.log('Iniciando configuración de índices y datos iniciales en las colecciones...');
    
    // #region Users Collection
    console.log('Configurando índices para la colección users...');
    const usersCollection = await getCollection('users');

    // Attempt to drop old indexes if they exist, handling the case where they don't.
    // This is useful if you have changed an index definition.
    try {
      await usersCollection.dropIndex('U_Email');
      console.log('Índice U_Email dropeado (si existía).');
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      // Type guard to safely check for 'codeName' property
      if (error && typeof error === 'object' && 'codeName' in error && typeof (error as { codeName: string }).codeName === 'string') {
        if ((error as { codeName: string }).codeName === 'IndexNotFound') {
          console.warn('Advertencia: Índice U_Email no encontrado, saltando drop.');
        } else {
          console.error('Error al intentar dropear índice U_Email:', error);
        }
      } else {
        console.error('Error al intentar dropear índice U_Email (tipo de error inesperado):', error);
      }
    }

    try {
      await usersCollection.dropIndex('Username');
      console.log('Índice Username dropeado (si existía).');
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      // Type guard to safely check for 'codeName' property
      if (error && typeof error === 'object' && 'codeName' in error && typeof (error as { codeName: string }).codeName === 'string') {
        if ((error as { codeName: string }).codeName === 'IndexNotFound') {
          console.warn('Advertencia: Índice Username no encontrado, saltando drop.');
        } else {
          console.error('Error al intentar dropear índice Username:', error);
        }
      } else {
        console.error('Error al intentar dropear índice Username (tipo de error inesperado):', error);
      }
    }

    // Create new indexes. MongoDB will create them if they don't exist or do nothing if they already exist with the same definition.
    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'U_Email' });
    await usersCollection.createIndex({ username: 1 }, { unique: true, name: 'Username' });
    console.log('Índices U_Email y Username creados/asegurados para la colección users.');
    // #endregion

    // #region Subjects Collection
    console.log('Configurando colección subjects...');
    const subjectsCollection = await getCollection('subjects');

    // Create indexes for subjects. They are idempotent.
    await subjectsCollection.createIndex({ category: 1 }, { unique: false });
    await subjectsCollection.createIndex({ name: 1 }, { unique: false });
    console.log('Índices de subjects creados/asegurados.');

    // Insert initial subjects data only if the collection is empty
    const subjectsCount = await subjectsCollection.countDocuments();
    if (subjectsCount === 0) {
      await subjectsCollection.insertMany(subjects);
      console.log('Datos iniciales de subjects insertados.');
    } else {
      console.log('Colección subjects ya contiene datos, saltando inserción inicial.');
    }
    // #endregion

    // #region Countries Collection
    console.log('Configurando colección countries...');
    const countriesCollection = await getCollection('countries');

    // For collections without complex unique indexes, createIndex is not strictly necessary before insertMany,
    // but if you had specific indexes for countries, you would create them here idempotently.
    // Example: await countriesCollection.createIndex({ name: 1 }, { unique: true });

    // Insert initial countries data only if the collection is empty
    const countriesCount = await countriesCollection.countDocuments();
    if (countriesCount === 0) {
      await countriesCollection.insertMany(countries);
      console.log('Datos iniciales de countries insertados.');
    } else {
      console.log('Colección countries ya contiene datos, saltando inserción inicial.');
    }
    // #endregion

    // #region Notifications Collection
    console.log('Configurando colección notifications...');
    const notificationsCollection = await getCollection('notifications');

    // Drop existing indexes if they exist
    try {
      await notificationsCollection.dropIndex('userId_1_createdAt_-1');
      await notificationsCollection.dropIndex('userId_1_read.status_1_createdAt_-1');
      await notificationsCollection.dropIndex('idx_ttl');
      console.log('Índices existentes eliminados.');
    } catch (error) {
      // Ignore errors if indexes don't exist
      console.log('No se encontraron índices existentes para eliminar o error al eliminarlos:', error);
    }

    // Create new indexes
    await notificationsCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'userId_1_createdAt_-1', unique: false }
    );
    
    await notificationsCollection.createIndex(
      { userId: 1, "read.status": 1, createdAt: -1 },
      { name: 'userId_1_read.status_1_createdAt_-1', unique: false }
    );

    // TTL index for automatic cleanup (60 days)
    await notificationsCollection.createIndex(
      { createdAt: 1 },
      { 
        name: 'idx_ttl',
        expireAfterSeconds: 5184000 // 60 days in seconds
      }
    );
    console.log('Nuevos índices de notifications creados correctamente.');

    // #endregion

    console.log('Configuración de base de datos (índices y datos iniciales) completada correctamente.');
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error('Error crítico durante la configuración de la base de datos:', error);
    // It's important to rethrow the error if it's critical so that the failure is detected.
    throw error;
  }
}

/**
 * Main function to set up the database.
 * This function can be called when the application starts (e.g., at an API entry point)
 * or explicitly in a script.
 */
export async function setupDatabase(): Promise<void> {
  try {
    await createIndexesAndSeedData();
    console.log('Base de datos configurada correctamente a través de setupDatabase.');
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error('Error al ejecutar setupDatabase:', error);
  }
}

// This block executes ONLY when the file is called directly
// as a script (e.g., `node src/app/utils/db-setup.ts`).
// It does NOT execute during the Next.js build process in Vercel,
// unless your "build command" explicitly calls it, which is discouraged
// for destructive operations in production.
if (require.main === module) {
  console.log('Ejecutando script de configuración de la base de datos...');
  setupDatabase()
    .then(() => {
      console.log('Proceso de script completado con éxito.');
      process.exit(0); // Exits successfully
    })
    .catch((error: unknown) => { // Changed 'any' to 'unknown'
      console.error('Error durante la ejecución del script de configuración:', error);
      process.exit(1); // Exits with error
    });
}