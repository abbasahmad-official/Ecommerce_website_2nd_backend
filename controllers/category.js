const Category = require("../models/category");
const {errorHandler} = require("../helpers/dbErrorHandler");


exports.categoryById = async (req, res, next, id) =>{
try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    req.category = category;
    next();
  } catch (err) {
    console.error("Error in categoryById middleware:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

exports.create = (req, res) =>{
    const category = new Category(req.body);
    category.save()
          .then((data)=>{
            res.json({data});
        })
          .catch((err) => {
            res.status(400).json({
              error:errorHandler(err)
            });
          });
}

exports.read = (req, res) =>{
  return res.json(req.category);
}

exports.update = (req, res) => {
  const category = req.category;
   category.name = req.body.name;
   category.save()
          .then((data)=>{
            res.json({data});
        })
          .catch((err) => {
            res.status(400).json({
              error:errorHandler(err)
            });
          });
}

exports.remove = async (req, res) =>{
 try {
    await req.category.deleteOne(); // Delete the category
    res.json({
      message: "Category deleted successfully"
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err)
    });
  }
}

exports.list = async (req, res) =>{
try {
    const categories = await Category.find({});

    // You can optionally check if no categories were found
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.json(categories);
  } catch (err) {
    console.error("Error in category list:", err);
    return res.status(500).json({ error: "Server error" });
  }
}