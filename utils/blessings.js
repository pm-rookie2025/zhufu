// 祝福语模板数组
const templates = [
  {
    template: "亲爱的{name}，新年的钟声即将敲响，愿你在2025年收获满满的幸福与喜悦！愿你的生活如冬日暖阳般温暖，事业如朝阳般冉冉升起，在新的一年里梦想成真，平安喜乐！",
    tags: ['温暖', '事业']
  },
  {
    template: "致{name}：元旦之际，送上我最真挚的祝福！愿新的一年里，你心想事成、万事如意，生活中处处充满欢声笑语，每一天都被幸福环绕，新年快乐！",
    tags: ['真挚', '幸福']
  },
  {
    template: "{name}，值此元旦佳节，愿你在新的一年里身体健康、工作顺心、家庭美满！愿你的每个梦想都开花结果，每个愿望都成真，新年快乐，元旦吉祥！",
    tags: ['健康', '家庭']
  },
  {
    template: "亲爱的{name}，在这辞旧迎新的美好时刻，祝愿你新的一年里事业蒸蒸日上，生活甜甜蜜蜜，愿你的笑容比冬日的阳光更加灿烂！元旦快乐！",
    tags: ['事业', '甜蜜']
  }
]

const config = require('../config.js')

// 缓存key前缀
const CACHE_KEY_PREFIX = 'blessing_cache_'

// 祝福缓存时间（24小时）
const BLESSING_CACHE_DURATION = 24 * 60 * 60 * 1000

// 生成缓存key
function generateCacheKey(name) {
  return `${CACHE_KEY_PREFIX}${name}`
}

// 获取缓存的祝福
function getCachedBlessing(name) {
  const key = generateCacheKey(name)
  try {
    const cache = wx.getStorageSync(key)
    if (cache && cache.timestamp && cache.blessing) {
      // 检查缓存是否过期
      if (Date.now() - cache.timestamp < BLESSING_CACHE_DURATION) {
        console.log('从缓存获取祝福:', cache.blessing)
        return cache.blessing
      }
      // 缓存过期，删除
      wx.removeStorageSync(key)
    }
  } catch (error) {
    console.error('读取缓存失败:', error)
  }
  return null
}

// 保存祝福到缓存
function cacheBlessing(name, blessing) {
  const key = generateCacheKey(name)
  try {
    wx.setStorageSync(key, {
      blessing,
      timestamp: Date.now()
    })
    console.log('祝福已缓存')
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

// 解析诗歌内容
function parsePoem(text) {
  console.log('开始解析诗句，原文:', text)
  
  // 移除多余的空格和换行
  text = text.trim()
  
  // 分割成行
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  console.log('分割后的行:', lines)
  
  return {
    lines: lines,
    raw: text
  }
}

// 调用扣子API生成藏头诗
async function generatePoemWithName(name) {
  console.log('开始生成祝福，姓名:', name)
  
  // 先检查缓存
  const cached = getCachedBlessing(name)
  if (cached) {
    return cached
  }

  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      // 打印完整的请求URL
      const requestUrl = `${config.apiBaseUrl}/api/chat`
      console.log('准备调用API，URL:', requestUrl)
      
      // 调用扣子API
      const response = await new Promise((resolve, reject) => {
        console.log('发送请求...')
        wx.request({
          url: requestUrl,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            message: name
          },
          timeout: 30000,  // 增加超时时间到30秒
          success: (res) => {
            console.log('API响应成功:', res)
            if (res.statusCode === 200 && res.data) {
              if (res.data.error) {
                console.error('API返回错误:', res.data.error)
                reject(new Error(res.data.error))
              } else {
                resolve(res)
              }
            } else {
              const error = new Error(`请求失败: ${res.statusCode}`)
              console.error(error)
              reject(error)
            }
          },
          fail: (err) => {
            console.error('API请求失败:', err)
            // 如果是超时错误，给出更友好的提示
            if (err.errMsg && err.errMsg.includes('timeout')) {
              reject(new Error('网络请求超时，请稍后再试'))
            } else {
              reject(new Error(err.errMsg || '网络请求失败'))
            }
          }
        })
      })

      console.log('开始处理API响应:', response.data)
      
      // 检查响应数据
      if (!response.data || (!response.data.content && !response.data.error)) {
        const error = new Error('API响应格式不正确')
        console.error(error, response.data)
        throw error
      }

      if (response.data.error) {
        const error = new Error(response.data.error)
        console.error('API返回错误:', error)
        throw error
      }

      // 解析诗歌内容
      const blessing = parsePoem(response.data.content)
      console.log('生成的祝福:', blessing)

      // 缓存结果
      cacheBlessing(name, blessing)

      return blessing
    } catch (error) {
      retryCount++
      console.error(`生成祝福失败，重试次数：${retryCount}`, error)
      if (retryCount >= maxRetries) {
        throw error
      }
    }
  }
}

// 备用的祝福语生成函数
function generateFallbackBlessing(name) {
  const templates = [
    `${name}新年好，万事皆如意。\n事业步步高，生活更美丽。`,
    `祝愿${name}，新年快乐。\n前程似锦绣，未来更辉煌。`,
    `恭贺${name}，喜迎新春。\n福星高照耀，吉祥永相伴。`
  ]
  
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return parsePoem(randomTemplate)
}

// 导出函数
module.exports = {
  generateBlessing: generatePoemWithName
}
