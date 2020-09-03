const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./pool');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./client/build'));
}

// get all items
app.get('/items', async (req, res) => {
    const { description } = req.query;
    let allItemsQuery;

    if (description) {
        allItemsQuery = `
        select i.item_id ,i.description, i.price, sum(coalesce(oi.qty_received, 0)) as qty_on_hand, sum(coalesce(oi.qty_ordered, 0)) as qty_on_order
        from item i
        left join orders_item oi on
        oi.item_id = i.item_id
        where i.description ilike '%${description}%'
        group by i.item_id, i.description, i.price;
        `
    } else {
        allItemsQuery = `
        select i.item_id ,i.description, i.price, sum(coalesce(oi.qty_received, 0)) as qty_on_hand, sum(coalesce(oi.qty_ordered, 0)) as qty_on_order
        from item i
        left join orders_item oi on
        oi.item_id = i.item_id
        group by i.item_id, i.description, i.price;
        `
    }

    try {
        const allItems = await pool.query(allItemsQuery);
        res.json(allItems.rows);
    } catch (error) {
        console.log(error.message);
    }
});

// get one item
app.get('/items/:itemId', async (req, res) => {
    const oneItemQuery = 'select * from item i where i.item_id = $1;'

    try {
        const { itemId } = req.params;
        const oneItem = await pool.query(oneItemQuery, [itemId]);
        res.json(oneItem.rows[0]);
    } catch (error) {
        console.log(error.message);
    }
});


// update an item
app.put('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const { description, price } = req.body;
    const updateItemQuery = `
    update item
    set description = '${description}', 
        price = ${price}
    where item_id = ${itemId};
    `

    try {
        const updateItem = await pool.query(updateItemQuery);
        res.json('Updated Item');
    } catch (error) {
        console.log(error.message);
    }
});

// create a new item
app.post('/items', async (req, res) => {
    const { description, price } = req.body;
    const newItemQuery = `
    insert into item(description, price) 
    values ($1, $2)
    returning *;
    `

    try {
        const newItem = await pool.query(newItemQuery, [description, price]);
        console.log(newItem);
        res.json(newItem.rows[0]);
    } catch (error) {
        console.log(error.message);
    }
});

// delete items
app.delete('/items', async (req, res) => {
    const { checkedItems } = req.body;
    const deleteItemsQuery = `delete from item where item_id = $1;`

    try {
        for (let itemId of checkedItems) {
            const deleteItems = await pool.query(deleteItemsQuery, [itemId]);
        }
        res.json('Items deleted');
    } catch (error) {
        console.log(error.message);
    }

});

// get all orders
app.get('/orders', async (req, res) => {
    const allOrders = `
    select o.order_id, o.ref_number, sum(oi.qty_received) as qty_received, sum(oi.qty_ordered) as qty_ordered
    from orders_item oi
    inner join orders o on
        o.order_id = oi.order_id
    group by o.order_id, o.ref_number;
    `

    try {
        const orders = await pool.query(allOrders);
        res.json(orders.rows);
    } catch (error) {
        console.log(error.message);
    }
});

// new order with items
app.post('/orders', async (req, res) => {
    const { refNumber, qtyOrdered, showModal } = req.body;
    const insertOrderQuery = `insert into orders(ref_number) values ($1) returning order_id;`
    const getOrderQuery = `select o.order_id from orders o where o.ref_number = $1;`
    const insertOrderItemsQuery = `insert into orders_item values ($1, $2, 0, $3);`
    const updateOrderItemsQuery = `
    update orders_item
    set qty_ordered = $3 + (
        select qty_ordered
        from orders_item
        where order_id = $1 and item_id = $2
    )
    where order_id = $1 and item_id = $2;
    `
    const getItemIdQuery = `
    select item_id from orders_item where item_id = $1 and order_id = $2;
    `

    try {
        // existing order
        const getOrderId = await pool.query(showModal ? getOrderQuery : insertOrderQuery, [refNumber]);
        const orderId = getOrderId.rows[0].order_id;
        for (const [key, value] of Object.entries(qtyOrdered)) {
            // get the item id 
            const getItemId = await pool.query(getItemIdQuery, [key, value]);
            const itemId = getItemId.rows[0];
            // if item id is null, insert into order items otherwise create a new row
            const updateOrderItems = await pool.query
                (itemId ? updateOrderItemsQuery : insertOrderItemsQuery, [orderId, key, value]);
            res.json();
        }
    } catch (error) {
        console.log(error.message);
    }
});


// get all items in a specific order
app.get('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const ordersItemQuery = `
    select i.item_id, i.description, i.price, oi.qty_received, oi.qty_ordered
    from orders_item oi
    inner join item i on
        i.item_id = oi.item_id
    where oi.order_id = ${id};
    `

    try {
        const ordersItem = await pool.query(ordersItemQuery);
        res.json(ordersItem.rows);
    } catch (error) {
        console.log(error.message);
    }
});

// update an orders item record
app.put('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { qtyReceived, itemId } = req.body;
    const updateQtyReceivedQuery = `
    update orders_item
    set qty_received = $1
    where order_id = $2 and item_id = $3
    `

    try {
        const updateQtyReceived = await pool.query(updateQtyReceivedQuery, [qtyReceived, id, itemId]);
        // this is needed or else put request will load for a long time, waiting for a response
        res.json('Updated Qty Received amounts');
    } catch (error) {
        console.log(error.message);
    }
});

// receive all items in an order
app.put('/orders/receive/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const receiveAllQuery = `
    update orders_item
    set qty_received = qty_ordered
    where order_id = ${orderId};
    `

    try {
        const receiveAll = await pool.query(receiveAllQuery);
        res.json('Received all items from order');
    } catch (error) {

    }
});

// get all orders associated with an item
app.get('/items-breakdown/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const itemBreakdownQuery = `
    select oi.order_id, o.ref_number, oi.qty_received, oi.qty_ordered
    from orders_item oi
    inner join orders o on
    o.order_id = oi.order_id
    where oi.item_id = ${itemId};
    `

    try {
        const itemBreakdown = await pool.query(itemBreakdownQuery);
        res.json(itemBreakdown.rows);
    } catch (error) {
        console.log(error);
    }
});

app.get('*', (req, res) => {
    res.sendFile('./client/build/index.html');
});


app.listen(PORT);