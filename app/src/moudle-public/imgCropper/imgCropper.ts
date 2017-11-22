declare function require(path: string): any;
import Cropper from "cropperjs";
import Vue from "vue";
import { getImmersed, imageUploader, mui, plus, plusReady, setImmersed } from "../../common";
import "./imgCropper.scss";
const template = require("./imgCropper.html");

let cropperObj: any = null;

const imgCropper: any = new Vue({
    el: "#imgCropper",
    template,
    data: {
        imgUrl: "",
        isCropperWrap: getImmersed(),
        option: {
            aspectRatio: 1,
            viewMode: 1
        }
    },
    mounted() {
        setImmersed();
    },
    methods: {
        save() {
            // console.log(cropperObj.getCroppedCanvas().toDataURL());
            plus.nativeUI.showWaiting("图片处理中...");
            const cropeddata = cropperObj.getData();
            const ClipImageOptions = {
                top: cropeddata.y,
                left: cropeddata.x,
                width: cropeddata.width,
                height: cropeddata.height
            };
            let rotate = 0; // 默认值
            if (cropeddata.rotate >= 0) {
                rotate = cropeddata.rotate;
            } else {
                switch (cropeddata.rotate) {
                    case -90:
                        rotate = 270;
                        break;
                    case -180:
                        rotate = 180;
                        break;
                    case -270:
                        rotate = 90;
                        break;
                    default:
                        rotate = 0;
                }
            }
            const format = imgCropper.option.imgUrl.substring(imgCropper.option.imgUrl.lastIndexOf(".") + 1);
            const picName = imgCropper.option.imgType + "_" + Date.now() + "." + format;
            const imgOption = {
                src: imgCropper.option.imgUrl,     // 原始图片路径
                dst: "_downloads/" + picName, // (String 类型 )压缩转换目标图片的路径,这里保存到 私有目录doc
                // 如“/sdcard/Android/data/io.dcloud.HBuilder/.HBuilder/apps/HBuilder/doc”。
                overwrite: true,     // 覆盖生成新文件
                quality: 50, // (Number 类型 )压缩图片的质量,可以自己调整
                rotate,      // (Number 类型 )旋转图片的角度
                // 支持值：90-表示旋转90度；180-表示旋转180度；270-表示旋转270度。 注意：若设置rotate属性值不合法，则不对图片进行旋转操作。
                clip: ClipImageOptions          // (ClipImageOptions 类型(json对象) )裁剪图片的区域
                // 值参考ClipImageOptions定义，若设置clip属性值不合法，则不对图片进行裁剪操作。
            };
            // 压缩剪裁
            imgCropper.compressImage(imgOption);
        },
        compressImage(imgOption) {
            plus.zip.compressImage(imgOption, () => {
                // mui.toast("图片已保存到：" + imgOption.dst, { duration: "long" });
                const path = plus.io.convertLocalFileSystemURL(imgOption.dst);
                imageUploader(imgOption.dst, imgCropper.option.imgType);
                console.info("压缩成功");
                // plus.nativeUI.closeWaiting();
                // mui.back();
            }, (error) => {
                mui.toast("压缩失败", { duration: "long" });
                plus.nativeUI.closeWaiting();
            });
        },
        back() {
            mui.back();
        },
        imgLoad(ev) {
            cropperObj = new Cropper(ev.target, imgCropper.option);
        }
    }
});

plusReady((view) => {
    // imgCropper.imgUrl = plus.io.convertLocalFileSystemURL(view.imgUrl);
    imgCropper.imgUrl = view.imgUrl;
    const option = mui.extend(imgCropper.option, {
        aspectRatio: view.aspectRatio,
        imgType: view.imgType,
        imgUrl: view.imgUrl
    });
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };
});
