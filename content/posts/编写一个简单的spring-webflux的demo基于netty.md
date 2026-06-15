+++
title = "编写一个简单的Spring WebFlux的Demo（基于Netty）"
date = 2026-06-15T19:56:47+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 完整代码

WebFluxMemoryShellDemoApplication.java

```java
package org.example.webfluxmemoryshelldemo;

  

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;

  

@SpringBootApplication

public class WebFluxMemoryShellDemoApplication {

    public static void main(String[] args) {

        SpringApplication.run(WebFluxMemoryShellDemoApplication.class, args);

    }

}
```

GreetingHandler.java


```java
package org.example.webfluxmemoryshelldemo.hello;

  

import org.springframework.http.MediaType;

import org.springframework.stereotype.Component;

import org.springframework.web.reactive.function.BodyInserters;

import org.springframework.web.reactive.function.server.ServerRequest;

import org.springframework.web.reactive.function.server.ServerResponse;

import reactor.core.publisher.Mono;

  

@Component

public class GreetingHandler {

    public Mono<ServerResponse> hello(ServerRequest request) {

        return ServerResponse.ok()

                .contentType(MediaType.TEXT_PLAIN)

                .body(BodyInserters.fromValue("Hello, Spring!"));

    }

}
```

GreetingRouter.java

```java
package org.example.webfluxmemoryshelldemo.hello;

  

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.http.MediaType;

import org.springframework.web.reactive.function.server.RequestPredicates;

import org.springframework.web.reactive.function.server.RouterFunction;

import org.springframework.web.reactive.function.server.RouterFunctions;

import org.springframework.web.reactive.function.server.ServerResponse;

  

@Configuration

public class GreetingRouter {

    @Bean

    public RouterFunction<ServerResponse> route(GreetingHandler greetingHandler) {

        return RouterFunctions.route(

                RequestPredicates.GET("/hello").and(RequestPredicates.accept(MediaType.TEXT_PLAIN)),

                greetingHandler::hello);

    }

}
```


# mvn 打包  加载

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517182924021.png)

# 运行启动

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517183026589.png)


打开进行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517183117217.png)


