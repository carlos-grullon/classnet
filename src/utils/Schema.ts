import 'dotenv/config'; // Carga variables de entorno desde .env
import { getCollection } from './MongoDB';

/**
 * Crea los índices necesarios para optimizar las consultas en la base de datos
 */
export async function createIndexes(): Promise<void> {
  try {
    console.log('Creando índices en las colecciones...');

    //region Users
    console.log('Creando índices en la colección users...');
    const usersCollection = await getCollection('users');
    try {
      await usersCollection.dropIndex('U_Email');
      await usersCollection.dropIndex('Username');
    } catch (error) {
      console.log('Índices no encontrados');
    }

    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'U_Email' });
    await usersCollection.createIndex({ username: 1 }, { unique: false, name: 'Username' });
    //endregion

    //region Subjects
    console.log('Creando índices en la colección subjects...');
    const subjectsCollection = await getCollection('subjects');
    subjectsCollection.drop();
    await subjectsCollection.createIndex({ category: 1, code: 1 }, { unique: true });
    await subjectsCollection.createIndex({ name: 1 }, { unique: true });
    const subjects = [
      {
        "category": "LAN",
        "name": "Inglés"
      },
      {
        "category": "LAN",
        "name": "Español"
      },
      {
        "category": "LAN",
        "name": "Francés"
      },
      {
        "category": "LAN",
        "name": "Alemán"
      },
      {
        "category": "LAN",
        "name": "Italiano"
      },
      {
        "category": "LAN",
        "name": "Portugués"
      },
      {
        "category": "LAN",
        "name": "Chino Mandarín"
      },
      {
        "category": "LAN",
        "name": "Chino Cantonés"
      },
      {
        "category": "LAN",
        "name": "Japonés"
      },
      {
        "category": "LAN",
        "name": "Coreano"
      },
      {
        "category": "LAN",
        "name": "Ruso"
      },
      {
        "category": "LAN",
        "name": "Árabe"
      },
      {
        "category": "LAN",
        "name": "Hebreo"
      },
      {
        "category": "LAN",
        "name": "Griego Moderno"
      },
      {
        "category": "LAN",
        "name": "Griego Antiguo"
      },
      {
        "category": "LAN",
        "name": "Neerlandés"
      },
      {
        "category": "LAN",
        "name": "Sueco"
      },
      {
        "category": "LAN",
        "name": "Noruego"
      },
      {
        "category": "LAN",
        "name": "Danés"
      },
      {
        "category": "LAN",
        "name": "Polaco"
      },
      {
        "category": "LAN",
        "name": "Turco"
      },
      {
        "category": "LAN",
        "name": "Hindi"
      },
      {
        "category": "LAN",
        "name": "Lengua de Signos"
      },
      {
        "category": "ART",
        "name": "Pintura"
      },
      {
        "category": "ART",
        "name": "Dibujo"
      },
      {
        "category": "ART",
        "name": "Acuarela"
      },
      {
        "category": "ART",
        "name": "Dibujo Digital"
      },
      {
        "category": "ART",
        "name": "Ilustración"
      },
      {
        "category": "ART",
        "name": "Diseño Gráfico"
      },
      {
        "category": "ART",
        "name": "Fotografía"
      },
      {
        "category": "ART",
        "name": "Edición de Video"
      },
      {
        "category": "ART",
        "name": "Animación"
      },
      {
        "category": "ART",
        "name": "Diseño de Moda"
      },
      {
        "category": "ART",
        "name": "Diseño de Interiores"
      },
      {
        "category": "ART",
        "name": "Escultura"
      },
      {
        "category": "ART",
        "name": "Cerámica"
      },
      {
        "category": "ART",
        "name": "Joyería"
      },
      {
        "category": "ART",
        "name": "Origami"
      },
      {
        "category": "ART",
        "name": "Caligrafía"
      },
      {
        "category": "ART",
        "name": "Lettering"
      },
      {
        "category": "ART",
        "name": "Creación de Cómics"
      },
      {
        "category": "ART",
        "name": "Costura"
      },
      {
        "category": "ART",
        "name": "Tejido (Punto)"
      },
      {
        "category": "ART",
        "name": "Tejido (Ganchillo)"
      },
      {
        "category": "MUS",
        "name": "Teoría Musical"
      },
      {
        "category": "MUS",
        "name": "Solfeo"
      },
      {
        "category": "MUS",
        "name": "Armonía"
      },
      {
        "category": "MUS",
        "name": "Composición Musical"
      },
      {
        "category": "MUS",
        "name": "Canto"
      },
      {
        "category": "MUS",
        "name": "Piano"
      },
      {
        "category": "MUS",
        "name": "Guitarra"
      },
      {
        "category": "MUS",
        "name": "Bajo Eléctrico"
      },
      {
        "category": "MUS",
        "name": "Batería"
      },
      {
        "category": "MUS",
        "name": "Violín"
      },
      {
        "category": "MUS",
        "name": "Violonchelo"
      },
      {
        "category": "MUS",
        "name": "Flauta"
      },
      {
        "category": "MUS",
        "name": "Clarinete"
      },
      {
        "category": "MUS",
        "name": "Saxofón"
      },
      {
        "category": "MUS",
        "name": "Trompeta"
      },
      {
        "category": "MUS",
        "name": "Ukelele"
      },
      {
        "category": "MUS",
        "name": "Producción Musical"
      },
      {
        "category": "MUS",
        "name": "Historia de la Música"
      },
      {
        "category": "DYM",
        "name": "Ballet"
      },
      {
        "category": "DYM",
        "name": "Jazz (Baile)"
      },
      {
        "category": "DYM",
        "name": "Hip Hop (Baile)"
      },
      {
        "category": "DYM",
        "name": "Contemporáneo (Baile)"
      },
      {
        "category": "DYM",
        "name": "Salsa"
      },
      {
        "category": "DYM",
        "name": "Bachata"
      },
      {
        "category": "DYM",
        "name": "Tango"
      },
      {
        "category": "DYM",
        "name": "Flamenco"
      },
      {
        "category": "DYM",
        "name": "Yoga"
      },
      {
        "category": "DYM",
        "name": "Pilates"
      },
      {
        "category": "DYM",
        "name": "Zumba"
      },
      {
        "category": "DYM",
        "name": "Aeróbicos"
      },
      {
        "category": "DYM",
        "name": "Estiramientos"
      },
      {
        "category": "DYM",
        "name": "Conciencia Corporal"
      },
      {
        "category": "ACA",
        "name": "Matemáticas"
      },
      {
        "category": "ACA",
        "name": "Física"
      },
      {
        "category": "ACA",
        "name": "Química"
      },
      {
        "category": "ACA",
        "name": "Biología"
      },
      {
        "category": "ACA",
        "name": "Ciencias Ambientales"
      },
      {
        "category": "ACA",
        "name": "Geología"
      },
      {
        "category": "ACA",
        "name": "Astronomía"
      },
      {
        "category": "ACA",
        "name": "Historia"
      },
      {
        "category": "ACA",
        "name": "Geografía"
      },
      {
        "category": "ACA",
        "name": "Literatura"
      },
      {
        "category": "ACA",
        "name": "Sociología"
      },
      {
        "category": "ACA",
        "name": "Psicología"
      },
      {
        "category": "ACA",
        "name": "Filosofía"
      },
      {
        "category": "ACA",
        "name": "Economía"
      },
      {
        "category": "ACA",
        "name": "Ciencias Políticas"
      },
      {
        "category": "ACA",
        "name": "Derecho (Introducción)"
      },
      {
        "category": "ACA",
        "name": "Lógica"
      },
      {
        "category": "ACA",
        "name": "Ética"
      },
      {
        "category": "TEC",
        "name": "Introducción a la Programación"
      },
      {
        "category": "TEC",
        "name": "Programación con Python"
      },
      {
        "category": "TEC",
        "name": "Programación con JavaScript"
      },
      {
        "category": "TEC",
        "name": "Programación con Java"
      },
      {
        "category": "TEC",
        "name": "Programación con C#"
      },
      {
        "category": "TEC",
        "name": "Desarrollo Web (Frontend)"
      },
      {
        "category": "TEC",
        "name": "Desarrollo Web (Backend)"
      },
      {
        "category": "TEC",
        "name": "Bases de Datos (SQL)"
      },
      {
        "category": "TEC",
        "name": "Desarrollo de Apps Móviles"
      },
      {
        "category": "TEC",
        "name": "Ciencia de Datos (Introducción)"
      },
      {
        "category": "TEC",
        "name": "Inteligencia Artificial (Introducción)"
      },
      {
        "category": "TEC",
        "name": "Ciberseguridad (Introducción)"
      },
      {
        "category": "TEC",
        "name": "Redes de Computadoras (Introducción)"
      },
      {
        "category": "TEC",
        "name": "Cloud Computing (Introducción)"
      },
      {
        "category": "TEC",
        "name": "Diseño UX/UI"
      },
      {
        "category": "TEC",
        "name": "Control de Versiones (Git)"
      },
      {
        "category": "TEC",
        "name": "Ofimática (Word)"
      },
      {
        "category": "TEC",
        "name": "Ofimática (Excel)"
      },
      {
        "category": "TEC",
        "name": "Ofimática (PowerPoint)"
      },
      {
        "category": "HAB",
        "name": "Cocina"
      },
      {
        "category": "HAB",
        "name": "Repostería"
      },
      {
        "category": "HAB",
        "name": "Jardinería"
      },
      {
        "category": "HAB",
        "name": "Ajedrez"
      },
      {
        "category": "HAB",
        "name": "Escritura Creativa"
      },
      {
        "category": "HAB",
        "name": "Guionismo"
      },
      {
        "category": "HAB",
        "name": "Podcasting"
      },
      {
        "category": "HAB",
        "name": "Blogging"
      },
      {
        "category": "HAB",
        "name": "Oratoria"
      },
      {
        "category": "HAB",
        "name": "Finanzas Personales"
      },
      {
        "category": "HAB",
        "name": "Organización del Hogar"
      },
      {
        "category": "HAB",
        "name": "Coaching"
      },
      {
        "category": "HAB",
        "name": "Mindfulness"
      },
      {
        "category": "HAB",
        "name": "Meditación"
      }
    ];
    await subjectsCollection.insertMany(subjects);
    //endregion

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
