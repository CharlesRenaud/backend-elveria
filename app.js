const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const winston = require('winston');
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');
const monsterRoutes = require('./routes/monster');
const mapRoutes = require('./routes/map');
const logRoutes = require('./routes/log');
const equipmentRoutes = require('./routes/equipment')
const fs = require('fs');

const util = require('util');

function formatLogMessage(message) {
  const date = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const formattedDateTime = date.toLocaleString('fr-FR', options).toUpperCase();
  
  return `- ${formattedDateTime} - ${util.inspect(message)}\n`;
}


const logStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });

console.log = function(message) {
  const formattedMessage = formatLogMessage(message);
  logStream.write(formattedMessage);
  process.stdout.write(formattedMessage);
};


require('dotenv').config()

password = process.env.password

mongoose.connect(
  `mongodb+srv://vilpex:5nsMqZzIzgylSZE8@cluster0.aytjmvc.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true, 
    useUnifiedTopology: true })
    .then(() => console.log('Connection à MongoDB réussie'))
    .catch((error) => console.log('Connection à MongoDB échouée' + error));

const app = express();    

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/monster', monsterRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/log', logRoutes);
app.use('/api/equipment', equipmentRoutes);

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;