import jwt from 'jsonwebtoken';

export const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES || '7d' }
);

export const publicUser = (user) => ({
  id: user._id, name: user.name, email: user.email,
  phone: user.phone, role: user.role, language: user.language
});
