import { Hono } from "hono";
import postgres, { Sql } from "postgres";
import { sign, verify } from "hono/jwt";
import { cors } from "hono/cors";
import { genSaltSync, hashSync, compareSync } from "bcrypt-edge";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { getConnInfo } from "hono/cloudflare-workers";

const app = new Hono<{
  Variables: {
    user: User;
    sql: ReturnType<typeof postgres>;
    JWT_SECRET: string;
  };
}>();

app.use(
  "*",
  cors({
    // any origin can access the API
    origin: ["http://localhost:5173", "https://statlytics.lalit.sh"],
    // allow credentials (cookies) to be sent
    credentials: true,
  })
);

app.use("/api/v1/collect-data", cors({ origin: "*" }));

app.use(async (c, next) => {
  const sql = postgres((c.env as { DB_URL: string }).DB_URL);
  c.set("sql", sql);
  const JWT_SECRET = (c.env as { JWT_SECRET: string }).JWT_SECRET;
  c.set("JWT_SECRET", JWT_SECRET);
  await next();
});

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
    const decoded = await verify(token, c.get("JWT_SECRET"));
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

  const sql = c.get("sql");
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
  const sql = c.get("sql");
  const users = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  console.log({ users });
  const user = users[0];
  if (!user || !compareSync(password, user.password_hash)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await sign(
    { email: user.email, role: user.role, user_id: user.user_id },
    c.get("JWT_SECRET"),
    "HS256"
  );

  // Set HttpOnly Secure Cookie
  c.header(
    "Set-Cookie",
    `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`
  );

  return c.json({ message: "Logged in" });
});

app.post("/api/v1/logout", async (c) => {
  c.header(
    "Set-Cookie",
    `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
  return c.json({ message: "Logged out" });
});

app.get("/api/v1/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

app.get(
  "/api/v1/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const sql = c.get("sql");
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
    const sql = c.get("sql");
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
    const sql = c.get("sql");
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
    const sql = c.get("sql");
    const result =
      await sql`UPDATE users SET role = ${role} WHERE email = ${email}`;
    if (!result) {
      return c.json({ error: "Failed to update user" }, 500);
    }

    // Regenerate token if the current user updated their own role
    const currentUser = c.get("user");
    if (currentUser.email === email) {
      const newToken = await sign(
        { email, role, user_id: currentUser.user_id },
        c.get("JWT_SECRET"),
        "HS256"
      );
      c.header(
        "Set-Cookie",
        `token=${newToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
      );
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
    const sql = c.get("sql");
    const trackingId = nanoid(6);
    const result =
      await sql`INSERT INTO websites (user_id, url, tracking_id, name) 
    VALUES (${c.get("user").user_id}, ${url}, ${trackingId}, ${name})
    `;
    if (!result) {
      return c.json({ error: "Failed to create site" }, 500);
    }
    console.log({ result });
    return c.json({ message: "Site created" });
  }
);

app.delete(
  "/api/v1/delete-site",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (c) => {
    const { website_id } = await c.req.json();
    const sql = c.get("sql");
    const result =
      await sql`DELETE FROM websites WHERE website_id = ${website_id}`;
    if (!result) {
      return c.json({ error: "Failed to delete site" }, 500);
    }
    return c.json({ message: "Site deleted" });
  }
);

// -----------------------------
// Requests to show on the dashboard
// -----------------------------

app.get("/api/v1/sites", authMiddleware, async (c) => {
  const sql = c.get("sql");
  const websites = await sql`SELECT * FROM websites`;
  return c.json(websites);
});

app.get("/api/v1/analytics-data", authMiddleware, async (c) => {
  const sql = c.get("sql");
  const website_id = c.req.query("website_id") as string;
  const pageviews =
    await sql`SELECT * FROM pageviews WHERE website_id = ${website_id}`;
  const visitors =
    await sql`SELECT * FROM visitors WHERE website_id = ${website_id}`;
  const website = await sql`
    SELECT * FROM websites WHERE website_id = ${website_id} limit 1`;
  return c.json({ pageviews, visitors, website });
});

// --------------------
// Requests from website visitors i.e data collection
// --------------------

app.post("/api/v1/collect-data", async (c) => {
  const { url, path, browser, operating_system, device, location, referrer } =
    await c.req.json();
  const sql = c.get("sql");
  const websites = await sql`SELECT * FROM websites WHERE url = ${url}`;
  const website = websites[0];
  if (!website) {
    return c.json({ error: "Website not found" }, 404);
  }

  const info = getConnInfo(c) || c.header("cf-connecting-ip");
  const ip = info.remote.address?.toString();
  console.log({ ip });
  const ipHash = hashSync(ip, 10);

  const result = await sql`
    WITH visitor_upsert AS (
      INSERT INTO visitors (visitor_id, website_id, browser, operating_system, device, location)
      VALUES (${ipHash}, ${website.website_id}, ${browser}, ${operating_system}, ${device}, ${location})
      ON CONFLICT (visitor_id) DO NOTHING
    )
    INSERT INTO pageviews (website_id, visitor_id, path, referrer)
    VALUES (${website.website_id}, ${ipHash}, ${path}, ${referrer})
    RETURNING *
  `;

  if (!result || result.length === 0) {
    return c.json({ error: "Failed to create pageview" }, 500);
  }
  return c.json({ message: "Data collected" });
});

export default app;

app.get("/api/v1/get-hash", async (c) => {
  const pass = c.req.query("pass");
  const salt = genSaltSync(10);
  const passwordHash = hashSync(pass, salt);
  return c.text(passwordHash);
});

//     role TEXT CHECK (role IN ('admin', 'developer', 'viewer')) NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE websites (
//     website_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
//     name TEXT NOT NULL,
//     url TEXT UNIQUE NOT NULL,
//     tracking_id TEXT UNIQUE NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE visitors (
//     visitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     website_id UUID REFERENCES websites(website_id) ON DELETE CASCADE,
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
