# GitHub 部署说明

这个项目现在使用的发布结构是：

- `main`：Hugo 源码分支
- `master`：GitHub Pages 静态页面分支

你有两种发布方式。

---

## 1. 本地一键发布

最推荐：

```powershell
cd "Z:\my_blogs"
.\publish.ps1
```

它会自动：

1. 检查当前在 `main`
2. 检查工作区是否干净
3. 推送源码到 `main`
4. 运行 `hugo --minify`
5. 把 `public` 推到 `master`

---

## 2. GitHub Actions 自动发布

工作流文件：

```text
Z:\my_blogs\.github\workflows\hugo.yml
```

触发方式：

- push 到 `main`
- 手动运行 workflow

流程：

1. 安装 Hugo Extended
2. 构建 `public`
3. 自动发布到 `master`

---

## 3. 你的 GitHub Pages 地址

```text
https://luxuryzcx.github.io/
```

对应 `config.toml` 里的：

```toml
baseURL = "https://luxuryzcx.github.io/"
```

---

## 4. 检查 Pages 是否正常

到仓库：

```text
Settings -> Pages
```

确认：

- Branch: `master`
- Folder: `/ (root)`

---

## 5. 最省事的实际操作

你以后通常只要执行：

```powershell
cd "Z:\my_blogs"
git add .
git commit -m "update: xxx"
.\publish.ps1
```

这样就够了。
