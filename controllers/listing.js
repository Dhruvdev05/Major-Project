const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });


module.exports.index = async(req,res) => {
  const allListing =  await Listing.find({});
 res.render("listings/index", { allListing }); 

}

module.exports.renderNewForm =  (req,res) => {
 res.render("listings/new");
}

module.exports.showListing = async(req,res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path : "reviews", populate: {
      path:"author",
  },
}).populate("owner");
    if (!listing) {
         req.flash("error", "listing doesn't exist")
    return res.redirect("/listings");
    }
  res.render("listings/show", { listing });
  console.log(listing)
}
// geocding

module.exports.createListing = async (req,res,next) => {
 let response =  await geocodingClient.forwardGeocode({
  query: req.body.listing.location ,
  limit: 1,
})
  .send()

 
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url , ".. ", filename)
   const newListing = new Listing (req.body.listing);
   newListing.owner = req.user._id;
  
   newListing.image = {url,filename}

    newListing.geometry = response.body.features[0].geometry
let savedListing = await newListing.save();
console.log(savedListing)
req.flash("success", "New listing Created")
 res.redirect("/listings")
}


module.exports.editListing = async (req,res) => {
  const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listings you req doesn't exist")
      res.redirect("/listings")
    }
   let orignalimage = listing.image.url;
orignalimage = orignalimage.replace("/upload/", "/upload/w_250/");

console.log(orignalimage);
res.render("listings/edit", { listing, orignalimage });

}

module.exports.updateListing = async (req,res) => {
   let { id } = req.params;
let listing =  await Listing.findByIdAndUpdate(id , {...req.body.listing});
 
if (typeof req.file !== "undefined") {
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image  = {url,filename}
  await listing.save()
}


 req.flash("success", "Listing Updated")
   res.redirect("/listings");
}


module.exports.destroyListing = async(req,res) => {
   const { id } = req.params;
   const deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   req.flash("success", "listing deleted")
   res.redirect("/listings")
}