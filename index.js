const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require('path');
require('dotenv').config();


const app = express();



app.use(bodyParser.urlencoded({ extended: false })); //app.use=> mean that bodyparser use in whole project and extended mean it will contain nested json or not
app.use(bodyParser.json());
// mongodb+srv://gujjarji7838:gujjar@38@cluster2.5rm9k.mongodb.net/
// try {

mongoose.connect("mongodb+srv://deep:deep123@cluster0.bwoiy.mongodb.net/music_db", {

}).then(function () {
    // app.get("/", function (req, res) {
    //     // res.send("This is homepage ");
    //     res.json({ message: "Api worked sucessfuly" })
    // });

    console.log("mongoes connected");
    // app.use(express.json());
    // app.use(cors());
    app.use(cors());
    const fullPath = path.join(__dirname, 'uploads');
    app.use('/uploads', express.static(fullPath));


    const musicRoutes = require('./src/routes/music_routes');
    app.use('/', musicRoutes);


});
// } catch (e) {
//     console.log("mongoes connected error $e");
// }
//  console.log('MongoDB connected')).catch(err => console.error(err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
