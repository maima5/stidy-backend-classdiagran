export class AppError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}
export const badRequest = (m: string) => new AppError(400, m, 'BAD_REQUEST');
export const unauthorized = (m = 'Tidak terautentikasi') => new AppError(401, m, 'UNAUTHORIZED');
export const forbidden = (m = 'Akses ditolak') => new AppError(403, m, 'FORBIDDEN');
export const notFound = (m = 'Data tidak ditemukan') => new AppError(404, m, 'NOT_FOUND');
export const conflict = (m: string) => new AppError(409, m, 'CONFLICT');
