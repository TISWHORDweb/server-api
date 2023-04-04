const TransferModel = require("../models/mongoro/transaction/api");
try {
    TransferModel.aggregate([{
        $group: {
            _id: null,
            "TotalTransaction": {
                '$sum': {
                    '$convert': {'input': '$amount', 'to': 'int'},
                    '$toDate': Date.now()
                }
            }
        }
    }]).then(rt => {
        console.log(rt)
    }).catch(e => {
        console.error(e)
    })
}catch (e) {
    console.error(e)
}

