// index.js
const blessings = require('../../utils/blessings.js')

Page({
  data: {
    name: '',
    blessing: null,
    isGenerating: false,
    blessingLines: []
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 监听输入框变化
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 生成祝福语
  async generateBlessing() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({
        title: '请输入您的名字',
        icon: 'none'
      })
      return
    }

    if (name.length < 2 || name.length > 4) {
      wx.showToast({
        title: '请输入2-4个字的名字',
        icon: 'none'
      })
      return
    }

    this.setData({
      isGenerating: true,
      blessing: null,
      blessingLines: []
    })

    try {
      wx.showLoading({
        title: '正在生成祝福...',
        mask: true
      })

      const blessing = await blessings.generateBlessing(name)
      console.log('生成的祝福:', blessing)

      // 将诗句按照每两句一组进行分组
      const lines = blessing.lines
      const groupedLines = []
      for (let i = 0; i < lines.length; i += 2) {
        groupedLines.push([
          lines[i],
          i + 1 < lines.length ? lines[i + 1] : null
        ])
      }

      this.setData({
        blessing,
        blessingLines: groupedLines,
        isGenerating: false
      })

      wx.hideLoading()
    } catch (error) {
      console.error('生成祝福失败:', error)
      
      wx.hideLoading()
      
      // 使用备用方案
      const fallbackBlessing = {
        lines: [
          `${name}新年好，万事皆如意。`,
          `事业步步高，生活更美丽。`
        ]
      }

      const groupedLines = [
        [fallbackBlessing.lines[0], fallbackBlessing.lines[1]]
      ]

      this.setData({
        blessing: fallbackBlessing,
        blessingLines: groupedLines,
        isGenerating: false
      })

      wx.showToast({
        title: '生成个性化祝福失败，已使用备用祝福',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '藏头诗送祝福',
      path: '/pages/index/index'
    }
  }
})
