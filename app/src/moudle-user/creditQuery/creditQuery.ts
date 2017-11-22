declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./creditQuery.scss";

const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const template = require("./creditQuery.html");

mui.init({
    swipeBack: false
});

@Component({
    template
})
class CreditQuery extends Vue {
    keyword = "";
    list = [];
    loading = false;
    reLoading = false;
    page = 1;
    isFocus = false;
    search() {
        if (!Neo.getCookie("access_token")) {
            Neo.showMsg("请先登录");
            return openPage("login");
        }
        if (this.keyword) {
            this.loading = this.reLoading = true;
            Neo.$http("GET", "http://182.140.213.68:9080/zhixin/baseInfo/searchCompanyInfoByKey.st", {
                sid: "ndt",
                name: this.keyword,
                type: "company",
                page: 1,
                pageSize: 5
            }).then((res: any) => {
                if (res.reCode === "00000" && res.result.length) {
                    this.list = res.result;
                } else {
                    window.removeEventListener("scroll", getList);
                    Neo.showMsg(res.reMsg || "没有更多数据了");
                }
                this.loading = this.reLoading = false;
            }).catch(() => {
                this.reLoading = this.loading = false;
            });
        } else {
            Neo.showMsg("请输入搜索关键词");
        }
        const search: Element | any = this.$refs.search;
        search.blur();
    }
    focus() {
        this.isFocus = true;
    }
    blur() {
        if (!this.list.length && !this.loading) {
            this.isFocus = false;
        }
    }
    handelDetail(id, detail) {
        Neo.openPage(id, {
            detail
        });
    }
    mounted() {
        Neo.setImmersed();
    }
}

const creditQuery = new CreditQuery().$mount("#creditQuery");

function getList() {
    if (!creditQuery.reLoading && !creditQuery.loading && creditQuery.list.length && getScrollTop() + getWindowHeight() > getScrollHeight() - 100) {
        creditQuery.reLoading = true;
        Neo.$http("GET", "http://182.140.213.68:9080/zhixin/baseInfo/searchCompanyInfoByKey.st", {
            sid: "ndt",
            name: creditQuery.keyword,
            type: "company",
            page: creditQuery.page += 1,
            pageSize: 5
        }).then((res: any) => {
            if (res.reCode === "00000" && res.result.length) {
                creditQuery.list = creditQuery.list.concat(res.result);
            } else {
                window.removeEventListener("scroll", getList);
                Neo.showMsg("没有更多数据了");
            }
            mui.later(() => {
                creditQuery.reLoading = false;
            }, 1000);
        }).catch(() => {
            window.removeEventListener("scroll", getList);
            mui.later(() => {
                creditQuery.reLoading = false;
            }, 1000);
        });
    }
}

plusReady((view) => {
    hideScroll();
    Neo.back();
    window.addEventListener("scroll", getList);
});

function getScrollTop() {
    // tslint:disable-next-line:one-variable-per-declaration
    let scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}
// 文档的总高度
function getScrollHeight() {
    // tslint:disable-next-line:one-variable-per-declaration
    let scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }
    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}
// 浏览器视口的高度
function getWindowHeight() {
    let windowHeight = 0;
    // tslint:disable-next-line:prefer-conditional-expression
    if (document.compatMode === "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}