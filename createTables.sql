set FOREIGN_KEY_CHECKS = 0;
drop table if exists categories,items,items_volumes;
set FOREIGN_KEY_CHECKS = 1;

create table categories (
	id bigint not null auto_increment,
	name varchar(255) unique,

    primary key (id)
);

create table items (
	id bigint not null auto_increment,
    name varchar(255),
    price int,
    category_id bigint,

    unique(NAME),
    foreign key (category_id) references categories(id),
    primary key (id)
);

create table items_volumes (
	id bigint not null auto_increment,
	item_id bigint,
    value varchar(255),
    price decimal(10,2),

    unique(item_id,price),
    foreign key (item_id) references items(id),
    primary key (id)
);

