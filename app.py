from flask import Flask, request, jsonify, render_template
import sqlite3
import hashlib
import os

app = Flask(__name__)


# 密码加密
def hash_pwd(password):
    return hashlib.sha256(password.encode()).hexdigest()


# 初始化数据库
def init_db():
    if not os.path.exists("users.db"):
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute('''
                  CREATE TABLE users
                  (
                      id       INTEGER PRIMARY KEY AUTOINCREMENT,
                      username TEXT UNIQUE NOT NULL,
                      password TEXT        NOT NULL
                  )
                  ''')
        conn.commit()
        conn.close()


init_db()


# 你的主页面
@app.route('/')
def index():
    return render_template("index.html")


# 登录接口
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"code": 0, "msg": "账号密码不能为空"})

    hp = hash_pwd(password)
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (username, hp))
    user = c.fetchone()
    conn.close()

    if user:
        return jsonify({"code": 1, "msg": "登录成功", "username": username})
    else:
        return jsonify({"code": 0, "msg": "账号或密码错误"})


# 注册接口
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"code": 0, "msg": "账号密码不能为空"})

    hp = hash_pwd(password)
    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("INSERT INTO users (username,password) VALUES (?,?)", (username, hp))
        conn.commit()
        conn.close()
        return jsonify({"code": 1, "msg": "注册成功"})
    except:
        return jsonify({"code": 0, "msg": "用户名已存在"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)