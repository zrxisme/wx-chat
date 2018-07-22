var wilddog = require('../../util/wilddog-weapp-all.js')
const dataTime = require("../../common/js/date.js")
var config = {
  syncURL: 'https://wd2253563068eogfxg.wilddogio.com',
  authDomain: 'wd2253563068eogfxg'
}
const apiUrl = "https://api.kaolaplay.com"
wilddog.initializeApp(config)
var app = getApp()
Page({
  data: {
    sTopHeight: "",
    sTop: 0,
    chatOrder: true,
    statusShow: false,
    flag: false,
    sid: 0,
    content: "",
    chatContent: [],
    orders: [],
    uid: "",
    dataFlag: false,
    viewId: "a20",
    viewHeight: 0,
    showContent: false,
    showContent2: false,
    timer: "",
    dataFlag: ""
  },
  onUnload: function () {
    app.globalData.chatId = ""

  },
  onReady: function () {
    var sid = this.data.sid
    var uid = this.data.uid
    var chatData = wilddog.sync().ref(`chat-with-${sid}-${uid}`).orderByPriority().limitToLast(500)
    var that = this

    chatData.bindAsArray(this, 'chatContent', function (err) {
      if (err != null) {
        console.log(err)
      }
    })
    chatData.on("value", function (snap) {
      var timer = setInterval(function () {
        wx.createSelectorQuery().select('#chat-ref').boundingClientRect(function (rect) {
          clearInterval(timer)
          that.setData({
            sTop: rect ? parseInt(rect.height) : 0
          })
          that.setData({
            showContent: true,
            showContent2: true
          })
        }).exec()
      }, 100)
    })
  },
  onLoad: function (options) {
    var uid = "8262306a2f77fd6c1725dd7d5698c08e7ee43a62"

    var sid = 16
    app.globalData.chatId = `chat-with-${sid}-${uid}`
    this.setData({
      seller: {
        avatar:"https://media.kaolaplay.com/user.png"
      },
      sid,
      uid
    })
    wx.setNavigationBarTitle({
      title: "实时聊天"
    })
  },
  socketControl() {
    var that = this
    var uid = this.data.uid
    var avatar = this.data.seller.avatar
    var content = this.data.content
    var sid = this.data.sid
    var loadTime = dataTime(new Date(), "MM-dd hh:mm")
    wx.getStorage({
      key: 'loadTime',
      success: function (res) {
        if (app.loadTime != res.data.loadTime) {
          wilddog.sync().ref(`chat-with-${sid}-${uid}`).push({ "time": loadTime })
          wx.setStorage({
            key: 'loadTime',
            data: {
              loadTime: app.loadTime,
            }
          })
        }
        wilddog.sync().ref(`chat-with-${sid}-${uid}`).push({ "message": content, "avatar": avatar, "uid": -1, "sid": sid, "msg": 1 });
      },
      fail: function () {
        wx.setStorage({
          key: 'loadTime',
          data: {
            loadTime: app.loadTime,
          }
        })
        wilddog.sync().ref(`chat-with-${sid}-${uid}`).push({ "message": content, "avatar": avatar, "uid": -1, "sid": sid, "msg": 1 });
      }
    })

    this.setData({
      content: ""
    })

  },

  bindReplaceInput(e) {
    var value = e.detail.value
    this.setData({
      content: value
    })
  },
  submitMessage() {
    this.socketControl()
  },
  showFlag() {
    var boo = !this.data.flag
    this.setData({
      flag: boo
    })
  },
  hideFlag() {
    this.setData({
      flag: false
    })
  },
  sendImage: function () {
    var that = this
    var uid = this.data.uid
    var sid = this.data.sid
    var avatar = this.data.seller.avatar

    wx.chooseImage({
      count: 1,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        tempFilePaths.forEach((tempFilePath) => {
          wx.uploadFile({
            url: `${apiUrl}/upload/img`,
            filePath: tempFilePath,
            name: 'file',
            formData: {
              'user': 'test'
            },
            success: function (res) {
              var data = res.data
              data = JSON.parse(data)
              var url = "http://" + data.data.url
              that.setData({
                flag: false
              })

              wilddog.sync().ref(`chat-with-${sid}-${uid}`).push({ "image": 1, "avatar": avatar, "url": url, "uid": -1, "sid": sid });

            },
            fail: function (err) {
              console.log(err)
            }
          })
        })
      }
    })
  }
})