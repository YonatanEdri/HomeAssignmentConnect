insert into `categories` (`name`) values 
('bag'),
('hat'),
('pants'),
('glove');

insert into `items` (`name`, `price`, `category_id`) values 
('black bag','425','1'),
('red bag','483','1'),
('green bag','843','1'),
('big hat','783','2'),
('black hat','7863','2'),
('small hat','7863','2'),
('short pants','678','3'),
('long pants','684','3'),
('jeans pants','393','3'),
('soft glove','27','4'),
('work glove','676','4'),
('finger glove','732','4');

insert into `items_volumes` (`item_id`, `value`, `price`) values
('1','entries 10','545'),
('2','months 4','42'),
('3','entries 4','65'),
('4','months 2','486'),
('5','entries 6','648'),
('6','months 3','57'),
('7','entries 9','876'),
('8','months 31','77'),
('9','entries 14','42'),
('10','months 15','76'),
('11','entries 2','786'),
('12','months 6','75');