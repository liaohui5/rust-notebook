## 介绍

> 什么是异步?

`async/await` 编程是一种并发(concurrent)的编程模型, 
但是它不同于多线程的异步模型, 不需要让操作系统去调度CPU,
性能开销更小...代码看起来像是同步的代码, 但是实际执行却是异步的,
看上去有点类似于 JavaScript 的 `async/await`

## 学习资料

- [Rust 异步编程](https://rust-lang.github.io/async-book/)
- [Rust 异步编程-中文](https://huangjj27.github.io/async-book/)

## 异步编程模型

+ OS 多线程/多进程
  + 无需改变编程模型, 线程间同步困难, 性能开销大
  + 具体应用: 比如之前写多线程 web 服务器时学过的 `线程池`

+ Event-deriven: 事件驱动
  + 类似 nodejs 的那种回调函数, 虽然高效, 但由于是非线性控制流, 所以可能会出现 `callback hell` 问题
  + 由于是非线性控制的, 所以可能会难以定位和传播错误
  + 如 node.js 的 `fs.readFile` API

+ Coroutine: 微线程(有的也叫 `纤程` `协程`)

  + 类似OS多线程, 但是由程序控制的, 所以没有线程切换的开销, 所以执行效率高, 类似 concurrent
  + 一般由编程语言提供的API, 比如: python 的 yield/asyncio, JS 的 Promise API

+ Actor 模型: 暂时还未学习过, 先过


## Rust 中的 async/await

+ Future 是惰性的
+ async 是零成本抽象(无需分配多内存和动态调度)
+ 不提供标准库实现, 由社区支持, 如 [tokio](https://github.com/tokio-rs/tokio) 和 [async-std](https://github.com/async-rs/async-std)


## 多线程与 async/await 的关系

- 多线程
  - 没有额外的运行时, 允许重复利用现有代码,代码几乎无需修改即可获得异步的能力(如之前写多线程web服务器的例子)
  - 创建/销毁线程内存和CPU开销大(线程池只能降低一些成本)

- async/await
  - 内存和CPU开销小, 对比多线程可显著降低内存和CPU开销(大量任务的情况下)
  - 需要额外的运行时来生产状态机, 可执行文件大

<span class="red-text">async/await 这种并发和多线程各有不同的应用场景, 不代表 async/await 就一定比多线程并发更好</span>

就比如你需要锻炼身体, 玩篮球和玩排球的关系, 都可以锻炼身体, 只是玩法不同, 没有哪种更好


## 语言和库的支持

+ rust 标准库只提供了最基本的特性/类型/和功能, 比如 `Future trait`
+ rust 编译器直接支持 async/await 语法
+ 异步代码/io和任务申城的执行由 `async runtimes`  提供

由于 rust 标准库只提供了最基本的功能和语法支持, 虽然可以实现并发编程, 但是不够方便好用, 所以很多的引用都依赖于社区实现的库, 如: `async-std` 和 `tokio`

## 注意

rust 不允许在 trait 中声明 async 函数

## 兼容性考虑

+ async 和同步代码不能总是自由结合(如: 不能直接从同步函数中调用异步函数)

+ async 代码也不总是能只有结合(如: 因为不同的实现依赖于不同的runtime, 比如 async-std 和 rayon 就不能混着用)

