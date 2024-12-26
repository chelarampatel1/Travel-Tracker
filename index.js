import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "Chelaram#123",
  port: 5432,
  host: "localhost",
  database: "world",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const checkVisited = async function () {
  const result = await db.query("select country_code from visited_countries");
  let countries = [];
  result.rows.forEach((ele) => countries.push(ele.country_code));
  return countries;
};

app.get("/", async (req, res) => {
  //Write your code here.
  const result = await db.query("select country_code from visited_countries");
  let countries = [];
  result.rows.forEach((ele) => countries.push(ele.country_code));
  // console.log(countries);
  res.render("index.ejs", { countries: countries, total: countries.length });
  // db.end();
});

app.post("/add", async (req, res) => {
  const country = req.body.country;
  const result1 = await db.query(
    `select country_code from countries where country_name = '${country}'`
  );
  console.log(result1.rows);
  if (result1.rows.length !== 0)
    await db.query(`insert into visited_countries (country_code) values ($1)`, [
      `${result1.rows[0].country_code}`,
    ]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
