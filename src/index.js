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
app.get('/citiesrep', (req, res) => {
    res.render('citiesrep.pug', {
        title: 'Reports Page'
    });
});
app.get('/languagesrep', (req, res) => {
    res.render('languagesrep.pug', {
        title: 'Reports Page'
    });
});


// getting and rendering all the data from city table
app.get('/city', (req,res) => {
    db.execute("SELECT name, countrycode, population FROM city", (err, result, fields) => {
        console.log('/cities: ');
        res.render('city.pug', {
            title: 'Cities',
            cities: result
        });
    })
})
// getting and rendering all the data from country table
app.get('/country', (req,res) => {
    db.execute("SELECT code, name, capital, continent, population FROM country", (err, result, fields) => {
        console.log('/countries: ');
        res.render('country.pug', {
            title: 'Countries',
            countries: result
        });
    })
})
// getting and rendering all the data from countrylanguage table
app.get('/language', (req,res) => {
    db.execute("SELECT countrycode, language, isofficial, percentage FROM countrylanguage", (err, result, fields) => {
        console.log('/languages: ');
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


app.listen(8080, () => {
    console.log('Server is running on 8080');

})