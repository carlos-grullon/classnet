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
    try {
      await usersCollection.dropIndex('U_Email');
      await usersCollection.dropIndex('Username');
    } catch (error) {
      console.log('Índices no encontrados');
    }

    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'U_Email' });
    await usersCollection.createIndex({ username: 1 }, { unique: false, name: 'Username' });

    const subjectsCollection = await getCollection('subjects');
    subjectsCollection.drop();
    await subjectsCollection.createIndex({ category: 1, code: 1 }, { unique: true });
    await subjectsCollection.createIndex({ name: 1 }, { unique: true });
    const subjects = [
      {
        "category": "LAN",
        "code": "0001",
        "name": "Inglés"
      },
      {
        "category": "LAN",
        "code": "0002",
        "name": "Español"
      },
      {
        "category": "LAN",
        "code": "0003",
        "name": "Francés"
      },
      {
        "category": "LAN",
        "code": "0004",
        "name": "Alemán"
      },
      {
        "category": "LAN",
        "code": "0005",
        "name": "Italiano"
      },
      {
        "category": "LAN",
        "code": "0006",
        "name": "Portugués"
      },
      {
        "category": "LAN",
        "code": "0007",
        "name": "Chino Mandarín"
      },
      {
        "category": "LAN",
        "code": "0008",
        "name": "Chino Cantonés"
      },
      {
        "category": "LAN",
        "code": "0009",
        "name": "Japonés"
      },
      {
        "category": "LAN",
        "code": "0010",
        "name": "Coreano"
      },
      {
        "category": "LAN",
        "code": "0011",
        "name": "Ruso"
      },
      {
        "category": "LAN",
        "code": "0012",
        "name": "Árabe"
      },
      {
        "category": "LAN",
        "code": "0013",
        "name": "Hebreo"
      },
      {
        "category": "LAN",
        "code": "0014",
        "name": "Griego Moderno"
      },
      {
        "category": "LAN",
        "code": "0015",
        "name": "Griego Antiguo"
      },
      {
        "category": "LAN",
        "code": "0016",
        "name": "Neerlandés"
      },
      {
        "category": "LAN",
        "code": "0017",
        "name": "Sueco"
      },
      {
        "category": "LAN",
        "code": "0018",
        "name": "Noruego"
      },
      {
        "category": "LAN",
        "code": "0019",
        "name": "Danés"
      },
      {
        "category": "LAN",
        "code": "0020",
        "name": "Polaco"
      },
      {
        "category": "LAN",
        "code": "0021",
        "name": "Turco"
      },
      {
        "category": "LAN",
        "code": "0022",
        "name": "Hindi"
      },
      {
        "category": "LAN",
        "code": "0023",
        "name": "Lengua de Signos"
      },
      {
        "category": "ART",
        "code": "0001",
        "name": "Pintura"
      },
      {
        "category": "ART",
        "code": "0002",
        "name": "Dibujo"
      },
      {
        "category": "ART",
        "code": "0003",
        "name": "Acuarela"
      },
      {
        "category": "ART",
        "code": "0004",
        "name": "Dibujo Digital"
      },
      {
        "category": "ART",
        "code": "0005",
        "name": "Ilustración"
      },
      {
        "category": "ART",
        "code": "0006",
        "name": "Diseño Gráfico"
      },
      {
        "category": "ART",
        "code": "0007",
        "name": "Fotografía"
      },
      {
        "category": "ART",
        "code": "0008",
        "name": "Edición de Video"
      },
      {
        "category": "ART",
        "code": "0009",
        "name": "Animación"
      },
      {
        "category": "ART",
        "code": "0010",
        "name": "Diseño de Moda"
      },
      {
        "category": "ART",
        "code": "0011",
        "name": "Diseño de Interiores"
      },
      {
        "category": "ART",
        "code": "0012",
        "name": "Escultura"
      },
      {
        "category": "ART",
        "code": "0013",
        "name": "Cerámica"
      },
      {
        "category": "ART",
        "code": "0014",
        "name": "Joyería"
      },
      {
        "category": "ART",
        "code": "0015",
        "name": "Origami"
      },
      {
        "category": "ART",
        "code": "0016",
        "name": "Caligrafía"
      },
      {
        "category": "ART",
        "code": "0017",
        "name": "Lettering"
      },
      {
        "category": "ART",
        "code": "0018",
        "name": "Creación de Cómics"
      },
      {
        "category": "ART",
        "code": "0019",
        "name": "Costura"
      },
      {
        "category": "ART",
        "code": "0020",
        "name": "Tejido (Punto)"
      },
      {
        "category": "ART",
        "code": "0021",
        "name": "Tejido (Ganchillo)"
      },
      {
        "category": "MUS",
        "code": "0001",
        "name": "Teoría Musical"
      },
      {
        "category": "MUS",
        "code": "0002",
        "name": "Solfeo"
      },
      {
        "category": "MUS",
        "code": "0003",
        "name": "Armonía"
      },
      {
        "category": "MUS",
        "code": "0004",
        "name": "Composición Musical"
      },
      {
        "category": "MUS",
        "code": "0005",
        "name": "Canto"
      },
      {
        "category": "MUS",
        "code": "0006",
        "name": "Piano"
      },
      {
        "category": "MUS",
        "code": "0007",
        "name": "Guitarra"
      },
      {
        "category": "MUS",
        "code": "0008",
        "name": "Bajo Eléctrico"
      },
      {
        "category": "MUS",
        "code": "0009",
        "name": "Batería"
      },
      {
        "category": "MUS",
        "code": "0010",
        "name": "Violín"
      },
      {
        "category": "MUS",
        "code": "0011",
        "name": "Violonchelo"
      },
      {
        "category": "MUS",
        "code": "0012",
        "name": "Flauta"
      },
      {
        "category": "MUS",
        "code": "0013",
        "name": "Clarinete"
      },
      {
        "category": "MUS",
        "code": "0014",
        "name": "Saxofón"
      },
      {
        "category": "MUS",
        "code": "0015",
        "name": "Trompeta"
      },
      {
        "category": "MUS",
        "code": "0016",
        "name": "Ukelele"
      },
      {
        "category": "MUS",
        "code": "0017",
        "name": "Producción Musical"
      },
      {
        "category": "MUS",
        "code": "0018",
        "name": "Historia de la Música"
      },
      {
        "category": "DYM",
        "code": "0001",
        "name": "Ballet"
      },
      {
        "category": "DYM",
        "code": "0002",
        "name": "Jazz (Baile)"
      },
      {
        "category": "DYM",
        "code": "0003",
        "name": "Hip Hop (Baile)"
      },
      {
        "category": "DYM",
        "code": "0004",
        "name": "Contemporáneo (Baile)"
      },
      {
        "category": "DYM",
        "code": "0005",
        "name": "Salsa"
      },
      {
        "category": "DYM",
        "code": "0006",
        "name": "Bachata"
      },
      {
        "category": "DYM",
        "code": "0007",
        "name": "Tango"
      },
      {
        "category": "DYM",
        "code": "0008",
        "name": "Flamenco"
      },
      {
        "category": "DYM",
        "code": "0009",
        "name": "Yoga"
      },
      {
        "category": "DYM",
        "code": "0010",
        "name": "Pilates"
      },
      {
        "category": "DYM",
        "code": "0011",
        "name": "Zumba"
      },
      {
        "category": "DYM",
        "code": "0012",
        "name": "Aeróbicos"
      },
      {
        "category": "DYM",
        "code": "0013",
        "name": "Estiramientos"
      },
      {
        "category": "DYM",
        "code": "0014",
        "name": "Conciencia Corporal"
      },
      {
        "category": "ACA",
        "code": "0001",
        "name": "Matemáticas"
      },
      {
        "category": "ACA",
        "code": "0002",
        "name": "Física"
      },
      {
        "category": "ACA",
        "code": "0003",
        "name": "Química"
      },
      {
        "category": "ACA",
        "code": "0004",
        "name": "Biología"
      },
      {
        "category": "ACA",
        "code": "0005",
        "name": "Ciencias Ambientales"
      },
      {
        "category": "ACA",
        "code": "0006",
        "name": "Geología"
      },
      {
        "category": "ACA",
        "code": "0007",
        "name": "Astronomía"
      },
      {
        "category": "ACA",
        "code": "0008",
        "name": "Historia"
      },
      {
        "category": "ACA",
        "code": "0009",
        "name": "Geografía"
      },
      {
        "category": "ACA",
        "code": "0010",
        "name": "Literatura"
      },
      {
        "category": "ACA",
        "code": "0011",
        "name": "Sociología"
      },
      {
        "category": "ACA",
        "code": "0012",
        "name": "Psicología"
      },
      {
        "category": "ACA",
        "code": "0013",
        "name": "Filosofía"
      },
      {
        "category": "ACA",
        "code": "0014",
        "name": "Economía"
      },
      {
        "category": "ACA",
        "code": "0015",
        "name": "Ciencias Políticas"
      },
      {
        "category": "ACA",
        "code": "0016",
        "name": "Derecho (Introducción)"
      },
      {
        "category": "ACA",
        "code": "0017",
        "name": "Lógica"
      },
      {
        "category": "ACA",
        "code": "0018",
        "name": "Ética"
      },
      {
        "category": "TEC",
        "code": "0001",
        "name": "Introducción a la Programación"
      },
      {
        "category": "TEC",
        "code": "0002",
        "name": "Programación con Python"
      },
      {
        "category": "TEC",
        "code": "0003",
        "name": "Programación con JavaScript"
      },
      {
        "category": "TEC",
        "code": "0004",
        "name": "Programación con Java"
      },
      {
        "category": "TEC",
        "code": "0005",
        "name": "Programación con C#"
      },
      {
        "category": "TEC",
        "code": "0006",
        "name": "Desarrollo Web (Frontend)"
      },
      {
        "category": "TEC",
        "code": "0007",
        "name": "Desarrollo Web (Backend)"
      },
      {
        "category": "TEC",
        "code": "0008",
        "name": "Bases de Datos (SQL)"
      },
      {
        "category": "TEC",
        "code": "0009",
        "name": "Desarrollo de Apps Móviles"
      },
      {
        "category": "TEC",
        "code": "0010",
        "name": "Ciencia de Datos (Introducción)"
      },
      {
        "category": "TEC",
        "code": "0011",
        "name": "Inteligencia Artificial (Introducción)"
      },
      {
        "category": "TEC",
        "code": "0012",
        "name": "Ciberseguridad (Introducción)"
      },
      {
        "category": "TEC",
        "code": "0013",
        "name": "Redes de Computadoras (Introducción)"
      },
      {
        "category": "TEC",
        "code": "0014",
        "name": "Cloud Computing (Introducción)"
      },
      {
        "category": "TEC",
        "code": "0015",
        "name": "Diseño UX/UI"
      },
      {
        "category": "TEC",
        "code": "0016",
        "name": "Control de Versiones (Git)"
      },
      {
        "category": "TEC",
        "code": "0017",
        "name": "Ofimática (Word)"
      },
      {
        "category": "TEC",
        "code": "0018",
        "name": "Ofimática (Excel)"
      },
      {
        "category": "TEC",
        "code": "0019",
        "name": "Ofimática (PowerPoint)"
      },
      {
        "category": "HAB",
        "code": "0001",
        "name": "Cocina"
      },
      {
        "category": "HAB",
        "code": "0002",
        "name": "Repostería"
      },
      {
        "category": "HAB",
        "code": "0003",
        "name": "Jardinería"
      },
      {
        "category": "HAB",
        "code": "0004",
        "name": "Ajedrez"
      },
      {
        "category": "HAB",
        "code": "0005",
        "name": "Escritura Creativa"
      },
      {
        "category": "HAB",
        "code": "0006",
        "name": "Guionismo"
      },
      {
        "category": "HAB",
        "code": "0007",
        "name": "Podcasting"
      },
      {
        "category": "HAB",
        "code": "0008",
        "name": "Blogging"
      },
      {
        "category": "HAB",
        "code": "0009",
        "name": "Oratoria"
      },
      {
        "category": "HAB",
        "code": "0010",
        "name": "Finanzas Personales"
      },
      {
        "category": "HAB",
        "code": "0011",
        "name": "Organización del Hogar"
      },
      {
        "category": "HAB",
        "code": "0012",
        "name": "Coaching"
      },
      {
        "category": "HAB",
        "code": "0013",
        "name": "Mindfulness"
      },
      {
        "category": "HAB",
        "code": "0014",
        "name": "Meditación"
      }
    ];
    await subjectsCollection.insertMany(subjects);

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
