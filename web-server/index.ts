import cors from 'cors'
import express from 'express'
import {CONFIG} from "./config";
import {BilletWebApi} from "./billetweb/api";

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => res.send('🏠'))

app.get('/sponsors', async (req, res) => {
    let attendees = await BilletWebApi.getSponsors();
    res.send(attendees)
})


const PORT = 8080
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`))
