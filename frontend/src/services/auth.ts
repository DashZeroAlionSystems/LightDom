export const AUTH_STORAGE_KEY = 'lightdom.auth.user';
export const AUTH_EVENT = 'auth:changed';

const persistUser = (user: Record<string, unknown> | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
};

export class AuthService {
  static async login(email: string, password: string) {
    return new Promise<{ user: { email: string; name: string; role: string } }>((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.trim().toLowerCase();
        const isAdmin = normalizedEmail === 'admin@lightdom.com' && password === 'admin123';

        if (!isAdmin) {
          reject(new Error('Invalid email or password'));
          return;
        }

        const user = {
          email: normalizedEmail,
          name: 'Admin',
          role: 'admin',
        } as const;

        persistUser(user);
        resolve({ user });
      }, 500);
    });
  }

  static async register(data: any) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ user: data }), 1000);
    });
  }

  static async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        persistUser(null);
        resolve(true);
      }, 300);
    });
  }
}
