import 'dotenv/config'; // Carga variables de entorno desde .env
import { getCollection } from './MongoDB'; // Asegúrate de que esta función maneje la conexión correctamente
import { subjects, countries } from '../lib/data'; // Datos iniciales

/**
 * Crea los índices necesarios y inserta datos iniciales si las colecciones están vacías.
 * Esta función es idempotente y segura de ejecutar múltiples veces.
 */
export async function createIndexesAndSeedData(): Promise<void> {
  try {
    console.log('Iniciando configuración de índices y datos iniciales en las colecciones...');

    // #region Users Collection
    console.log('Configurando índices para la colección users...');
    const usersCollection = await getCollection('users');

    // Intentar dropear índices antiguos si existen, manejando el caso de que no existan.
    // Esto es útil si has cambiado la definición de un índice.
    try {
      await usersCollection.dropIndex('U_Email');
      console.log('Índice U_Email dropeado (si existía).');
    } catch (error: any) {
      if (error.codeName === 'IndexNotFound') {
        console.warn('Advertencia: Índice U_Email no encontrado, saltando drop.');
      } else {
        console.error('Error al intentar dropear índice U_Email:', error);
      }
    }

    try {
      await usersCollection.dropIndex('Username');
      console.log('Índice Username dropeado (si existía).');
    } catch (error: any) {
      if (error.codeName === 'IndexNotFound') {
        console.warn('Advertencia: Índice Username no encontrado, saltando drop.');
      } else {
        console.error('Error al intentar dropear índice Username:', error);
      }
    }

    // Crear nuevos índices. MongoDB los creará si no existen o no hará nada si ya existen con la misma definición.
    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'U_Email' });
    await usersCollection.createIndex({ username: 1 }, { unique: true, name: 'Username' });
    console.log('Índices U_Email y Username creados/asegurados para la colección users.');
    // #endregion

    // #region Subjects Collection
    console.log('Configurando colección subjects...');
    const subjectsCollection = await getCollection('subjects');

    // Crear índices para subjects. Son idempotentes.
    await subjectsCollection.createIndex({ category: 1 }, { unique: false });
    await subjectsCollection.createIndex({ name: 1 }, { unique: false });
    console.log('Índices de subjects creados/asegurados.');

    // Insertar datos iniciales de subjects solo si la colección está vacía
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

    // Para collections sin índices únicos complejos, createIndex no es estrictamente necesario antes de insertMany,
    // pero si tuvieras índices específicos para countries, los crearías aquí de forma idempotente.
    // Ejemplo: await countriesCollection.createIndex({ name: 1 }, { unique: true });

    // Insertar datos iniciales de countries solo si la colección está vacía
    const countriesCount = await countriesCollection.countDocuments();
    if (countriesCount === 0) {
      await countriesCollection.insertMany(countries);
      console.log('Datos iniciales de countries insertados.');
    } else {
      console.log('Colección countries ya contiene datos, saltando inserción inicial.');
    }
    // #endregion

    console.log('Configuración de base de datos (índices y datos iniciales) completada correctamente.');
  } catch (error) {
    console.error('Error crítico durante la configuración de la base de datos:', error);
    // Es importante relanzar el error si es crítico para que se detecte el fallo.
    throw error;
  }
}

/**
 * Función principal para configurar la base de datos.
 * Esta función se puede llamar al iniciar la aplicación (ej. en un punto de entrada de API)
 * o de forma explícita en un script.
 */
export async function setupDatabase(): Promise<void> {
  try {
    await createIndexesAndSeedData();
    console.log('Base de datos configurada correctamente a través de setupDatabase.');
  } catch (error) {
    console.error('Error al ejecutar setupDatabase:', error);
  }
}

// Este bloque se ejecuta SOLAMENTE cuando el archivo es llamado directamente
// como un script (ej. `node src/app/utils/db-setup.ts`).
// NO se ejecuta durante el proceso de build de Next.js en Vercel,
// a menos que tu "build command" lo llame explícitamente, lo cual se desaconseja
// para operaciones destructivas en producción.
if (require.main === module) {
  console.log('Ejecutando script de configuración de la base de datos...');
  setupDatabase()
    .then(() => {
      console.log('Proceso de script completado con éxito.');
      process.exit(0); // Sale con éxito
    })
    .catch((error) => {
      console.error('Error durante la ejecución del script de configuración:', error);
      process.exit(1); // Sale con error
    });
}
