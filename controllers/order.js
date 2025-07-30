const {Order, CartItem} = require("../models/order");
const {errorHandler}  = require("../helpers/dbErrorHandler")

exports.orderById = async (req, res, next, id) => {

    try {
        let order =  await  Order.findById(id).populate("products.product", "name price")
        req.order = order;
        next();
    } catch (error) {
        console.log("orderById ", error);
    }
}

exports.create = (req, res) => {
    // console.log("Create order", req.body);
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save().then((data)=>{
                res.json(data);
    }).catch((err)=>{
        return res.status(400).json({error: errorHandler(err)})
    })

}

exports.listOrders = async (req, res) => {
    try{
   let orders = await Order.find({}).populate("user", "_id name adress").sort("-created");
    res.json(orders);
    } catch (error) {
        console.log("error fetching order", error);
    }
}

exports.getStatusValues = (req, res) =>{
    res.json(Order.schema.path("status").enumValues)
}

exports.updateOrderStatus = async (req, res) => {
    try{
        let order = await Order.updateOne({_id: req.body.orderId}, {$set: { status: req.body.status}});
        res.json(order);
    } catch (error){
        console.log("update order status error", error);
    }
}