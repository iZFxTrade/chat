// Setup up Chatbot
require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");
const { getImage, getChat } = require("./Helper/functions");
const { Telegraf } = require("telegraf");

const configuration = new Configuration({
  apiKey: process.env.API,
});
const openai = new OpenAIApi(configuration);
module.exports = openai;

const bot = new Telegraf(process.env.TG_API);
bot.start((ctx) => ctx.reply("Chào Ku! muốn hỏi gì?"));

bot.help((ctx) => {
  ctx.reply(
    "Một số lệnh để sử dụng \n /img -> tạo hình ảnh từ text \n /ask -> hỏi cái gì cũng biết "
  );
});

// Chat command

bot.command("ask", async (ctx) => {
  const text = ctx.message.text?.replace("/ask", "")?.trim().toLowerCase();

  if (text) {
    ctx.sendChatAction("typing");
    const res = await getChat(text);
    if (res) {
      ctx.telegram.sendMessage(ctx.message.chat.id, res, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } else {
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      "hỏi gì cũng được sau lệnh /ask",
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );

    //  reply("Please ask anything after /ask");
  }
});

// Image command
bot.command("img", async (ctx) => {
  const text = ctx.message.text?.replace("/img", "")?.trim().toLowerCase();

  if (text) {

    const res = await getImage(text);

    if (res) {
      ctx.sendChatAction("upload_photo");
      // ctx.sendPhoto(res);
      // ctx.telegram.sendPhoto()
      ctx.telegram.sendPhoto(ctx.message.chat.id, res, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } else {
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      "nhập nội dung hình ảnh yêu cầu sau /img",
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
});
// khoi chay chat bot
bot.launch();
//================================================//

// Setup basic express server
//const express = require('express');
//const app = express();
//const path = require('path');
//const server = require('http').createServer(app);
//const io = require('socket.io')(server);
const io = require('socket.io')();
const port = process.env.PORT || 3000;
const rooms = io.sockets.adapter.rooms;
const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
io.listen(port);

/* server.listen(port, () => {
  console.log('Server listening at port %d', port);

}); */

// Routing
//app.use(express.static(path.join(__dirname, 'public')));
let numUsers = 0;
io.on('connection', (socket) => {
  let addedUser = false;
  const users = {}; // Lưu trữ các user đã kết nối với socket

  // Chatroom
  // Tạo namespace và lắng nghe kết nối đến các namespace tương ứng với từng room
  const saleNamespace = io.of('/sale');
  saleNamespace.on('connection', (socket) => {
    console.log(`User ${socket.id} connected to room Sale`);

    // Lưu thông tin user vào object users với key là socket.id và value là username
    const { id } = socket;
    const { username } = socket.handshake.query;
    users[id] = username;

    // In danh sách user trong room
    const clients = Object.keys(saleNamespace.connected).map((socketId) => ({
      id: socketId,
      username: users[socketId],
    }));
    console.log(`Users in room Sale: `, clients);
  });

  const marketingNamespace = io.of('/marketing');
  marketingNamespace.on('connection', (socket) => {
    console.log(`User ${socket.id} connected to room Marketing`);

    const { id } = socket;
    const { username } = socket.handshake.query;
    users[id] = username;

    const clients = Object.keys(marketingNamespace.connected).map((socketId) => ({
      id: socketId,
      username: users[socketId],
    }));
    console.log(`Users in room Marketing: `, clients);
  });

  const cskhNamespace = io.of('/cskh');
  cskhNamespace.on('connection', (socket) => {
    console.log(`User ${socket.id} connected to room CSKH`);

    const { id } = socket;
    const { username } = socket.handshake.query;
    users[id] = username;

    const clients = Object.keys(cskhNamespace.connected).map((socketId) => ({
      id: socketId,
      username: users[socketId],
    }));
    console.log(`Users in room CSKH: `, clients);
  });

  const ktvNamespace = io.of('/ktv');
  ktvNamespace.on('connection', (socket) => {
    console.log(`User ${socket.id} connected to room KTV`);

    const { id } = socket;
    const { username } = socket.handshake.query;
    users[id] = username;

    const clients = Object.keys(ktvNamespace.connected).map((socketId) => ({
      id: socketId,
      username: users[socketId],
    }));
    console.log(`Users in room KTV: `, clients);
  });

  const modNamespace = io.of('/mod');
  modNamespace.on('connection', (socket) => {
    console.log(`User ${socket.id} connected to room MOD`);

    const { id } = socket;
    const { username } = socket.handshake.query;
    users[id] = username;

    const clients = Object.keys(modNamespace.connected).map((socketId) => ({
      id: socketId,
      username: users[socketId],
    }));
    console.log(`Users in room MOD: `, clients);
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    //console.log('Received message %s: %s', username , data);
    const userId = data.to;
    var User;

    if (typeof data === 'string') {
      User = socket.console;
      var msg = data;
    } else if (typeof data === 'object' && data !== null && typeof data.username === 'string') {
      User = socket.console.username;
      var msg = data.message;
    } else {
      console.error('Invalid data type received:', data);
      return;
    }
    // gửi nội dung đến tất cả các user đang kết nối
    if (data.username === "All" || typeof data === 'string') {
      socket.broadcast.emit('new message', {
        username: User,
        message: msg,
      });
      console.log(rooms);
      console.log('New message to All from user', User, ': ', msg);
    }
    if (data.username === "Sale") {
      socket.join("sale");
      io.to("sale").emit("new message", "Hello from CSKH room!");
    }
    if (data.username === "Marketing") {
      socket.join("marketing");
      io.to("marketing").emit("new message", "Hello from CSKH room!");
    }
    if (data.username === "CSKH") {
      socket.join("cskh");
      io.to("cskh").emit("new message", "Hello from CSKH room!");
    }
    if (data.username === "KTV") {
      socket.join("ktv");
      io.to("ktv").emit("new message", "Hello from CSKH room!");
    }
    if (data.username === "MOD") {
      socket.join("mod");
      io.to("mod").emit("new message", "Hello from CSKH room!");
    }
    else {
      // gửi nội dung đến user đó
      socket.to(data.username).emit('new message', {
        username: User,
        message: msg,
      });
      console.log(rooms);
      console.log('New message', User, 'to', data.username, ': ', msg);
    }
    /* socket.broadcast.emit('new message', {
      username: User,
      message: msg,
    });
    console.log('New message to All from user', User, ': ', msg);
 */
    // Gửi tin nhắn cho một user duy nhất với socketId tương ứng dung 

  });
  // Lắng nghe sự kiện khi một client kết nối đến server
  io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    // Lắng nghe sự kiện chat message từ client
    socket.on('chat message', (msg) => {
      console.log('Received message:', msg);

      // Gửi tin nhắn cho một user duy nhất với socketId tương ứng
      const userId = msg.to;
      const socketId = getUserSocketId(userId); // Lấy socketId của user từ id
      if (socketId) {
        socket.to(socketId).emit('chat message', msg);
        console.log('Sent message to user', userId);
      } else {
        console.log('User not found:', userId);
      }
    });

    // ...
  });


  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.console = username;

    console.log('Adding user ', username, 'ID: ', socket.id);
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // print msg form client
  socket.on('msg_from_client', (msg) => {
    console.log('Received message:', msg, ' ID: ', socket.id);
  })

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

//===========================================//
/* 
// Add webhook endpoint
app.post('/webhook/:username', (req, res) => {
  const { username } = req.params;
  const data = req.body;
  const msg = JSON.stringify(data, null, 2);
  let text = ''; // Khởi tạo chuỗi văn bản trống để lưu trữ các cặp giá trị JSON

  for (const key in data) {
    if (data.hasOwnProperty(key)) { // Kiểm tra xem thuộc tính có phải là của đối tượng hay không
      var k = key;
      if (key === 'symbol' || key === "type") {
        k = "";
      }
      text += `${k}: ${data[key]}\n`; // Thêm cặp giá trị vào chuỗi văn bản, với mỗi giá trị nằm trên một dòng mới
    }
  }


  console.log('Noi dung Webhook: %s', data);
  io.emit('new message', {
    username,
    //message: data.message
    message: text
  });

  res.status(200).send(`Webhook received for ${username}  : ${JSON.stringify(data)}`);
});

 */