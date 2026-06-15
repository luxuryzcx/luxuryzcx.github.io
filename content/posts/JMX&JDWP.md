+++
title = "JMX&JDWP"
date = 2026-06-14T22:20:00+08:00
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

## JMX定义

**JMX（Java Management Extensions）** 是 Java 平台上用于管理和监控应用程序、系统对象以及 JVM 自身的一套标准技术。


## 暴露场景


1.敏感信息泄露


2.RCE


3.未授权访问如 (Tomcat、WebLogic、JBoss)

## JDWP定义

**JDWP（Java Debug Wire Protocol）** 是 Java 调试体系中位于底层的一套通信协议。它定义了调试器（Debugger）和被调试的 JVM（Target VM）之间传输的调试信息和请求的格式。

简单来说，JDWP 就是连接 IDE（如 IDEA、Eclipse）与远程 Java 应用程序的“桥梁”，允许开发者在本地远程挂载服务器上的代码，进行单行调试、查看变量和堆栈。



## 暴露场景


1.无需认证远程访问


2.完全控制JVM内存与控制流


3.RCE的利用方式
