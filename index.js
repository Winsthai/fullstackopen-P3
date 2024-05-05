/* global process */

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.static('dist'))
app.use(cors());
const Person = require('./models/person')

morgan.token('body', (req) => { return JSON.stringify(req.body) })

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

app.get('/', (_, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(results => {
        response.json(results)
    })
})

app.get('/info', (request, response) => {
    (async() => {
        const count = await Person.find({}).countDocuments()
        response.send(`<p>Phonebook has info for ${count} people</p> <p>${new Date().toString()}</p>`)
    })()
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(() => {
        response.status(204).end()
    })
    .catch(error => {next(error)})
})

app.post('/api/persons', (request, response, next) => {

    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json( {
            error: 'name or number of person is missing'
        })
    } 

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save().then(() => {
        response.json(newPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Add error handling middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
  
    next(error)
  }

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})