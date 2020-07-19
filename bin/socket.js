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
        userList.push(data)
        socket.userName = data.userName
        socket.avatar = data.avatar

        socket.emit('loginRes', {
            code: 0,
            data
        })

        // 全部广播
        io.emit('userStatusChange', {
            code: 0,
            data:{
                msg:socket.userName+'加入了群聊'
            }
        })
        console.log(userList)
        io.emit('userListChange', {
            code: 0,
            data: userList
        })
    })
    socket.on('chatMessage', data => {
        io.emit('receiveMessage', {
            code: 0,
            data: {
                msg: data.msg,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar
                }
            }
        })
    })
    socket.on('sendImage', data => {
        io.emit('receiveImage', {
            code: 0,
            data: {
                imgList:data.imgList,
                userInfo: {
                    userName: socket.userName,
                    avatar: socket.avatar
                }
            }
        })
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