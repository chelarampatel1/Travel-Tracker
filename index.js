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
  const result = await db.query(
    "select country_code from visited_countries order by id asc"
  );
  let countries = [];
  result.rows.forEach((ele) => countries.push(ele.country_code));
  return countries;
};

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  const country = req.body.country;
  try {
    const result1 = await db.query(
      `select country_code from countries where lower(country_name) like '%${country.toLowerCase()}%'`
    );

    const data = result1.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        `insert into visited_countries (country_code) values ($1)`,
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country already added.Try again",
      });
    }
  } catch (err) {
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country does not exit.Try again",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
