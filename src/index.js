const express = require('express');
const app = express();
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "verysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);


app.set('view engine', 'pug');

app.use(express.static('public'));

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    user: "user",
    password: "password",
    database: "world",
});

// Connect to database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});


app.get('/', (req, res) => {
    res.render('index.pug', {
        title: 'Home Page'
    });
});
app.get('/about', (req, res) => {
    res.render('about.pug', {
        title: 'About Page'
    });
});
app.get('/reports', (req, res) => {
    res.render('reports.pug', {
        title: 'Reports Page'
    });
});
app.get('/countriesrep', (req, res) => {
    db.execute("SELECT name, population FROM country ORDER BY Population DESC", (err, result, fields) => {
        res.render('countriesrep.pug', {
            countries: result
        });
    });
});
app.get('/revcountries', (req, res) => {
    db.execute("SELECT name, population FROM country ORDER BY Population ASC", (err, result, fields) => {
        res.render('revcountries.pug', {
            countries: result
        });
    });
});

app.get('/citiesrep', (req, res) => {
    db.execute("SELECT name, countrycode, population FROM city ORDER BY population DESC LIMIT 100", (err, result, fields) => {
        res.render('citiesrep.pug', {
            cities: result
        });
    });
});
app.get('/revcities', (req, res) => {
    db.execute("SELECT name, countrycode, population FROM city ORDER BY population ASC LIMIT 100", (err, result, fields) => {
        res.render('revcities.pug', {
            cities: result
        });
    });
});

app.get('/languagesrep', (req, res) => {
    db.execute("SELECT language, SUM(percentage) AS totalpercentage FROM countrylanguage GROUP BY language ORDER BY totalpercentage DESC", (err, result, fields) => {
        res.render('languagesrep.pug', {
            languages: result
       });
    });
});
app.get('/revlanguages', (req, res) => {
    db.execute("SELECT language, SUM(percentage) AS totalpercentage FROM countrylanguage GROUP BY language ORDER BY totalpercentage ASC", (err, result, fields) => {
        res.render('revlanguages.pug', {
            languages: result
        });
    });
});


// getting and rendering all the data from city table
app.get('/city', (req,res) => {
    db.execute("SELECT id, name, countrycode, district, population FROM city", (err, result, fields) => {
        res.render('city.pug', {
            title: 'Cities',
            cities: result
        });
    })
})
// getting and rendering all the data from country table
app.get('/country', (req,res) => {
    db.execute("SELECT code, name, continent, region, surfacearea, indepyear, population, lifeexpectancy, localname, governmentform, headofstate FROM country", (err, result, fields) => {
        res.render('country.pug', {
            title: 'Countries',
            countries: result
        });
    })
})
// getting and rendering all the data from countrylanguage table
app.get('/language', (req,res) => {
    db.execute("SELECT countrycode, language, isofficial, percentage FROM countrylanguage", (err, result, fields) => {
        res.render('language.pug', {
            title: 'Languages',
            languages: result
        });
    })
})

app.get('/citiesrep', (req,res) => {
    db.execute("SELECT name, population FROM city ORDER BY population DESC", (err, result, fields) => {
        res.render('citiesrep.pug', {
            title: 'CitiesReport',
            cities: result
        });
    })
})

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});
  
app.get("/account", async (req, res) => {
    const { auth, userId } = req.session;
  
    if (!auth) {
      return res.redirect("/login");
    }
  
    const sql = `SELECT id, email FROM user WHERE user.id = ${userId}`;
    const [results, cols] = await Promise.all([db.execute(sql)]);
    const user = results[1];
  
    res.render("account", { user });
});
  
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
      const sql = `INSERT INTO user (email, password) VALUES ('${email}', '${hashed}')`;
      const [result, _] = await Promise.all([db.execute(sql)]);
      const id = result.insertId;
      req.session.auth = true;
      req.session.userId = id;
      return res.redirect("/account");
    } catch (err) {
      console.error(err);
      return res.status(400).send(err.sqlMessage);
    }
});
  
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(401).send("Missing credentials");
    }
  
    const sql = `SELECT id, password FROM user WHERE email = '${email}'`;
    const [results, cols] = await Promise.all([db.execute(sql)]);
  
    const user = results[0];
  
    if (!user) {
      return res.status(401).send("User does not exist");
    }
  
    const { id } = user;
    const hash = user?.password;
    const match = await bcrypt.compare(password, hash);
  
    if (!match) {
      return res.status(401).send("Invalid password");
    }
  
    req.session.auth = true;
    req.session.userId = id;
  
    return res.redirect("/account");
});
  

app.listen(8080, () => {
    console.log('Server is running on 8080');

})