+++
title = "Windows  入侵排查思路"
date = 2026-06-16T00:07:42+08:00
draft = false
description = "win的一些排查思路"
tags = ["应急响应", "Windows"]
categories = ["应急响应"]
series = ["应急响应"]
pin = false
+++

# 查账号安全   


# 查登录日志

事件查看器   

重点关注   4624（登录成功）   和4776（身份验证尝试）


# 可疑进程/连接

netstat  查异常ID


# 计划任务/操作

输入   taskschd.msc   打开计划任务程序



# 分析中间件和应用日志




# 安全日志/系统日志/应用程序日志

C:\Windows\System32\winevt\Logs\Security.evtx    ----安全日志

C:\Windows\System32\winevt\Logs\System.evtx  ----- 系统日志

C:\Windows\System32\winevt\Logs\Application.evtx     ----应用程序日志



# 远程桌面登录日志

C:\Windows\System32\winevt\Logs\Microsoft-Windows-TerminalServices-LocalSessionManager%4Operational.evtx



# 计划任务执行日志

C:\Windows\System32\winevt\Logs\Microsoft-Windows-TaskScheduler%4Operational.evtx



# 日志工具批量分析

LogParser,EventLog  Explorer 























