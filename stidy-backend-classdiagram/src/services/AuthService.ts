import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { conflict, forbidden, unauthorized } from '../config/errors';
import { User } from '../domain/entities';
import { AuthSessionRepository } from '../repositories/AuthSessionRepository';
import { UserRepository } from '../repositories/UserRepository';

export interface AuthTokens { accessToken: string; refreshToken: string }
interface ClientInfo { userAgent?: string; ipAddress?: string }

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export class AuthService {
  constructor(private users: UserRepository, private sessions: AuthSessionRepository) {}

  async register(name: string, email: string, password: string): Promise<User> {
    if (await this.users.findByEmail(email)) throw conflict('Email sudah terdaftar');
    const hash = await bcrypt.hash(password, 10);
    return this.users.create(name, email, hash); // role selalu 'user'
  }

  async login(email: string, password: string, client: ClientInfo) {
    const user = await this.users.findByEmail(email);
    // compare tetap dijalankan agar waktu respons tidak membocorkan keberadaan email
    const ok = await bcrypt.compare(password, user?.passwordHash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi');
    if (!user || !ok) throw unauthorized('Email atau password salah');
    if (!user.isActive()) throw forbidden('Akun dinonaktifkan');
    await this.users.touchLogin(user.id);
    return { user, ...(await this.issueTokens(user, client)) };
  }

  async refresh(refreshToken: string, client: ClientInfo) {
    const session = await this.sessions.findByTokenHash(sha256(refreshToken));
    if (!session || !session.isValid()) throw unauthorized('Refresh token tidak valid');
    const user = await this.users.findById(session.userId);
    if (!user || !user.isActive()) throw forbidden('Akun dinonaktifkan');
    await this.sessions.revoke(session.id); // rotasi token
    return { user, ...(await this.issueTokens(user, client)) };
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessions.findByTokenHash(sha256(refreshToken));
    if (session) await this.sessions.revoke(session.id);
  }

  verifyAccessToken(token: string): { sub: string; role: string } {
    try {
      return jwt.verify(token, env.jwtSecret) as { sub: string; role: string };
    } catch {
      throw unauthorized('Token tidak valid atau kedaluwarsa');
    }
  }

  private async issueTokens(user: User, client: ClientInfo): Promise<AuthTokens> {
    const accessToken = jwt.sign({ role: user.role }, env.jwtSecret, {
      subject: user.id, expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = randomBytes(48).toString('hex');
    await this.sessions.create({
      userId: user.id,
      tokenHash: sha256(refreshToken), // hanya hash yang disimpan
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
      expiresAt: new Date(Date.now() + env.refreshTtlDays * 86_400_000),
    });
    return { accessToken, refreshToken };
  }
}
