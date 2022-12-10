const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/english');
        console.log('Connect successfully !!!')
    } catch (error) {
        console.log('Connect fail  !!!' + error)
    }
}
module.exports = { connect }