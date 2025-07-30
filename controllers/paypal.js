const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

exports.createOrderPaypal =  async (req, res) => {
  try {
    const accessToken = await generateAccessToken();

    const order = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: req.body.amount,
            },
          },
        ],
      }),
    });

    const orderData = await order.json();
    res.json(orderData);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.capturePaypalOrder =  async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await generateAccessToken();

    const capture = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await capture.json();
    res.json(captureData);
  } catch (error) {
    console.error("Capture order error:", error);
    res.status(500).json({ error: "Failed to capture order" });
  }
};