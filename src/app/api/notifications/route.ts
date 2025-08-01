import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { CreateNotificationDto } from '@/types/notification';
import { ObjectId } from 'mongodb';
import { getUserId } from '@/utils/Tools.ts';
import { MarkAsReadDto } from '@/types/notification';

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
    try {
        // Verificar que el cuerpo de la solicitud existe
        const requestBody = await request.text();
        if (!requestBody) {
            return NextResponse.json(
                { error: 'El cuerpo de la solicitud está vacío' },
                { status: 400 }
            );
        }

        let data: CreateNotificationDto;
        try {
            data = JSON.parse(requestBody);
        } catch (error) {
            console.error('Error al analizar JSON:', error);
            return NextResponse.json(
                { error: 'Formato de JSON inválido' },
                { status: 400 }
            );
        }

        console.log('Datos recibidos:', data);

        // Validación básica
        if (!data.userId || !data.title || !data.message) {
            return NextResponse.json(
                { 
                    error: 'Faltan campos requeridos',
                    required: ['userId', 'title', 'message'],
                    received: Object.keys(data)
                },
                { status: 400 }
            );
        }

        const notificationCollection = await getCollection('notifications');
        const now = new Date();

        const newNotification = {
            userId: new ObjectId(data.userId),
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            read: {
                status: false,
                readAt: null
            },
            link: data.link,
            metadata: data.metadata,
            createdAt: now,
            updatedAt: now,
        };

        const result = await notificationCollection.insertOne(newNotification);

        fetch('https://web-production-e802b.up.railway.app/emit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-key': process.env.SOCKET_KEY || ''
            },
            body: JSON.stringify({
              userId: data.userId,
              eventType: 'new-notification',
              payload: {
                _id: result.insertedId,
                ...newNotification
              }
            })
          });

        return NextResponse.json(
            {
                ...newNotification,
                _id: result.insertedId
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al crear notificación:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = await getUserId(request);
    
    // Parámetros de la consulta
    const unreadOnly = searchParams.get('unread') === 'true';
    const newOnly = searchParams.get('new') === 'true';
    // const countOnly = searchParams.get('countOnly') === 'true';
    const markAsViewed = searchParams.get('markAsViewed') === 'true';
    const includeCounts = searchParams.get('includeCounts') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    if (!userId) {
        return NextResponse.json(
            { error: 'Se requiere userId' },
            { status: 400 }
        );
    }

    try {
        const notificationCollection = await getCollection('notifications');
        const userCollection = await getCollection('users');
        const userIdObj = new ObjectId(userId);
        
        // Obtener la última fecha de visualización del usuario
        const user = await userCollection.findOne({ _id: userIdObj });
        const lastViewedAt = user?.lastNotificationView || null;

        // Construir la consulta base
        const query: any = { userId: userIdObj };

        // Aplicar filtros
        if (unreadOnly) {
            query['read.status'] = false;
        }
        
        // Filtrar por notificaciones nuevas (después de lastViewedAt)
        if (newOnly && lastViewedAt) {
            query.createdAt = { $gt: new Date(lastViewedAt) };
        }

        // Si solo necesitamos los contadores
        // if (countOnly) {
        //     const [total, unreadCount, newCount] = await Promise.all([
        //         notificationCollection.countDocuments(query),
        //         notificationCollection.countDocuments({ ...query, 'read.status': false }),
        //         lastViewedAt 
        //             ? notificationCollection.countDocuments({ 
        //                 ...query, 
        //                 createdAt: { $gt: new Date(lastViewedAt) } 
        //             })
        //             : notificationCollection.countDocuments({ ...query, 'read.status': false })
        //     ]);

        //     return NextResponse.json({
        //         total,
        //         unreadCount,
        //         newCount
        //     });
        // }

        // Actualizar la última fecha de visualización si es necesario
        if (markAsViewed) {
            await userCollection.updateOne(
                { _id: userIdObj },
                { $set: { lastNotificationView: new Date() } }
            );
        }

        // Obtener los contadores si se solicitan
        let counts: { total?: number; unreadCount?: number; newCount?: number } = {};
        if (includeCounts) {
            const [total, unreadCount, newCount] = await Promise.all([
                notificationCollection.countDocuments(query),
                notificationCollection.countDocuments({ ...query, 'read.status': false }),
                lastViewedAt 
                    ? notificationCollection.countDocuments({ 
                        ...query, 
                        createdAt: { $gt: new Date(lastViewedAt) } 
                    })
                    : 0
            ]);
            
            counts = { total, unreadCount, newCount };
        }

        // Obtener las notificaciones paginadas
        const notifications = await notificationCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        // Calcular si hay más páginas
        const total = counts['total'] || await notificationCollection.countDocuments(query);
        const hasMore = skip + notifications.length < total;

        // Devolver en el formato esperado
        return NextResponse.json({
            data: notifications,
            total,
            hasMore,
            unreadCount: counts['unreadCount'] || 0,
            newCount: counts['newCount'] || 0,
            ...counts
        });

    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return NextResponse.json(
            { error: 'Error al obtener notificaciones' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
      const { notificationIds } = await request.json() as MarkAsReadDto;
      const userId = await getUserId(request);
  
      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { error: 'Se requiere un arreglo de notificationIds' },
          { status: 400 }
        );
      }
  
      if (!userId) {
        return NextResponse.json(
          { error: 'Se requiere userId' },
          { status: 400 }
        );
      }
  
      const collection = await getCollection('notifications');
      const objectIds = notificationIds.map(id => new ObjectId(id));
      const userIdObj = new ObjectId(userId);
      
      // Update only unread notifications that belong to the user
      const result = await collection.updateMany(
        { 
          _id: { $in: objectIds },
          userId: userIdObj,
          'read.status': false
        },
        { 
          $set: { 
            'read.status': true,
            'read.readAt': new Date(),
            updatedAt: new Date()
          } 
        }
      );
  
      return NextResponse.json({
        success: true,
        message: `Se actualizaron ${result.modifiedCount} notificaciones`,
        updatedCount: result.modifiedCount
      });
  
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Error al actualizar las notificaciones',
          details: error instanceof Error ? error.message : 'Error desconocido'
        },
        { status: 500 }
      );
    }
  }