// Creates and lists feedback for the authenticated LearnQuick user.
import { validationResult } from "express-validator";
import Feedback from "../models/Feedback.js";

const cleanText = (value, preserveLines = false) => {
  const withoutUnsafeCharacters = String(value ?? "")
    .replace(/[<>\u0000]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();

  return preserveLines
    ? withoutUnsafeCharacters.replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n")
    : withoutUnsafeCharacters.replace(/\s+/g, " ");
};

export const submitFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        statusCode: 400,
      });
    }

    const message = cleanText(req.body.message, true);
    const subject = cleanText(req.body.subject);
    const duplicate = await Feedback.findOne({
      userId: req.user._id,
      message,
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: "This feedback was already submitted. Thank you!",
        statusCode: 409,
      });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      name: req.user.username,
      email: req.user.email,
      category: req.body.category,
      subject,
      message,
      rating: req.body.rating,
    });

    return res.status(201).json({
      success: true,
      data: feedback,
      message: "Thanks — your feedback has been submitted.",
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("category subject message rating status createdAt updatedAt");

    return res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    return next(error);
  }
};
