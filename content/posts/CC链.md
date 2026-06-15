+++
title = "CC链"
date = 2026-06-15T17:30:00+08:00
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

## 定义

  
  
CC链 Commons Collections链 是Java反序列化漏洞利用中，最经典，最核心的利用链子  
  
Apache Commons Collections 是Java开发中及其常用的一个第三方基础类库，提供了大量强大的数据结构，（Map,list,集合等）  
  

## 核心基石

  
  
TemplatesImpl  
  
大部分（CC2,CC3,CC4）都会落脚到JDK自带的一个危险类  
  
com.sun.org.apache.xalan.internal.xsltc.trax.TemlatesImpl  
  
然后实现Java 反序列化类  
  
允许通过反射私有变量（一般恶意数组）--》调用它的方法--》然后内存中动态加载并实例化这段恶意字节码，然后执行命令  
  
CC当中 最终会通过各种链条走到  
TemlatesImpl.newTemlatesImpl()进行恶意类加载执行   一般是 CC   234 

或者 通过反射到 Runtime.getRuntime().exec()进行调用执行   CC   1567  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613181827183.png)




## 总结


核心差异总结：

1. 触发差异：CC1/3/5/6/7 依赖于动态代理或 Map 相关的通用逻辑，而 CC2/4 依赖于 JDK 自带的 PriorityQueue 排序逻辑。
    
2. 终点差异：CC1/5/6/7 倾向于直接调用    InvokerTransformer    反射执行命令；CC2/3/4 倾向于通过     TemplatesImpl     进行内存加载，后者在防御上更难通过简单的字符串黑名单规避。
