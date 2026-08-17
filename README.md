# 🎵 音乐圈

一个**私密小圈子**的「听专辑」共写日记 + 听友会。搜专辑自动补全信息，标记听过、打 10 分、写三层点评（速记 / 深度评 / 自由长评），看到朋友动态，约好一起听一起聊。

> 定位：帮你和朋友们把「听专辑」从打发时间，变成一件能沉淀、能交流、能提升审美的事。

---

## 🚀 怎么启动

### 最简单：双击「启动网站.bat」
直接双击项目里的 `启动网站.bat`，弹出黑窗口别关，浏览器打开 **http://localhost:3001** 就行。关掉黑窗口 = 停止网站。

### 或命令行（二选一）

在项目目录下先装一次依赖（已经装过了就不用再装）：

```bash
npm install
```

### 方式 A：开发模式（改代码时用，改完自动刷新）
```bash
npm run dev
```
然后浏览器打开 **http://localhost:5173**

### 方式 B：正式跑（推荐日常用，一个网址搞定）
```bash
npm run build
npm start
```
然后浏览器打开 **http://localhost:3001**

> 第一次启动时，控制台会打印一个 **🎟️ 邀请码**，也会存到 `data/invite-code.txt`。这个码就是发给你朋友的「入场券」。

---

## 🎬 第一次使用

1. 打开网址，切到「注册」标签
2. 填邀请码 + 昵称 + 用户名 + 密码，注册（**同一个邀请码，所有朋友共用**；第一个注册的人自动成为发起人）
3. 去「搜专辑」输入一张专辑名（如 `OK Computer`），点「去点评」
4. 标记「完整听/随意听」→ 打分 → 写一句第一印象 → 想认真就「展开深度评」分维度打分 → 保存
5. 到「时间线」看朋友动态；到专辑页点「发起听友会」约大家一起听

---

## 📁 目录结构

```
music-club/
├── server/           后端（Node + Express + SQLite）
│   ├── index.js      服务入口
│   ├── db.js         数据库 + 邀请码
│   ├── auth.js       登录鉴权
│   ├── metadata.js   专辑资料（iTunes 搜索接口）
│   └── routes/       各功能接口
├── src/              前端（React + Vite）
│   ├── pages/        页面（登录/时间线/搜索/专辑/听友会）
│   ├── dimensions.js 11 个评价维度
│   └── components/   公共组件
├── data/             数据（SQLite 数据库，自动生成，不要手动改）
└── dist/             前端构建产物（npm run build 生成）
```

---

## 🔒 关于「私密」

- 数据存在你自己的 `data/app.db` 一个 SQLite 文件里（本地或服务器磁盘，不经过第三方）
- 必须有邀请码才能注册，内容只对圈内人可见
- 密码用 scrypt 加盐哈希存储，不存明文

---

## 🌍 部署到 Railway（让朋友从外面访问）

现在这版跑在你电脑上，只有你能访问。要朋友一起用，把它部署到 [Railway](https://railway.app)（免费额度够小圈子用，不用备案、不用买域名）。

### 第一步：把代码传到 GitHub（一次性）

1. 注册/登录 [GitHub](https://github.com)
2. 新建一个空仓库（New repository），名字随便，比如 `music-club`，**不要**勾选任何初始化文件
3. 把本地代码推上去（在项目目录里执行，把 `你的用户名` 换成你自己的）：
   ```bash
   git init
   git add .
   git commit -m "音乐圈"
   git branch -M main
   git remote add origin https://github.com/你的用户名/music-club.git
   git push -u origin main
   ```

### 第二步：在 Railway 部署

1. 注册/登录 [Railway](https://railway.app)（建议用 GitHub 账号登录，省事）
2. 点 **New Project → Deploy from GitHub**
3. 选刚才的 `music-club` 仓库，Railway 会自动检测 Dockerfile 并开始部署
4. 部署完，进项目 **Settings** 设置两个东西：
   - **Environment Variables（环境变量）**：加一个
     - 名字 `INVITE_CODE`，值填你想给朋友用的邀请码（比如 `TONGPIN26`）
   - **Volumes（磁盘）**：加一个卷，**挂载路径填 `/app/data`**（这样数据不会因重启丢失）
5. Railway 会自动给你一个网址（如 `https://xxx.up.railway.app`），把这个网址 + 邀请码发给朋友

### 第三步：使用

- 你先用那个网址注册（第一个注册的自动成为发起人）
- 朋友用同一个网址 + 同一个邀请码注册
- 完事 🎉

> 提示：环境变量 `INVITE_CODE` 就是你们的「圈密码」，想换就改这里，重启后生效。

---

## 🧰 技术栈

- 后端：Node.js + Express 5 + SQLite（Node 内置 `node:sqlite`）
- 前端：React 19 + React Router 7 + Vite 8
- 专辑资料：iTunes 搜索接口（免密钥，一次返回封面+曲目+艺人）
