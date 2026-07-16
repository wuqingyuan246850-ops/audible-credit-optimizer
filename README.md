 # Audible Credit Optimizer
 
 一个自动更新的纯静态网站，帮你推荐 Audible 有声书，最大化每个积分的价值。
 
 Steam 深色主题 · Amazon PAAPI 数据驱动 · 每天自动更新 · Cloudflare Pages 全球部署
 
 ---
 
 ## 目录
 
 1. [项目结构](#项目结构)
 2. [你需要的账号](#你需要的账号)
 3. [本地运行（测试用）](#本地运行测试用)
 4. [部署到 GitHub](#部署到-github)
 5. [部署到 Cloudflare Pages](#部署到-cloudflare-pages)
 6. [配置 GitHub Secrets（每天自动更新数据）](#配置-github-secrets每天自动更新数据)
 7. [管理种子数据（你的有声书清单）](#管理种子数据你的有声书清单)
 8. [常见问题](#常见问题)
 
 ---
 
 ## 项目结构
 
 ```
 📁 audible-credit-optimizer/
 ├── 📁 .github/workflows/
 │   └── 📄 build-and-deploy.yml    # GitHub Actions 自动构建脚本
 ├── 📁 data/
 │   └── 📄 seed_books.json         # 📌 你的有声书种子清单
 ├── 📁 scripts/
 │   ├── 📄 fetch_books.py          # 从 Amazon API 获取数据
 │   ├── 📄 generate_site.py        # 生成静态网站
 │   └── 📄 build.py                # 本地一键构建
 ├── 📁 templates/
 │   ├── 📄 base.html               # Steam 风格基础模板
 │   ├── 📄 index.html              # 首页（表格 + 推荐卡片）
 │   └── 📄 category.html           # 分类页面
 ├── 📁 static/
 │   ├── 📁 css/style.css           # Steam 深色主题样式
 │   └── 📁 js/app.js               # 排序、筛选、搜索功能
 ├── 📄 .env.example                # API 密钥模板
 ├── 📄 .gitignore                  # 忽略敏感文件
 └── 📄 requirements.txt           # Python 依赖
 ```
 
 ## 你需要的账号
 
 | 账号 | 用途 | 费用 | 获取方式 |
 |------|------|------|---------|
 | **Amazon Associates** | 获取联盟佣金 | 免费 | https://affiliate-program.amazon.com |
 | **Amazon PAAPI 5.0** | 获取图书数据 | 免费 | 需要 Associates 账号后申请 |
 | **GitHub** | 托管代码 + 自动构建 | 免费 | https://github.com |
 | **Cloudflare** | 部署网站 + CDN | 免费 | https://dash.cloudflare.com |
 
 > 你已经有了 Amazon Associates 和 Creators API，直接往里填就行。
 
 ## 本地运行（测试用）
 
 本地运行可以看到网站效果，不需要 API 密钥，用内置的种子数据就能跑。
 
 ### 1. 安装 Python 依赖
 
 打开终端（Terminal / PowerShell），进入项目目录，执行：
 
 ```bash
 pip install -r requirements.txt
 ```
 
 ### 2. 构建网站
 
 ```bash
 python scripts/generate_site.py
 ```
 
 ### 3. 打开网站
 
 构建完成后，网站文件在 `output/` 目录。直接双击打开 `output/index.html` 就能看到效果。
 
 > 如果你装了 VS Code，可以用 Live Server 插件打开，效果更真实（支持 AJAX 加载）。
 
 ## 部署到 GitHub
 
 1. **创建 GitHub 仓库**
    - 打开 https://github.com/new
    - 仓库名：`audible-credit-optimizer`（或其他你喜欢的名字）
    - 选 **Public**（公开，免费）
    - 不要勾选任何初始化选项
    - 点击 "Create repository"
 
 2. **上传代码到 GitHub**
 
    在本地项目目录中执行以下命令：
 
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/你的用户名/audible-credit-optimizer.git
    git branch -M main
    git push -u origin main
    ```
 
    （把 `你的用户名` 换成你的 GitHub 用户名）
 
 ## 部署到 Cloudflare Pages
 
 ### 第一步：在 Cloudflare 创建 Pages 项目
 
 1. 打开 https://dash.cloudflare.com/ 登录
 2. 左侧菜单点击 **Workers & Pages**
 3. 点击 **Create** → **Pages**
 4. **Connect to Git** → 授权 GitHub
 5. 选择你刚刚上传的仓库 `audible-credit-optimizer`
 6. 在 **Set up builds and deployments** 页面：
    - **Production branch**: `gh-pages`
    - **Build command**: 留空（GitHub Actions 会帮我们构建）
    - **Build output directory**: `output/`
    - **Root directory**: 留空
 7. 点击 **Save and Deploy**
 
 部署完成后，Cloudflare 会给你的网站一个免费域名：`你的项目名.pages.dev`
 
 ### 第二步：（可选）绑定自定义域名
 
 1. 在 Cloudflare Pages 项目设置中
 2. 点击 **Custom domains** → **Set up a custom domain**
 3. 输入你的域名（如 `audiblevalue.com`）
 4. 按提示在域名注册商处添加 CNAME 记录
 
 ## 配置 GitHub Secrets（每天自动更新数据）
 
 这是最重要的一步。配置后，网站每天自动从 Amazon API 获取最新数据并更新。
 
 ### 你需要的 4 个密钥
 
 | Secret 名称 | 说明 | 从哪里获得 |
 |-------------|------|-----------|
 | `AMAZON_ACCESS_KEY` | API 访问密钥 | Amazon PAAPI 注册后获取 |
 | `AMAZON_SECRET_KEY` | API 密钥 | Amazon PAAPI 注册后获取 |
 | `AMAZON_ASSOCIATE_TAG` | 你的联盟标签 | Amazon Associates 后台 → Account Settings |
 | `AMAZON_PARTNER_TAG` | 同 ASSOCIATE_TAG | 同上 |
 
 ### 设置步骤
 
 1. 打开你的 GitHub 仓库：`https://github.com/你的用户名/audible-credit-optimizer`
 2. 点击 **Settings** → **Secrets and variables** → **Actions**
 3. 点击 **New repository secret**
 4. 依次添加以上 4 个密钥
 
    > ⚠️ **安全提醒**：这些密钥永远不要写在代码里，不要分享给任何人。
    > 系统已经通过 `.gitignore` 排除了 `.env` 文件，代码里也不会有任何密钥。
 
 配置完成后，GitHub Actions 会自动：
 - **每天 14:00（香港时间）** 运行一次
 - 调用 Amazon API 获取最新价格和评分
 - 自动生成网站 → 部署到 Cloudflare Pages
 
 ## 管理种子数据（你的有声书清单）
 
 网站展示哪些书，由 `data/seed_books.json` 控制。
 
 这个文件里每条记录是一本有声书。格式如下：
 
 ```json
 {
   "asin": "B0D9Z2L3KJ",
   "title": "Project Hail Mary",
   "author": "Andy Weir",
   "narrator": "Ray Porter",
   "price": 23.96,
   "rating": 4.8,
   "runtime_minutes": 960,
   "categories": ["Science Fiction"],
   "cover_url": "",
   "is_audible": true
 }
 ```
 
 ### 如何添加新书
 
 1. 在 Audible 或 Amazon 找到你想推荐的有声书
 2. 复制它的 **ASIN**（Amazon 商品 ID，通常是 `B0XXXXXX` 格式）
 3. 用文本编辑器打开 `data/seed_books.json`
 4. 按照上面的格式添加一条记录
 5. 不需要填写 price 和 rating —— GitHub Actions 每天会自动从 API 获取最新数据
 6. 把修改 push 到 GitHub，Actions 会自动更新网站
 
 > 💡 **提示**：`categories` 字段可以放多个分类，比如 `["Science Fiction", "Fantasy"]`。
 > 系统会自动为每个分类生成独立的页面（如 `/category/science-fiction.html`）。
 
 ## 常见问题
 
 ### Q: 网站需要花钱吗？
 
 全免费。GitHub、Cloudflare、Amazon PAAPI 都有免费额度，足够这个网站使用。
 
 ### Q: 没有 API 密钥能运行吗？
 
 能。内置了 30 本示例有声书的数据，可以直接构建网站看到效果。
 配置 API 后会自动获取实时数据。
 
 ### Q: API 密钥泄露了怎么办？
 
 只要密钥没写在代码里（写在 GitHub Secrets 里），就是安全的。
 如果怀疑泄露，在 Amazon PAAPI 后台重新生成密钥即可。
 
 ### Q: 如何修改网站样式？
 
 编辑 `static/css/style.css`。所有颜色用 CSS 变量定义在文件顶部 `:root` 中。
 
 ### Q: 如何添加新分类？
 
 不需要手动添加。只要在 `seed_books.json` 里某本书的 `categories` 数组里写上新的分类名，
 生成网站时会自动创建对应的分类页面。
 
 ### Q: Cloudflare Pages 部署失败了？
 
 1. 检查 GitHub Actions 是否运行成功（仓库 → Actions 标签页）
 2. 如果 Actions 成功但 Pages 没更新，检查 Cloudflare Pages 是否正确连接了 `gh-pages` 分支
 3. 在 Cloudflare Pages 项目设置中手动触发一次重新部署
 
 ---
 
 Built with ❤️ for Audible audiobook enthusiasts everywhere.

---

> **重要更新：2025年 Amazon 已将 PAAPI 5.0 迁移到 Creators API**
> 
> 本项目已从旧的 PAAPI 5.0（AWS Signature V4）迁移到新的 **Amazon Creators API（OAuth 2.0）**。
> 
> **变更内容：**
> - ✅ 认证方式：AWS 签名 → OAuth 2.0 Bearer Token
> - ✅ API 端点：`webservices.amazon.com/paapi5/` → `creatorsapi.amazon/catalog/v1/`
> - ✅ 资源名称：`Offers.Listings` → `OffersV2`
> - ✅ 参数大小写：`ItemIds` → `itemIds`（lowerCamelCase）
> - ✅ Token 自动缓存续期（1小时过期）
> - ✅ 兼容新旧两种响应格式

---

## 🔑 你必须配置的 GitHub Secrets

| Secret 名称 | 说明 | 从哪里获取 |
|-------------|------|-----------|
| `AMAZON_ACCESS_KEY` | 你的 **Credential ID** | Creators API 仪表盘 |
| `AMAZON_SECRET_KEY` | 你的 **Credential Secret** | Creators API 仪表盘（只显示一次！） |
| `AMAZON_CREDENTIALS_VERSION` | 你的 **Version** | Creators API 仪表盘（创建凭证时分配） |
| `AMAZON_ASSOCIATE_TAG` | 你的 Associates 追踪标签 | Amazon Associates → Account Settings |

> ⚠️ **重要**：旧版 PAAPI 的 AWS Access Key/Secret Key **不能用**。你必须登录 `affiliate-program.amazon.com/creatorsapi` 生成新的凭证。

## 📝 本地测试

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 创建 .env 文件（复制 .env.example 改名为 .env）
#    填入你的 Credential ID、Credential Secret、Version、Associate Tag

# 3. 运行获取数据（需要 API 凭证）
python scripts/fetch_books.py

# 4. 生成网站
python scripts/generate_site.py

# 5. 打开 output/index.html 查看效果
```

## 🤖 自动更新（GitHub Actions + Cloudflare Pages）

配置好 GitHub Secrets 后，网站会：
- **每天 UTC 06:00（香港时间 14:00）** 自动获取最新数据
- 自动构建并部署到 Cloudflare Pages
- 封面图片、价格、评分等数据自动更新

### GitHub Secrets 配置步骤：

1. 打开你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，依次添加以下 4 个 Secret：

| Secret 名称 | 填什么 |
|-------------|--------|
| `AMAZON_ACCESS_KEY` | 你的 **Credential ID** |
| `AMAZON_SECRET_KEY` | 你的 **Credential Secret** |
| `AMAZON_CREDENTIALS_VERSION` | 你的 **Version** 号 |
| `AMAZON_ASSOCIATE_TAG` | 你的 Associate Tag（如 `yourtag-20`） |

3. 配置完成后，可以手动触发一次测试：
   - GitHub 仓库 → **Actions** → **Build & Deploy** → **Run workflow**
