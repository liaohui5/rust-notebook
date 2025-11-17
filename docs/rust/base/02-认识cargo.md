

## Cargo 是什么?

cargo 是 rust 的包管理器, 如 npm 与 node, pip 与 python 的关系

## 创建项目

```sh
# 创建新项目
cargo new rust-demo

# 目录已经存在, 创建 cargo 项目
cargo init
```

## 使用 cargo 运行

+ 编译并运行 src/main.rs

```sh
cargo run # cargo r
```

+ 仅编译

```sh
cargo build # cargo b
```

+ 运行单元测试

```sh
cargo test # cargo t
```

+ 生成文档并在浏览器中打开

```sh
cargo doc --open
# or
cargo d --open
```

## 使用 cargo 管理依赖

在 rust 中, 第三方的依赖包叫做 `crate` 所谓的 crate 就是 rust 写的包


+ 搜索 , [也可以使用浏览器打开网站搜索](https://crates.io/)

```sh
cargo search rand
```

+ 安装

```sh
cargo add rand
```

+ 移除

```sh
cargo rm rand # cargo remove rand
```

### 配置 Cargo 镜像源

毕竟服务器在国外, 有时候没有梯子下载速度会很慢, 所以需要 [配置rsproxy](https://rsproxy.cn/)

## 采用发布配置自定义构建

主要有两个配置(profile):

- 用于开发环境的: dev
- 用于生成环境的: release
- opt-level: 表示优化等级(0: 完全不开启, 3: 全部开启, 1,2: 仅开启部分)

```toml
# other configs ...
[profile.dev]
opt-level = 0 # 会保留调试信息,编译速度快,建议开发环境用

[profile.release]
opt-level = 3 # 去除所有调试信息,做很多其他优化,编译速度慢
```

## 将项目发布到 crates.io

在写猜数字游戏的时候, 曾经安装过别人发布的包(生成随机数)来使用,
但其实, 我们可以将自己写好的代码放到 crates.io 上供别人下载使用,
但是在上传之前, 我们需要学习如何写文档

### 文档

`///` 被称之为 `文档注释`, 可以在其中写 markdown 内容, 例如之前实现minigrep的时
候写的搜索方法, 可以给他加上文档注释

```rust
/// Search query in file contents
///
/// # Example
///
/// ```
/// search("hello", "other string hello other string")
/// ```
pub fn search<'a>(query: &str, content: &'a str) -> Vec<&'a str> {
    content.lines().filter(|line| line.contains(query)).collect()
}
```

这里使用了 # Example 作为一级标题的部分, 除了这个, 还应该标明函数的:

- panics: 函数可能会出现 panics
- errors: 如果返回 Result, 需要写明什么情况会出现 Err
- safety: 如果函数中有 unsafe 关键字, 那么应该写明为什么用 unsafe

### 注释包含项(模块/结构体/方法等)的结构

这个一般在 `src/lib.rs` 中, 使用 `//!` 开头的注释

```rust
//! # minigrep crate
//!
//! `minigrep create` is a collection cli arguments utilities
```

### 发布 crate 包

#### 注册 crates.io 账号并设置

1. 用 Github 账号登录 [crates.io](https://crates.io/) (可能需要梯子)
2. 获取登录需要的 API token,  验证邮箱
3. 登录 `cargo login $your_api_token_string`

![crate-token](https://raw.githubusercontent.com/liaohui5/images/main/images/images202409111003762.png)

![](https://raw.githubusercontent.com/liaohui5/images/main/images/images202409111040948.png)

####  设置 crate 的元数据

发布之前需要在 `Cargo.toml` 的  `[package]` 添加一些元数据

可以定义哪些字段, 哪些是必填字段, 字段分别代表什么意思请[查看文档](https://rustwiki.org/zh-CN/cargo/reference/manifest.html)

```toml
[package]
# 这个名称就是包名不能重复, 所以发布之
# 前建议到 create.io 先查一下, 是否有重复的

# 最后, 建议再跑一次测试, 因为改动name之后
# 可能会导致代码报错, 确保没有问题再发布
name = "minigrep_4_study_rust"

# 这个包的版本
version = "0.1.0"

# rust 编译器版本
edition = "2021"

# 项目的描述, 发布之后的搜索关键字
description = "practice demo for study rust"

# 作者信息字段
authors = ["secretx500 <secretx500@qq.com>"]

# 项目许可(开源协议), 可到 http://spdx.org/licenses 寻找
# 如果有多个协议的话, 用 OR 隔开
license = "MIT OR Apache-2.0"
```

#### 发布

1. 可能需要梯子才能发布成功
2. 必须先 cargo login 登录
3. 必须有验证过的邮箱

满足这些条件后, 才能发布成功, 发布后, 就可以到网站上看到自己发布的包了

```sh
cargo publish
```

![](https://raw.githubusercontent.com/liaohui5/images/main/images/images202409111048907.png)

## Cargo 工作空间

这个功能就非常类似 nodejs 的 [pnpm包管理器](https://pnpm.io/)的 `worksapce` 功能

随着项目越来越大, 将所有的代码都放到一个 crate 中, 就会导致这个 crate 非常大, 这是不合理的,
那么工作空间的功能就是: `是一系列共享同样的 Cargo.lock 和输出目录的包`

### 创建文件

```sh
mkdir ws
cd ws
touch Cargo.toml # 创建 workspace 配置文件
cargo new linear --lib # 创建 lib crate
cargo new bst --lib # 创建 lib crate
cargo new alog # 创建 bin crate
```

### 目录结构

```txt
.
├── Cargo.lock
├── Cargo.toml
├── target
├── alog              // 二进制 crate
│   ├── Cargo.toml    // 在这个 Cargo.toml 中声明依赖
│   └── src
│       └── main.rs   // cargo run 执行的是这个文件
├── bst               // libary crate
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
└── linear            // libary crate
    ├── Cargo.toml
    └── src
        └── lib.rs
```

### 源码

::: code-group

```toml [Cargo.toml]
[workspace]
members = ["alog", "bst", "linear"]
```
:::

#### alog crate 源码

::: code-group

```toml [alog/Cargo.toml]
[package]
name = "alog"
version = "0.1.0"
edition = "2021"

# 在 bin crate 中手动导入其他的 lib crate
[dependencies]
linear = { path = "../linear" }
bst = { path = "../bst" }
```

```rust [alog/src/main.rs]
use linear;
use bst;
fn main() {
    linear::linear();
    bst::bst();
}
```
:::

#### linear crate 源码

::: code-group

```toml [linear/Cargo.toml]
[package]
name = "linear"
version = "0.1.0"
edition = "2021"

[dependencies]
```

```rust [linear/src/lib.rs]
pub fn linear() {
    println!("Hello, linear!");
}
```

:::

#### bst crate 源码

::: code-group

```toml [bst/Cargo.toml]
[package]
name = "bst"
version = "0.1.0"
edition = "2021"

[dependencies]
```

```rust [bst/src/lib.rs]
pub fn bst() {
    println!("Hello, bst!");
}
```

:::


## 使用 cargo install 从 Crates.io 安装二进制文件

所谓的安装二进制文件就是, 安装一个可以执行的命令, 并且将这个命令添加到环境变量 `$PATH` 中,
如: [lsd 命令](https://crates.io/crates/lsd),  这是一个可用于替代 ls 命令的命令

```sh
cargo install lsd
```

## Cargo 自定义扩展命令

当使用 cargo install 安装二进制 crate 之后,
就可以使用 `cargo lsd` 类似这样的格式来执行这些文件,
也可以使用 `cargo --list` 来查看所有已经安装的二进制的命令
