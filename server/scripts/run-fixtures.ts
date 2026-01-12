import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const DEFAULTS = {
  host: "mariadb",
  port: 3306,
  user: "user",
  password: "password",
  database: "app",
};

async function main() {
  const filePath = path.resolve(__dirname, "../fixtures/000-initial-data.sql");
  const sql = await fs.readFile(filePath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? DEFAULTS.host,
    port: Number(process.env.DB_PORT ?? DEFAULTS.port),
    user: process.env.DB_USERNAME ?? DEFAULTS.user,
    password: process.env.DB_PASSWORD ?? DEFAULTS.password,
    database: process.env.DB_DATABASE ?? DEFAULTS.database,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log("Fixtures applied successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to apply fixtures: ${message}`);
  process.exit(1);
});
