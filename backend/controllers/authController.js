const pool = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwt");
const {
  registerSchema,
  loginSchema
} = require("../validators/authValidator");

exports.register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, role } = req.body;

  const existing = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({
      message: "Email already exists"
    });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await pool.query(
    `INSERT INTO users(name,email,password,role)
     VALUES($1,$2,$3,$4)
     RETURNING id,name,email,role`,
    [name, email, hashed, role]
  );

  const token = generateToken(user.rows[0]);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax"
  });

  res.json(user.rows[0]);
};

exports.login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (!user.rows.length) {
    return res.status(400).json({
      message: "Invalid credentials"
    });
  }

  const valid = await bcrypt.compare(
    password,
    user.rows[0].password
  );

  if (!valid) {
    return res.status(400).json({
      message: "Invalid credentials"
    });
  }

  const token = generateToken(user.rows[0]);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax"
  });

  res.json({
    id: user.rows[0].id,
    name: user.rows[0].name,
    role: user.rows[0].role
  });
};

exports.logout = async (req, res) => {
  res.clearCookie("token");

  res.json({
    message: "Logged out"
  });
};

exports.me = async (req, res) => {
  const user = await pool.query(
    "SELECT id,name,email,role FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json(user.rows[0]);
};