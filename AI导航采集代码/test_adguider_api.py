#!/usr/bin/env python3
"""
测试脚本：分析 adguider.com 日历 API
"""

import requests
import json
from datetime import datetime, timedelta

# 目标API URL
API_URL = "https://www.adguider.com/sv1/calendar/getCalendar"

# 测试参数
TEST_PARAMS = {
    "mode": 2,
    "startDate": "2026/03/13"
}

# 测试不同的startDate格式
test_dates = [
    "2026/03/13",  # 任意日期
    "2026/03/01",  # 月初
    "2026/03/31"   # 月末
]

def test_api(start_date):
    """测试API请求"""
    
    # 构建完整的请求头
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.adguider.com/"
    }
    
    # 创建会话
    session = requests.Session()
    session.headers.update(headers)
    
    try:
        # 先访问主页面获取会话信息
        main_url = "https://www.adguider.com/"
        main_response = session.get(main_url, timeout=10)
        main_response.raise_for_status()
        print(f"访问主页面: {main_response.status_code}")
        
        # 构建请求参数
        params = {
            "mode": 2,
            "startDate": start_date
        }
        
        # 调用API
        response = session.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        
        print(f"\n--- 测试日期: {start_date} ---")
        print(f"状态码: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        
        # 尝试解析JSON
        try:
            data = response.json()
            print(f"\n成功解析JSON响应:")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:2000] + "..." if len(str(data)) > 2000 else json.dumps(data, indent=2, ensure_ascii=False))
            return data
        except json.JSONDecodeError:
            print(f"\n无法解析为JSON，响应内容预览:")
            print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
            
        return response.text
        
    except requests.exceptions.RequestException as e:
        print(f"\n请求错误 ({start_date}): {e}")
        return None
    except Exception as e:
        print(f"\n解析错误 ({start_date}): {e}")
        return None

if __name__ == "__main__":
    print("=== AdGuider API 测试 ===")
    
    # 测试不同日期格式
    for date in test_dates:
        response_text = test_api(date)
        
    print("\n=== 测试完成 ===")
