const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageDataSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    dict_of_vars: {
        type: Map,
        of: Schema.Types.Mixed,
        required: true
    }
});

const ImageData = mongoose.model('ImageData', ImageDataSchema);

module.exports = ImageData;