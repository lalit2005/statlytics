import { Hono } from "hono";
import postgres from "postgres";
import { sign, verify } from "hono/jwt";
import { genSaltSync, hashSync, compareSync } from "bcrypt-edge";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { JWTPayload } from "hono/utils/jwt/types";

const app = new Hono<{
  Variables: {
    user: User;
  };
}>();
const sql = postgres(
  "postgresql://postgres.rziipqpadnlwbghmukkv:statlytics-database@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
);

const JWT_SECRET = "your_jwt_secret";

interface User {
  email: string;
  role: string;
  user_id: string;
}

const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, "token");
  console.log({ token });
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  try {
    const decoded = await verify(token, JWT_SECRET);
    c.set("user", decoded);
    console.log(decoded);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid token" }, 401);
  }
};

const roleMiddleware =
  (allowedRoles: string[]) => async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };

app.post("/api/v1/signup", async (c) => {
  const { email, password, role } = await c.req.json();

  if (!["developer", "admin", "viewer"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  const salt = genSaltSync(10);
  const passwordHash = hashSync(password, salt);

  const result = await sql`INSERT INTO users (email, password_hash, role) 
    VALUES (${email}, ${passwordHash}, ${role})
  `;

  if (!result) {
    return c.json({ error: "Failed to create user" }, 500);
  }

  console.log(result);

  return c.json({ message: "User created" });
});

app.post("/api/v1/login", async (c) => {
  const { email, password } = await c.req.json();
  const users = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  const user = users[0];
  if (!user || !compareSync(password, user.password_hash)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await sign(
    { email: user.email, role: user.role, user_id: user.user_id },
    JWT_SECRET,
    "HS256"
  );

  // Set HttpOnly Secure Cookie
  c.header("Set-Cookie", `token=${token}; HttpOnly; SameSite=Strict; Path=/`);

  return c.json({ message: "Logged in" });
});

app.post("/api/v1/logout", async (c) => {
  c.header(
    "Set-Cookie",
    `token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
  );
  return c.json({ message: "Logged out" });
});

app.get(
  "/api/v1/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const users = await sql`SELECT email, role FROM users`;
    return c.json(users);
  }
);

app.post(
  "/api/v1/add-new-user",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const { email, password, role } = await c.req.json();
    const salt = genSaltSync(10);
    const passwordHash = hashSync(password, salt);
    const result = await sql`INSERT INTO users (email, password_hash, role)
    VALUES (${email}, ${passwordHash}, ${role})
  `;
    if (!result) {
      return c.json({ error: "Failed to create user" }, 500);
    }
    return c.json({ message: "User created" });
  }
);

app.delete(
  "/api/v1/delete-user",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const { email } = await c.req.json();
    const result = await sql`DELETE FROM users WHERE email = ${email}`;
    if (!result) {
      return c.json({ error: "Failed to delete user" }, 500);
    }
    return c.json({ message: "User deleted" });
  }
);

app.put(
  "/api/v1/update-user",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const { email, role } = await c.req.json();
    const result =
      await sql`UPDATE users SET role = ${role} WHERE email = ${email}`;
    if (!result) {
      return c.json({ error: "Failed to update user" }, 500);
    }
    return c.json({ message: "User updated" });
  }
);

app.post(
  "/api/v1/add-new-site",
  authMiddleware,
  roleMiddleware(["admin", "developer"]),
  async (c) => {
    const { name, url } = await c.req.json();
    const result = sql`INSERT INTO websites (user_id, url, tracking_id) 
    VALUES (${c.get("user").user_id}, ${url}, ${name})
    `;
    if (!result) {
      return c.json({ error: "Failed to create site" }, 500);
    }
    return c.json({ message: "Site created" });
  }
);

app.delete(
  "/api/v1/delete-site",
  authMiddleware,
  roleMiddleware(["admin", "developer"]),
  async (c) => {
    const { website_id } = await c.req.json();
    const result =
      await sql`DELETE FROM websites WHERE website_id = ${website_id}`;
    if (!result) {
      return c.json({ error: "Failed to delete site" }, 500);
    }
    return c.json({ message: "Site deleted" });
  }
);

// --------------------
// Requests from website visitors i.e data collection
// --------------------

app.post("/api/v1/collect-data", async (c) => {
  const {
    url,
    visitor_id,
    path,
    browser,
    operating_system,
    device,
    location,
    referrer,
  } = await c.req.json();
  const websites = await sql`SELECT * FROM websites WHERE url = ${url}`;
  const website = websites[0];
  if (!website) {
    return c.json({ error: "Website not found" }, 404);
  }
  const result =
    await sql`INSERT INTO visitors (website_id, visitor_id, browser, operating_system, device, location)
    VALUES (${website.website_id}, ${visitor_id}, ${browser}, ${operating_system}, ${device}, ${location})
  `;
  if (!result) {
    return c.json({ error: "Failed to create visitor" }, 500);
  }
  const pageviewResult =
    await sql`INSERT INTO pageviews (website_id, visitor_id, path, referrer)
    VALUES (${website.website_id}, ${visitor_id}, ${path}, ${referrer})
  `;
  if (!pageviewResult) {
    return c.json({ error: "Failed to create pageview" }, 500);
  }
  return c.json({ message: "Data collected" });
});

app.get("/dashboard", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ message: `Hello, ${user.role}!` });
});

export default app;

// tables
// CREATE TABLE users (
//     user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     email TEXT UNIQUE NOT NULL,
//     password_hash TEXT NOT NULL,
//     jwt TEXT,  -- Stores active JWT token (optional)
//     role TEXT CHECK (role IN ('admin', 'developer', 'viewer')) NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE websites (
//     website_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
//     url TEXT UNIQUE NOT NULL,
//     tracking_id TEXT UNIQUE NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE visitors (
//     visitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     website_id UUID REFERENCES websites(website_id) ON DELETE CASCADE,
//     ip_hash TEXT NOT NULL,  -- Store a hash of the IP for privacy
//     browser TEXT NOT NULL,
//     operating_system TEXT NOT NULL,
//     device TEXT NOT NULL,
//     location TEXT,  -- Optional: Can be derived from IP geolocation
//     created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE pageviews (
//     pageview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     website_id UUID REFERENCES websites(website_id) ON DELETE CASCADE,
//     visitor_id UUID REFERENCES visitors(visitor_id) ON DELETE CASCADE,
//     path TEXT NOT NULL,
//     duration INTEGER CHECK (duration >= 0),  -- Duration in seconds
//     referrer TEXT,  -- The previous URL
//     timestamp TIMESTAMP DEFAULT NOW()
// );
