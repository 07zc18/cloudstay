const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    service: 'room-service',
    port: 3002
  })
);


// Database connection
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'cloudstay_db',
});


// ================================
// Get all rooms
// ================================
app.get('/api/rooms', async (req, res) => {

  try {

    const [rows] = await db.query(
      'SELECT * FROM rooms'
    );

    res.json(rows);

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

});


// ================================
// Get room by ID
// ================================
app.get('/api/rooms/:id', async(req,res)=>{

  try{

    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id=?',
      [req.params.id]
    );


    if(rows.length === 0){
      return res.status(404).json({
        message:"Room not found"
      });
    }


    res.json(rows[0]);


  }catch(error){

    res.status(500).json({
      error:error.message
    });

  }

});


// ================================
// Search rooms by type/category
// ================================
app.get('/api/rooms/type/:type', async(req,res)=>{

  try{

    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE room_type=?',
      [req.params.type]
    );

    res.json(rows);

  }catch(error){

    res.status(500).json({
      error:error.message
    });

  }

});



const PORT = process.env.PORT || 3002;


app.listen(PORT,()=>{

 console.log(
  `[room-service] Running on http://localhost:${PORT}`
 );

});