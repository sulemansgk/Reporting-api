const express = require('express');
const router = express.Router();

// Item Model
const Item = require('../../models/Item');

router.post('/', (req, res) => {
const newItem = new ApiRequest({
token: req.body.token,
type: req.body.type
});

newItem.save().then(item => res.json(item));
});


// @route DELETE api/items/:id
// @desc Delete An Item
// @access Public

router.delete('/:id', (req, res) => {
Item.findById(req.params.id)
.then(item => item.remove().then(() => res.json({success: true})))
.catch(err => res.status(404).json({success: false}));
});

module.exports = router;