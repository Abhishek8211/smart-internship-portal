import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../models/dbStore';
import { User } from '../models/mongoModels';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sip_jwt_secret_token_2026_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sip_jwt_refresh_secret_token_2026_key';

// Helper to generate and persist tokens (Implementing Token Rotation)
const generateAndPersistTokens = async (user: any) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' } // 15 mins for access token in production
  );
  
  const newRefreshToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days expiration
  );

  // Retrieve user record and append to token list
  const userRec = await User.findById(user._id);
  if (userRec) {
    const tokens = userRec.refreshTokens || [];
    tokens.push(newRefreshToken);
    userRec.refreshTokens = tokens;
    await userRec.save();
  }

  return { accessToken, refreshToken: newRefreshToken };
};

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, companyName, companyId, jobTitle } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'All primary fields (email, password, role, name) are required.' });
    }

    const existingUser = await dbStore.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate numeric 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Create Base User
    const newUser = await dbStore.users.create({
      email,
      passwordHash,
      role,
      name,
      isVerified: false,
      otp,
      otpExpiry
    });

    // Profile creation
    if (role === 'student') {
      await dbStore.profiles.create({
        user: newUser._id
      });
    } else if (role === 'recruiter') {
      let finalCompId = companyId || '';

      if (!finalCompId && companyName) {
        const comp = await dbStore.companies.create({
          name: companyName,
          location: 'Remote',
          is_verified: false
        });
        finalCompId = comp.id;
      }

      await dbStore.recruiters.create({
        id: newUser._id,
        company_id: finalCompId || null,
        phone: phone || '',
        title: jobTitle || 'Recruiter'
      });
    }

    // Trigger NodeMailer verification email
    await emailService.sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. Verification OTP sent to your email.',
      userId: newUser._id,
      email: newUser.email,
      otp // Return direct for testing convenience
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const user = await dbStore.users.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification OTP.' });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const updatedUser = await dbStore.users.update(user._id, {
      isVerified: true,
      otp: null,
      otpExpiry: null
    });

    const { accessToken, refreshToken } = await generateAndPersistTokens(updatedUser);

    res.json({
      message: 'Account verified successfully.',
      accessToken,
      refreshToken,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        profilePic: updatedUser.profilePic
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbStore.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      // Re-send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
      await dbStore.users.update(user._id, { otp, otpExpiry });
      await emailService.sendOtpEmail(email, otp);

      return res.status(403).json({
        error: 'Account not verified. Verification OTP sent.',
        verified: false,
        otp
      });
    }

    const { accessToken, refreshToken } = await generateAndPersistTokens(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profilePic: user.profilePic
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. MOCK GOOGLE LOGIN
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleToken, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Google login requires email and name.' });
    }

    let user = await dbStore.users.findByEmail(email);

    if (!user) {
      const selectedRole = role || 'student';
      const dummyPassword = Math.random().toString(36).substr(2, 10);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dummyPassword, salt);

      user = await dbStore.users.create({
        email,
        passwordHash,
        role: selectedRole,
        name,
        isVerified: true
      });

      if (selectedRole === 'student') {
        await dbStore.profiles.create({ user: user._id });
      } else if (selectedRole === 'recruiter') {
        await dbStore.recruiters.create({
          id: user._id,
          company_id: null,
          phone: '',
          title: 'Recruiter'
        });
      }
    }

    const { accessToken, refreshToken } = await generateAndPersistTokens(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profilePic: user.profilePic
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. REFRESH TOKEN (With Rotation & Token Reuse Detection)
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token is required.' });

    // Verify token validity
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }

    const userRec = await User.findById(decoded.userId);
    if (!userRec) return res.status(403).json({ error: 'Session user record not found.' });

    const activeTokens = userRec.refreshTokens || [];

    // Token Reuse Detection
    if (!activeTokens.includes(token)) {
      // Re-used token: Potential session hijacking!
      // Revoke all active refresh sessions to secure account
      userRec.refreshTokens = [];
      await userRec.save();
      console.warn(`🚨 [Replay Attack Detected] Revoking all sessions for user: ${userRec.email}`);
      return res.status(403).json({ error: 'Security alert: Refresh token reused. Please sign in again.' });
    }

    // Generate new Access and Refresh tokens
    const nextAccessToken = jwt.sign(
      { userId: userRec._id, email: userRec.email, role: userRec.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const nextRefreshToken = jwt.sign(
      { userId: userRec._id, email: userRec.email, role: userRec.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Rotate key: filter old, insert new
    userRec.refreshTokens = activeTokens.filter((t: string) => t !== token);
    userRec.refreshTokens.push(nextRefreshToken);
    await userRec.save();

    res.json({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await dbStore.users.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'No user registered with this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await dbStore.users.update(user._id, { otp, otpExpiry });
    await emailService.sendPasswordResetEmail(email, otp);

    res.json({
      message: 'Password reset OTP has been sent.',
      otp // Returned for testing
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields (email, otp, newPassword) are required.' });
    }

    const user = await dbStore.users.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid verification OTP.' });
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await dbStore.users.update(user._id, {
      passwordHash,
      otp: null,
      otpExpiry: null,
      refreshTokens: [] // Revoke all sessions on password change
    });

    res.json({ message: 'Password reset successful. All active sessions revoked.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. LOGOUT (Invalidate session token)
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token is required.' });

    try {
      const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
      const userRec = await User.findById(decoded.userId);
      if (userRec) {
        userRec.refreshTokens = (userRec.refreshTokens || []).filter((t: string) => t !== token);
        await userRec.save();
      }
    } catch (e) {
      // Continue even if token already expired/invalid on logout
    }

    res.json({ message: 'Logged out successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
