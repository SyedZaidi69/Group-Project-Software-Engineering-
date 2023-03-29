const express = require('express');
const app = express();
const mysql = require('mysql2');


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
app.get('/search', (req, res) => {
    res.render('search.pug', {
        title: 'FAQ Page'
    });
});



app.get('/city', (req,res) => {
    db.execute("SELECT name, countrycode, population FROM city", (err, result, fields) => {
        console.log('/cities: ');
        res.render('city.pug', {
            title: 'Cities',
            cities: result
        });
    })
})

app.get('/country', (req,res) => {
    db.execute("SELECT code, name, capital, continent, population FROM country", (err, result, fields) => {
        console.log('/countries: ');
        res.render('country.pug', {
            title: 'Countries',
            countries: result
        });
    })
})


app.get('/country/:sortBy/:order', (req,res) => {
    let orderQuery = '';
    if (req.params.order === 'asc') {
      orderQuery = 'ASC';
    } else if (req.params.order === 'desc') {
      orderQuery = 'DESC';
    }
    db.execute(`SELECT code, name, capital, continent, population FROM country ORDER BY ${req.params.sortBy} ${orderQuery}`, (err, result, fields) => {
      console.log('/countries: ');
      res.render('country.pug', {
        title: 'Countries',
        countries: result
      });
    })
  })

app.get('/language', (req,res) => {
    db.execute("SELECT countrycode, language, isofficial, percentage FROM countrylanguage", (err, result, fields) => {
        console.log('/languages: ');
        res.render('language.pug', {
            title: 'Languages',
            languages: result
        });
    })
})


//module.exports={app, db}
app.listen(8080, () => {
    console.log('Server is running on 8080');

})