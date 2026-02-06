-- ===============================
-- CREATE DATABASE
-- ===============================



-- ===============================
-- TABLES
-- ===============================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(10) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS jokes (
    id SERIAL PRIMARY KEY,
    joke TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS joke_votes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joke_id INT NOT NULL REFERENCES jokes(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, joke_id)
);

-- ===============================
-- DEFAULT CATEGORIES
-- ===============================

INSERT INTO categories (name)
VALUES
    ('Dad'),
    ('Tech'),
    ('Dark')
ON CONFLICT (name) DO NOTHING;

-- ===============================
-- DAD JOKES
-- ===============================

INSERT INTO jokes (joke, category_id)
VALUES
    (
        'I''m afraid for the calendar. Its days are numbered.',
        (SELECT id FROM categories WHERE name = 'Dad')
    ),
    (
        'Why did the scarecrow win an award? Because he was outstanding in his field.',
        (SELECT id FROM categories WHERE name = 'Dad')
    ),
    (
        'Why don''t eggs tell jokes? They''d crack each other up.',
        (SELECT id FROM categories WHERE name = 'Dad')
    );

-- ===============================
-- TECH JOKES
-- ===============================

INSERT INTO jokes (joke, category_id)
VALUES
    (
        'Why do programmers prefer dark mode? Because light attracts bugs.',
        (SELECT id FROM categories WHERE name = 'Tech')
    ),
    (
        'Why did the developer go broke? Because he used up all his cache.',
        (SELECT id FROM categories WHERE name = 'Tech')
    ),
    (
        'I told my SQL query a joke… now it''s in a JOIN.',
        (SELECT id FROM categories WHERE name = 'Tech')
    );

-- ===============================
-- DARK JOKES
-- ===============================

INSERT INTO jokes (joke, category_id)
VALUES
    (
        'I have a dark sense of humor… it''s just not very well lit.',
        (SELECT id FROM categories WHERE name = 'Dark')
    ),
    (
        'Why don''t graveyards ever get overcrowded? Because people are dying to get in.',
        (SELECT id FROM categories WHERE name = 'Dark')
    ),
    (
        'I started a procrastinators support group. We haven''t met yet.',
        (SELECT id FROM categories WHERE name = 'Dark')
    );
