require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.static('dist'))
app.use(cors());
const Person = require('./models/person')

morgan.token('body', (req, res) => { return JSON.stringify(req.body) })

const logger = morgan((tokens, request, response) => {
    return [
        tokens.method(request, response),
        tokens.url(request, response),
        tokens.status(request, response),
        tokens.res(request, response, 'content-length'), '-',
        tokens['response-time'](request, response), 'ms',
        tokens.body(request, response)
    ].join(' ')
})

app.use(logger)

let data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(results => {
        response.json(results)
    })
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${data.length} people</p> <p>${new Date().toString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => {next(error)})
})

app.post('/api/persons', (request, response) => {
    const min = 1       // Min id is 1
    const max = 1000    // Max id is 1000
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    const id = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)

    // Get random id that has not been taken yet
    while (data.includes(person => person.id === id)) {
        id = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
    }

    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json( {
            error: 'name or number of person is missing'
        })
    } /* else if (checkNameExists(body.name)) {
        return response.status(400).json( {
            error: 'name of the person must be unique; it already exists'
        })
    } */

    const newPerson = new Person({
        id: "",
        name: body.name,
        number: body.number
    })

    newPerson.save().then(result => {
        response.json(newPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})