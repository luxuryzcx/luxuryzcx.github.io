+++
title = "编写一个简单的Spring Controller"
date = 2026-06-15T19:56:22+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 完整代码

SpringControllerApplication.java

```java
package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringControllerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringControllerApplication.class, args);
    }
}

```

TestController.java

```java
package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {
    @ResponseBody
    @RequestMapping("/test")
    public String test() {
        return "hello spring";
    }
}

```

pom.xml

```c
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springController</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.boot.version>2.7.18</spring.boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring.boot.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring.boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>

```


# mvn  进行打包


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517164620095.png)


# 运行并访问



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517164658887.png)



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517164751069.png)


可以看到已经成功访问了






