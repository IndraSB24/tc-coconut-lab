import { User } from '@/core/domain/entities/User';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    for (const u of initialUsers) {
      this.users.set(u.id, u);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find((u) => u.email === email) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  public clear(): void {
    this.users.clear();
  }
}
