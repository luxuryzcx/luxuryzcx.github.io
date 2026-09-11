+++
description = "漏洞复现"
title = "Shiro 概述"
date = 2026-09-11T16:12:49+08:00
draft = false
pin = false
+++

Apache Shiro 是 Java 领域最流行的  安全框架  之一，负责认证（Authentication）、授权（Authorization）、会话管理（Session Management）和加密（Cryptography）。

在 Java 安全研究中，Shiro 几乎是必经之路，因为它为攻击者提供了一个  完美的入口（Source），可以直接向 JVM 投递恶意的序列化数据。

### 1. 核心机制：RememberMe 为什么会出错？

Shiro 的漏洞根源在于其   RememberMe  （记住我）功能。

- 业务逻辑：当用户勾选“记住我”登录时，Shiro 会将用户的身份信息序列化为二进制，进行 AES 加密，再进行 Base64 编码，最后写入浏览器的 rememberMe  Cookie 中。
    
- 安全漏洞：当用户下次访问时，Shiro 会读取这个 Cookie，进行 Base64 解码，然后直接使用 AES 解密，并进行反序列化（Deserialization）
    

这就是问题的核心：

1. 它是一个“自动拆箱机”：Shiro 信任这个 Cookie，认为它是合法的，于是无条件地执行了反序列化。
    
2. “钥匙”被泄露**：如果加密用的 AES 密钥被攻击者拿到，攻击者就能构造任意的“恶意对象”，加密后填入 Cookie，让服务器去反序列化执行命令。
    

### 2. Shiro-550 与 Shiro-721 的本质区别

这是两个最著名的 Shiro 漏洞，理解它们的区别是区分“脚本小子”和“安全研究员”的分水岭。

| 特性   | Shiro-550 (CVE-2016-4437) | Shiro-721 (CVE-2019-12422)    |
| ---- | ------------------------- | ----------------------------- |
| 漏洞本质 | 硬编码密钥** (Hardcoded Key)   | 加密填充预测(Padding Oracle Attack) |
| 密钥获取 | 通过爆破常见内置密钥获取              | 无需密钥，通过侧信道暴力破解                |
| 攻击门槛 | 低，一旦获取密钥即可实施              | 高，需发送海量请求进行加密填充测试             |
| 触发方式 | 构造恶意序列化流 -> 加密 -> 发送      | 构造畸形 Padding -> 观察服务器响应差异     |

### 3. Shiro RCE 的利用逻辑 (Attack Chain)

Shiro 漏洞本身不是 RCE，它是反序列化漏洞的管道。攻击流程如下：

1. 探测阶段：请求目标站点，查看返回包是否存在 `Set-Cookie: rememberMe=deleteMe`。如果存在，说明 Shiro 在处理该请求。
    
2. Payload 投递：
    
    - 使用 `ysoserial` 生成一个“命令执行”的 Gadget Chain（如 `CommonsCollections`）。
        
    - 使用获取到的 Key 对 Payload 进行 AES 加密。
        
    - 将密文 Base64 编码放入 `rememberMe` Cookie。
        
3. 触发阶段 (Sink)：服务器接收请求，对 Cookie 进行 `AES解密` -> `反序列化`。
    
4. 执行阶段**：在反序列化过程中，JVM 自动调用了 Payload 中的 Gadget，最终执行了 `Runtime.getRuntime().exec()`，实现 RCE。
    

### 4. 实战审计：如何防御与检测

如果你在审计一个 Java 项目或进行安全加固，请关注以下三点：

#### A. 密钥管理 (最关键)

- 严禁硬编码：检查 `shiro.ini` 或代码中的 `setCipherKey`，确保没有写死在代码里。
    
- 动态生成：密钥必须在服务启动时动态生成，或者从加密配置中心加载，并且每次重启服务都应更换。
    

#### B. 序列化黑/白名单 (JEP 290)

- Shiro 本身并不负责过滤“什么类可以被反序列化”。你需要利用 JVM 的 **JEP 290** 机制，在启动参数中强制开启反序列化过滤器，只允许特定的类通过：
    
    Bash
    
    ```
    -Djdk.serialFilter=org.apache.shiro.*,java.util.*;!*
    ```
    

#### C. 流量与行为分析

- Cookie 异常：如果 WAF 检测到 `rememberMe` 字段长度异常大，或者是包含大量随机字符（非标准 Base64 编码行为），应直接拦截。
    
- 行为监控 (RASP)：在服务器端挂钩 `ObjectInputStream.readObject()`，如果发现有 `Runtime.exec` 或 `defineClass` 等行为，直接阻断该线程。





