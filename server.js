const express = require('express');
const app = express();
const port = 3000;
var methodOverride = require('method-override')
const mysql = require('mysql');
const {
    nanoid
} = require('nanoid');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
const cookieParser = require('cookie-parser');


// start-- checking database connect or not
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_sampah"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("-> Database Connected");
});

// end-- checking database connect or not
app.use(cookieParser())

// start-- routing
app.set('view engine', 'ejs');
app.use('/public', express.static('public'))
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
    res.render('main')
});
app.get('/dashboard', (req, res) => {
    con.query('SELECT * FROM sampah', function (err, rows) {
        if (err) {
            res.render('dashboard', {
                data: ''
            })
        } else {
            res.render('dashboard', {
                data: rows
            })
            
        }
    })
});
app.get('/input', (req, res) => {
    // res.render('input')
    con.query('SELECT * FROM list_sampah', function (err, rows) {
        if (err) {
            res.render('input', {
                data: ''
            })
        } else {
            res.render('input', {
                data: rows
            })
        }
    })
});
app.post('/input', urlencodedParser, (req, res) => {
    const id = nanoid(6);
    const Penyetor = req.body.Penyetor;
    const jenis_sampah = req.body.jenis_sampah;
    const berat_sampah = req.body.berat_sampah;
    const harga = req.body.harga_sampah;

    const tanggal_input = new Date().toISOString();
    console.log(Penyetor, jenis_sampah, berat_sampah, harga);
    if(containsOnlyNumbers(berat_sampah)){
            con.query(
                "INSERT INTO sampah(id, nama_penyetor, jenis_sampah, berat_sampah, harga, tanggal_input) VALUES (?, ?, ?, ?, ?, ?)",
                [id, Penyetor, jenis_sampah, berat_sampah , harga, tanggal_input],
                function (err, rows) {
                    if (err) throw err;
                    res.redirect('back');
                }
            );
        }
});
app.post('/list', urlencodedParser, (req, res) => {
    const id = nanoid(6);
    const {jenis_sampah, harga_sampah} = req.body
    console.log(jenis_sampah)
    if(jenis_sampah != "" || harga_sampah != ""){
        con.query(
            "INSERT INTO list_sampah(id, jenis_sampah, harga_sampah) VALUES (?, ?, ?)",
            [id, jenis_sampah, harga_sampah],
            function (err, rows) {
                if (err) throw err;
                res.redirect('back');
            }
        );
    }
});
app.put('/list_sampah/edit', urlencodedParser,(req, res)=>{
const id = req.body.id;
const jenis_sampah = req.body.jenis_sampah;
const harga_sampah = req.body.harga_sampah;

    con.query('UPDATE list_sampah SET jenis_sampah = ?, harga_sampah = ? WHERE id = ?',
    [jenis_sampah, harga_sampah, id],
    (err, rows) =>{
        if(err){
            res.redirect('/list_sampah')
        }else{
            res.redirect('/list_sampah')
        }
    });
});
app.delete("/list_sampah/delete/:id", function(req, res) {
    let id = req.params.id;
    con.query("DELETE FROM list_sampah WHERE id = ?", [id], function(err, rows) {
      if (err) throw err;
      res.redirect('/list_sampah')
    });
});
app.get('/list_sampah', function (req, res) {
    con.query('SELECT * FROM list_sampah', function (err, rows) {
        if (err) {
            res.render('list', {
                data: ''
            })
        } else {
            res.render('list', {
                data: rows
            })
        }
    })
})
app.get('/table', (req, res) => {
    con.query('SELECT * FROM sampah', function (err, rows) {
        if (err) {
            res.render('table', {
                data: ''
            })
        } else {
            res.render('table', {
                data: rows
            })
        }
    })
});
app.get('/register', (req, res) => {
    res.render('register')
});
app.post('/register', urlencodedParser, (req, res)=>{
    const id = nanoid(16);
    const {first_name, last_name, email_address, password, password2} = req.body;

    if (password == password2) {
        con.query(
            "INSERT INTO user(id, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
            [id, first_name, last_name, email_address, password],
            function (err, rows) {
                if (err) throw err;
                res.redirect('back');
            }
        );
    }
})
app.get('/login', (req, res) => {
    res.render('login')
    
});
app.post('/login',urlencodedParser, (req, res)=>{
    const { email, password } = req.body;
    con.query('SELECT email, password FROM USER', (err, row)=>{
    const db_email = row.map(data=>data.email);
    const db_password = row.map(data=>data.password);

    console.log(db_email.indexOf((email)))
    console.log(db_password.indexOf((password)))
    if(db_email.indexOf((email)) == db_password.indexOf(password)){
        res.redirect('dashboard')
    }else{
        res.render('404', {
            error:true,
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });
    }
    })
});

app.listen(port, () => {
    console.log(`Server start on http://localhost:${port}`)
});

function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}
