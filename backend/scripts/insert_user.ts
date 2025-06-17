// @ts-nocheck

import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();
import bcrypt from "bcryptjs";
import { User } from "../src/lib/entities";
import { DB } from "../src/lib/db";

export async function CreateUser(
  username: string,
  email: string,
  password: string,
) {
  await DB.initialize();

  const existing = await DB.getRepository(User).findOneBy({ email });
  if (existing) {
    console.error("❌ Email already registered");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = DB.getRepository(User).create({
    username,
    email,
    password: hashedPassword,
  });

  await DB.getRepository(User).save(user);

  console.log("✅ User registered");
  process.exit(0);
}

// const username = "admin";
// const email = "admin@admin.com";
// const password = "admin";
// CreateUser(username, email, password).catch((err) => {
//     console.error(err);
//     process.exit(1);
// });
//SEED=true pnpm tsx scripts/insert_user.ts
