## 什么是 trait

中文直译就是: `特性` 或者 `特征`

可以简单的理解为其他编程语言中接口(interface)的功能,
就是为了定义共同行为

比如: 之前学习泛型的时候用过 [std::cmp::PartialOrd](https://rustwiki.org/zh-CN/core/cmp/trait.PartialOrd.html) 它就是内置的 trait

## 定义 trait

```rust
// 多边形
trait Polygon {
    // 获取面积
    fn get_area(&self) -> u32;

    // 获取周长
    fn get_length(&self) -> u32;
}

// 矩形
struct Rectangle {
    width: u32,
    height: u32,
}

impl Polygon for Rectangle {
    fn get_area(&self) -> u32 {
        self.width * self.height
    }

    fn get_length(&self) -> u32 {
        self.height * 2 + self.width * 2
    }
}

// 正方形
struct Square {
    width: u32,
}

impl Polygon for Square {
    fn get_area(&self) -> u32 {
        self.width * self.width
    }

    fn get_length(&self) -> u32 {
        self.width * 4
    }
}

// 三角形(等边)
struct Triangle {
    length: u32,
}

impl Polygon for Triangle {
    fn get_area(&self) -> u32 {
        self.length * 3 / 2
    }

    fn get_length(&self) -> u32 {
        self.length * 3
    }
}

// 传入的数据类型必须实现 Polygon 这个特性
// 这就是面向对象语言中 多态 的概念
// 正方形/长方形/三角形 计算面积可以看做 多边形计算面积
// 正方形/长方形/三角形 计算周长可以看做 多边形计算边长
fn get_poly_info<T: Polygon>(polygon: &T) -> (u32, u32) {
    let area = polygon.get_area();
    let length = polygon.get_length();
    (area, length)
}

fn main() {
    let rect = Rectangle {
        width: 3,
        height: 4,
    };
    let (area, length) = get_poly_info(&rect);
    println!("rect area={}, length={}", area, length);

    let square = Square {
        width: 3,
    };
    let (area, length) = get_poly_info(&square);
    println!("square area={}, length={}", area, length);

    let tria = Triangle {
        length: 4,
    };
    let (area, length) = get_poly_info(&tria);
    println!("tria area={}, length={}", area, length);
}
```

## 默认实现

trait 可以有默认实现, 不同于Java的接口, 接口只能定义方法, 不能有默认实现

```rust
trait Animal {
    fn eat(&self);
    fn breath(&self) {
        println!("动物都需要呼");
    }
}

struct Cat {}

impl Animal for Cat {
    // 使用默认实现的 breath
    // fn breath(&self) {
    //     println!("猫需要呼吸");
    // }
    fn eat(&self) {
        println!("猫吃鱼");
    }
}

struct Dog {}

impl Animal for Dog {
    fn breath(&self) {
        println!("狗需要呼吸");
    }

    fn eat(&self) {
        println!("狗吃骨头");
    }
}

fn animal_eat_breath<T: Animal>(animal: &T) {
    animal.breath();
    animal.eat();
}

fn main() {
    let cat = Cat {};
    animal_eat_breath(&cat);

    let dog = Dog {};
    animal_eat_breath(&dog);
}
```

## trait 当作参数

### 多种绑定方式

```rust
trait Runable {
    fn run(&self) {
        println!("运行中...");
    }
}

// 两种写法原理是一样的, 后面这种事新版本的语法糖
fn run<T: Runable>(t: T) {
    t.run();
}

fn execute(t: &impl Runable) {
    t.run();
}
```

### 使用 + 指定多个 trait 绑定

```rust
trait Writable {
    fn write(&self) {
        println!("是否可写...");
    }
}

trait Configurable {
    fn config(&self) {
        println!("是否可配置...");
    }
}

fn is_writeable(t: &(impl Writeable + Configurable)) {

}

// 推荐: 比较清晰
fn is_configurable<T: Writable + Configurable>(t: &T) {

}
```

### 通过 where 简化 trait 绑定

```rust
trait Readable {
    fn read(&self) {
        println!("是否可读...");
    }
}

trait Writable {
    fn write(&self) {
        println!("是否可写...");
    }
}

trait Runable {
    fn run(&self) {
        println!("是否可执行...");
    }
}

// 如果特性比较多, 那么这么写就比较变态, 建议使用 where 关键字
// fn is_full_perms<T: Readable + Writable, U:Readable + Writable + Runable>
// (path: T, file: U) -> bool
// {
//     false
// }

fn is_full_rights<T, U>(path: T, file: U) -> bool
where
    T: Readable + Writable,
    U: Readable + Writable + Runable
{
    true
}
```

## trait 类型当作返回值

```rust
trait Swimable {
    fn swim(&self);
}

struct Fish {}
impl Swimable for Fish {
    fn swim(&self) {
        println!("鱼会游泳");
    }
}

struct Tortoise {}
impl Swimable for Tortoise {
    fn swim(&self) {
        println!("乌龟会游泳");
    }
}

fn get_swimable_animal()-> impl Swimable {
    Fish{ }
    // Tortoise{ }
}

fn main() {
    let swimable_animal = get_swimable_animal();
    swimable_animal.swim();
}
```

## dyn 关键字

用来创建一个 指向实现了特定 trait 的实例对象的引用

```rust
trait Executable {
    fn exec(&self);
}

struct ShellScript {
    path: String
}
impl Executable for ShellScript {
    fn exec(&self) {
        println!("执行shell脚本:{}", self.path);
    }
}

struct Command {
    name: String
}
impl Executable for Command {
    fn exec(&self) {
        println!("执行系统命令:{}", self.name);
    }
}

// dyn 的作用就是用来创建一个 `指向实现特定trait的实例对象的引用`
// 直接 &Executable 是不允许的, 必须加上 dyn 关键字
// 不能这样操作:
// fn execute(x: &Executable) {
fn execute(x: &dyn Executable) {
    x.exec();
}

// run 和 execute 是等价的
fn run<T: Executable>(x: &T) {
    x.exec();
}

fn main() {
    let command = Command { name: "ls".to_string() };
    execute(&command);

    let script  = ShellScript { path: "./run.sh".to_string() };
    run(&script);
}
```

## 标准库 trait 学习

### Eq 和 PartialEq

### Ord 和 PartialOrd

### Clone 和 Copy

## 高级 trait

### 关联类型在 trait 定义中指定占位符类型

比如之前的迭代器特性 `Iterator` trait 中就有一个 `Item` 关联类型

```rust
pub trait Iterator {
  type Item; // 关联类型
  fn next(&mut self) -> Option<Self::Item>;
}
```

### 实现带关联类型和实带泛型trait的区别

1. 带有关联类型的trait只能实现一次, 带泛型 trait 可以实现多次
2. 实现带泛型的 trait 必须每次手动指定类型

#### 实现带关联类型的trait

```rust
struct Countdown {
    start: u32,
}

// Iterator 这个 trait 是标准库中的
impl Iterator for Countdown {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.start == 0 {
            None
        } else {
            self.start -= 1;
            Some(self.start)
        }
    }
}

// 只能实现一次, 实现多次就会冲突, 如果实现多次, 那么 for in 迭代的时候用哪个实现呢?
// error[E0119]: conflicting implementations of trait `Iterator` for type `Countdown`
// impl Iterator for Countdown {}

fn main() {
    let c = Countdown { start: 5 };
    for i in c {
        println!("{}", i);
    }
}

```

#### 实现带泛型的 trait

```rust {37-75}
trait Appendable<T> {
    fn append(&mut self, value: &mut T) -> Stack;
}

// first in last out
struct Stack {
    items: Vec<i32>,
}
impl Stack {
    fn new() -> Stack {
        Stack { items: Vec::new() }
    }
    fn pop(&mut self) -> Option<i32> {
        self.items.pop()
    }
    fn push(&mut self, item: i32) {
        self.items.push(item);
    }
}

// first in first out
struct Queue {
    items: Vec<i32>,
}
impl Queue {
    fn new() -> Queue {
        Queue { items: Vec::new() }
    }
    fn dequeue(&mut self) -> Option<i32> {
        self.items.pop()
    }
    fn enqueue(&mut self, item: i32) {
        self.items.insert(0, item);
    }
}

// merage anothor stack items
impl Appendable<Stack> for Stack {
    fn append(&mut self, stk: &mut Stack) -> Stack {
        let mut new_stk = Stack::new();

        // keep order, first in last out
        while let Some(item) = self.pop() {
            new_stk.items.insert(0, item);
        }

        while let Some(item) = stk.pop() {
            new_stk.items.insert(0, item);
        }

        new_stk
    }
}

// merge anothor queue items
impl Appendable<Queue> for Stack {
    fn append(&mut self, q: &mut Queue) -> Stack {
        let mut stk = Stack::new();

        // keep order, first in last out
        while let Some(item) = self.items.pop() {
            stk.items.insert(0, item);
        }

        while let Some(item) = q.dequeue() {
            stk.items.insert(0, item);
        }

        stk
    }
}

// 带有泛型的特性可以在一个结构体中多次实现
// impl Appendable<LinkedList> for Stack
// impl Appendable<HashTable> for Stack

// print stack items like a string
fn print_stack_items(label: &str, stk: &Stack) {
    let mut msg = String::new();
    msg.push_str("[");
    for item in stk.items.iter() {
        msg.push_str(item.to_string().as_str());
        msg.push_str(",");
    }
    msg.pop(); // remove last ,
    msg.push_str("]");
    println!("{}:{}", label, msg);
}

fn main() {
    let mut stk1 = Stack::new();
    stk1.push(1);
    stk1.push(2);
    stk1.push(3);
    print_stack_items("stk-1", &stk1);
    // stk-1:[1,2,3]

    let mut anthor_stk = Stack::new();
    anthor_stk.push(4);
    anthor_stk.push(5);
    anthor_stk.push(6);
    let mut stk2 = stk1.append(&mut anthor_stk);
    print_stack_items("stk-2", &stk2);
    // stk-2:[4,5,6,1,2,3]

    let mut queue = Queue::new();
    queue.enqueue(7);
    queue.enqueue(8);
    queue.enqueue(9);
    let stk3 = stk2.append(&mut queue);
    print_stack_items("stk-3", &stk3);
    // stk-3:[9,8,7,4,5,6,1,2,3]
}
```

### 默认泛型参数

```rust
// 为哪个结构体实现这个特性那么 T 默认是那个结构体
// 如: trait Appendable for Stack
// 那么此时的 T 泛型代表的就是 Stack 这个结构体类型
trait Appendable<T = Self> {
    fn append(&mut self, value: &mut T) -> Stack;
}

struct Stack {
    items: Vec<i32>,
}
impl Stack {
    fn new() -> Stack {
        Stack { items: Vec::new() }
    }
    fn pop(&mut self) -> Option<i32> {
        self.items.pop()
    }
    fn push(&mut self, item: i32) {
        self.items.push(item);
    }
}

impl Appendable for Stack {
    fn append(&mut self, stk: &mut Stack) -> Stack {
        let mut new_stk = Stack::new();
        while let Some(item) = self.pop() {
            new_stk.items.insert(0, item);
        }
        while let Some(item) = stk.pop() {
            new_stk.items.insert(0, item);
        }
        new_stk
    }
}

fn print_stack_items(label: &str, stk: &Stack) {
    let mut msg = String::new();
    msg.push_str("[");
    for item in stk.items.iter() {
        msg.push_str(item.to_string().as_str());
        msg.push_str(",");
    }
    msg.pop(); // remove last ,
    msg.push_str("]");
    println!("{}:{}", label, msg);
}

fn main() {
    let mut stk1 = Stack::new();
    stk1.push(1);
    stk1.push(2);
    stk1.push(3);
    print_stack_items("stk-1", &stk1);
    // stk-1:[1,2,3]

    let mut anthor_stk = Stack::new();
    anthor_stk.push(4);
    anthor_stk.push(5);
    anthor_stk.push(6);
    let stk2 = stk1.append(&mut anthor_stk);
    print_stack_items("stk-2", &stk2);
    // stk-2:[4,5,6,1,2,3]
}
```

### 运算符重载

运算符重载: 为结构体实现运算符特性, 这里以加法为例子, 同理可以实现其他运算符特性,
[查看标准库运算符特性文档](https://rustwiki.org/zh-CN/std/ops/index.html#traits)

```rust
use std::ops::Add;

struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }
    fn get_area(&self) -> u32 {
        self.width * self.height
    }
}

// 为结构体实现加法运算符特性, 那么这个结构体就可以直接相加
// 那么可以重载加法运算符, 同理也重载 减法/乘法/除法 等运算符
// https://rustwiki.org/zh-CN/std/ops/index.html#traits
// Rectangle + Rectangle
impl Add for Rectangle {
    type Output = Rectangle;
    fn add(self, rhs: Rectangle) -> Self::Output {
        Rectangle {
            width: self.width + rhs.width,
            height: self.height + rhs.height
        }
    }
}

// 这个加法运算符特性是同时带有带有泛型的和关联类型占位符
// 因为这个特性带有泛型, 所以可以为一个结构体多次实现这个特性
// Reactange + u32
impl Add<u32> for Rectangle {
    type Output = Rectangle;
    fn add(self, rhs: u32) -> Self::Output {
        Rectangle {
            width: self.width + rhs,
            height: self.height + rhs
        }
    }
}

fn main() {
    let rect1 = Rectangle::new(10, 10);
    println!("area of rect1 is {}", rect1.get_area());

    let rect2 = Rectangle::new(20, 20);
    println!("area of rect2 is {}", rect2.get_area());

    let rect3 = rect1 + rect2;
    println!("area of rect3 is {}", rect3.get_area());

    let rect4 = rect3 + 5; // 35 * 35
    println!("area of rect4 is {}", rect4.get_area());
}
```

### 完全限定语法与消歧义: 调用相同名称的方法

Rust 既不能避免一个 trait 与另一个 trait 拥有相同名称的方法, 也不能阻止为同一类型同时实现这两个 trait

```rust
trait Pilot {
    fn fly(&self);
    fn get_name();
}

trait Wizard {
    fn fly(&self);
    fn get_name();
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("飞行员可以飞");
    }
    fn get_name() {
        println!("飞行员");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("魔法师可以飞");
    }
    fn get_name() {
        println!("魔法师");
    }
}

impl Human {
    fn fly(&self) {
        println!("人类坐飞机可以飞");
    }
}

impl Human {
    fn get_name() {
        println!("普通人类");
    }
}

fn main() {
    let h = Human;

    // 1.通过传入的引用自动推到出类型
    h.fly();         // 人类坐飞机可以飞
    Pilot::fly(&h);  // 飞行员可以飞
    Wizard::fly(&h); // 魔法师可以飞

    // 2.使用完全限定语法强制转换类型
    Human::get_name();     // 普通人类
    // Pilot::get_name();  // 飞行员
    // Wizard::get_name(); // 魔法师
    // 这样调用是不行的, 编译器报错:
    // error[E0790]: cannot call associated function on trait without specifying the corresponding `impl` type

    <Human as Pilot>::get_name();    // 飞行员
    <Human as Wizard>::get_name();   // 魔法师
}
```

### trait 依赖其他trait

如果 `OutlinePrint` 特性有一个默认实现, 但是它的实现依赖 `fmt::Display` 特性,

1. 那么实现 `OutlinePrint` 特性时, 必须同时实现 `fmt::Display` 特性
2. `fmt::Display` 特性就是 `OutlinePrint` 特性的父级特性 `Super trait`

```rust
use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

struct Point {
    x: i32,
    y: i32,
}

// 此时会报错: 虽然 OutlinePrint 有默认实现, 但是它依赖了 fmt::Display 特性
// 如果不同时实现 fmt::Display 特性就会报错
impl OutlinePrint for Point {}
impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "(x:{},y:{})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    p.outline_print();
}
```

### 为外部类型实现特性

用于扩展外部(其他crate或标准库)中的结构体

::: code-group

```rust [不允许给外部的结构体直接实现特性]
// 直接为外部(其他crate或标准库)中的结构体实现trait是不允许的
// error[E0117]: only traits defined in the current crate can be implemented for types defined outside of the crate
impl std::fmt::Display for std::vec::Vec<String> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.join(", "))
    }
}

fn main() {
    let v = vec![
        String::from("hello"),
        String::from("world"),
    ];
    println!("{}", v);
}
```

```rust [使用newtype模式为外部结构体实现特性]
use std::fmt;

// 1. 在当前位置定义新的结构体 VecWrapper
struct VecWrapper(Vec<String>);

// 2. 为这个 VecWrapper 结构体实现特性, 也就是间接为外部的 Vec 实现了特性
impl fmt::Display for VecWrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let v = vec![
        String::from("hello"),
        String::from("world"),
    ];
    let w = VecWrapper(v);

    println!("{}", w);
}
```

```rust [完善泛型定义]
use std::fmt;

// 1. 在当前位置定义新的结构体 VecWrapper
struct VecWrapper<T>(Vec<T>);

// 2. 为这个 VecWrapper 结构体实现特性, 然后使用 VecWrapper 即可, 功能和 Vec 是一样的
// 3. 传入的泛型必须实现 fmt::Debug 特性(用于输出到控制台)
impl<T: fmt::Debug> fmt::Display for VecWrapper<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 使用 iter 和 map 将每个元素转换为字符串, 然后使用 join 拼接
        write!(f, "[{}]", self.0.iter().map(|x| format!("{:?}", x)).collect::<Vec<_>>().join(", "))
    }
}

fn main() {
    let v = vec![
        String::from("hello"),
        String::from("world"),
    ];
    let w = VecWrapper(v); // Vec<String> String 实现了 fmt::Debug 特性
    println!("{}", w);

    let nums = vec![1, 2, 3]; // Vec<i32> i32 实现了 fmt::Debug 特性
    let w = VecWrapper(nums);
    println!("{}", w);
}
```

:::

## 标准库中的 trait 学习

### std::fmt::Display

实现这个特性就可以直接使用 `println!()` 宏来输出到标准输出,

他会自动实现 `ToString` trait 也就是说, 实现 `Display` trait 就可以使用 `to_string` 方法

```rust
use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "x={},y={}", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 10, y: 20 };
    println!("p is {}", p); // p is x=10,y=20

    let s = p.to_string();
    println!("s is {}", s); // p is x=10,y=20
}
```

### Form<&str>

这个特性可以传递泛型, 比一定是 `&str` 也可以是其他的类型

实现这个特性就可以直接使用 `into` 方法, 或者 `from` 方法

```rust
#[derive(Debug)]
enum Season {
    Spring,
    Summer,
    Autumn,
    Winter,
    Unknown,
}

impl From<u32> for Season {
    fn from(value: u32) -> Season {
        match value {
            0 => Season::Spring,
            1 => Season::Summer,
            2 => Season::Autumn,
            3 => Season::Winter,
            _ => Season::Unknown,
        }
    }
}

impl From<&str> for Season {
    fn from(value: &str) -> Season {
        match value {
            "spring" => Season::Spring,
            "summer" => Season::Summer,
            "autumn" => Season::Autumn,
            "winter" => Season::Winter,
            _ => Season::Unknown,
        }
    }
}

fn main() {
    let s1 = Season::from("summer");
    let s3 = Season::from(0);

    // 使用 into 方法必须指定类型
    let s2: Season = "winter".into();
    let s4: Season = 2.into();
    println!("s1: {:?}", s1);
    println!("s2: {:?}", s2);
    println!("s3: {:?}", s3);
    println!("s4: {:?}", s4);
}
```
