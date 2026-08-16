import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, logActivity } from '../db.js';
import { generateToken, requireAuth, AuthRequest } from '../auth.js';
import { User } from '../../src/types/index.js';

export const authRoutes = Router();

// Register new user
authRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, username, password, phone } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const db = getDb();
    const cleanUsername = username.toLowerCase().trim();

    const existingUser = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Este usuário já está cadastrado.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: userId,
      name: name.trim(),
      username: cleanUsername,
      role: 'USER',
      phone: phone ? phone.trim() : undefined,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.user_passwords[userId] = passwordHash;
    saveDb();

    logActivity(userId, cleanUsername, 'USER_REGISTER', `Novo usuário registrado: ${name} (${cleanUsername})`);

    const token = generateToken(newUser);
    return res.status(201).json({
      user: newUser,
      token,
      message: 'Cadastro realizado com sucesso!',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
});

// Login
authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Informe seu usuário e senha.' });
    }

    const db = getDb();
    const cleanUsername = username.toLowerCase().trim();
    const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const passwordHash = db.user_passwords[user.id];
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const token = generateToken(user);
    logActivity(user.id, user.username, 'USER_LOGIN', `Login efetuado: ${user.name} [${user.role}]`);

    return res.json({
      user,
      token,
      message: 'Login realizado com sucesso!',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro ao processar login.' });
  }
});

// Get current authenticated user
authRoutes.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// Update Profile
authRoutes.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (name) db.users[userIndex].name = name.trim();
    if (phone !== undefined) db.users[userIndex].phone = phone ? phone.trim() : undefined;
    if (avatar) db.users[userIndex].avatar = avatar;

    saveDb();
    logActivity(req.user!.id, req.user!.email, 'UPDATE_PROFILE', 'Perfil atualizado');

    return res.json({
      user: db.users[userIndex],
      message: 'Perfil atualizado com sucesso!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// Change Password
authRoutes.put('/change-password', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const db = getDb();
    const passwordHash = db.user_passwords[req.user!.id];

    if (!passwordHash || !bcrypt.compareSync(currentPassword, passwordHash)) {
      return res.status(400).json({ error: 'A senha atual está incorreta.' });
    }

    const salt = bcrypt.genSaltSync(10);
    db.user_passwords[req.user!.id] = bcrypt.hashSync(newPassword, salt);
    saveDb();

    logActivity(req.user!.id, req.user!.email, 'CHANGE_PASSWORD', 'Senha alterada com sucesso');

    return res.json({ message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// Forgot password simulation / token
authRoutes.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe seu e-mail.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    // Return friendly message even if not found for security
    return res.json({
      message: 'Se este e-mail estiver cadastrado, enviamos as instruções de recuperação.',
    });
  }

  return res.json({
    message: 'Instruções de recuperação geradas com sucesso. Verifique seu e-mail.',
    demoNote: 'Em ambiente de demonstração, use a senha padrão "cliente123" ou "admin123" ou altere sua senha no perfil.',
  });
});
