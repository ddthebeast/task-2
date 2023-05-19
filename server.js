const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/universities', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Academy = mongoose.model('Academy',{
  name: String,
  address: String,
});
const Course = mongoose.model('Course', {
name: String,
description: String,
  academy: { type: mongoose.Schema.Types.ObjectId, ref:'Academi' },
});
app.post('/courses', authenticateToken, async (req, res) => {
  try {
    const { name, description, academyId } = req.body;
    const course = new Course({ name, description, academy: academyId });
    await course.save();
    res.json({ message: 'Курсот е креиран успешно.' });
  } catch (error) {
    res.status(500).json({ message: 'Настана грешка при креирање на курсот.' });
  }
});
app.put('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const course = await Course.findByIdAndUpdate(id, { name, description });
    res.json({ message: 'Курсот е успешно променет.' });
  } catch (error) {
    res.status(500).json({ message: 'Настана грешка при промена на курсот.' });
  }
});

app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('academy', '-courses');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Настана грешка при преземање на листата на курсеви.' });
  }
});
app.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('academy','-courses');
    res.json({ course});
  } catch (error) {
  res.status(500).json({ message: 'Настана грешка при преземање на курсот.' });
  }
});
app.delete('/courses/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await Course.findByIdAndDelete(id);
      res.json({ message: 'Курсот е успешно избришан.' });
    } catch (error) {
      res.status(500).json({ message: 'Настана грешка при бришење на курсот.' });
    }
  });
app.post('/register', async (req, res) =>{
  try {
    const {username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ message: 'Корисникот е успешно регистриран.' });
  } catch (error) {
    res.status(500).json({ message: 'Настана грешка при регистрацia на корисникот.' });
  }
});
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    res.json({ token });
  } catch (error) {
res.status(500).json({ message: 'Настана грешка при логирањето на корисникот.' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, user) => {
    if (err) return res.sendStatus(403);
    req.user =user;
    next();
  });
}
const port = 3000;
app.listen(port, ()=>{
  console.log(`Серверот слуша на ${port}.`);
});
