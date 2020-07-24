var https = require('https');
var http = require('http');
var server = require('./socket')
var fs = require('fs');
var path = require('path');
var app = require('../app');
const {
    use
} = require('../routes');

// 第一步：https
const credentials = {
    key: fs.readFileSync(path.resolve(__dirname, './https/fengfengyou.cn.key')),
    cert: fs.readFileSync(path.resolve(__dirname, './https/fengfengyou.cn_bundle.crt'))
}
var httpsServer = https.createServer(credentials, app);

const userList = []

// 第二步：http
var httpServer = http.createServer(app)

var io = require('socket.io')(httpServer)
io.on('connection', function (socket) {
    // 监听登录事件
    socket.on('login', data => {
        const user = userList.find(e => e.userName === data.userName)
        if (user) {
            socket.emit('loginRes', {
                code: -1,
                msg: '已登录，请勿重复登录'
            })
            return
        }
        socket.userName = data.userName
        socket.avatar = data.avatar
        let userInfo = {
            ...data,
            socketId: socket.id
        }
        userList.push( userInfo )

        socket.emit('loginRes', {
            code: 0,
            data: userInfo
        })

        // 全部广播
        io.emit('userStatusChange', {
            code: 0,
            data:{
                msg:socket.userName+'加入了群聊'
            }
        })
        io.emit('userListChange', {
            code: 0,
            data: userList
        })
    })
    // type: 0-文字消息，1-图片消息
    socket.on('chatMessage', data => {
        if(data.socketId){
          socket.emit('receiveMessage', {
            code: 0,
            data: {
              socketId: data.socketId,
              msg: data.msg,
              type: 0,
              userInfo: {
                  userName: socket.userName,
                  avatar: socket.avatar,
                  userSocketId: socket.id
              }
            }
          })
          const toIo = io.sockets.sockets[data.socketId]
          toIo.emit('receiveMessage', {
            code: 0,
            data: {
                socketId: socket.id,
                msg: data.msg,
                type: 0,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar,
                    userSocketId: socket.id
                }
            }
          })
        }else{
          io.emit('receiveMessage', {
            code: 0,
            data: {
                msg: data.msg,
                type: 0,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar,
                    userSocketId: socket.id
                }
            }
          })
        }
        
    })
    socket.on('sendImage', data => {
        console.log('来饿了', data.socketId)
        if(data.socketId){
          socket.emit('receiveMessage', {
            code: 0,
            data: {
                socketId: data.socketId,
                imgList:data.imgList,
                type: 1,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar,
                    userSocketId: socket.id
                }
            }
          })
          const toIo = io.sockets.sockets[data.socketId]
          toIo.emit('receiveMessage', {
              code: 0,
              data: {
                  socketId: socket.id,
                  imgList:data.imgList,
                  type: 1,
                  userInfo: {
                      userName: socket.userName,
                      avatar: socket.avatar,
                      userSocketId: socket.id
                  }
              }
          })
        }else{
          io.emit('receiveMessage', {
            code: 0,
            data: {
                imgList:data.imgList,
                type: 1,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar,
                    userSocketId: socket.id
                }
            }
          })
        }
    })
    socket.on('disconnect', () => {
        const user = userList.findIndex(e => e.userName === socket.userName)
        if(user===-1) return
        userList.splice(user, 1)
        io.emit('userListChange', {
            code: 0,
            data: userList
        })
        // 用户状态变化
        io.emit('userStatusChange', {
            code: 0,
            data:{
                msg:socket.userName+'离开了群聊'
            }
        })
    })
})

module.exports = {
    httpsServer,
    httpServer
}