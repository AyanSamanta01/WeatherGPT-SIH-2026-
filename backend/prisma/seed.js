const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Weather@123', 10);

  // Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@weathergpt.ai' },
    update: {},
    create: {
      name: 'WeatherGPT Demo User',
      email: 'demo@weathergpt.ai',
      passwordHash,
      preferredLanguage: 'en',
      deviceToken: 'demo_fcm_token_sih_2026'
    }
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (Password: Weather@123)`);

  // Seed Saved Locations
  await prisma.location.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Kolkata Headquarters',
        latitude: 22.5726,
        longitude: 88.3639,
        isDefault: true
      },
      {
        userId: demoUser.id,
        name: 'Mumbai Marine Drive',
        latitude: 19.0760,
        longitude: 72.8777,
        isDefault: false
      },
      {
        userId: demoUser.id,
        name: 'Delhi NCR',
        latitude: 28.6139,
        longitude: 77.2090,
        isDefault: false
      }
    ],
    skipDuplicates: true
  });

  console.log('📍 Seeded default locations.');

  // Seed Demo Weather Alerts
  await prisma.alert.createMany({
    data: [
      {
        locationName: 'Bay of Bengal Coast',
        latitude: 21.5,
        longitude: 87.5,
        radiusKm: 150,
        severity: 'warning',
        alertType: 'cyclone',
        title: 'Deep Depression warning over Bay of Bengal',
        description: 'Wind speeds of 50-65 km/h with heavy squalls expected along coastal regions.',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[86.5, 20.5], [88.5, 20.5], [88.5, 22.5], [86.5, 22.5], [86.5, 20.5]]
          ]
        },
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 72 * 3600 * 1000),
        source: 'IMD'
      },
      {
        locationName: 'Northwest Plains',
        latitude: 28.6,
        longitude: 77.2,
        radiusKm: 100,
        severity: 'advisory',
        alertType: 'heatwave',
        title: 'Heatwave condition advisory',
        description: 'Daytime temperatures exceeding 42°C with low humidity. Stay hydrated.',
        geometry: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 48 * 3600 * 1000),
        source: 'IMD'
      }
    ],
    skipDuplicates: true
  });

  console.log('⚠️ Seeded sample alerts.');

  // Seed Sample Conversation & Messages
  const demoConv = await prisma.conversation.create({
    data: {
      userId: demoUser.id,
      title: 'Monsoon forecast inquiry for Kolkata',
      messages: {
        create: [
          {
            userId: demoUser.id,
            role: 'user',
            content: 'Will it rain tomorrow in Kolkata?',
            intent: 'forecast_query',
            language: 'en',
            sources: ['open-meteo'],
            riskLevel: 'low'
          },
          {
            userId: demoUser.id,
            role: 'assistant',
            content: 'Forecast indicates temperatures between 26.5°C and 32.0°C with moderate cloud cover and 20% chance of light drizzle.',
            intent: 'forecast_query',
            language: 'en',
            sources: ['open-meteo'],
            riskLevel: 'low'
          }
        ]
      }
    }
  });

  console.log(`💬 Seeded sample conversation: "${demoConv.title}"`);
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
