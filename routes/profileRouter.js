const express= require ("express")
const bodyparser=require("body-parser")
const profileRouter=express.Router()
const authenticate=require('../authenticate')
const cors=require('../cors')
profileRouter.use(bodyparser.json())

profileRouter.route('/') 
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})

.get(cors.cors,(req,res,next) => {
 console.log("know we are tolking")
})



module.exports= profileRouter