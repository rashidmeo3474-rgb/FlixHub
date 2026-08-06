import jwt from 'jsonwebtoken';

export const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
<<<<<<< HEAD
  process.env.JWT_SECRET,
=======
  process.env.JWT_SECRET || 'dev-secret-change-me',
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
  { expiresIn: process.env.JWT_EXPIRES || '7d' }
);

export const publicUser = (user) => ({
  id: user._id, name: user.name, email: user.email,
  phone: user.phone, role: user.role, language: user.language
});
