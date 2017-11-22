declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import "./productDetail.scss";

const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const template = require("./productDetail.html");

mui.init({
    swipeBack: true
});

plusReady((view: any) => {
    hideScroll();

    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };

    // 获取贷款产品ID
    const { productId } = view;
    if (productId) {
        Neo.$http("GET", "front/loanProduct/findById", { id: productId }).then((res: any) => {
            if (!res.errorCode && res.data) {
                products.detail = res.data;
            } else {
                Neo.showError(res.errorCode, "获取产品详情失败");
            }
            products.loading = false;
        }).catch(() => {
            products.loading = false;
        });
    }
});

interface IProductDetail {
    loading: boolean;
    detail: object | null;
}

const products: any = new Vue({
    el: "#productDetail",
    template,
    data(): IProductDetail {
        return {
            loading: true,
            detail: null
        };
    },
    methods: {
        logo: Neo.getProductImg,
        getUnit: Neo.getUnit,
        formatMoney(str) {
            return Neo.formatMoney(str + "");
        },
        showPage(id: string, detail: object | any) {
            if (!!Neo.getCookie("access_token")) {
                const userType = Neo.getSettings("user").userType;
                if (userType === 202) {
                    if (detail.productTo.indexOf(2701) < 0) {
                        Neo.showMsg("此产品不适用于个人用户");
                    } else {
                        openPage(id, { detail });
                    }
                }
                if (userType === 203) {
                    if (detail.productTo.indexOf(2702) < 0) {
                        Neo.showMsg("此产品不适用于企业用户");
                    } else {
                        openPage(id, { detail });
                    }
                }
            } else {
                openPage("login");
            }
        }
    },
    mounted() {
        Neo.setImmersed();
    }
});