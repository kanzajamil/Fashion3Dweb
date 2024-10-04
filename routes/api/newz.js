/*const express = require("express");
let router = express.Router();
let News = require("../../models/newsUpdates");
let cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dhvw0rfvd',
    api_key: '345363672419592',
    api_secret: 'c_T-gT7iHbS3X-0aNfYWat1ZVrY'
})

router.get("/api/newz/:id", async function (req, res) {
    // return res.send(req.params);
    let news = await News.findById(req.params.id);
    res.send(news);
  });
  router.put("/api/newz/:id", async function (req, res){
    // return res.send(req.params);
    let news = await News.findById(req.params.id);
    news.model = req.body.model;
    news.title = req.body.title;
    news. detail = req.body.detail;
    news.imageUrl = req.body.imageUrl;
    await news.save();
    res.send(news);
  });
  router.delete("/api/newz/:id", async function (req, res) {
    // return res.send(req.params);
    let news = await News.findByIdAndDelete(req.params.id);
  
    res.send(news);
  });
  router.post("/api/newz", async function (req, res) {
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
        });

        await news.save();
        return res.send(news);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error occurred while uploading and saving data");
    }
});

/*router.get("/news", async function (req, res) {
    try {
        let newsItems = await News.find();
        res.render('news', { newsItems }); // Render the 'news.ejs' file with the fetched data
    } catch (error) {
        res.status(500).send('Error fetching news');
    }
});*/
/*
router.get("/news/:page?", async (req, res) => {
    let page = req.params.page ? req.params.page : 1;
    page = Number(page);
    let pageSize = 2;
    let newsItems = await News.find()
      .limit(pageSize)
      .skip((page - 1) * pageSize);
    let newsCount = await News.countDocuments();
    let totalPages = Math.ceil(newsCount / pageSize);
    res.render("news", {
      newsItems,
      page,
      totalPages,
    });
  });

module.exports = router;*/
