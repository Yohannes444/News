const express= require ("express")
const bodyparser=require("body-parser")
const portfolioRouter=express.Router()
const authenticate=require('../authenticate')
const Portfolio = require('../models/portfolio')
const cors=require('../cors')
const multer = require('multer');
const path=require('path')

portfolioRouter.use(bodyparser.json())


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },

    filename: (req, files, cb) => {
        cb(null, files.originalname)
    }
});

const imageFileFilter = (req, files, cb) => {
    if(!files.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

portfolioRouter.route('/') 
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})

.get(cors.cors,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Portfolio.find()
    .then(portfolio=>{
        if(portfolio != null){
            res.statusCode=200,
            res.setHeader('Content-Type','application/json')
            res.send(portfolio)
        }else{
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            const err = new Error("ther is no portfolio add new or chek your database ")
            return next(err)        }
    })
    .catch((err)=>next(err))
})


.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, upload.fields([{ name: 'file' }]), (req, res, next) => {
    try{
    // Extract the form data from the request
    const { projectName, description } = req.body;
  
    // Get the paths of the uploaded files
    const images = path.join( req.files['file'][0].originalname).split(path.sep).join('/');
  
    // Create a new portfolio document with the form data and file paths
    const newportfolio =  {
      projectName:projectName,
      description:description,
      images: images,
    };
    // Save the new portfolio document to the database
    Portfolio.create(newportfolio)
      .then(portfolio => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(portfolio);
      })
      .catch(err => next(err));
    } catch (err) {
        next(err);
      }
  })

module.exports= portfolioRouter