const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI
 
const connectToMongo = () =>{
    mongoose.set('strictQuery', true);
    mongoose.connect(mongoURI, () => {
        console.log('Connected suncessfully to mongoose')
    })
}

module.exports = connectToMongo;
 