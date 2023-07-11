const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minLength: 6},
    image: {type: String, required: true},
    animes: [{type: mongoose.Types.ObjectId, required: true, ref: 'Anime'}] // an array b/c can have multiple places per user //ref establishes connection between schemas
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);