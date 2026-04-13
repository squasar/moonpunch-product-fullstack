import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ─── Seed Categories ─────────────────────────────────────────────────────────
  const categories = [
    { name: 'Game',     slug: 'game',     colorHex: '#ff4500' },
    { name: 'Software', slug: 'software', colorHex: '#007bff' },
    { name: 'Tool',     slug: 'tool',     colorHex: '#28a745' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅  Categories seeded.');

  // ─── Seed Admin User ─────────────────────────────────────────────────────────
  const adminEmail = 'admin@moonpunch.com';
  const passwordHash = await bcrypt.hash('changeme123!', 12);

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:        adminEmail,
      username:     'moonpunch_admin',
      passwordHash,
      role:         'admin',
      firstName:    'MOON',
      lastName:     'PUNCH',
      isVerified:   true,
    },
  });
  console.log('✅  Admin user seeded  →  admin@moonpunch.com / changeme123!');

  // ─── Seed Demo Product ────────────────────────────────────────────────────────
  const gameCategory = await prisma.category.findUnique({ where: { slug: 'game' } });

  if (gameCategory) {
    await prisma.product.upsert({
      where:  { slug: 'kavunn' },
      update: {},
      create: {
        projectName:        'Kavunn',
        slug:               'kavunn',
        projectExplanation: 'An immersive action adventure set in a handcrafted world with deep combat mechanics. Built with Unreal Engine and crafted over 3 years of passionate development.',
        shortDescription:   'Our flagship action adventure title.',
        videoUrl:           'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl:       '/assets/img/portfolio/1.jpg',
        categoryId:         gameCategory.id,
        status:             'published',
        releaseDate:        new Date('2024-01-01'),
        storeUrl:           'https://store.steampowered.com/',
      },
    });
    console.log('✅  Demo product "Kavunn" seeded.');
  }

  console.log('🚀  Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
