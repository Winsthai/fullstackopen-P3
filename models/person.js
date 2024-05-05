require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: Number,
    name: { type: String, minLength: 3 },
    number: { type: String, minLength: 8, validate: {
        /* Number should be formed of two parts that are separated by -, 
        the first part has two or three numbers and the second part also consists of numbers */
        validator: (x) => {
            return /^(\d{3}|\d{2})-\d+$/.test(x)
        }
    } }
})

personSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)