import express from 'express';
import { MongoClient } from 'mongodb';
const app = express();
const port = 3005;
import { configDotenv } from 'dotenv';
configDotenv();
const uri = process.env.Mongo_url;
const databaseName = 'Hotels'
const collectionName = 'Hotel'

app.get('/',async(req,res)=>{
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const hotels = await collection.find({}).toArray();
        res.status(200).json({
            success: true,
            data: hotels
        })
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        })
    }finally{
        await client.close();
    }
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});