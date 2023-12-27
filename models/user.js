var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
    firstname: {
        type: String,
          default: ''
      },
      lastname: {
        type: String,
          default: ''
      },
      age:{
        type:Number,
        default:22,
      },
    facebookId:String,
    admin:   {
        type: Boolean,
        default: true
    }
});
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('user', User);