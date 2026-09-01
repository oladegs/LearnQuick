// Exposes email/password authentication alongside optional Google sign-in.
import express from "express";
import { body } from "express-validator";
import { rateLimit } from "express-rate-limit";

import {
  changePassword,
  forgotPassword,
  getProfile,
  getSession,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import {
  getProviders,
  handleGoogleCallback,
  startGoogleOAuth,
} from "../controllers/oauthController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      error: "Too many authentication attempts. Please try again later.",
      statusCode: 429,
    }),
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      error: "Too many password-reset attempts. Please try again later.",
      statusCode: 429,
    }),
});

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("profileImage")
    .optional({ nullable: true })
    .isString()
    .withMessage("Profile image must be a string"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

router.get("/providers", getProviders);
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post(
  "/forgot-password",
  resetLimiter,
  forgotPasswordValidation,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetLimiter,
  resetPasswordValidation,
  resetPassword,
);
router.post("/logout", logout);
router.get("/google/callback", authLimiter, handleGoogleCallback);
router.get("/google", authLimiter, startGoogleOAuth);

router.get("/session", protect, getSession);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidation, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;
