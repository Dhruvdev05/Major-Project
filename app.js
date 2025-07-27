if (process.env.NODE_ENV != "production") {
require("dotenv").config();
}

console.log(process.env.SECRET)

const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user.js")


// const review = require("./models/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const { Session } = require("inspector/promises");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

// const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl)
main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => { 
    console.log(err)
})

async function main() {
  await mongoose.connect(dbUrl);

}


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in MONGO STORE",err)
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // must be a Date object
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  }
};




app.use(session(sessionOptions));
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()))


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req,res,next) => {
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currUser = req.user;
next();
})

// app.get("/demouser",async(req,res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username : "delta-user"
//   })

//   let registeredUser = await User.register(fakeUser, "hello-world")
//   res.send(registeredUser)
// })
  
app.use("/listings" , listings)

app.use("/listings/:id/reviews" , reviews);
app.use("/" , userRouter)

// app.get("/", (req,res)=>{
//     res.send(" hi I am a root")
// })


// 404 Catch-All Route for Express 5.x
app.all('/{*splat}', (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error Middleware (improved)
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
res.status(statusCode).render("listings/error", { message })
});


app.listen(8080, () => {
    console.log("server ius running")
});
