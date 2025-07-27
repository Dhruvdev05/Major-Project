const express = require("express");
const router =  express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner,validateError } = require("../middleware.js");
const { index } = require("../controllers/listing.js");
const multer  = require('multer');
const{ storage } = require("../cloudinary.js")
const upload = multer({ storage})

const listingController = require("../controllers/listing.js");


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,
 upload.single('listing[image]'),  validateError,
   wrapAsync ( listingController.createListing)
);


// new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner,upload.single('listing[image]'),validateError,
  wrapAsync(listingController.updateListing)
)
.delete(  isLoggedIn,isOwner,
  wrapAsync(listingController.destroyListing)
);


// edit route
router.get("/:id/edit" , isLoggedIn,isOwner,
  wrapAsync (listingController.editListing)
)



module.exports = router;