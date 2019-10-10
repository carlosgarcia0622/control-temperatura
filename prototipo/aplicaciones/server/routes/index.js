const express = require('express');
const app = express();




app.use(require('./temperatureRecord'))

module.exports = app;
