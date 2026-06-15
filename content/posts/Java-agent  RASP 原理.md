+++
title = "Java-agent  RASP 原理"
date = 2026-06-15T19:40:00+08:00
draft = false
description = "由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。"
tags = ["Java安全", "安全研究"]
categories = ["安全研究"]
series = ["Java 安全 持续学习"]
pin = false
cover = "/images/posts/java-security-banner.svg"
+++
## 前言

RASP   (运用时应用自我保护)

是一种应用程序内部实现的主动防御技术。与传统的WAF不同，RASP直接嵌入到应用程序的运行环境中（通常通过Java agent 等技术）通过监控，分析和拦截恶意调用来保护应用。


核心原理

钩子机制:RASP利用jvm的instrumentation 能力 在 应用程序的关键函数如 Runtime.exec(),
java.sql.Statement.file.open()上设置钩子。

上下文感知:执行敏感操作，会检查此时的上下文，谁发起的请求，请求参数是什么，是否符合正常行为。

防御决策：识别攻击行为，RASP会立即阻止该调用并记录日志，然后终止该请求。



## 简单实现一下


### 核心原理

- **`ClassPool.getDefault()`**：获取 Javassist 的类池，它负责在内存中寻找和管理类。
    
- **`CtClass` 和 `CtMethod`**：分别代表类和方法，通过它们可以动态获取类结构。
    
- **`insertBefore(String src)`**：Javassist 提供的强大方法，允许直接把一段合法的 Java 字符串代码插入到目标方法体的最前面。在 RASP 中，我们通过 `$1` 获取传入的命令参数进行审查，一旦发现恶意特征（如 `calc.exe`）直接抛出 `SecurityException` 阻断后续流程。

### 未拦截版本

发现跳出计算机

```c
java -cp target/javassist-rasp-1.0-SNAPSHOT.jar com.rasp.CalcTest
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260610191703556.png)

源码

```java
  package com.rasp;

  /**
   * 简单测试 - 直接弹出计算器（无 RASP 拦截）
   *
   * 运行命令:
   * java -cp target/javassist-rasp-1.0-SNAPSHOT.jar com.rasp.CalcTest
   */
  public class CalcTest {
      public static void main(String[] args) throws Exception {
          System.out.println("正在启动计算器...");
          Runtime.getRuntime().exec("calc.exe");
          System.out.println("计算器已启动！");
      }
  }

```





### 拦截后版本



这是拦截之后的效果

```c
java -javaagent:target/javassist-rasp-1.0-SNAPSHOT.jar -cp target/javassist-rasp-1.0-SNAPSHOT.jar com.rasp.ComprehensiveTest
╔══════════════════════════════════════════════════════════╗
║              RASP (Runtime Application Self-Protection)  ║
║                    Java Agent v1.0                        ║
╚══════════════════════════════════════════════════════════╝

[RASP] Agent 启动成功，开始注册拦截器...

[RASP] 注册 Runtime.exec 拦截器...
[RASP] 注册 ProcessBuilder 拦截器...
[RASP] 注册文件操作拦截器...
[RASP] 注册反射调用拦截器...
[RASP] 注册网络连接拦截器...

[RASP] 所有拦截器注册完成！
[RASP] 监控列表:
  ├── 命令执行: Runtime.exec, ProcessBuilder.start
  ├── 文件操作: FileInputStream, FileOutputStream, File.delete
  ├── 反射调用: Method.invoke, Class.forName
  └── 网络连接: Socket, URL.openConnection

══════════════════════════════════════════════════════════



┌─────────────────────────────────────────────────────────┐
│           RASP 综合测试程序                              │
└─────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════
测试1: Runtime.exec 命令执行
═══════════════════════════════════════════════════════════

尝试执行: calc.exe
[RASP] 检测到 ProcessBuilder 类加载，注入拦截器...
[RASP] ProcessBuilder.start() 注入成功
[RASP] ProcessBuilder 拦截到危险命令: calc.exe
? 命令被拦截: RASP拦截：禁止执行该命令！calc.exe

尝试执行: whoami
[RASP] ProcessBuilder 拦截到危险命令: whoami
? 命令被拦截: RASP拦截：禁止执行该命令！whoami

尝试执行: notepad.exe
[RASP] ProcessBuilder 拦截到危险命令: notepad.exe
? 命令被拦截: RASP拦截：禁止执行该命令！notepad.exe


═══════════════════════════════════════════════════════════
测试2: ProcessBuilder 进程创建
═══════════════════════════════════════════════════════════

尝试执行: cmd.exe /c dir
[RASP] ProcessBuilder 拦截到危险命令: cmd.exe /c dir
? 进程被拦截: RASP拦截：禁止执行该命令！cmd.exe /c dir

尝试执行: powershell Get-Process
[RASP] ProcessBuilder 拦截到危险命令: powershell get-process
? 进程被拦截: RASP拦截：禁止执行该命令！powershell get-process

尝试执行: notepad.exe
[RASP] ProcessBuilder 拦截到危险命令: notepad.exe
? 进程被拦截: RASP拦截：禁止执行该命令！notepad.exe


═══════════════════════════════════════════════════════════
测试3: 文件操作
═══════════════════════════════════════════════════════════

尝试读取: C:\Windows\System32\drivers\etc\hosts
? 文件读取成功（未被拦截）

尝试读取: test.txt
? IO异常: test.txt (系统找不到指定的文件。)

尝试写入: test_output.txt
? 文件写入成功


═══════════════════════════════════════════════════════════
测试4: 反射调用
═══════════════════════════════════════════════════════════

通过反射加载 Runtime 类...
通过反射获取 exec 方法...
通过反射调用 exec("calc.exe")...
[RASP] ProcessBuilder 拦截到危险命令: calc.exe
? 异常: null


═══════════════════════════════════════════════════════════
测试5: 网络连接
═══════════════════════════════════════════════════════════

尝试连接: 127.0.0.1:22
[RASP] 检测到 Socket 类加载，注入网络拦截器...
[RASP] Socket 注入成功
[RASP] 网络连接请求: 127.0.0.1:22
[RASP] 警告：连接到敏感端口 22
? 连接失败: Connection refused: connect

尝试连接: 127.0.0.1:80
[RASP] 网络连接请求: 127.0.0.1:80
? 连接失败: Connection refused: connect

尝试连接: 127.0.0.1:3306
[RASP] 网络连接请求: 127.0.0.1:3306
[RASP] 警告：连接到敏感端口 3306
? 连接失败: Connection refused: connect

尝试连接: 127.0.0.1:8080
[RASP] 网络连接请求: 127.0.0.1:8080
? 连接成功（未被拦截）

尝试连接: 192.168.1.1:22
[RASP] 网络连接请求: 192.168.1.1:22
[RASP] 警告：连接到敏感端口 22
[RASP] 警告：连接到可疑地址 192.168.1.1
```



发现都已经被拦截了


源码

```java
package com.rasp;

  /**
   * 简单测试 - 弹出计算器（带 RASP 拦截）
   *
   * 运行命令:
   * java -javaagent:target/javassist-rasp-1.0-SNAPSHOT.jar -cp target/javassist-rasp-1.0-SNAPSHOT.jar com.rasp.CalcTest
   */
  public class CalcTest {
      public static void main(String[] args) throws Exception {
          System.out.println("正在启动计算器...");
          try {
              Runtime.getRuntime().exec("calc.exe");
              System.out.println("计算器已启动！");
          } catch (SecurityException e) {
              System.out.println("计算器被拦截！");
              System.out.println("拦截原因: " + e.getMessage());
          }
      }
  }
```


原因是加载了agent
