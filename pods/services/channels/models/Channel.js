const mongoose = require("mongoose")

const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const ChannelSchema = mongoose.Schema({
    ChannelId: {
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
    Subscribers: [
        {
            userId: {
                type: String,
                unique: true
            }
        }
    ],
    Members: [
        {
            userId: {
                type: String,
                unique: true
            },
            plan: {
                type: String
            }
        }
    ]
}, opts)

const Channel = mongoose.model("Channel", ChannelSchema)

module.exports = Channel;