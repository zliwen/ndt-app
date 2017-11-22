import * as Vue from "vue";
import * as Neo from "../common";
const plus: any = (window as any).plus;
const mui: any = (window as any).mui;

// 注册一个全局自定义指令 v-imgcropper
Vue.directive("imgCropper", {
    // 当绑定元素插入到 DOM 中。
    inserted: (el, binding) => {
        el.addEventListener("tap", () => {
            plus.gallery.pick((path) => {
                Neo.openPage("imgCropper", {
                    imgUrl: path,
                    aspectRatio: Number(el.dataset.aspectRatio) || 1,
                    imgType: binding.arg
                });
                window.addEventListener(binding.arg, (event: any) => {
                    binding.value(event.detail.img, binding.arg, event.detail.fileId);
                });
                console.log("选择成功：" + path);
            }, (e) => {
                console.log("取消选择图片");
            }, { filter: "image" });
        }, false);
    }
});
