import b from './b.js'
console.log(b)
var socket = io('http://localhost')
var userName, avatar

// 选择头像
$('#login_avatar li').on('click', function (e) {
  $(this).addClass('now')
    .siblings()
    .removeClass('now')
  avatar = $(this).children('img').attr('src')
})

// 点击登陆按钮
$('#loginBtn').on('click', function () {
  var val = $('#name-input').val().trim()
  if (!val || !avatar) {
    $('#warn-text').text('账号或者头像不能为空').show()
    return
  }
  $('#warn-text').hide()
  userName = val
  var params = {
    userName,
    avatar
  }
  socket.emit('login', params)
})

// 登录返回接口
socket.on('loginRes', data => {
  if (!data.code) {
    $('.login_box').hide()
    $('.container').show()
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
    var html = template('user_list_tpl', data)
    $('.user-list-box').html(html)
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
  if (!data.code) {
    var html = template('message_user', {
      data: data.data,
      currentUser: {
        userName,
        avatar
      }
    })
    $('.box-bd').append(html)
    .children(':last')
    .get(0)
    .scrollIntoView(false)
  } else {
    commonFailReq()
  }
})
socket.on('receiveImage', data => {
  if (!data.code) {
    var html = template('image_user', {
      data: data.data,
      currentUser: {
        userName,
        avatar
      }
    })
    $('.box-bd').append(html)
    // 滚动到底部
    $('.box-bd img:last').load(function() {
      $('.message-box:last')
        .get(0)
        .scrollIntoView(false, {
          behavior: 'smooth'
        })
    })
  } else {
    commonFailReq()
  }
})

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
    msg: content
  })
}

// 发送图片
$('#file').on('change',function(){
  checkIsImage(this.files)
  .then(readerFileToList)
    .then(function(uploadList){
      socket.emit('sendImage', {
        imgList: uploadList
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
