require('dotenv').config()
const express = require('express')
const bot = require('./bot')

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => res.send('Hello FN2 !?'))

app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`))

bot.launch()
console.log('Bot ishladi !?')
