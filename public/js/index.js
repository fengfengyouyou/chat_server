var socket = io('http://localhost')
var currentUser = {userName:'', avatar:'', socketId:''},
activeUser
function UserMsg(){
  this.state = {

  }
}
UserMsg.prototype.addMsg = function(socketId,msg){
  if(this.state[socketId]){
    this.state[socketId].push(msg)
  }else{
    this.state[socketId] = []
    this.state[socketId].push(msg)
  }
  console.log(socketId, activeUser, msg)
  if(activeUser === socketId){
    this.loadMsg(socketId,[msg])
  }
}
UserMsg.prototype.loadMsg = function(socketId,data){
  const msgArr = data || this.state[socketId]
  // console.log(this.state,socketId)
  if(!msgArr || !msgArr.length){
    $('.box-bd').html('')
    return
  }
  var html = template('message_user', {
    data: msgArr,
    currentUser
  })
  console.log({
    data: msgArr,
    currentUser,
    html
  })
  $('.box-bd').append(html)
  .children(':last')
  .get(0)
  .scrollIntoView(false)
}
var userMsg = new UserMsg()
// 选择头像
$('#login_avatar li').on('click', function (e) {
  $(this).addClass('now')
    .siblings()
    .removeClass('now')
  currentUser.avatar = $(this).children('img').attr('src')
})

// 点击登陆按钮
$('#loginBtn').on('click', function () {
  var val = $('#name-input').val().trim()
  if (!val || !currentUser.avatar) {
    $('#warn-text').text('账号或者头像不能为空').show()
    return
  }
  $('#warn-text').hide()
  currentUser.userName = val
  socket.emit('login', currentUser)
})

// 登录返回接口
socket.on('loginRes', data => {
  if (!data.code) {
    $('.login_box').hide()
    $('.container').show()
    currentUser.socketId = data.data.socketId
    // 显示用户信息
    var html = template('user_info_tpl', data.data)
    $('.header').html(html)
  } else {
    commonFailReq()
    $('#warn-text').text(data.msg).show()
  }
})

// 用户列表发生变化
socket.on('userListChange', data => {
  if (!data.code) {
    var html = template('user_list_tpl', {data:data.data,currentUser})
    $('.user-list-box').html(html)
    $('.box-hd h3').text(`公共聊天室（${data.data.length}）`)
    // var msgBox = template('message_box',data)
    // $('.box-hd').after(msgBox)
    $('.user-list-box .user').on('click',function(e){
      const id = $(this).data('socket_id')
      if(activeUser === id){
        return
      }
      activeUser = id
      $('.user-list-box .user').removeClass('active')
      $(this).addClass('active')
      $('.box-bd').html('')
      userMsg.loadMsg(activeUser)
      // console.log(socketId)
    })
  } else {
    commonFailReq()
  }
})
// 用户状态变化
socket.on('userStatusChange', data => {
  if (!data.code) {
    var html = template('message_system', data.data)
    $('.box-bd')
    .append(html)
    .children(':last')
    .get(0)
    .scrollIntoView(false)
  } else {
    commonFailReq()
  }
})
socket.on('receiveMessage', data => {
  console.log(data)
  if (!data.code) {
    let receiveId = data.data.socketId
    userMsg.addMsg(receiveId, data.data)
    // var html = template('message_user', {
    //   data: data.data,
    //   currentUser: {
    //     userName,
    //     avatar
    //   }
    // })
    // $('.box-bd').append(html)
    // .children(':last')
    // .get(0)
    // .scrollIntoView(false)
  } else {
    commonFailReq()
  }
})
// socket.on('receiveImage', data => {
//   if (!data.code) {
//     var html = template('image_user', {
//       data: data.data,
//       currentUser
//     })
//     $('.box-bd').append(html)
//     // 滚动到底部
//     $('.box-bd img:last').load(function() {
//       $('.message-box:last')
//         .get(0)
//         .scrollIntoView(false, {
//           behavior: 'smooth'
//         })
//     })
//   } else {
//     commonFailReq()
//   }
// })

// 触发发送消息事件
$('#btn-send').on('click', function () {
  sendMsg()
})
$('#content').keydown(function (event) {
  // 监听 Ctrl + Enter 可全屏查看 
  if (event.ctrlKey && event.keyCode == 13) {
    sendMsg()
  }
});
// 发送消息
function sendMsg() {
  var content = $('#content').html()
  $('#content').html('')
  socket.emit('chatMessage', {
    socketId: activeUser,
    msg: content,
    type: 0
  })
}

// 发送图片
$('#file').on('change',function(){
  checkIsImage(this.files)
  .then(readerFileToList)
    .then(function(uploadList){
      socket.emit('sendImage', {
        socketId: activeUser,
        imgList: uploadList,
        type: 1
      })
    })

})

// 表情功能
$('#face').on('click', function() {
  $('.emoji_container').remove()
  $('#content').emoji({
    button: '#face',
    position: 'topRight',
    showTab: false,
    animation: 'slide',
    icons: [
      {
        name: "QQ表情",
        path: "lib/jquery-emoji/img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif",
        placeholder: '#qq_{alias}#',
      },
      {
        name: "emoji高清",
        path: "lib/jquery-emoji/img/emoji/",
        maxNum: 84,
        file: ".png",
      },
      {
        name: "贴吧表情",
        path: "lib/jquery-emoji/img/tieba/",
        maxNum: 50,
        file: ".jpg",
      }
    ]
  })
})


