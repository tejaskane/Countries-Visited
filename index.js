import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
  user: 'postgres',
  server: 'localhost',
  database: 'world',
  password: 'Tejas123',
  port: 5432,
});



var countries = [];
var total = 0;

db.connect();

async function visited_countries() {
  var countries_code = [];
  const result = await db.query('select country_code from visited_countries');
  console.log(result.rows);
  for (var i = 0; i < result.rows.length; i++) {
    countries_code.push(result.rows[i].country_code);
  }
  return countries_code;
}


app.get("/", async (req, res) => {
  //Write your code here.
  var countries = await visited_countries();
  total = countries.length;
  console.log(countries);
  res.render("index.ejs", { countries: countries, total: total });
});

app.post("/add", async (req, res) => {
  //Write your code here.
  const result = await db.query(`select country_code from countries where country_name ilike '%${req.body.country}%'`);
  console.log(result.rows);
  if (result.rows.length !== 0) {
    var found = await db.query(`select country_code from visited_countries where country_code ilike '%${result.rows[0].country_code}'`);
    if (found.rows.length !== 0) {
      var countries = await visited_countries();
      total = countries.length;
      res.render("index.ejs", { countries: countries, total: total, error: 'Country name already exists, Please enter different one' });
      console.log('Found :' + found.rows[0].country_code);
    } else {
      db.query('insert into visited_countries(country_code) values($1)', [result.rows[0].country_code]);
      res.redirect('/');
    }
  } else {
    var countries = await visited_countries();
    total = countries.length;
    res.render("index.ejs", { countries: countries, total: total, error: 'Country name does not exist, Try again!' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
