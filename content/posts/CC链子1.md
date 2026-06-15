+++
title = "CC链子1"
date = 2026-06-14T20:25:00+08:00
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

## 原理

- **依赖**：`commons-collections:3.1`
    
- **入口**：`AnnotationInvocationHandler.readObject()`
    
- **执行**：`InvokerTransformer` 反射调用 `Runtime.getRuntime().exec()`
    
- **原理**：利用 `AnnotationInvocationHandler` 的 `readObject` 反序列化逻辑，通过动态代理将 `Map` 方法调用转发给 `LazyMap`，进而触发 `ChainedTransformer` 的反射调用链。
    
- **流程**： 
- `AnnotationInvocationHandler.readObject()`
- ↓ `Proxy` 动态代理触发 `invoke()`
- ↓ `LazyMap.get()`
- ↓ `ChainedTransformer.transform()` 
- ↓ `InvokerTransformer` (反射) 
- ↓ `Runtime.getRuntime().exec()`

jdk  版本要在  8u71之前才行

后面更新了


CC1一遍最后是  runtime.exec()进行的  容易被rasp给检测到


利用原理

触发点    AnnotationInvocationHandler   


- **调用过程**：`AnnotationInvocationHandler` (readObject) -> `Proxy` -> `LazyMap.get()` -> `ChainedTransformer` -> `InvokerTransformer` -> `Runtime.exec()`。
    
- **特点**：依赖 JDK 原生代理类 `AnnotationInvocationHandler`，利用反射链调用系统命令。
    
- **局限**：JDK 8u71 修改了类结构，彻底封死触发点。
