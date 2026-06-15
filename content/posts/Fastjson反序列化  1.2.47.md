+++
title = "Fastjson反序列化  1.2.47"
date = 2026-06-15T16:20:00+08:00
draft = false
description = "由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。"
tags = ["Java安全", "安全研究"]
categories = ["安全研究"]
series = ["Java 安全 持续学习"]
pin = false
cover = "/images/posts/java-security-banner.svg"
+++
## 前言

由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。这篇文章收录在「Java 安全 持续学习」系列中，用来沉淀对应主题的分析与记录。

## 正文

## 原理


 Fastjson 1.2.47 之前的漏洞利用了以下特性：

  1. autotype 黑名单绕过 - 通过 java.lang.Class 的特殊处理机制，先将恶意类加载到缓存
  2. JNDI 注入 - 通过 JdbcRowSetImpl 类触发 JNDI 连接，加载远程恶意类执行代码



## 过程


这里我们用jar包来进行搭建测试     当然也可以 docker 来进行  这里我们用 docker 来运行 

不得不说  p神的 vulnhub  真的夯
