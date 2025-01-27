module.exports = {
  KIMI_API_KEY: 'pat_owL8mXroakuymBvJFPOJ0vRAWnqwXkx510fxeFivvAgdEE5zEIG1BzLUgtkAhmoc',
  KIMI_MODEL_ID: '7464130855104266240',
  
  // API基础URL，使用Vercel提供的域名
  apiBaseUrl: 'https://your-app.vercel.app',  // 请将此处替换为Vercel提供的实际域名
  
  // 版本信息
  version: '1.0.0',
  
  // 缓存配置
  cache: {
    // 祝福缓存时间（24小时）
    blessingDuration: 24 * 60 * 60 * 1000
  },
  
  // 调试模式
  debug: false  // 生产环境关闭调试模式
}
