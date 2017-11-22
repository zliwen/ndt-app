// 当前环境 dev or build
export const ENV = "dev";
// export const ENV = "build";
// APP名称
export const APPNAME = "农贷通";
// 返回按钮Base64码
export const backImgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAb1BMVEUAAAAAev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8AAACubimgAAAAI3RSTlMAGfUTGfQTGPMSGPIYGhgaGBsXGxcbFxwXHBccFhwWHRYdHWufDPQAAAABYktHRACIBR1IAAAAB3RJTUUH4QETEBwooeTlkQAAAJVJREFUSMft1EkSgkAQRNFGUXFWHBDBibr/HTUwD5B/48Ig1y+io7u6MqUhf5hsNEY+j5hMgZ/FJ8Xc9ovos3T96utjbfqN/Nb0O/m96Uv5g+mP8ifTn+Ur01/ka9Nf5RvTt/I309/lH6Z/yr9Mn+Q71/MT8B34K/E58Enzv8R/K98HvnF8p3lr8F7izce7lbf3kJ/lDQp9HdBhgg3PAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAxLTE5VDE2OjI4OjQwKzA4OjAwpTDFwQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMS0xOVQxNjoyODo0MCswODowMNRtfX0AAAAASUVORK5CYII=";
// 返回按钮默认图片
export const backImgUrl = "_www/dist/app_" + ENV + "/assets/images/user-list.png";

// 远程服务地址
// export const ROOT = "http://web.ndtcd.cn/";
// export const IMGURL = "http://web.ndtcd.cn/";

// 线上环境
// export const ROOT = "http://www.ndtcd.cn/";
// export const IMGURL = "http://www.ndtcd.cn/";

// 开发环境
export const ROOT = "http://192.168.1.42:28080/";
export const IMGURL = "http://192.168.1.42:28080/";

// Ajax请求根路径
export const REMOTE = ROOT + "v1/";
// 静态图片资源地址
export const ASSETSIMG = "_www/dist/app_" + ENV + "/assets/images/";
// HTML5 PLUS底层库
export const plus = (window as any).plus;
// MUI框架
export const mui = (window as any).mui;
// 弹层组件
export const layer = (window as any).layer;
// 不用验证Token的页面列表
export const noAuth = ["login", "register", "registerCompany", "forget", "index", "productDetail", "products", "news", "newDetail", "creditQuery", "user", "mainTab", "financialProducts"];