const express = require("express");
let router = express.Router();
let News = require("../../models/newsUpdates");
let cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dhvw0rfvd',
    api_key: '345363672419592',
    api_secret: 'c_T-gT7iHbS3X-0aNfYWat1ZVrY'
})

//route to deliver an edit form
router.get("/newz/edit/:id", async (req, res) => {
  let news = await News.findById(req.params.id);
  res.render("./admin/newz/edit" ,{news});
});


router.post("/newz/edit/:id", async (req, res) => {
    try {
      
      // Find the existing news by ID
      let existingNews = await News.findById(req.params.id);
  
      // Check if a new image file was uploaded
      if (req.files && req.files.newImage) {
        const file = req.files.newImage;
  
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath);
  
        // Update the image URL with the new one
        existingNews.imageUrl = result.url;
      }
  
      // Update other fields as needed
      existingNews.title = req.body.title;
      existingNews.detail = req.body.detail;
      // Include other properties you're updating
  
      // Save the updated news
      await existingNews.save();
  
      res.redirect("/admin/newz/display");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error occurred while updating news");
    }
  });
  

//route to delete a News
router.get("/newz/delete/:id", async (req, res) => {
  let news = await News.findByIdAndDelete(req.params.id);
  req.session.flash = { type: "danger", message: "News Deleted!" };
  res.redirect("/admin/newz/display");
});

router.get("/newz/add", async (req, res) => {
  res.render("./admin/newz/add");
});


router.post("/newz/add", async function (req, res) {
    try {
        const file = req.files.photo;

        // Upload file to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        // Create and save News object
        let news = new News({
            model: req.body.model,
            title: req.body.title,
            detail: req.body.detail,
            imageUrl: result.url,
            // Other properties from req.body as needed
        });

        await news.save();
        req.session.flash = { type: "success", message: "Added Sucessfully." };
        res.redirect("/admin/newz/display");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error occurred while uploading and saving data");
    }
    
});


/*router.get("/admin/newz/display", async function (req, res) {
    try {
        let newsItems = await News.find();
        res.render('./admin/newz/display', { newsItems }); // Render the 'news.ejs' file with the fetched data
    } catch (error) {
        res.status(500).send('Error fetching news');
    }
});*/

router.get("/newz/display/:page?", async (req, res) => {
    let page = req.params.page ? req.params.page : 1;
    page = Number(page);
    let pageSize = 2;
    let newsItems = await News.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize);
    let newsCount = await News.countDocuments();
    let totalPages = Math.ceil(newsCount / pageSize);
    res.render("./admin/newz/display", {
      newsItems,
      page,
      totalPages,
    });
  });

module.exports = router;

