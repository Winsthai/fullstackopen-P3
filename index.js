const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())

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
    response.json(data)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${data.length} people</p> <p>${new Date().toString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = data.find(person => person.id === Number(id))

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    data = data.filter(person => person.id !== Number(id))

    response.status(204).end()
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
    } else if (data.includes(person => person.name === body.name)) {
        return response.status(400).json( {
            error: 'name of the person must be unique; it already exists'
        })
    }

    const person = {
        id: id,
        name: body.name,
        number: body.number
    }

    data = data.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)