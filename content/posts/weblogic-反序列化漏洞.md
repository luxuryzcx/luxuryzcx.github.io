+++
series = ["Java 安全 持续学习"]
categories = ["安全研究"]
description = "weblogic"
title = "Weblogic  反序列化漏洞"
date = 2026-06-30T21:11:23+08:00
draft = false
pin = false
+++

# 原理


核心在于  T3 协议   这是  weblogic 专有的二进制协议   T3协议处理时默认支持原生Java反序列化

在接受数据时未对序列化对象做成严格校验  攻击者 就可以发送 精心构造的 T3  数据包  然后在  服

务端触发RCE  


# 什么是T3协议

T3 协议是 WebLogic 的“后门”。它不是基于 HTTP 的，而是直接基于 TCP 的二进制协议。攻击者

通过直接与 WebLogic 的 7001 端口进行 T3 通信，绕过了大部分 Web 层面的安全过滤器（如基

于 HTTP 请求的 WAF）

触发点：readObject()

当 T3 数据包中包含序列化对象时，WebLogic 的 `InboundMsgAbbrev` 类会调用 `readObject()` 来

反序列化这些数据。只要数据流中有恶意类（Gadget），反序列化过程就会触发该类的逻辑。

载体：Gadget Chain

在 WebLogic 的类路径（Classpath）中，包含了大量第三方库（如 Commons-Collections）以

及 WebLogic 自身的一些特殊类。攻击者通过将这些类组合成“链条”，从简单的“反序列化”转变为

“命令执行”。



# 为什么要二次反序列化


用来突破  JEP 290 或者 WAF 的限制

简单来说，二次反序列化是指在一个类的 `readObject()` 方法执行过程中，再次调用了另一个类的反序列化逻辑（或使用了 `ObjectInputStream` 进行反序列化），从而导致恶意 Payload 在“深层”被触发。


二次反序列化的一种突破入口

在 WebLogic 的反序列化漏洞研究中，很多攻击者会利用 `javax.jms.StreamMessage` 或者相关的 WebLogic 内部实现类作为“包裹类”。

- 攻击者思路：
    
    - 构造一个 `StreamMessageImpl` 或类似的序列化对象。
        
    - 在其数据字段中，嵌入一段完整的、被序列化过的 `Commons-Collections` 或原生 Gadget 数据流。
        
    - 由于 `StreamMessage` 是 WebLogic 处理消息的标准方式，它极有可能处于白名单中。
        
    - 当 WebLogic 内部处理该消息时，它会自动解析数据字段，从而触发深层的反序列化。


下面来演示  二次反序列化的 一种过程 


# 二次反序列化的一种过程

首先启动服务端

```c
java -cp build VulnerableWebLogicServer 7001
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629195931644.png)


然后启动供给端  发现已经成功了 

```c
java -cp build AttackerClient payloads/payload.bin 127.0.0.1 7001
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629200018817.png)

# weblogic 实战


CVE-2018-2628

首先进行  这个 漏洞复现

打开页面  发现是 经典的 weblogic 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629201429834.png)
确实 用 tscan 发现 扫到 特征到了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629201624941.png)


然后访问第二个页面  经典的登陆框 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629201813639.png)

可以用 weblogic 工具一把梭     发现这几个箭头的都能够进行利用

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629202245939.png)


发现确实  是 T3  协议  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629202425034.png)

 
测试  发现是 root 没毛病    因为是 测试的  这样就结束了 真实的还能继续深入操作

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629204633974.png)










