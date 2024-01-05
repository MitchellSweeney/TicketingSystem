const express = require("express");
const db = require("./db");
const axios = require("axios");
let paymentTimouts = {};
let queue = [];
const router = express.Router();
const paymentTimeout = 20; //seconds
// Users bookk tickets in first come first serve order
// need to pay for booked ticket within paymentTimeout
// users added to queue when tickets run out
// if order is not completed first user from queue has their order placed
// some sort of notification system could be used to inform the user that 
// they have been removed from queue and an order has been placed
router.post("/order_ticket", async (req, res) => {
  /*
  Assuming body contains:
  {
    user_id, 
    ticket_id
  }
  */
  console.log(req.body);
  try {
    // get ticket quantity
    const result = await db.query(
      `SELECT quantity FROM tickets WHERE ticket_id = ${req.body.ticket_id};`
    );
    const quantity = result[0].quantity;
    console.log("Quantity: ", quantity);
    if (quantity <= 0) {
      let queue_data = {
        user_id: req.body.user_id,
        ticket_id: req.body.ticket_id
      }
      queue.push(queue_data);
      console.log("Queue: ", queue);
      res.status(400).json({
        message: "No tickets available!",
      });
    } else {
      // create ticket order
      await db.query(
        `UPDATE Tickets SET quantity = quantity - 1 WHERE ticket_id = ${req.body.ticket_id};`
      );
      const order = await db.query(
        `INSERT INTO Ticket_order (user_id, ticket_id, order_status) VALUES (${req.body.user_id}, ${req.body.ticket_id}, 'PAYMENT_PENDING');`
      );
      setTimeout(async () => {
        const order = await db.query(
          `SELECT order_id, order_status FROM Ticket_order WHERE user_id = ${req.body.user_id} AND ticket_id = ${req.body.ticket_id};`
        );
        const order_id = order[0].order_id;
        const order_status = order[0].order_status;
        if (order_status.toString() != "PAYMENT_SUCCESSFUL") {
          // cancel order and increase ticket quantity back
          await db.query(
            `UPDATE Ticket_order SET order_status = "PAYMENT_UNSUCCESFUL" WHERE user_id = ${req.body.user_id} AND ticket_id = ${req.body.ticket_id} AND order_id = ${order_id};`
          );
          await db.query(
            `UPDATE Tickets SET quantity = quantity + 1 WHERE ticket_id = ${req.body.ticket_id};`
          );
          if (queue.length > 0){
            axios
            .post("http://127.0.0.1:4000/order_ticket", queue.shift())
            .then((response) => {
              console.log(response.data);
            })
          }
        }
      }, paymentTimeout * 1000);
      res.status(200).json({
        message: `Order placed! Place pay for the order within ${paymentTimeout} seconds to avoid cancellation.`,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/pay_for_ticket", async (req, res) => {
  /*
  Assuming body contains:
  {
    payment_details: {
      account_number,
      cvv,
    }
    order_id
  }
  */
  console.log(req.body);
  try {
    // compare to dummy payment details
    const payment_details = await db.query(`SELECT * FROM Payment_details`);
    let stored_details = {
      account_number: (payment_details[0].account_number).toString(),
      cvv: (payment_details[0].cvv).toString(),
    }
    console.log("Provided: ", req.body.payment_details, " Actual: ", stored_details)
    if (stored_details.account_number == req.body.payment_details.account_number && stored_details.cvv == req.body.payment_details.cvv) {
      // set order status to payment successful
      await db.query(
        `UPDATE Ticket_order SET order_status = "PAYMENT_SUCCESSFUL" WHERE order_id = ${req.body.order_id};`
      )
      res.json({
        message: "Payment successful!"
      })
    } else {
      res.status(500).json({
        message: "Incorrect Payment Details",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
