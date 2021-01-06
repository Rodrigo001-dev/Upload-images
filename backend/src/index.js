require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const Connection = require('./connection');
const cors = require('cors');

const path = require('path');

const app = express();

Connection();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  '/files', 
  express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
);

app.use(require('./routes'));

app.listen(3000);