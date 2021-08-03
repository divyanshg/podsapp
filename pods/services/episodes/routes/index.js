const _episode = require("express").Router()
const multer = require('multer');
const {
    Readable
} = require('stream');
const mongodb = require("mongodb")
const {
    v4: uuid
} = require("uuid")

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fs = require("fs")

let db;
MongoClient.connect('mongodb://divyansh:div21902@cluster0-shard-00-00.bfbrp.mongodb.net:27017,cluster0-shard-00-01.bfbrp.mongodb.net:27017,cluster0-shard-00-02.bfbrp.mongodb.net:27017/pods?ssl=true&replicaSet=atlas-emw6k4-shard-0&authSource=admin&retryWrites=true&w=majority', (err, database) => {
    if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    }
    console.log("DB CONNECTED")
    db = database;
});

_episode.get("/all/:ShowId", (req, res) => {
    res.send("ok")
})

_episode.get("/:ShowId/episode/:EpisodeId", async (req, res) => {
    const EpisodeId = req.params.EpisodeId
    const ShowId = req.params.ShowId

    const _Episode = await db.collection("episodes").findOne({
        ShowId,
        EpisodeId
    })

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');

    let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'episodes'
    });

    let downloadStream = bucket.openDownloadStream(_Episode.FileId)

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('error', () => {
        res.sendStatus(404);
    });

    downloadStream.on('end', () => {
        res.end();
    });
})

_episode.post("/new/:ShowId", (req, res) => {
    const storage = multer.memoryStorage()
    const upload = multer({
        storage: storage,
        limits: {
            fields: 1,
            fileSize: 60000000,
            files: 1,
            parts: 2
        }
    });
    upload.single('episode')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: "Upload Request Validation Failed : " + err
            });
        } else if (!req.body.name) {
            return res.status(400).json({
                message: "No episode name in request body"
            });
        }


        let Name = req.body.name
        let ShowId = req.params.ShowId
        let EpisodeId = uuid()


        // Covert buffer to Readable Stream
        const readableEpisodeStream = new Readable();
        readableEpisodeStream.push(req.file.buffer);
        readableEpisodeStream.push(null);

        let bucket = new mongodb.GridFSBucket(db, {
            bucketName: 'episodes',
            chunkSizeBytes: 25 * 1024
        });

        let uploadStream = bucket.openUploadStream(Name);
        let id = uploadStream.id;
        let episode = {
            Name,
            ShowId,
            EpisodeId,
            FileId: id
        }
        readableEpisodeStream.pipe(uploadStream);

        uploadStream.on('error', (e) => {
            return res.status(500).json({
                message: "Error uploading file : " + e
            });
        });

        uploadStream.on('finish', async () => {
            await db.collection("episodes").insertOne(episode)
                .then(info => {
                    return res.status(201).json({
                        message: "File uploaded successfully, stored under Mongo ObjectID: " + id
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        err: "We are unable to process this request at this time. Please try again later"
                    })
                })
        });

    })
})

module.exports = _episode;