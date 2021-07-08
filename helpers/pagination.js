const mongoose = require("mongoose");


module.exports = function paginatedResults(model,id) {
    return async (req, res, next) => {
        if(!mongoose.isValidObjectId(req.params.userId)){
            return res.status(400).json({message:"Invalid User Id"});
        }
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {}

        // if (endIndex < await model.countDocuments({userId:req.params.userId}).exec()){
        //     results.next = {
        //         page : page+1,
        //         limit:limit
        //     }
        // }

        // if (startIndex>0){
        //     results.previous = {
        //         page:page-1,
        //         limit:limit
        //     }
        // }

        try {
            results.results = await model.find({userId:req.params.userId}).limit(limit).skip(startIndex).exec();
            res.paginatedResults = results;
            next()
        } catch (e) {
            res.status(500).json({message:e.message});
        }
    }
}