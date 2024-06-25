const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "dist")));

// PostgreSQL 연결 설정
const pool = new Pool({
  user: "scott",
  host: "postgres",
  database: "camp",
  password: "tiger",
  port: 5432,
});

// PostgreSQL 연결 테스트
(async () => {
  try {
    console.log("Attempting to connect to PostgreSQL...");
    const client = await pool.connect();
    console.log("PostgreSQL connection test successful");
    client.release();
  } catch (err) {
    console.error("PostgreSQL connection test failed", err);
    process.exit(1);
  }
})();

// CORS 설정
app.use(
  cors({
    origin: true, // 모든 도메인 허용
    credentials: true, // 세션 쿠키를 포함하는 것을 허용
  })
);

// 요청 본문을 JSON으로 파싱
app.use(bodyParser.json());

// 세션 설정
app.use(
  session({
    secret: "98uf134iouas9873ewrasdy", // 비밀 키는 환경 변수로 관리하는 것이 좋습니다
    resave: false,
    saveUninitialized: false, // 세션이 필요할 때만 생성
    cookie: {
      secure: false, // HTTPS를 사용하지 않는 로컬 개발 환경에서는 false로 설정
      maxAge: 3600000, // 1시간 동안 세션 유지
      sameSite: "lax", // 세션 쿠키를 동일 사이트 요청에만 전송
    },
  })
);

// 모든 요청에 대해 세션 정보를 출력하는 미들웨어
app.use((req, res, next) => {
  console.log("Session information:", req.session);
  next();
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// 비밀번호 해싱 함수 (bcrypt 사용)
async function hashPassword(password) {
  const saltRounds = 10; // 해싱 횟수
  return await bcrypt.hash(password, saltRounds);
}

// 비밀번호 검증 함수 (bcrypt 사용)
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 로그인 처리 엔드포인트
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("Received login request:", { username });

  try {
    console.log("Attempting to query the database...");
    const result = await pool.query(
      "SELECT * FROM profile WHERE username = $1",
      [username]
    );
    console.log("Query executed successfully:", result);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await comparePassword(password, user.password); // 비밀번호 검증
      if (match) {
        req.session.user = username; // 세션에 사용자 정보 저장
        console.log("Login successful for user:", username);
        console.log("Session after login:", req.session); // 세션 정보 출력
        res.json({ success: true });
      } else {
        console.log("Login failed for user:", username);
        res.status(401).json({ success: false });
      }
    } else {
      console.log("Login failed for user:", username);
      res.status(401).json({ success: false });
    }
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 로그인 상태 확인 엔드포인트
app.get("/checkLogin", (req, res) => {
  console.log("Session on checkLogin:", req.session);
  if (req.session.user) {
    console.log("User is logged in:", req.session.user);
    res.json({ loggedIn: true });
  } else {
    console.log("No user is logged in");
    res.json({ loggedIn: false });
  }
});

// 회원가입 처리 엔드포인트
app.post("/signup", async (req, res) => {
  const { username, password, name, phone } = req.body;
  const hashedPassword = await hashPassword(password); // 비밀번호 해싱

  try {
    await pool.query(
      "INSERT INTO profile (username, password, name, phone) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, name, phone]
    );
    console.log("User inserted successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 로그인 여부 확인 및 리디렉션 미들웨어
app.use((req, res, next) => {
  if (
    !req.session.user &&
    req.path !== "/login.html" &&
    req.path !== "/signup" &&
    !req.path.startsWith("/static") &&
    !req.path.startsWith("/checkLogin")
  ) {
    return res.redirect("/login.html");
  }
  next();
});

// 모든 경로에 대해 index.html을 서빙하도록 설정
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 서버 시작
const port = 3000; // 서버 포트 설정
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
