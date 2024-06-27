const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");
const mime = require("mime-types");

const app = express();

// PostgreSQL 연결 설정
const pool = new Pool({
  user: "scott", // 데이터베이스 사용자 이름
  host: "postgres", // 데이터베이스 호스트명
  database: "camp", // 데이터베이스 이름
  password: "tiger", // 데이터베이스 비밀번호
  port: 5432, // 데이터베이스 포트
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
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
})();

// 세션 설정
app.use(
  session({
    secret: "98uf134iouas9873ewrasdy", // 세션 암호화에 사용될 비밀 키
    resave: false, // 세션이 수정되지 않더라도 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션도 저장할지 여부
    cookie: {
      secure: false, // true로 설정 시 HTTPS에서만 쿠키 전송
      maxAge: 3600000, // 쿠키의 수명 (밀리초 단위)
      sameSite: "lax", // CSRF 보호 설정
    },
  })
);

// CORS 설정
app.use(
  cors({
    origin: true, // 모든 출처에 대해 허용
    credentials: true, // 자격 증명(쿠키, HTTP 인증) 허용
  })
);

// 요청 본문을 JSON으로 파싱
app.use(bodyParser.json());

// MIME 타입 설정
app.use((req, res, next) => {
  const type = mime.lookup(req.path);
  if (type) {
    res.setHeader("Content-Type", type);
  }
  next();
});

// 모든 요청에 대해 세션 정보를 출력하는 미들웨어
app.use((req, res, next) => {
  console.log("Session information:", req.session);
  next();
});

// 로그인 여부 확인 및 리디렉션 미들웨어
app.use((req, res, next) => {
  const publicPaths = ["/login", "/signup", "/login.html", "/favicon.ico"];
  if (
    !req.session.user &&
    !publicPaths.includes(req.path) &&
    !req.path.startsWith("/static") &&
    !req.path.startsWith("/checkLogin")
  ) {
    return res.redirect("/login.html"); // 로그인 안 된 경우 로그인 페이지로 리디렉션
  }
  next();
});

// 기타 정적 파일 서빙 설정
app.use("/static", express.static(path.join(__dirname, "static")));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "dist")));

// 비밀번호 해싱 함수 (bcrypt 사용)
async function hashPassword(password) {
  const saltRounds = 10; // 솔트 라운드 수 (보안 강도)
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
      console.log("User found:", user);
      const match = await comparePassword(password, user.password); // 비밀번호 검증
      if (match) {
        req.session.user = username; // 세션에 사용자 정보 저장
        console.log("Login successful for user:", username);
        console.log("Session after login:", req.session); // 세션 정보 출력
        res.json({ success: true });
      } else {
        console.log("Password mismatch for user:", username);
        res.status(401).json({ success: false, message: "Password mismatch" });
      }
    } else {
      console.log("No user found with username:", username);
      res.status(401).json({ success: false, message: "No user found" });
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

// 모든 경로에 대해 index.html을 서빙하도록 설정
app.get("*", (req, res) => {
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
