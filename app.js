const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const router = require('./routers/watson.router');

const app = express();

app.set('port', process.env.PORT || 4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));

app.use('/api/v1', router)

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Tente novamente mais tarde');
})

app.use(express.static(path.join(__dirname, '/public')));

app.use('/*', (req, res) => {
    res.redirect('/api/v1/watson')
})

app.listen(app.get('port'), '0.0.0.0', () => {
    console.log(`Server up and running on ${app.get('port')}`);
});