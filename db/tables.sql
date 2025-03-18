CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'developer', 'viewer')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE websites (
    website_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    tracking_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE visitors (
    visitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES websites(website_id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    browser TEXT NOT NULL,
    operating_system TEXT NOT NULL,
    device TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pageviews (
    pageview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES websites(website_id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    duration INTEGER CHECK (duration >= 0),
    referrer TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);