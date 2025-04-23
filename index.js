require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())



// mongodb database
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e1lr7.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const salahCollection = client.db("LefeNest").collection("salah-info");


    // store salah data
    app.post('/salah-data', async(req, res)=>{
        const {email, date, salahData} = req.body;
        const existData = await salahCollection.findOne({email,date});
        if(existData){
            return res.status(409).json({ message: "Salah data already recorded for today." });
        }
        const result = await salahCollection.insertOne({ email, date, salahData });
        console.log(result)
        res.send(result)
    })

    // get salah data
    app.get('/salah-data', async(req,res)=>{
        const {email} = req.query;
        const result = await salahCollection.find({email}).toArray()
        res.send(result);

    })


  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Express')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})