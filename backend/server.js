const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./auth');

const app = express();

const PORT = process.env.PORT || 3002;


app.use(cors());

app.use(express.json());


// Authentication routes

app.use('/api/auth', authRoutes);



// ===============================
// HEALTH CHECK
// ===============================

app.get('/health', (req, res) => {

    res.json({
        status: 'ok',
        service: 'cloudstay-room-service'
    });

});




// ===============================
// GET ALL ROOMS
// ===============================

app.get('/api/rooms', async (req,res)=>{


    try {


        const [rows] = await db.query(
            'SELECT * FROM rooms ORDER BY room_type'
        );


        res.json({

            success:true,

            data:rows

        });



    } catch(err){


        console.error(
            'Room fetch error:',
            err.message
        );


        res.status(500).json({

            success:false,

            error:'Could not load rooms'

        });


    }


});




// ===============================
// GET ROOM BY TYPE
// ===============================

app.get('/api/rooms/type/:type', async(req,res)=>{


    try{


        const [rows] = await db.query(

            'SELECT * FROM rooms WHERE room_type = ?',

            [req.params.type]

        );


        res.json({

            success:true,

            data:rows

        });



    }catch(err){


        res.status(500).json({

            success:false,

            error:err.message

        });


    }


});





app.listen(PORT,()=>{

    console.log(
        `CloudStay Room Service running on port ${PORT}`
    );

});