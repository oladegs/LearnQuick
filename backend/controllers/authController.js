// Handles email/password accounts, profile management, sessions, and resets.
import crypto from "node:crypto";
import { validationResult } from "express-validator";

import User from "../models/User.js";
import {
  clearAuthCookie,
  generateAuthToken,
  setAuthCookie,
  toPublicUser,
} from "../utils/authTokens.js";
import {
  isEmailConfigured,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    const { username, email, password } = req.body;
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error:
          existing.email === email
            ? "Email already registered"
            : "Username already taken",
        statusCode: 400,
      });
    }

    const user = await User.create({ username, email, password });
    const token = generateAuthToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: { user: toPublicUser(user), token },
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user?.password || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: user && !user.password
          ? "This account currently uses Google. Reset your password to add email sign-in."
          : "Invalid credentials",
        statusCode: 401,
      });
    }

    const token = generateAuthToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      data: { user: toPublicUser(user), token },
      message: "Login successful",
    });
  } catch (error) {
    return next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }
    return res.status(200).json({ success: true, data: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    const { username, email, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }
    if (username === undefined && email === undefined && profileImage === undefined) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one field to update",
        statusCode: 400,
      });
    }

    if (username && username !== user.username) {
      if (await User.exists({ username, _id: { $ne: user._id } })) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
          statusCode: 400,
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      if (await User.exists({ email, _id: { $ne: user._id } })) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
          statusCode: 400,
        });
      }
      user.email = email;
      user.emailVerified = false;
    }

    if (profileImage !== undefined) user.profileImage = profileImage;
    await user.save();

    return res.status(200).json({
      success: true,
      data: toPublicUser(user),
      message: "Profile updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    const hadPassword = Boolean(user.password);
    if (hadPassword) {
      if (!currentPassword || !(await user.matchPassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          error: "Current password is incorrect",
          statusCode: 401,
        });
      }
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      data: { user: toPublicUser(user) },
      message: hadPassword
        ? "Password updated successfully"
        : "Email/password sign-in added successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getSession = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: toPublicUser(req.user) },
  });
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    if (!isEmailConfigured()) {
      const error = new Error(
        "Password reset email is not configured. Please contact support.",
      );
      error.statusCode = 503;
      throw error;
    }

    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    const message =
      "If an account exists for that email, a password-reset link has been sent.";
    if (!user) return res.status(200).json({ success: true, message });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendUrl = (
      process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173"
    )
      .trim()
      .replace(/\/+$/, "");

    try {
      await sendPasswordResetEmail({
        user,
        resetUrl: `${frontendUrl}/reset-password/${resetToken}`,
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw error;
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "This password-reset link is invalid or has expired.",
        statusCode: 400,
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateAuthToken(user._id);
    setAuthCookie(res, token);
    return res.status(200).json({
      success: true,
      data: { user: toPublicUser(user), token },
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};
