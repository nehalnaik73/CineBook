const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cinebook.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@cinebook.com', password: adminPass, role: 'admin', phone: '9999999999' },
  });

  // Regular user
  const userPass = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: { name: 'John Doe', email: 'john@example.com', password: userPass, phone: '9876543210' },
  });

  // Theaters
  const theaters = await Promise.all([
    prisma.theater.upsert({ where: { id: 1 }, update: {}, create: { name: 'PVR Cinemas', city: 'Mumbai', address: 'Phoenix Mall, Lower Parel' } }),
    prisma.theater.upsert({ where: { id: 2 }, update: {}, create: { name: 'INOX Megaplex', city: 'Mumbai', address: 'R-City Mall, Ghatkopar' } }),
    prisma.theater.upsert({ where: { id: 3 }, update: {}, create: { name: 'Cinepolis', city: 'Delhi', address: 'DLF Mall, Saket' } }),
    prisma.theater.upsert({ where: { id: 4 }, update: {}, create: { name: 'PVR IMAX', city: 'Delhi', address: 'Ambience Mall, Vasant Kunj' } }),
    prisma.theater.upsert({ where: { id: 5 }, update: {}, create: { name: 'Multiplex Gold', city: 'Bangalore', address: 'UB City Mall, Vittal Mallya Rd' } }),
    prisma.theater.upsert({ where: { id: 6 }, update: {}, create: { name: 'SPI Cinemas', city: 'Chennai', address: 'Express Avenue, Royapettah' } }),
  ]);

  // Movies
  const movies = await Promise.all([
    prisma.movie.upsert({ where: { id: 1 }, update: {}, create: { title: 'Dune: Part Three', description: 'The epic conclusion to the Dune saga. Paul Atreides faces the ultimate battle for Arrakis.', genre: 'Sci-Fi', language: 'English', duration: 165, rating: 'UA', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', releaseDate: '2026-03-01' } }),
    prisma.movie.upsert({ where: { id: 2 }, update: {}, create: { title: 'Pushpa 3', description: 'Pushpa Raj returns in an even more explosive chapter of his rise to power.', genre: 'Action', language: 'Telugu', duration: 178, rating: 'UA', poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400', releaseDate: '2026-02-15' } }),
    prisma.movie.upsert({ where: { id: 3 }, update: {}, create: { title: 'Kalki 2898 AD Returns', description: 'The futuristic mythological saga continues with Kalki facing new divine challenges.', genre: 'Fantasy', language: 'Hindi', duration: 172, rating: 'U', poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400', releaseDate: '2026-01-26' } }),
    prisma.movie.upsert({ where: { id: 4 }, update: {}, create: { title: 'Metro In Dino', description: 'A touching anthology of urban love stories set in modern Mumbai.', genre: 'Romance', language: 'Hindi', duration: 148, rating: 'U', poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', releaseDate: '2026-03-07' } }),
    prisma.movie.upsert({ where: { id: 5 }, update: {}, create: { title: 'Avengers: Kang Dynasty', description: 'Earth\'s mightiest heroes unite to battle the multiversal conqueror Kang.', genre: 'Action', language: 'English', duration: 180, rating: 'UA', poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400', releaseDate: '2026-03-19' } }),
    prisma.movie.upsert({ where: { id: 6 }, update: {}, create: { title: 'RRR 2', description: 'Ram and Bheem return for another breathtaking action-packed revolutionary adventure.', genre: 'Action', language: 'Telugu', duration: 185, rating: 'UA', poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400', releaseDate: '2026-02-28' } }),
    prisma.movie.upsert({ where: { id: 7 }, update: {}, create: { title: 'The Dark Forest', description: 'A spine-chilling horror mystery set in the dense forests of Northeast India.', genre: 'Horror', language: 'Hindi', duration: 132, rating: 'A', poster: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', releaseDate: '2026-03-13' } }),
    prisma.movie.upsert({ where: { id: 8 }, update: {}, create: { title: 'Laughter Riot', description: 'A hilarious comedy of errors that turns a simple wedding into pure chaos.', genre: 'Comedy', language: 'Hindi', duration: 128, rating: 'U', poster: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400', releaseDate: '2026-03-05' } }),
  ]);

  // Shows for movie 1 at theater 1
  const today = new Date();
  const dateStr = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const showsData = [
    { movieId: 1, theaterId: 1, date: dateStr(0), time: '10:00 AM', format: '2D', price: 280 },
    { movieId: 1, theaterId: 1, date: dateStr(0), time: '02:30 PM', format: '3D', price: 380 },
    { movieId: 1, theaterId: 1, date: dateStr(0), time: '07:00 PM', format: '3D', price: 420 },
    { movieId: 1, theaterId: 2, date: dateStr(0), time: '11:00 AM', format: '2D', price: 260 },
    { movieId: 1, theaterId: 2, date: dateStr(1), time: '03:00 PM', format: '2D', price: 260 },
    { movieId: 2, theaterId: 1, date: dateStr(0), time: '09:30 AM', format: '2D', price: 240 },
    { movieId: 2, theaterId: 1, date: dateStr(0), time: '01:00 PM', format: '2D', price: 240 },
    { movieId: 2, theaterId: 3, date: dateStr(0), time: '06:30 PM', format: '3D', price: 360 },
    { movieId: 3, theaterId: 2, date: dateStr(0), time: '12:00 PM', format: '2D', price: 300 },
    { movieId: 3, theaterId: 4, date: dateStr(0), time: '04:00 PM', format: 'IMAX', price: 550 },
    { movieId: 4, theaterId: 1, date: dateStr(0), time: '11:30 AM', format: '2D', price: 220 },
    { movieId: 5, theaterId: 3, date: dateStr(0), time: '05:00 PM', format: '3D', price: 400 },
    { movieId: 5, theaterId: 4, date: dateStr(0), time: '08:00 PM', format: 'IMAX', price: 600 },
    { movieId: 6, theaterId: 5, date: dateStr(0), time: '10:30 AM', format: '2D', price: 250 },
    { movieId: 7, theaterId: 6, date: dateStr(0), time: '09:00 PM', format: '2D', price: 200 },
    { movieId: 8, theaterId: 1, date: dateStr(1), time: '02:00 PM', format: '2D', price: 180 },
  ];

  for (const sd of showsData) {
    const existing = await prisma.show.findFirst({ where: { movieId: sd.movieId, theaterId: sd.theaterId, date: sd.date, time: sd.time } });
    if (!existing) {
      const show = await prisma.show.create({ data: sd });
      const rowLabels = ['A','B','C','D','E','F','G','H'];
      const seatsData = [];
      for (const row of rowLabels) {
        for (let n = 1; n <= 10; n++) {
          seatsData.push({ showId: show.id, row, number: n, status: 'available' });
        }
      }
      await prisma.seat.createMany({ data: seatsData });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@cinebook.com / admin123');
  console.log('📧 User:  john@example.com / user123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
