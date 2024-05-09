const dbm = require("./databaseManager");

// Function to validate each volume object and extract data
function validateAndExtractVolumes(volumes) {
    const formattedVolumes = [];
    const priceMap = new Map(); // Map to track unique prices for each item ID

    for (const volume of volumes) {
        const value = volume.value;
    const price = volume.price;

    if (!value || typeof value !== 'string' || !price || typeof price !== 'number') {
        return null; // Invalid volume object
    }

    let entries, months;
    if (value.includes('entries')) {
        entries = parseInt(value.split(' ')[1]);
    } else if (value.includes('months')) {
        months = parseInt(value.split(' ')[1]);
    }else{
        return null;
    }

    // Check if the price for this item ID is unique
    if (priceMap.has(price)) {
        return null; // Price is not unique
    } else {
        priceMap.set(price, true); // Mark price as seen for this item ID
    }

    formattedVolumes.push({ value, price, entries, months });
    }

    return formattedVolumes;
}

async function getItemDetails(query,res) {

    const itemId = parseInt(query);
    try {

        if (isNaN(itemId) || itemId <= 0) {
            return res.status(400).json({ success: false, code: 400, message: 'Invalid input: itemId must be a positive integer' });
        }

        const item = await dbm.getItemById(itemId);
        if(!item){
            return res.status(404).json({ success: false, code: 404, message: 'Item not found' });
        }

        const volumes = await dbm.getItemVolumes(itemId);
        
        const responseData = {
            id: item.id,
            name: item.name,
            volumes: volumes.map(volume => ({
                value: volume.value,
                price: volume.price
            }))
        };
            
        res.status(200).json({ success: true, code: 200, data: responseData });

    } catch(err) {
        console.error('Error retrieving item - itemId: '+itemId, err);
        res.status(500).json({ success: false, code: 500, message: 'Internal Server Error' });
    }
    
}

async function searchItemsAndCategories(query,res) {
    try {
        const name = query;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ success: false, code: 400, message: 'Invalid input: name is required and must be a non-empty string' });
        }

        const items = await dbm.getElementsByName(name,"items");
        const categories = await dbm.getElementsByName(name,"categories");

        let responseData = {};

        if (categories.length === 0 && items.length === 0) {
            responseData = { message: 'No categories or items found for the given search term' };
        } else {
            responseData = {
                categories: categories,
                items: items
            };
        }

        res.status(200).json({ success: true, code: 200, data: responseData });

    } catch(err) {
        console.error('Error searching items and categories:', err);
        res.status(500).json({ success: false, code: 500, message: 'Internal Server Error' });
    }
}




module.exports =
{
    createOrUpdateItem: async function(app, req, res) {
        try {
            const { name, price, categoryId, volumes } = req.body;

            // Check if required fields are provided
            // Perform validation
            if (!name || !price || !categoryId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const catExists = await dbm.IsCategoryExists(categoryId);
            
            if (!catExists) {
                return res.status(400).json({ error: 'Item must be related to an existing category' });
            }

            if (!volumes || volumes.length === 0) {
                return res.status(400).json({ error: 'At least one item volume must be provided' });
            }

            // Validate each volume object and convert data to the appropriate format
            const formattedVolumes = validateAndExtractVolumes(volumes);

            if (!formattedVolumes) {
                return res.status(400).json({ error: 'Invalid volume object' });
            }

            // Check if the item already exists by name
            const itemExistsId = await dbm.IsItemExists(name);

            if (itemExistsId != 0) {
                // If the item exists, perform an update operation
                const result = await dbm.updateItem(name, price, categoryId, volumes,itemExistsId);
                
                // Return the result to the client
                if (result.success) {
                    res.status(200).json({ message: result.message });
                } else {
                    res.status(500).json({ error: result.message });
                }
            } else {
                // If the item does not exist, perform an insert operation
                const result = await dbm.createItem(name, price, categoryId, volumes);

                // Return the result to the client
                if (result.success) {
                    res.status(200).json({ message: result.message });
                } else {
                    res.status(500).json({ error: result.message });
                }
            }
        } catch(err) {
            console.error(`Error @ itemHandler.js::createOrUpdateItem: ${err}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getItems: async function(app, req, res) {
        try {
            
            // Fetch all items from the database
            const items = await dbm.getAllItems();
    
            if (items.length === 0) {
                // If there are no items in the database, return a 404 Not Found response
                return res.status(404).json({ success: false, code: 404, message: 'No items found' });
            }
    
            // Construct the response object with the retrieved items and their volumes
            const responseData = await this.itemListAsData(items);
    
            // Send the response with the item details
            res.status(200).json({ success: true, code: 200, data: responseData });
        } catch (error) {
            // If an error occurs during the retrieval of items, return a 500 Internal Server Error response
            console.error('Error retrieving items:', error);
            res.status(500).json({ success: false, code: 500, message: 'Internal Server Error' });
        }
    },

    queryItems: async function(app, req, res){
        
        const query = req.params.query;
        if (!isNaN(query)) {
            return getItemDetails(query,res)
        } else {
            return searchItemsAndCategories(query,res)
        }
    
    },

    itemListAsData: async function(items) {
    
        const responseData = await Promise.all(items.map(async item => {
            const volumes = await dbm.getItemVolumes(item.id);
            return {
                id: item.id,
                name: item.name,
                volumes: volumes.map(volume => ({
                    value: volume.value,
                    price: volume.price
                }))
            };
        }));
        
        return responseData;
    }
}