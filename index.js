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

// get all orders associated with an item
app.get('/items/breakdown/:itemId', async (req, res) => {
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

// create a new item
app.post('/items', async (req, res) => {
    try {
        const { description, price } = req.body;
        const newItemQuery = `
        insert into item(description, price) 
        values ($1, $2)
        returning *;
        `
        const newItem = await pool.query(newItemQuery, [description, price]);
        res.json(newItem.rows[0]);
    } catch (error) {
        console.log(error.message);
    }
});

// update an item
app.put('/items/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { description, price } = req.body;
        const updateItemQuery = `
        update item
        set description = '${description}', 
            price = ${price}
        where item_id = ${itemId};
        `
        await pool.query(updateItemQuery);
        // this is needed or else put request will load for a long time, waiting for a response
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// delete items
app.delete('/items', async (req, res) => {
    try {
        const { checkedItems } = req.body;
        // deleting an item from item table will automatically delete the rows in order item table with that same item id
        const deleteItemsQuery = `delete from item where item_id = $1;`
        // to clean up the orders that have no record in the order item table anymore
        const deleteOrdersQuery = `delete from orders o where order_id not in (select distinct order_id from orders_item);`
        for (let itemId of checkedItems) {
            await pool.query(deleteItemsQuery, [itemId]);
        }
        await pool.query(deleteOrdersQuery);
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// get all orders
app.get('/orders', async (req, res) => {
    try {
        const { ref } = req.query;
        let getOrdersQuery;
        if (ref) {
            getOrdersQuery = `
            select o.order_id, o.ref_number, sum(coalesce(oi.qty_received, 0)) as qty_received,sum(coalesce(oi.qty_ordered, 0)) as qty_ordered,
                sum(coalesce(oi.qty_ordered, 0) * i.price) as order_value, count(i.item_id) as total_items
            from orders_item oi
            inner join orders o on
                o.order_id = oi.order_id
            inner join item i on
                i.item_id = oi.item_id
            where o.ref_number ilike '%${ref}%'
            group by o.order_id, o.ref_number;
            `
        } else {
            getOrdersQuery = `
            select o.order_id, o.ref_number, sum(coalesce(oi.qty_received, 0)) as qty_received,sum(coalesce(oi.qty_ordered, 0)) as qty_ordered,
                sum(coalesce(oi.qty_ordered, 0) * i.price) as order_value, count(i.item_id) as total_items
            from orders_item oi
            inner join orders o on
                o.order_id = oi.order_id
            inner join item i on
                i.item_id = oi.item_id
            group by o.order_id, o.ref_number;
            `
        }
        const getOrders = await pool.query(getOrdersQuery);
        res.json(getOrders.rows);
    } catch (error) {
        console.log(error.message);
    }
});

// get all items in a specific order
app.get('/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const ordersItemQuery = `
        select o.ref_number, i.item_id, i.description, i.price, oi.qty_received, oi.qty_ordered
        from orders_item oi
        inner join item i on
            i.item_id = oi.item_id
        inner join orders o on
            oi.order_id = o.order_id
        where oi.order_id = ${orderId};
        `
        const ordersItem = await pool.query(ordersItemQuery);
        res.json(ordersItem.rows);
    } catch (error) {
        console.log(error.message);
    }
});

// new order with items
app.post('/orders', async (req, res) => {
    try {
        const { refNumber, qtyOrdered, showModal } = req.body;
        const insertOrderQuery = `insert into orders(ref_number) values ($1) returning order_id;`
        const getOrderQuery = `select order_id from orders where ref_number = $1;`
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
        // existing order
        const getOrderId = await pool.query(showModal ? getOrderQuery : insertOrderQuery, [refNumber]);
        const orderId = getOrderId.rows[0].order_id;
        for (const [key, value] of Object.entries(qtyOrdered)) {
            // get the item id 
            const getItemId = await pool.query(getItemIdQuery, [key, orderId]);
            const itemId = getItemId.rows[0];
            // if item id is null, insert into order items otherwise update existing row 
            await pool.query((itemId ? updateOrderItemsQuery : insertOrderItemsQuery), [orderId, key, value]);
        }
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// update an order ref_number
app.put('/orders/:orderId', async (req, res) => {

    try {
        const { orderId } = req.params;
        const { refNumber } = req.body;
        const updateOrderQuery = `update orders set ref_number = '${refNumber}' where order_id = ${orderId};`
        await pool.query(updateOrderQuery);
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// update an orders item record
app.put('/orders/item/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { qtyReceived, itemId } = req.body;
        const updateQtyReceivedQuery = `
        update orders_item
        set qty_received = ${qtyReceived}
        where order_id = ${orderId} and item_id = ${itemId};
        `
        await pool.query(updateQtyReceivedQuery);
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// receive all items in an order
app.put('/orders/receive/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const receiveAllQuery = `
        update orders_item
        set qty_received = qty_ordered
        where order_id = ${orderId};
        `
        await pool.query(receiveAllQuery);
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// delete an order
app.delete('/orders', async (req, res) => {
    try {
        const { checkedOrders } = req.body;
        const deleteOrderQuery = `delete from orders where order_id = $1;`
        for (let orderId of checkedOrders) {
            await pool.query(deleteOrderQuery, [orderId]);
        }
        res.json();
    } catch (error) {
        console.log(error.message);
    }
});

// catch all statement
app.get('*', (req, res) => {
    res.sendFile('./client/build/index.html');
});

app.listen(PORT);