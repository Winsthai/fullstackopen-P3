const mongoose = require('mongoose')

if ( !(process.argv.length == 3 || process.argv.length == 5) ) {
    console.log('Usage:\nnode mongo.js yourpassword - displays all entries in the phonebook\nnode mongo.js <yourpassword> <name> <number> - adds entry to the phonebook')
    process.exit(1)
  }

const password = process.argv[2]

const url = `mongodb+srv://winstonthai1:${password}@fullstackopen.zdidpnl.mongodb.net/`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    // Print out all phonebook entries
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })

} else {
    const min = 1       // Min id is 1
    const max = 1000    // Max id is 1000
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // Generate random id from 1 to 1000
    const id = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)

    const name = process.argv[3]
    const number = process.argv[4]

    const newPerson = new Person({
        id: id,
        name: name,
        number: number
    })

    newPerson.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}