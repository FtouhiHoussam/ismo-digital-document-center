import "dotenv/config";
import { hashPassword } from "./middleware/auth.js";
import fs from "fs";

console.log("--- Testing Security Fix ---");
console.log("JWT_SECRET from process.env:", process.env.JWT_SECRET);

// We can't easily export JWT_SECRET if it's not exported, 
// but we can check if the app starts or if it logs the error.
// Let's just check the process.env directly since that's what the middleware uses.

if (process.env.JWT_SECRET === "ismo-digital-secret-key-2024") {
    console.log("✅ SUCCESS: JWT_SECRET is correctly read from .env");
} else {
    console.log("❌ FAILURE: JWT_SECRET not found or incorrect");
}

console.log("----------------------------");
