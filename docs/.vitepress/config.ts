import markdownItCheckBox from "markdown-it-todo-lists";
import { defineConfig } from "vitepress";
import { genSidebarByNavs } from "./sidebar";

const nav = [
  {
    text: "C 语言基础",
    link: "/clang/",
    isAutoGenSidebar: true,
  },
  {
    text: "Rust 基础",
    link: "/rust/base/",
    isAutoGenSidebar: true,
  },
  {
    text: "内置标准库",
    link: "/rust/stdlibs/",
    isAutoGenSidebar: true,
  },
  {
    text: "Rust 异步编程",
    link: "/rust/async/",
    isAutoGenSidebar: true,
  },
  {
    text: "常用开源库",
    link: "/rust/libs/",
    isAutoGenSidebar: true,
  },
];

const sidebar = genSidebarByNavs(nav);

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/",
  title: "Rust",
  description: "Notebook for learning Rust",

  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "zh-CN" }],
    ["meta", { name: "og:site_name", content: "notebook" }],
  ],

  themeConfig: {
    nav,
    logo: "/logo.svg",
    sidebar,
    outline: "deep",

    search: {
      provider: "local",
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/liaohui5",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2023-present liaohui5",
    },
  },

  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(markdownItCheckBox);
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ["@nolebase/vitepress-plugin-enhanced-readabilities/client"],
    },
    ssr: {
      noExternal: ["@nolebase/vitepress-plugin-enhanced-readabilities"],
    },
  },
});
