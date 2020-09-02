create database InventoryManagement;

create table item(
    item_id serial primary key,
    description varchar(50) unique not null,
    price numeric(12, 2) not null
);

create table orders(
    order_id serial primary key,
    ref_number varchar(50) unique not null
);

create table orders_item(
    order_id integer references orders on delete cascade,
    item_id integer references item on delete cascade,
    qty_received integer not null,
    qty_ordered integer not null,
    primary key (order_id, item_id)
);