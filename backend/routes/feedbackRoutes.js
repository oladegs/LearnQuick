// Authenticated feedback endpoints with validation and rapid-submit protection.
import express from "express";
import { body } from "express-validator";
import { rateLimit } from "express-rate-limit";
import { getMyFeedback, submitFeedback } from "../controllers/feedbackController.js";
import protect from "../middleware/auth.js";

const router = express.Router();
const categories = ["General", "Feature request", "Bug", "UI/UX", "AI quality", "Other"];

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    error: "You've submitted several responses recently. Please try again later.",
    statusCode: 429,
  }),
});

const feedbackValidation = [
  body("subject").optional({ checkFalsy: true }).isString().trim().isLength({ max: 120 }).withMessage("Subject must be 120 characters or fewer"),
  body("category").isIn(categories).withMessage("Please choose a valid feedback category"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("message").isString().trim().isLength({ min: 10, max: 2000 }).withMessage("Message must be between 10 and 2000 characters"),
];

router.use(protect);
router.get("/me", getMyFeedback);
router.post("/", feedbackLimiter, feedbackValidation, submitFeedback);

export default router;
