var io;

var role = {
  teacher: 't',
  student: 's'
}

var socketCommand = {
  "join": "join"
}

var clients = [];
var gameInfo = {
  "scene": "1"
};

// var commandMapping = {
//   "MOVE": {
//     "s": {
//       to: 't',
//       callback: (user, data, emitLogic) => {
//         emitLogic({
//           name: user.name,
//           position: data.value
//         })
//       }
//     }
//   },
//   "SCENE": {
//     "t": {
//       to: 's',
//       callback: (user, data, emitLogic) => {
//         console.log("get from t SCENE", data);
//         gameInfo.scene = data.name;
//         emitLogic(data);
//       }
//     }
//   },
//   "SCENE2": {
//     "t": {
//       to: 's',
//       callback: defaultEmitLogic,
//     }
//   }
// }

function defaultEmitLogic(user, data, emitLogic) {
  emitLogic(data);
}

function getUser(socket) {
  for (let i = 0; i < clients.length; i++) {
    if (socket == clients[i].socket)
      return clients[i].user;
  }
  return undefined;
}

function removeUser(socket) {
  for (let i = clients.length - 1; i >= 0; i--) {
    if (socket == clients[i].socket) {
      clients.splice(i, 1);
      return;
    }
  }
}

function containsSocket(socket) {
  for (let i = clients.length - 1; i >= 0; i--) {
    if (socket == clients[i].socket) {
      return true;
    }
  }
  return false;
}

function printInfo() {
  console.log("------print info--------");
  for (let i = clients.length - 1; i >= 0; i--) {
    console.log(clients[i].user);
  }
  console.log("--------------------");
}

function init(server) {
  io = require('socket.io').listen(server);
  io.on("connection", socket => {
    console.log('connected');

    socket.on("JOIN", data => {
      console.log('JOIN', data);
      printInfo();
      if (containsSocket(socket)) return;
      clients.push({
        socket: socket,
        user: data
      });
      socket.join(data.role);
      console.log('JOINED ', data.role);
      printInfo();
      // console.log('JOIN', data.name, clients.length);
      if (data.role == role.student) {
        socket.to(role.teacher).emit('JOIN', data);
        socket.emit('JOIN', gameInfo);
      } else {
        let users = [];
        for (let i = clients.length - 1; i >= 0; i--) {
          if (clients[i].user.role == role.student) {
            users.push(clients[i].user);
          }
        }
        socket.emit('USERS', {
          users: users
        });
      }
    });

    socket.on("CHECK", data => {
      if (containsSocket(socket)) return;
      console.log("CHECKED");
      socket.emit('CHECK', gameInfo);
    });

    socket.on("E", data => {
      var currentUser = getUser(socket);
      if (!currentUser) {
        return;
      }
      let r = currentUser.role;
      console.log("EVENT", data);
      let eventName = data.name;
      if (eventName == "SCENE") {
        gameInfo.scene = data.data.name;
      }
      let targetR = r == role.teacher ? role.student : role.teacher;
      socket.to(targetR).emit('E', data);
      // socket.to(r).emit('E', data);
      // socket.emit('E', data);
    });

    // for (let k in commandMapping) {
    //   // console.log('registering ', k);
    //   socket.on(k, receivedData => {
    //     console.log(k, receivedData);
    //     var currentUser = getUser(socket);
    //     if (!currentUser) {
    //       // socket.emit('INFO');
    //       return;
    //     }
    //     let role = currentUser.role;
    //     commandInfo = commandMapping[k][role];
    //     if (!commandInfo) return;
    //     callback = commandInfo.callback;
    //     if (!callback) return;
    //     callback(currentUser, receivedData, data => {
    //       let to = commandInfo.to;
    //       if (to == 'all') {
    //         for (let i = 0; i < clients.length; i++) {
    //           socket.emit(k, data);
    //         }
    //       } else if (['t', 's'].indexOf(to) > -1) {
    //         for (let i = 0; i < clients.length; i++) {
    //           if (to == clients[i].user.role)
    //             clients[i].socket.emit(k, data);
    //         }
    //       }
    //     });
    //   });
    // }

    socket.on("disconnect", () => {
      let user = getUser(socket);
      if (user) {
        console.log(user.name, " has disconnected");
        if (user.role == role.student)
          socket.to(role.teacher).emit('LEAVE', user);
      } else
        console.log("disconnected");
      removeUser(socket);
      printInfo();
    });
    printInfo();
  })
}




module.exports = {
  init: init
}