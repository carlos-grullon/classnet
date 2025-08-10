const CRON_SECRET = '4194ad8602e2608e1fbf6e98c207a11403f7defbf4c3bcd171b488d74671a39f070d2a297bcbea6a82c5cef5124bac721d9521b6e9a7340abe56e33c7598c6ac';

async function testCron() {
  try {
    console.log('🔄 Ejecutando tareas diarias...');
    
    const response = await fetch('http://localhost:3000/api/cron/payment-reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Tareas completadas con éxito');
    console.log('Resultado:', JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error al ejecutar las tareas diarias:');
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Ejecutar la función
testCron();