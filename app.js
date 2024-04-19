const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'pug');
app.set('views', './views');

const routes = require('./routes/index');

const errorController = require('./controllers/errors');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use(errorController.get404Page);

app.listen(3000, () => {
    console.log('listening on port 3000');
});
