const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
// const product = require("../models/product");

exports.productById = async (req, res, next, id) =>{
try {
    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    req.product = product;
    next();
  } catch (err) {
    console.error("Error in productById middleware:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.read = (req, res) =>{
  req.product.photo = undefined;
  return res.json(req.product);

}


exports.create = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
const name = fields.name?.[0];
const description = fields.description?.[0];
const price = fields.price?.[0];
const category = fields.category?.[0];
const quantity = fields.quantity?.[0];
const shipping = fields.shipping?.[0];
const photoFile = files.photo?.[0]; // ✅ Get the file from array

if(!name || !description || !price || !category || !quantity || !photoFile || !shipping){
    return res.status(400).json({error: "All  fields are required"})
}

    let product = new Product(
      Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))
    );


    if (photoFile && photoFile.filepath) {
      try {     
        if(photoFile.size > 1572864 ){
            return res.status(400).json({error: "image should be less than 1.5mb"})
        }
         console.log("size of file", photoFile.size);
        product.photo.data = fs.readFileSync(photoFile.filepath);
        product.photo.contentType = photoFile.mimetype;
      } catch (readErr) {
        return res.status(400).json({
          error: "Failed to read image file",
        });
      }
    }

    product
      .save()
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({
          error: errorHandler(err),
        });
      });
  });
};

exports.remove = async (req, res) => {
  try {
    const product = req.product;
    const deletedProduct = await product.deleteOne(); // use deleteOne() or remove() as per Mongoose version
    res.json({
      message: "Product deleted successfully"
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err) // Make sure errorHandler is imported
    });
  }
};
exports.update = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
const name = fields.name?.[0];
const description = fields.description?.[0];
const price = fields.price?.[0];
const category = fields.category?.[0];
const quantity = fields.quantity?.[0];
const shipping = fields.shipping?.[0];
const photoFile = files.photo?.[0]; // ✅ Get the file from array

if(!name || !description || !price || !category || !quantity  || !shipping){
    return res.status(400).json({error: "All fields are required"})
}
const flatFields = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    let product = req.product;
    product = _.extend(product, flatFields);

    if (photoFile && photoFile.filepath) {
      try {     
        if(photoFile.size > 1572864 ){
            return res.status(400).json({error: "image should be less than 1.5mb"})
        }
         console.log("size of file", photoFile.size);
        product.photo.data = fs.readFileSync(photoFile.filepath);
        product.photo.contentType = photoFile.mimetype;
      } catch (readErr) {
        return res.status(400).json({
          error: "Failed to read image file",
        });
      }
    }

    product
      .save()
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(400).json({
          error: errorHandler(err),
        });
      });
  });
};


exports.list = async (req, res) =>{
  /*
  * sell / arrival
  * by sell = /products?sortBy=sold&order=desc&limit=4
  * by arrival = /products?sortBy=createdAt&order=desc&limit=4
  * if no params are sent, then all products are returned
  *1 */
 try{

  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  let products = await Product.find({})
     .select("-photo")
     .populate("category")
     .sort([[sortBy, order]])
     .limit(limit);
     res.send(products);
    
  } catch (error) {
    return res.status(400).json({error: "Products not found"});
  }
}

exports.relatedList = async (req, res) =>{
  try{
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  let products = await Product.find({_id: {$ne: req.product._id}, category: req.product.category})
  .limit(limit)
  .populate("category", "_id name");
  res.json(products);
  } catch(error){
    return res.status(400).json({error: " Products not found"});
  }

}

exports.listCategories = async (req, res) =>{
  try{
  let categories = await Product.distinct("category")
  
  res.json(categories);
  } catch(error){
    return res.status(400).json({error: " categories not found"});
  }

}

exports.getProductsByCategory = async (req,res) => {
  // console.log("getProductsByCategory CALLED");

  try{
    const {categoryId} = req.params;

    const products = await Product.find({category: categoryId})
    .select("-photo")
    .populate("category", "_id name");
    // If no products found, you can handle it explicitly:
    if (!products.length) {
      return res.status(200).json({ error: "No products found" });
    }
    // console.log(products)
    res.json({
      size: products.length,
      data: products
    });
  } catch (error) {
    console.error("Error in listBySearch:", error);
    res.status(400).json({ error: "Products not found" });
  }
}

exports.listBySearch = async (req, res) => {
  try {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0; // add default 0 if not provided
    let findArgs = {};

    // Build findArgs from filters
    for (let key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
        if (key === "price") {
          findArgs[key] = {
            $gte: req.body.filters[key][0],
            $lte: req.body.filters[key][1]
          };
        } else {
          findArgs[key] = req.body.filters[key];
        }
      }
    }

    const products = await Product.find(findArgs)
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit);

    // If no products found, you can handle it explicitly:
    if (!products.length) {
      return res.status(404).json({ error: "No products found" });
    }

    res.json({
      size: products.length,
      data: products
    });
  } catch (error) {
    console.error("Error in listBySearch:", error);
    res.status(400).json({ error: "Products not found" });
  }
};


exports.photo = (req, res, next) =>{
  if(req.product.photo.data){
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data)
  }
  next();
}


exports.listSearch = async (req, res) => {
  try {
    // Create query object
    const query = {};

    // If search term exists, add to query
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };

      // If category is provided and not "All", add it too
      if (req.query.category && req.query.category !== 'All') {
        query.category = req.query.category;
      }
    }

    // Execute query using Mongoose
    const products = await Product.find(query).select("-photo");

    // Send result
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: 'Error fetching products',
    });
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map(item => {
    return{
      updateOne: {
        filter: {_id: item._id},
        update: {$inc: {quantity: -item.count, sold:+item.count}}
      }
    }
  })

  Product.bulkWrite(bulkOps, {}).then(()=>{
    next();
  }).catch(error => {
    console.log("error in updating quantity", error);
    res.status(400).json({error: "error in updating quantity"})
  })

}