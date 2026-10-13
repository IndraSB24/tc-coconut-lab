import { prisma } from '@/lib/prisma';
import { User } from '@/core/domain/entities/User';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: raw.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { email },
    });
    if (!raw) return null;

    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: raw.createdAt,
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  }
}
