const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
const { text } = require('body-parser');

//Init Nexmo

const nexmo = new Nexmo({
    apiKey: 'Your Api key',
    apiSecret: 'your api secret'
}, {debug:true});

// Init App
const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Index route

app.get('/',(req,res)=>{
    res.render('index');
});

// catch from submit 

app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const { number, text } = req.body;
  
    nexmo.message.sendSms(
      'Your number, use 91 for India', number, text, { type: 'unicode' },
      (err, responseData) => {
        if(err) {
          console.log(err);
        } else {
          const { messages } = responseData;
          const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
          console.dir(responseData);
          // Get data from response
          const data = {
            id,
            number,
            error
          };
  
          // Emit to the client
          io.emit('smsStatus', data);
        }
      }
    );
  });

//Define Port

const port = 3000;

//Start server
const server = app.listen(port, ()=> console.log(`Server started on port ${port}`));

// connect to socket.io

const io = socketio(server);
io.on('connection',(socket)=>{
    console.log('Connected');
    io.on('disconnected',()=>{
        console.log('Disconnect');
    })
})