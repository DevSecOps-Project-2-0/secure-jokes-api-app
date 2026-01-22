const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcrypt");

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});

app.use((req, res, next) => {
  res.locals.error = req.session.error || null;
  delete req.session.error; 
  next();
});


// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM categories ORDER BY name"
    );
    res.locals.categories = result.rows;
    next();
  } catch (err) {
    next(err);
  }
});


(async () => {
  const username = process.env.ADMIN_USERNAME;;
  const password = process.env.ADMIN_PASSWORD;;

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (username, password, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (username) DO NOTHING`,
    [username, hash]
  );

  console.log("Admin user created");
})();


function isAdmin(req, res, next) {
  if (req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).send("Forbidden: Admins only");
}

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.userRole = req.session.userRole || 'user';
  res.locals.username = req.session.username || null; 
   if (req.session.username) {
    res.locals.avatar = req.session.username
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  } else {
    res.locals.avatar = null;
  }
  next();
});



// ROUTES

// Home - show all jokes
app.get("/", async (req, res) => {
  try {
    const jokesResult = await pool.query(`
      SELECT jokes.*, categories.name AS category,
        COALESCE(likes.count, 0) AS likes,
        COALESCE(dislikes.count, 0) AS dislikes
      FROM jokes
      LEFT JOIN categories ON jokes.category_id = categories.id
      LEFT JOIN (
        SELECT joke_id, COUNT(*) AS count
        FROM joke_votes
        WHERE vote_type='like'
        GROUP BY joke_id
      ) AS likes ON likes.joke_id = jokes.id
      LEFT JOIN (
        SELECT joke_id, COUNT(*) AS count
        FROM joke_votes
        WHERE vote_type='dislike'
        GROUP BY joke_id
      ) AS dislikes ON dislikes.joke_id = jokes.id
      ORDER BY jokes.id DESC
    `);

    const categoriesResult = await pool.query("SELECT * FROM categories ORDER BY name");

    res.render("index", {
      jokes: jokesResult.rows,
      userId: req.session.userId || null,
      userRole: req.session.userRole || 'user',
      categories: categoriesResult.rows,
      activeCategory: null
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading jokes");
  }
});


app.get("/category/:name", async (req, res) => {
  const { name } = req.params;

  const result = await pool.query(
    `
    SELECT jokes.*, categories.name AS category
    FROM jokes
    JOIN categories ON jokes.category_id = categories.id
    WHERE LOWER(categories.name) = LOWER($1)
    ORDER BY jokes.id DESC
    `,
    [name]
  );

  res.locals.activeCategory = name;
  res.render("index", {
    jokes: result.rows });
});


// Random joke
app.get("/random", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT COALESCE(
      (SELECT joke FROM jokes ORDER BY RANDOM() LIMIT 1),
      '😄 No jokes available right now!'
    ) AS joke
  `);

    const jokes = result.rows;
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    res.render("random", { joke });
  } catch (err) {
    console.error(err);
    res.send("Error fetching random joke");
  }
});

app.get("/api/jokes/random", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1"
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random joke" });
  }
});



app.post("/jokes/:id/like", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO joke_votes (user_id, joke_id, vote)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, joke_id) DO NOTHING`,
      [req.session.userId, req.params.id]
    );

    await pool.query(
      "UPDATE jokes SET likes = likes + 1 WHERE id = $1",
      [req.params.id]
    );

    res.redirect("back");
  } catch (err) {
    res.redirect("back");
  }
});

app.post("/like/:id", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });

  const jokeId = req.params.id;
  const userId = req.session.userId;

  try {
    // Check existing vote
    const existing = await pool.query(
      "SELECT vote_type FROM joke_votes WHERE joke_id=$1 AND user_id=$2",
      [jokeId, userId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].vote_type === 'like') {
        // Undo like
        await pool.query("DELETE FROM joke_votes WHERE joke_id=$1 AND user_id=$2", [jokeId, userId]);
      } else {
        // Switch dislike → like
        await pool.query("UPDATE joke_votes SET vote_type='like' WHERE joke_id=$1 AND user_id=$2", [jokeId, userId]);
      }
    } else {
      // Add new like
      await pool.query(
        "INSERT INTO joke_votes (joke_id, user_id, vote_type) VALUES ($1, $2, 'like')",
        [jokeId, userId]
      );
    }

    // Return updated counts
    const likes = await pool.query("SELECT COUNT(*) FROM joke_votes WHERE joke_id=$1 AND vote_type='like'", [jokeId]);
    const dislikes = await pool.query("SELECT COUNT(*) FROM joke_votes WHERE joke_id=$1 AND vote_type='dislike'", [jokeId]);

    res.json({ likes: likes.rows[0].count, dislikes: dislikes.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





app.post("/jokes/:id/dislike", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO joke_votes (user_id, joke_id, vote)
       VALUES ($1, $2, -1)
       ON CONFLICT (user_id, joke_id) DO NOTHING`,
      [req.session.userId, req.params.id]
    );

    await pool.query(
      "UPDATE jokes SET dislikes = dislikes + 1 WHERE id = $1",
      [req.params.id]
    );

    res.redirect("back");
  } catch (err) {
    res.redirect("back");
  }
});



app.post("/dislike/:id", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });

  const jokeId = req.params.id;
  const userId = req.session.userId;

  try {
    const existing = await pool.query(
      "SELECT vote_type FROM joke_votes WHERE joke_id=$1 AND user_id=$2",
      [jokeId, userId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].vote_type === 'dislike') {
        // Undo dislike
        await pool.query("DELETE FROM joke_votes WHERE joke_id=$1 AND user_id=$2", [jokeId, userId]);
      } else {
        // Switch like → dislike
        await pool.query("UPDATE joke_votes SET vote_type='dislike' WHERE joke_id=$1 AND user_id=$2", [jokeId, userId]);
      }
    } else {
      // Add new dislike
      await pool.query(
        "INSERT INTO joke_votes (joke_id, user_id, vote_type) VALUES ($1, $2, 'dislike')",
        [jokeId, userId]
      );
    }

    const likes = await pool.query("SELECT COUNT(*) FROM joke_votes WHERE joke_id=$1 AND vote_type='like'", [jokeId]);
    const dislikes = await pool.query("SELECT COUNT(*) FROM joke_votes WHERE joke_id=$1 AND vote_type='dislike'", [jokeId]);

    res.json({ likes: likes.rows[0].count, dislikes: dislikes.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




app.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;

    let baseQuery = `
      SELECT jokes.*, categories.name AS category
      FROM jokes
      LEFT JOIN categories ON jokes.category_id = categories.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Keyword filter
    if (q && q.trim() !== "") {
      baseQuery += ` AND jokes.joke ILIKE $${idx}`;
      params.push(`%${q}%`);
      idx++;
    }

    // Category filter
    if (category && category.trim() !== "") {
      baseQuery += ` AND categories.name = $${idx}`;
      params.push(category);
      idx++;
    }

    baseQuery += " ORDER BY jokes.id DESC";

    const result = await pool.query(baseQuery, params);

    res.render("index", {
      jokes: result.rows,
      activeCategory: category || null,
      searchQuery: q || "",
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});


app.get("/add", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.render("add", { categories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load categories");
  }
});


// Handle form submission
app.post("/add", async (req, res) => {
  const { joke, category_id } = req.body;

  if (!joke || !category_id) {
    return res.render("add", {
      error: "Please enter a joke and select a category",
      categories: await getCategories()
    });
  }

  try {
    await pool.query(
      "INSERT INTO jokes (joke, category_id) VALUES ($1, $2)",
      [joke, category_id]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("add", {
      error: "Database error",
      categories: await getCategories()
    });
  }
});



// API endpoint
app.get("/api/jokes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jokes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching jokes" });
  }
});

// Delete joke by ID
app.post("/delete/:id", isAdmin, async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const userId = req.session.userId;

  const jokeId = req.params.id;
  await pool.query("DELETE FROM jokes WHERE id = $1", [jokeId]);
  

  try {
    await pool.query("DELETE FROM jokes WHERE id=$1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// app.post("/delete/:id", async (req, res) => {
//   if (process.env.NODE_ENV !== "test") {
//     // keep your auth / csrf checks here
//     // if (!authorized) return res.sendStatus(403);
//   }

//   await pool.query(
//     "DELETE FROM jokes WHERE id = $1",
//     [req.params.id]
//   );

//   res.redirect("/");
// });



// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Register page
app.get("/register", (req, res) => {
  res.render("register");
});


app.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2)",
    [req.body.username, hash]
  );

  res.redirect("/login");
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.render("login", { error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("login", { error: "Invalid username or password" });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role; 
    req.session.username = user.username; 

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error logging in");
  }
});


app.get("/admin", isAdmin, async (req, res) => {
  try {
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const jokesCount = await pool.query("SELECT COUNT(*) FROM jokes");

    const jokesResult = await pool.query(`
      SELECT jokes.id, jokes.joke, categories.name AS category
      FROM jokes
      LEFT JOIN categories ON jokes.category_id = categories.id
      ORDER BY jokes.id DESC
    `);

    // Fetch votes for all jokes
    const jokeIds = jokesResult.rows.map(j => j.id);
    let votes = [];
    if (jokeIds.length > 0) {
      const votesResult = await pool.query(`
        SELECT joke_votes.joke_id, users.username, joke_votes.vote_type
        FROM joke_votes
        JOIN users ON users.id = joke_votes.user_id
        WHERE joke_votes.joke_id = ANY($1::int[])
        ORDER BY joke_votes.joke_id
      `, [jokeIds]);

      votes = votesResult.rows;
    }

    // Map votes by joke ID
    const votesByJoke = {};
    votes.forEach(v => {
      if (!votesByJoke[v.joke_id]) votesByJoke[v.joke_id] = { likes: [], dislikes: [] };
      if (v.vote_type === 'like') votesByJoke[v.joke_id].likes.push(v.username);
      if (v.vote_type === 'dislike') votesByJoke[v.joke_id].dislikes.push(v.username);
    });

    res.render("admin", {
      usersCount: usersCount.rows[0].count,
      jokesCount: jokesCount.rows[0].count,
      jokes: jokesResult.rows,
      votesByJoke,
      userId: req.session.userId,
      userRole: req.session.userRole
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading admin dashboard");
  }
});



function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.redirect("/login");
  next();
}

app.get("/add", requireAuth, (req, res) => {
  res.render("add");
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect("/");
    }
    res.redirect("/login");
  });
});


if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on PORT ${PORT}`);
  });
}

module.exports = app;
