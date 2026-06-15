# 1ux4ry Archive 迁移与 GitHub 部署说明

这份文档包含 4 件事：

1. 项目迁移到 `Z:\Desktop\日常学习\魔改模板`
2. 本地开发与构建
3. 推送到 GitHub 的命令
4. 发布到 GitHub Pages 的完整步骤

---

## 1. 项目目录

当前 Hugo 项目源码目录：

```text
Z:\Desktop\codex_渗透\hugo-luxury-blog
```

目标迁移目录：

```text
Z:\Desktop\日常学习\魔改模板
```

迁移后你主要会用到这些内容：

- `config.toml`：站点配置
- `content/`：文章与页面内容
- `layouts/`：模板
- `static/`：静态资源
- `.github/workflows/hugo.yml`：GitHub Pages 自动部署
- `.gitignore`：Git 忽略规则

---

## 2. 本地开发命令

如果 Hugo 已安装，进入项目目录后运行：

```powershell
cd "Z:\Desktop\日常学习\魔改模板"
hugo server --bind 127.0.0.1 --port 1313 --disableFastRender
```

本地访问：

```text
http://127.0.0.1:1313/
```

本地构建静态文件：

```powershell
cd "Z:\Desktop\日常学习\魔改模板"
hugo --minify
```

构建输出目录：

```text
public/
```

---

## 3. 推送到 GitHub 的命令

下面是最常见的首次上传流程。

### 3.1 初始化 Git

```powershell
cd "Z:\Desktop\日常学习\魔改模板"
git init
git branch -M main
git add .
git commit -m "init: import 1ux4ry blog"
```

### 3.2 关联 GitHub 仓库

先在 GitHub 上新建一个仓库，例如：

```text
1ux4ry-archive
```

然后执行：

```powershell
git remote add origin https://github.com/你的GitHub用户名/1ux4ry-archive.git
git push -u origin main
```

如果你使用 SSH：

```powershell
git remote add origin git@github.com:你的GitHub用户名/1ux4ry-archive.git
git push -u origin main
```

后续更新常用命令：

```powershell
git add .
git commit -m "update: refresh content and style"
git push
```

---

## 4. GitHub Pages 自动部署

项目里已经帮你放好了工作流文件：

```text
.github/workflows/hugo.yml
```

它会在你每次 push 到 `main` 分支后自动：

- 安装 Hugo Extended
- 构建站点
- 发布到 GitHub Pages

### 4.1 先改 `baseURL`

打开：

```text
config.toml
```

把：

```toml
baseURL = "https://example.org/"
```

改成你的真实地址。

如果仓库名是普通仓库，例如：

```text
https://github.com/yourname/1ux4ry-archive
```

那么建议改成：

```toml
baseURL = "https://yourname.github.io/1ux4ry-archive/"
```

如果你的仓库名正好是：

```text
yourname.github.io
```

那么改成：

```toml
baseURL = "https://yourname.github.io/"
```

### 4.2 打开 GitHub Pages

推送代码后，去 GitHub 仓库页面：

`Settings` -> `Pages`

确认来源为：

```text
GitHub Actions
```

### 4.3 查看部署结果

部署后可在这里看状态：

```text
GitHub 仓库 -> Actions
```

第一次部署成功后，Pages 会给你一个站点地址。

---

## 5. 修改站点个性信息

你之后通常会改这些地方：

### 站点标题和作者名

文件：

```text
config.toml
```

重点字段：

```toml
title = "1ux4ry Archive"

[params]
  author = "1ux4ry"
  subtitle = "你的副标题"
  email = "你的邮箱"
  github = "你的 GitHub 地址"
```

### 首页首屏终端内容

文件：

```text
layouts/partials/profile-hero.html
```

可以改：

- 终端命令
- flag 内容
- 大标题
- 介绍文案

### 文章内容

目录：

```text
content/posts/
```

每篇文章都是一个 Markdown 文件。

---

## 6. 推荐发布流程

推荐你以后每次这样更新：

1. 改内容或样式
2. 本地运行 `hugo server`
3. 检查无误后执行：

```powershell
git add .
git commit -m "update: xxx"
git push
```

4. GitHub Actions 自动发布

---

## 7. 常见问题

### Hugo 命令不能用

先检查：

```powershell
hugo version
```

如果提示找不到命令，重开一个终端窗口再试一次。

### 页面样式没变化

先强制刷新浏览器：

```text
Ctrl + F5
```

### GitHub Pages 地址样式错乱

通常是 `baseURL` 配错了，尤其是仓库名不是 `username.github.io` 时。

---

## 8. 本项目当前状态

当前已经完成：

- Hugo 博客基础结构
- 首页终端风首屏
- 归档、分类、标签、关于、友链
- GitHub Actions 自动部署
- Git 忽略规则

如果后面还要继续魔改，优先改这几个地方：

- `layouts/partials/profile-hero.html`
- `static/css/main.css`
- `static/js/main.js`
- `content/posts/`
