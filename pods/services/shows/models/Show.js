const mongoose = require("mongoose")

const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const ShowSchema = mongoose.Schema({
    ShowId: {
        type: String,
        required: true,
    },
    Name: {
        type: String,
        required: true
    },
    UserId: {
        type:String,
        required: true
    },
    ChannelId: {
        type:String,
        required: true
    },
    Followers: [
        {
            userId: {
                type: String,
                unique: true
            }
        }
    ]
}, opts)

const Show = mongoose.model("Show", ShowSchema)

module.exports = Show;