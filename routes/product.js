const express = require("express");
const router = express.Router();

const { create, productById, read, remove, update, list, relatedList, listCategories, listBySearch, photo, listSearch, getProductsByCategory } = require("../controllers/product")
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/product/:productId", read);
router.get("/productByCategory/:categoryId", getProductsByCategory);
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove);
router.put("/product/:productId/:userId", requireSignin, isAuth, isAdmin, update);

router.get("/products", list);
router.get("/products/search", listSearch);
router.get("/products/related/:productId", relatedList);
router.get("/products/categories", listCategories);
router.post("/products/by/search", listBySearch);
router.get("/product/photo/:productId", photo);

router.param("userId", userById);
router.param("productId", productById);



module.exports = router;