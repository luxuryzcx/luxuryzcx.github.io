+++
description = "漏洞复现"
title = "Hessian-dubbo历史上的一些洞"
date = 2026-09-11T16:11:47+08:00
draft = false
pin = false
+++
Apache Dubbo 是 Java 领域最流行的分布式服务框架之一。对于安全研究人员来说，Dubbo 不仅仅是一个用来做微服务的工具，它更是一个**复杂的分布式通信系统**，其中蕴含了大量的网络协议处理、序列化机制和动态类加载逻辑，这正是安全漏洞滋生的“温床”。

### 1. 什么是 Dubbo？

Dubbo 是一款高性能、轻量级的 **RPC (Remote Procedure Call，远程过程调用)** 框架。

简单来说，RPC 的目的是让你在调用远程服务器上的函数时，感觉就像在调用本地函数一样简单。Dubbo 屏蔽了底层的网络通信、序列化细节，让开发者专注于业务逻辑。

### 2. 核心架构（安全研究的切入点）

要理解 Dubbo 的安全风险，必须先看懂它的五个核心角色：

- **Provider (服务提供者)**：暴露服务的机器，负责执行具体的业务逻辑。
    
- **Consumer (服务消费者)**：调用远程服务的机器。
    
- **Registry (注册中心)**：**整个系统的“电话簿”**（如 Zookeeper, Nacos）。Provider 在这里注册，Consumer 从这里发现 Provider。
    
- **Monitor (监控中心)**：统计服务调用次数和时间。
    
- **Container (容器)**：服务运行的容器。


其中是Hessian走二进制的，所有流量层的很难防住





    


