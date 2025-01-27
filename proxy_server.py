from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import requests
import json
import logging
import sys

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 启用CORS

COZE_API_URL = 'https://api.coze.cn/v3/chat'
API_KEY = 'pat_owL8mXroakuymBvJFPOJ0vRAWnqwXkx510fxeFivvAgdEE5zEIG1BzLUgtkAhmoc'

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        logger.info("收到新的请求")
        data = request.get_json()
        if not data:
            logger.error("请求体为空")
            return jsonify({'error': '请求体为空'}), 400
            
        message = data.get('message', '')
        logger.info(f"收到请求消息: {message}")

        if not message:
            logger.error("消息内容为空")
            return jsonify({'error': '消息内容为空'}), 400

        # 构建请求数据
        request_data = {
            'bot_id': '7464130855104266240',
            'user_id': '123456789',
            'stream': False,  # 关闭流式响应
            'auto_save_history': True,
            'messages': [{  # 使用正确的消息格式
                'role': 'user',
                'content': f'请以"{message}"为藏头诗，创作一首七言新年贺诗。要求：\n1. 每句七个字，每个字都要用到\n2. 诗句要体现新年祝福的喜庆氛围，可以包含春联、福字、红包等新年元素\n3. 诗句要通顺优美，符合平仄\n4. 不需要完全按照名字顺序，但要确保所有字都用上\n请直接返回诗句，不要有任何解释。',
                'content_type': 'text'
            }]
        }
        
        logger.info(f"请求数据: {json.dumps(request_data, ensure_ascii=False)}")

        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }

        logger.info("开始发送请求到扣子API")
        response = requests.post(
            COZE_API_URL,
            json=request_data,
            headers=headers,
            timeout=30
        )
        
        logger.info(f"API响应状态码: {response.status_code}")
        logger.info(f"API响应内容: {response.text}")
        
        if response.status_code != 200:
            error_msg = f"API错误: {response.text}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), response.status_code

        try:
            response_data = response.json()
            if 'message' in response_data:
                content = response_data['message'].get('content', '')
                if content:
                    logger.info(f"生成的诗歌内容: {content}")
                    return jsonify({'content': content})
                else:
                    error_msg = "API响应中没有内容"
                    logger.error(error_msg)
                    return jsonify({'error': error_msg}), 500
            else:
                error_msg = "API响应格式不正确"
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 500

        except json.JSONDecodeError as e:
            error_msg = f"JSON解析错误: {str(e)}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 500

    except requests.Timeout:
        error_msg = "API请求超时，请稍后重试"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 504
    except Exception as e:
        error_msg = f"服务器错误: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    # 本地开发时使用
    logger.info("启动服务器，监听端口 8080")
    app.run(host='0.0.0.0', port=8080, debug=True)
else:
    # Vercel 生产环境使用
    logger.info("在 Vercel 环境中运行")
