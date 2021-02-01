var router = require("express").Router();
const axios = require('axios').default;
const banks = require('../fakers').banks;
var user = require('../Model/user');
var middleware = require('../Middleware/AuthMiddleware');

router.get('/banks', (req, res) => {
    return res.status(200).send({ status: "success", data: banks, });
})

router.post('/withdraw', middleware.authenticate, async (req, res) => {
    const { account_number, bank_code, } = req.body;
    var _user = await user.findById(req.auth.Id);
    if (req.body.amount > _user.balance) {
        return res.status(500).send({ status: false, message: "Insufficient wallet balance", });
    }
    await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(async response => {
            if (response.data && response.data.status) {
                var receipt = await transferReceipt(req.body);
                // transferReceipt(req.body).then(e => console.log(e.status))
                if (receipt && receipt.status) {
                    var tx = await initiateTransfer(Object.assign(req.body, { recipient: receipt.data.recipient_code }));
                    if (tx && tx.status) {
                        var newBal = _user.balance - req.body.amount;
                        var updated = await user.updateOne({ _id: req.auth.Id }, { balance: newBal, }, (err, balanceUpdated));
                        return res.send(tx);
                    }
                    return res.status(500).send(tx);
                }
                return res.send({ status: false, message: receipt });
            }
            return res.send({ status: false, message: response.data });
        })
        .catch(err => res.status(500).send({ status: false, message: err && err.response && err.response.data.message || "Internal server error" }))
})

function transferReceipt(data) {
    const { name, account_number, bank_code, } = data;
    let request = {
        type: "nuban",
        name,
        account_number,
        bank_code,
    }
    return axios.post(`https://api.paystack.co/transferrecipient`, request, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(response => { return response.data; })
        .catch(err => { return ({ message: err && err.response && err.response.data.message || "Internal server error" }) })
}

function initiateTransfer(data) {
    const { amount, recipient, } = data;
    let request = {
        source: "balance",
        amount: amount * 100,
        recipient,
    }
    return axios.post(`https://api.paystack.co/transfer`, request, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(response => {
            return response.data;
        })
        .catch(err => { return ({ message: err && err.response && err.response.data.message || "Internal server error" }) })
}

router.get('/account/resolve', async (req, res) => {
    const { account_number, bank_code, } = req.query;
    await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(async response => {
            return res.send(response.data);
        })
        .catch(err => res.send({ message: err && err.response && err.response.data.message || "Internal server error" }))
})

router.post('/transfer/receipt', async (req, res) => {
    const { name, account_number, bank_code, } = req.body;
    let request = {
        type: "nuban",
        name,
        account_number,
        bank_code,
    }
    await axios.post(`https://api.paystack.co/transferrecipient`, request, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(response => {
            res.send(response.data);
        })
        .catch(err => res.send({ message: err && err.response && err.response.data.message || "Internal server error" }))
})

router.post('/transfer/initiate', async (req, res) => {
    const { amount, recipient, } = req.body;
    let request = {
        source: "balance",
        amount: amount * 100,
        recipient,
    }
    await axios.post(`https://api.paystack.co/transfer`, request, {
        headers: {
            'Authorization': `Bearer ${process.env.SECKEY}`
        },
    })
        .then(response => {
            res.send(response.data)
        })
        .catch(err => res.send({ message: err && err.response && err.response.data.message || "Internal server error" }))
})

module.exports = router;