const mongoose = require('mongoose')
const User = require('../models/User')
const { Schema } = mongoose;

const NotesSchema = new Schema({
   user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   title: {
    type: String,
    require: true
   },
   description: {
    type: String,
    require: true,
   },
   tag: {
    type: String,
    default: 'General'
   },
   Date: {
    type: Date,
    default: Date.now
   }
  });

  module.exports = mongoose.model('Notes', NotesSchema);
