const express= require ("express")
const bodyparser=require("body-parser")
const promoRouter=express.Router()
const authenticate=require('../authenticate')
const cors=require('../cors')
promoRouter.use(bodyparser.json())

promoRouter.route('/') 
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})

.get(cors.cors,(req,res,next) => {
 console.log("know we are tolking")
})



module.exports= promoRouter