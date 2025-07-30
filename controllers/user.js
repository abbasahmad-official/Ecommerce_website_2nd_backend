const User  = require("../models/user");
const {Order, CartItem} = require("../models/order");

exports.userById = async (req, res, next, id) => {
try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    req.profile = user;
    next();
  } catch (err) {
    console.error("Error in userById middleware:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.read = async (req, res) => {
  try {
    const user = req.profile;

    // Remove sensitive fields
    user.hashed_password = undefined;
    user.salt = undefined;

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong." });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.profile._id }, // find by ID
      { $set: req.body },        // apply updates
      { new: true }              // return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Hide sensitive fields
    updatedUser.hashed_password = undefined;
    updatedUser.salt = undefined;

    return res.json(updatedUser);
  } catch (err) {
    return res.status(400).json({
      error: "You are not authorized to perform this action"
    });
  }
};

exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];
    req.body.order.products.forEach((item)=>{
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
            
        });
    });


    User.findOneAndUpdate({_id: req.profile._id}, { $push: { history: { $each: history } } }, {new: true}).then((data)=>{
          next();
    }).catch(error=>{
      console.log("error in user update history", error)
      return res.status(400).json({error:"could not update user purchase history"});
    })
}

exports.purchaseHistory = async (req, res) => {
  try{
  let orders = await Order.find({user:req.profile._id}).populate("user", "_id name").sort("-created");
  res.json(orders);
  } catch (error){
    console.log("purchaseHistory", error);
  }
}