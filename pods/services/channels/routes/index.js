const _channel = require("express").Router()
const Channel = require("../models/Channel")
const mongoose = require("mongoose")
const {
    v4: uuidv4
} = require('uuid');

_channel.get("/all/:page/:per_page", async (req, res) => {
    const channels = await Channel.find().select({
        Name: 1,
        Subscribers: 1,
        Members: 1
    })
    res.json(await paginator(channels, req.params.page, req.params.per_page))
})

_channel.get("/:id", async (req, res) => {
    const channel = await Channel.findOne({
        ChannelId: req.params.id
    }).select({
        Name: 1,
        Subscribers: 1,
        Members: 1
    })
    res.json(channel)
})

_channel.get("/u/my", async (req, res) => {
    const channels = await Channel.find({UserId: req.user.UserId}).select({Name: 1})
    res.json(channels)
})

_channel.post("/new", async (req, res) => {
    var channel = req.body

    channel["ChannelId"] = uuidv4();
    channel["UserId"] = req.user.UserId

    const newChannel = new Channel(channel)
    await newChannel.save()
    res.json(channel)
})

_channel.put("/subscribe/:id", async (req, res) => {
    const subscriber = {userId: req.user.UserId};
    const ChannelId = req.params.id
    await Channel.findOneAndUpdate({ChannelId}, {$push: { Subscribers: subscriber }})
    res.sendStatus(200)
})

_channel.patch("/update/:id", async (req, res) => {
    const ChannelId = req.params.id;
    const updates = req.body;

    const channel = await Channel.findOne({ChannelId}).select({Name: 1, UserId: 1})

    if(channel.UserId != req.user.UserId) return res.sendStatus(403)

    await Object.keys(updates).forEach(key => channel[key] = updates[key])

    channel.save()

    res.sendStatus(200)
})

_channel.get("/subscribers/count/:id", async (req, res) => {
    const ChannelId = req.params.id
    const {Subscribers: subscribers} = await Channel.findOne({ChannelId}).select({Subscribers: 1})
    const count = subscribers.length;
    res.send(count.toString())
})

function paginator(items, page, per_page) {

    var page = page || 1,
        per_page = per_page || 10,
        offset = (page - 1) * per_page,

        paginatedItems = items.slice(offset).slice(0, per_page),
        total_pages = Math.ceil(items.length / per_page);
    return {
        page: page,
        per_page: per_page,
        pre_page: page - 1 ? page - 1 : null,
        next_page: (total_pages > page) ? page + 1 : null,
        total: items.length,
        total_pages: total_pages,
        data: paginatedItems
    };
}

module.exports = _channel;