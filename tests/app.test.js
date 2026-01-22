// __tests__/app.test.js
const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/index"); // path to your app file
const { Pool } = require("pg");

// Mock PostgreSQL
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("Express app routes", () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET / should render index page with jokes", async () => {
  // Mock pool.query depending on SQL
  pool.query.mockImplementation((sql) => {
    if (sql.includes("SELECT jokes")) {
      // This matches your jokes query
      return Promise.resolve({
        rows: [
          {
            id: 1,
            joke: "Test joke",
            category: "funny",
            likes: 0,
            dislikes: 0,
          },
        ],
      });
    } else if (sql.includes("SELECT * FROM categories")) {
      // This matches categories query
      return Promise.resolve({
        rows: [{ id: 1, name: "funny" }],
      });
    }
    return Promise.resolve({ rows: [] });
  });

  const res = await request(app).get("/");

  expect(res.statusCode).toBe(200);
  expect(res.text).toContain("Test joke"); // now this will pass
});



  test("GET /api/jokes/random should return a random joke", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, joke: "Random joke" }] });

    const res = await request(app).get("/api/jokes/random");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, joke: "Random joke" });
  });

  test("POST /register should create a new user", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post("/register")
      .send({ username: "testuser", password: "password123" });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      expect.any(Array)
    );
  });

  test("POST /login should login a valid user", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    pool.query.mockResolvedValue({
      rows: [{ id: 1, username: "testuser", password: hashedPassword, role: "user" }],
    });

    const res = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "password123" });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
  });

  test("GET /login should render login page", async () => {
    const res = await request(app).get("/login");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Login");
  });

  test("GET /admin should return 403 for non-admin users", async () => {
    const agent = request.agent(app);

    // Mock session
    agent.jar.setCookie("connect.sid=s%3Atestcookie");

    const res = await agent.get("/admin");
    expect(res.statusCode).toBe(403);
  });

  test("POST /logout should destroy session and redirect to login", async () => {
    const agent = request.agent(app);

    // Mock session
    agent.jar.setCookie("connect.sid=s%3Atestcookie");

    const res = await agent.post("/logout");
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
  });
});
