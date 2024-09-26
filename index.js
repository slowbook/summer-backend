const express = require("express") ;
const app = express() ;
const Prisma = require("@prisma/client") ;
const prisma = new Prisma.PrismaClient() ;
const bcrypt = require("bcryptjs") ;
const cors = require("cors") ;

app.use(cors()) ;


var allowlist = ['https://summer-frontend.vercel.app/']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
app.use(express.json()) ;

app.get("/" , (req,res)=>{
    res.send("Hello World") ;
})

app.post("/user/signup", async (req, res) => {
    const {email , password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 8) ;

    const user = await prisma.user.create({
        data: {
            email,
            password : hashedPassword
        }
    })

    res.json(user) ;
})

app.post("/user/login" , async (req,res)=>{
    const {email , password} = req.body;

    const user = await prisma.user.findUnique({
        where : {
            email
        }
    })

    if(!user){
        return res.status(404).json({message : "User not found"}) ;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password) ;

    if(!isPasswordValid){
        return res.status(401).json({message : "Invalid Password"}) ;
    }

    res.json(user) ;
})

app.listen(3000) ;
