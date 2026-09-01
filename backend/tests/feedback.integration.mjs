// Verifies authenticated feedback creation, identity enforcement, validation, history, and duplicate protection.
import "dotenv/config";
import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import { generateAuthToken } from "../utils/authTokens.js";

const baseUrl = process.env.AUTH_TEST_BASE_URL || "http://localhost:8000";
const stamp = Date.now().toString();
const email = `feedback${stamp}@example.com`;
let user;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { status: response.status, body: await response.json() };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

await mongoose.connect(process.env.MONGODB_URI);

try {
  user = await User.create({ username: `feedback${stamp.slice(-8)}`, email, password: "TestPass123!" });
  const token = generateAuthToken(user._id);
  const headers = { "content-type": "application/json", authorization: `Bearer ${token}` };
  const payload = {
    category: "UI/UX",
    subject: "Navigation polish",
    message: "The refreshed navigation feels much clearer to use.",
    rating: 5,
    userId: new mongoose.Types.ObjectId(),
    name: "Spoofed Name",
    email: "spoofed@example.com",
  };

  assert((await request("/api/feedback/me")).status === 401, "Feedback history is not protected.");

  const created = await request("/api/feedback", { method: "POST", headers, body: JSON.stringify(payload) });
  assert(created.status === 201, "Valid feedback was not created.");
  assert(created.body.data.userId === user._id.toString(), "The backend trusted a browser-supplied userId.");
  assert(created.body.data.name === user.username && created.body.data.email === user.email, "The backend trusted browser-supplied identity fields.");

  const duplicate = await request("/api/feedback", { method: "POST", headers, body: JSON.stringify(payload) });
  assert(duplicate.status === 409, "Rapid duplicate feedback was not rejected.");

  const invalid = await request("/api/feedback", { method: "POST", headers, body: JSON.stringify({ category: "Unknown", rating: 7, message: "short" }) });
  assert(invalid.status === 400, "Invalid feedback was not rejected.");

  const history = await request("/api/feedback/me", { headers });
  assert(history.status === 200 && history.body.count === 1, "Feedback history did not return the user's submission.");

  console.log(JSON.stringify({ authenticatedRoutes: "pass", validation: "pass", serverOwnedIdentity: "pass", duplicateProtection: "pass", personalHistory: "pass" }, null, 2));
} finally {
  if (user) await Feedback.deleteMany({ userId: user._id });
  await User.deleteOne({ email });
  await mongoose.disconnect();
}
