var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var portfolio = new Schema({
        projectName:{
            type: String,
            required: true,
        },
        images:[{
            type: String,
            required:true

        }],
        description:{
            type: String,
            require:true
        }
       
})

module.exports = mongoose.model('profile', portfolio)