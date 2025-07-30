const express = require("express");
const User = require("../models/user");
const braintree = require("braintree");
require("dotenv").config();
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const app= express();
app.use(express.json());

// console.log("BRAINTREE_MERCHANT_ID:", process.env.BRAINTREE_MERCHANT_ID);
// console.log("BRAINTREE_PUBLIC_KEY:", process.env.BRAINTREE_PUBLIC_KEY);
// console.log("BRAINTREE_PRIVATE_KEY:", process.env.BRAINTREE_PRIVATE_KEY);

// const gateway = new braintree.BraintreeGateway({
//     environment: braintree.Environment.Sandbox,
//     merchantId: process.env.BRAINTREE_MERCHANT_ID,
//     publicKey: process.env.BRAINTREE_PUBLIC_KEY, 
//     privateKey: process.env.BRAINTREE_PRIVATE_KEY 
// });

// exports.generateToken = (req, res) => {
//     gateway.clientToken.generate({}).then( response => {
//         // const clientToken = response.clientToken;
//             res.send(response);
//     }).catch(err => {
//         res.status(500).send(err);
//     })
// }

exports.create_checkout_session = async (req, res) => {
  try {
    const { items, order } = req.body;

    // Safer logging
    // console.log("Received Items:", items);
    console.log("Received Order:", order.products);

        const metadata = {
         products:JSON.stringify(order.products), 
      full_name: order.full_name || '',
      address: order.address || '',
      phone_no: order.phone_no || '',
      payment_status: order.payment_status || '',
    };

    // Log to confirm
    // console.log("Received items:" + req.body);

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Stripe requires amount in cents
      },
      quantity: item.count,
    }));
    // const encodedAddress = encodeURIComponent(address);

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      metadata,
      success_url: `http://localhost:5173/success`,
      // success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}&address=${encodedAddress}`,
      cancel_url: 'http://localhost:5173/cancel',
    });
    // console.log(session);

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Error creating Stripe session:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
