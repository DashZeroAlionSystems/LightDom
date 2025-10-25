export class AuthService {
  static async login(email: string, password: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ user: { email } }), 1000);
    });
  }

  static async register(data: any) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ user: data }), 1000);
    });
  }

  static async logout() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }
}
