import { MongoClient, Db, Collection, Document } from 'mongodb';

// Tipos para mejorar el trabajo con TypeScript
type MongoDBConnection = {
    client: MongoClient;
    db: Db;
};

// Variables para implementar el patrón singleton
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.DATABASE_NAME || 'classnet';

// Caché para mantener una única instancia de conexión
let cachedConnection: MongoDBConnection | null = null;
let isConnecting = false;

/**
 * Clase para manejar la conexión a MongoDB
 */
class MongoDB {
    private static instance: MongoDB | null = null;
    private connection: MongoDBConnection | null = null;

    /**
     * Constructor privado para implementar el patrón singleton
     */
    private constructor() { }

    /**
     * Obtiene la instancia única de MongoDB
     */
    public static getInstance(): MongoDB {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance;
    }

    /**
     * Conecta a la base de datos MongoDB
     */
    public async connect(): Promise<MongoDBConnection> {
        // Si ya tenemos una conexión, la retornamos
        if (cachedConnection) {
            return cachedConnection;
        }

        // Si ya estamos intentando conectarnos, evitamos múltiples intentos
        if (isConnecting) {
            // Esperamos hasta que la conexión esté lista
            while (isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (cachedConnection) {
                return cachedConnection;
            }
        }

        try {
            isConnecting = true;

            // Validamos que tengamos una URI definida
            if (!MONGODB_URI) {
                throw new Error('La variable de entorno MONGODB_URI no está definida');
            }

            // Creamos un nuevo cliente MongoDB
            const client = new MongoClient(MONGODB_URI);
            await client.connect();

            // Obtenemos la referencia a la base de datos
            const db = client.db(MONGODB_DB);

            // Guardamos la conexión en caché
            cachedConnection = { client, db };
            this.connection = cachedConnection;

            // Agregamos manejo de cierre de conexión al cerrar el proceso
            process.on('beforeExit', () => {
                if (cachedConnection?.client) {
                    cachedConnection.client.close();
                    cachedConnection = null;
                }
            });

            return cachedConnection;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        } finally {
            isConnecting = false;
        }
    }

    /**
     * Obtiene una colección de la base de datos
     * @param collectionName Nombre de la colección
     * @returns Colección de MongoDB
     */
    public async getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
        const connection = await this.connect();
        return connection.db.collection<T>(collectionName);
    }

    /**
     * Cierra la conexión a MongoDB
     */
    public async close(): Promise<void> {
        if (cachedConnection) {
            await cachedConnection.client.close();
            cachedConnection = null;
            this.connection = null;
        }
    }
}

// Exportamos funciones de utilidad para trabajar con MongoDB

/**
 * Obtiene una instancia de la clase MongoDB
 */
export const getMongoDBInstance = (): MongoDB => {
    return MongoDB.getInstance();
};

/**
 * Obtiene una colección de MongoDB
 * @param collectionName Nombre de la colección
 * @returns Colección de MongoDB
 */
export const getCollection = async <T extends Document = Document>(collectionName: string): Promise<Collection<T>> => {
    const instance = getMongoDBInstance();
    return instance.getCollection<T>(collectionName);
};

/**
 * Cierra la conexión a MongoDB
 */
export const closeConnection = async (): Promise<void> => {
    const instance = getMongoDBInstance();
    await instance.close();
};

export const collections = {
    users: await getCollection('users')
}

export default MongoDB;