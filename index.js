require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

// middleware
const corsOptions = {
    origin: ['https://lifenest-cac1e.web.app', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const salahCollection = client.db("LefeNest").collection("salah-info");
    const goalsCollection = client.db("LefeNest").collection("goal-info");
  


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

    app.get("/salah-data/today", async (req, res) => {
        const { email, date } = req.query;
        const salahEntry = await salahCollection.findOne({ email, date });
        if (salahEntry) {
          res.json({ exists: true, salahData: salahEntry.salahData });
        } else {
          res.json({ exists: false });
        }
      });

      
// POST daily goals
app.post("/daily-goals", async (req, res) => {
    const { email, date, goals } = req.body;
  
    const exist = await goalsCollection.findOne({ email, date });
    if (exist) {
      return res.status(409).send({ message: "Already submitted goals today." });
    }
  
    const result = await goalsCollection.insertOne({ email, date, goals });
    res.send(result);
  });
  
  // GET daily goals
  app.get("/daily-goals", async (req, res) => {
    const { email, date } = req.query;
    const result = await goalsCollection.findOne({ email, date });
    res.send(result || {});
  });
  
  
      


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