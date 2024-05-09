const cfg = require("./config").get();
const mariadb = require("mariadb");

let pool = undefined;

try
{
    pool = mariadb.createPool(
    {
        host: cfg["mysql"]["host"],
        user: cfg["mysql"]["user"],
        password: cfg["mysql"]["password"],
        port: cfg["mysql"]["port"],
        database: cfg["mysql"]["database"],
        connectionLimit: cfg["mysql"]["connection_limit"],
        acquireTimeout: cfg["mysql"]["acquire_timeout"],
        insertIdAsNumber: cfg["mysql"]["convert_to_number"],
        decimalAsNumber: cfg["mysql"]["convert_to_number"],
        bigIntAsNumber: cfg["mysql"]["convert_to_number"]
    });
}

catch(err) { }

module.exports =
{
    IsItemExists: async function(name)
    {
        try
        {
            const result = await pool.query("SELECT id FROM items WHERE name = ? ;", [name]);

            if(result.length > 0 ){
                // Item found, returning its id
                console.log(`[INFO] databaseManager.js::IsItemExists(): item is found with id of ${result[0].id}`);
                return result[0].id;
            }
            // Item not found, return 0
            console.log(`[INFO] databaseManager.js::IsItemExists(): Item not found`);
            return 0;
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::IsItemExists("${name}"): ${err}`);

            return 0;
        }
    },

    updateItem: async function(name, price, categoryId, volumes,itemId)
    {
        try
        {
            const result = await pool.query("UPDATE items SET name = ?, price = ?, category_id = ? WHERE id = ?;", [name, price, categoryId, itemId]);

            if(result.affectedRows > 0){
                this.deleteOldVolumes(itemId);
                this.addItemVolumes(itemId,volumes);
            }
            console.log(`[INFO] Updating existing item - itemID:${itemId} name: ${name}, price: ${price}, categoryId: ${categoryId}`);

            return { success: true, message: 'Successfully updated an item in the database' };
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::updateItem("${itemId}", "${name}", "${price}", "${categoryId}"): ${err}`);

            return { success: false, message: 'Database error while trying to update an item' };
        }
    },

    createItem: async function(name, price, categoryId, volumes)
    {
        try
        {
            let itemId;
            const result = await pool.query("INSERT INTO items (name, price, category_id) VALUES (?, ?, ?);", [name, price, categoryId]);

            itemId = result.insertId;

            if(itemId){
                this.addItemVolumes(itemId,volumes);
            }
            console.log(`[INFO] Adding new item: name: ${name}, price: ${price}, category_id: ${categoryId}`);

            return { success: true, message: 'Successfully added new item to the database' };
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::createItem("${name}", "${price}", "${categoryId}"): ${err}`);

            return { success: false, message: 'Database error while trying to add new item' };
        }
    },

    addItemVolumes: async function(itemId,volumes)
    {
        try {

            console.log(`[INFO] databaseManager.js::addItemVolumes Adding item volumes for item of id = ${itemId}`);

            for (const volume of volumes) {
                const volumeValues = [itemId, volume.value, volume.price];
                await pool.query("INSERT INTO items_volumes (item_id, value, price) VALUES (?, ?, ?);", volumeValues);
                console.log(`[INFO] databaseManager.js::addItemVolumes added item volume - value: ${volumeValues[1]}, price: ${volumeValues[2]}`);
            }

        } catch(err) {
            console.log(`Error @ databaseManager.js::addItemVolume("${itemId}"): ${err}`);
        }
    },

    IsCategoryExists: async function(id)
    {
        try
        {
            const result = await pool.query("SELECT COUNT(*) num FROM categories WHERE id = ? ;", [id]);

            console.log(`[INFO] databaseManager.js::IsCategoryExists(): ${result[0]["num"]}`);
            
            return result[0]["num"] > 0;
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::IsCategoryExists("${id}"): ${err}`);

            return false;
        }
    },

    updateItemVolumes: async function(itemId,volumes)
    {
        try
        {
            const volumeValues = volumes.map(volume => [itemId, volume.value, volume.price]);
            const result = await pool.query("INSERT INTO items_volumes (item_id, value, price) VALUES ?;", [volumeValues]);

            console.log(`[INFO] databaseManager.js::addItemVolumes ${result.affectedRows} item volumes for item ID ${itemId}`);
            
            return result[0];
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::addItemVolume("${username}"): ${err}`);

            return undefined;
        }
    },

    deleteOldVolumes: async function(itemId)
    {
        try
        {
            // Delete existing volumes associated with the itemId
            await pool.query("DELETE FROM items_volumes WHERE item_id = ?;", [itemId]);
    
            console.log(`[INFO] databaseManager.js::deleteOldVolumes( itemId = ${itemId} )`);
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::deleteOldVolumes(${itemId}): ${err}`);
        }
    },

    addCategory: async function(name)
    {
        try
        {
            await pool.query("INSERT INTO categories (name) VALUES (?);", [name]);

            console.log(`[INFO] Adding new category: name: ${name}`);

            return { success: true, message: 'Successfully added new category to the database' };
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::addCategory("${name}"): ${err}`);

            return { success: false, message: 'Failed to add new category to the database' };
        }
    },

    getAllItems: async function()
    {
        try {
            const items = await pool.query('SELECT * FROM items');
            return items;
        } catch (err) {
            console.log(`Error @ databaseManager.js::getAllItems(): ${err}`);
            return undefined;
        }
    },

    getItemVolumes: async function(itemId)
    {
        try {
            const volumes = await pool.query('SELECT * FROM items_volumes WHERE item_id = ?', [itemId]);
            return volumes;
        } catch (err) {
            console.log(`Error @ databaseManager.js::getItemVolumes("${itemId}"): ${err}`);
            return undefined;
        }
    },

    getItemById: async function(itemId)
    {
        try {
            const result = await pool.query('SELECT * FROM items WHERE id = ?', [itemId]);


            if(result.length > 0 ){
                // Item found, returning its id
                console.log(`[INFO] databaseManager.js::getItemById("${itemId}"): item is found`);
                return result[0];
            }
            // Item not found, return 0
            console.log(`[INFO] databaseManager.js::getItemById("${itemId}"): Item not found`);
            return undefined;

            return item;
        } catch (err) {
            console.log(`Error @ databaseManager.js::getItemById("${itemId}"): ${err}`);
            return undefined;
        }
    },

    getElementsByName: async function(name,tableName)
    {
        try
        {
            const result = await pool.query(`SELECT * FROM ${tableName} WHERE name LIKE ?`, [`%${name}%`]);

            if(result.length > 0 ){
                console.log(`[INFO] databaseManager.js::getElementsByName("${name}","${tableName}"): Found elements`);
                return result;
            }
            
            console.log(`[INFO] databaseManager.js::getElementsByName("${name}","${tableName}"): Not found elements`);
            return {};
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::getElementsByName("${name}","${tableName}"): ${err}`);

            return {};
        }
    },

    getCategoryById: async function(categoryId)
    {
        try
        {
            const result = await pool.query("SELECT id FROM categories WHERE id = ? ;", [categoryId]);

            if(result.length > 0 ){
                // Item found, returning its id
                console.log(`[INFO] databaseManager.js::getCategoryById(): category is found with id of ${categoryId}`);
                return result[0];
            }
            // Item not found, return 0
            console.log(`[INFO] databaseManager.js::IsItemExists(): Item not found`);
            return undefined;
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::getCategoryById("${categoryId}"): ${err}`);

            return undefined;
        }
    },

    getItemsByCategory: async function(categoryId)
    {
        try
        {
            const result = await pool.query(`SELECT * FROM items WHERE category_id = ?`, [categoryId]);

            if(result.length > 0 ){
                console.log(`[INFO] databaseManager.js::getItemsByCategory("${categoryId}"): Found items`);
                return result;
            }
            
            console.log(`[INFO] databaseManager.js::getItemsByCategory("${categoryId}"): Not found items`);
            return undefined;
        }

        catch(err)
        {
            console.log(`Error @ databaseManager.js::getItemsByCategory("${categoryId}"): ${err}`);

            return undefined;
        }
    },

};