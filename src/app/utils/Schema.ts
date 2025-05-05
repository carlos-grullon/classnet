import 'dotenv/config'; // Carga variables de entorno desde .env
import { getCollection } from './MongoDB';

/**
 * Crea los índices necesarios para optimizar las consultas en la base de datos
 */
export async function createIndexes(): Promise<void> {
  try {
    console.log('Creando índices en las colecciones...');

    console.log('Creando índices en la colección users...');
    const usersCollection = await getCollection('users');
    await usersCollection.dropIndex('U_Email');
    await usersCollection.dropIndex('Username');
    await usersCollection.dropIndex('UserType');

    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'U_Email' });
    await usersCollection.createIndex({ username: 1 }, { unique: false, name: 'Username' });
    await usersCollection.createIndex({ user_type: 1 }, { unique: false, name: 'UserType' });

    console.log('Índices creados correctamente');
  } catch (error) {
    console.error('Error al crear los índices:', error);
    throw error;
  }
}

/**
 * Función para ejecutar la creación de índices
 * Esta función se puede llamar al iniciar la aplicación
 */
export async function setupDatabase(): Promise<void> {
  try {
    await createIndexes();
    console.log('Base de datos configurada correctamente');
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
  }
}

// Exportamos la función por defecto para facilitar su importación
export default setupDatabase;

// Ejecutar la configuración de la base de datos cuando se llame directamente al archivo
if (require.main === module) {
  console.log('Ejecutando configuración de la base de datos...');
  setupDatabase()
    .then(() => {
      console.log('Proceso completado con éxito');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error durante la configuración:', error);
      process.exit(1);
    });
}
