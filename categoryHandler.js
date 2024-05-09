const dbm = require("./databaseManager");
const itemHandler = require("./itemHandler");



module.exports =
{
    createCategory: async function(app, req, res) {

        try {
            const {name} = req.body;
            if(!name || typeof name !== 'string')
                return res.status(400).json({error: 'Invalid category name'})
            
            // If the item exists, perform an update operation
            const result = await dbm.addCategory(name);
                
            // Return the result to the client
            if (result.success) {
                res.status(200).json({ message: result.message });
            } else {
                res.status(500).json({ error: result.message });
            }


        } catch(err){
            console.error(`Error @ categoryHandler.js::createCategory: ${err}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getCategoryById: async function(app, req, res) {
        const categoryId = parseInt(req.params.id);
        try {
            console.log(categoryId);
            if (isNaN(categoryId) || categoryId <= 0) {
                return res.status(400).json({ success: false, code: 400, message: 'Invalid input: categoryId must be a positive integer' });
            }

            const category = await dbm.getCategoryById(categoryId);
            if(!category){
                return res.status(404).json({ success: false, code: 404, message: 'Category not found' });
            }

            const items = await dbm.getItemsByCategory(categoryId);
            let itemData = {}
            if(items) {
                itemData = await itemHandler.itemListAsData(items);
            }
            
            const responseData = {
                id: category.id,
                name: category.name,
                items: itemData
            };
                
            res.status(200).json({ success: true, code: 200, data: responseData });

        } catch(err) {
            console.error('Error retrieving category - categoryId: '+categoryId, err);
            res.status(500).json({ success: false, code: 500, message: 'Internal Server Error' });
        }

    }

}