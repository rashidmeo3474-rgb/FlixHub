import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { asyncHandler } from '../middleware/error.js';
import { signToken, publicUser } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!normalizedEmail || !password) return res.status(422).json({ message: 'Email and password are required' });
  if (await User.exists({ email: normalizedEmail }))
    return res.status(409).json({ message: 'This email is already registered' });

  const user = await User.create({ name, email: normalizedEmail, password, phone, role: 'user' });
  await ActivityLog.create({ user: user._id, actor: user._id, action: 'user_registered', details: { email: normalizedEmail } });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || '')))
    return res.status(401).json({ message: 'Wrong email or password' });

  await ActivityLog.create({ user: user._id, actor: user._id, action: 'user_login', details: { email: user.email } });
  res.json({ token: signToken(user), user: publicUser(user) });
});

/** Separate entry point for the admin portal — rejects non-admin accounts outright. */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || '')))
    return res.status(401).json({ message: 'Wrong email or password' });
  if (user.role !== 'admin')
    return res.status(403).json({ message: 'This account has no admin access' });

  await ActivityLog.create({ user: user._id, actor: user._id, action: 'admin_login', details: { email: user.email } });
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, language } = req.body;
  Object.assign(req.user, {
    name: name ?? req.user.name,
    phone: phone ?? req.user.phone,
    language: language ?? req.user.language
  });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
