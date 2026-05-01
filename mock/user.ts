import { Request, Response } from 'express';

type MockUser = {
  id: number;
  login: string;
  name: string;
  role: 'user' | 'admin';
};

const mockUsers: MockUser[] = [
  { id: 1, login: 'john@example.com', name: 'John', role: 'user' },
  { id: 2, login: 'admin@example.com', name: 'Admin', role: 'admin' },
];

const waitTime = (time = 200) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export default {
  // Mock login for DB-less local development.
  'POST /api/v1/users/login': async (req: Request, res: Response) => {
    const { login, password } = req.body || {};
    await waitTime();

    if (!login || !password) {
      res.status(400).send({ detail: 'Login and password are required' });
      return;
    }

    // Accept any password for known demo users; fallback to generic local user.
    const user = mockUsers.find((u) => u.login === login) || {
      id: 999,
      login,
      name: 'Local User',
      role: 'user' as const,
    };

    res.send({
      access_token: `mock-access-token-${user.id}`,
      refresh_token: `mock-refresh-token-${user.id}`,
      token_type: 'bearer',
    });
  },

  // Login page calls /me right after receiving token.
  'GET /api/v1/users/me': async (req: Request, res: Response) => {
    await waitTime();
    const auth = String(req.headers.authorization || '');
    const idFromToken = Number(auth.split('-').pop()) || 1;
    const user = mockUsers.find((u) => u.id === idFromToken) || mockUsers[0];

    res.send({
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      created_dt: new Date().toISOString(),
      updated_dt: new Date().toISOString(),
    });
  },
};
