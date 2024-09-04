#! /usr/bin/node
const express = require('express');
const session = require("express-session");
require('dotenv').config();

const USER_ID = process.env['USER_ID'];
const PASSWORD = process.env['PASSWORD'];

const sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 10000,
    // rolling: true,
    unset: 'destroy',
   },
  name: 'exprs-ts-arch-id',
};

const auth = require("./app/auth");
const app = express();
app.use(express.json());
app.use(session(sess));
const tunnel = require('./app/tunnel');
app.use('/tunnel', auth.verify, tunnel);

app.post("/login", (req, res) => {
  const { username, password } = req.body || {}
  if (username == USER_ID && password == PASSWORD) {
    req.session.regenerate(() => {
      // Store the user's primary key
      // in the session store to be retrieved,
      // or in this case the entire user object
      req.session.user = username;
      res.send({
        ok: true,
        message: "Login successful"
      });
    });
  } else {
    res.status(401).send({
      ok: false,
      message: "Invalid credentials!"
    })
  }
});

process.on('exit', async function () {
  for (type in TUNNEL_CFG) {
    const tunnel = TUNNEL_CFG[type]['tunnel'];
    if (tunnel) {
      console.log(`Closing tunnel: ${type}`);
      await tunnel.close();
    }
  }
});

const port = process.env['PORT'] || 3000;
app.listen(port, () => {
  console.log('Listening tunnel connections');
});
