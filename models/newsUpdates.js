const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  detail: String,
  imageUrl: String, 
  
});
const News = mongoose.model('News', newsSchema);
module.exports = News;
