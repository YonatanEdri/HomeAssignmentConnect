const fs = require("fs");
const cfg = JSON.parse(fs.readFileSync("yonaConf.json", "utf8"));

module.exports =
{
    get: function()
    {
        return cfg;
    }
};

