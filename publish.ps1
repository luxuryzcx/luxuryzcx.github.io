param(
    [string]$CommitMessage = "deploy: publish static site",
    [string]$SourceBranch = "main",
    [string]$PublishBranch = "master",
    [string]$RemoteName = "origin",
    [switch]$SkipSourcePush
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "未找到命令: $Name"
    }
}

Ensure-Command "git"
Ensure-Command "hugo"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Step "检查 Git 仓库状态"
$gitTopLevel = git rev-parse --show-toplevel 2>$null
if (-not $gitTopLevel) {
    throw "当前目录不是 Git 仓库: $repoRoot"
}

$remoteUrl = git remote get-url $RemoteName 2>$null
if (-not $remoteUrl) {
    throw "未找到远程仓库 '$RemoteName'，请先配置 git remote。"
}

Write-Step "检查当前分支"
$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne $SourceBranch) {
    throw "请先切换到源码分支 '$SourceBranch'。当前分支是 '$currentBranch'。"
}

Write-Step "检查工作区是否干净"
$status = git status --porcelain
if ($status) {
    throw "检测到未提交修改，请先提交或暂存后再发布。"
}

if (-not $SkipSourcePush) {
    Write-Step "推送源码分支到 $RemoteName/$SourceBranch"
    git push $RemoteName $SourceBranch
}

Write-Step "构建 Hugo 静态站点"
hugo --minify --cleanDestinationDir

$publicDir = Join-Path $repoRoot "public"
if (-not (Test-Path -LiteralPath $publicDir)) {
    throw "构建完成后未找到 public 目录。"
}

$deployDir = Join-Path ([System.IO.Path]::GetTempPath()) "my_blogs_publish"
if (Test-Path -LiteralPath $deployDir) {
    Remove-Item -LiteralPath $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Step "复制 public 到临时发布目录"
$null = robocopy $publicDir $deployDir /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -gt 3) {
    throw "复制 public 目录失败，robocopy 退出码: $LASTEXITCODE"
}

Push-Location $deployDir
try {
    Write-Step "初始化临时发布仓库并提交静态文件"
    git init | Out-Null
    git checkout -b $PublishBranch | Out-Null
    git add .
    git commit -m $CommitMessage | Out-Null
    git remote add $RemoteName $remoteUrl

    Write-Step "强制推送静态文件到 $RemoteName/$PublishBranch"
    git push -f $RemoteName $PublishBranch
}
finally {
    Pop-Location
}

Write-Step "发布完成"
Write-Host "源码分支: $SourceBranch" -ForegroundColor Green
Write-Host "静态分支: $PublishBranch" -ForegroundColor Green
Write-Host "站点地址: https://luxuryzcx.github.io/" -ForegroundColor Green
