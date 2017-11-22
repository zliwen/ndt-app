declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import { CreatePage, getCodeTable, getSettings, hideScroll, mui, openPage, plus, setImmersed } from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./filterPage.scss";

@Component({
    template: require("./filterPage.html"),
    data() {
        return {
            onlyNdt: [{
                value: true,
                name: "是"
            }, {
                value: false,
                name: "否"
            }, {
                value: "",
                name: "不限"
            }],
            loanAmount: [{
                value: {
                    loanAmountMax: 300000
                },
                name: "小于30万"
            }, {
                value: {
                    loanAmountMax: 2000000,
                    loanAmountMin: 300000
                },
                name: "30~200万"
            }, {
                value: {
                    loanAmountMax: 5000000,
                    loanAmountMin: 2000000
                },
                name: "200~500万"
            }, {
                value: {
                    loanAmountMin: 5000000
                },
                name: "500万以上"
            }]
        };
    }
})
export class FilterComponent extends Vue {
    public productTo = [];
    public loanTypes = [];
    public loanAmountIndex = null;
    public params: any = {
        productTo: [],
        onlyNdt: "",
        loanTypes: []
    };
    handelProductTo(type, id) {
        const list = this.params[type];
        const index = list.indexOf(id);
        if (index < 0) {
            list.splice(list.length, 0, id);
        } else {
            list.splice(index, 1);
        }
    }
    handleOnlyNdt(val) {
        this.params = {
            ...this.params,
            onlyNdt: val
        };
    }
    handelLoanAmount(val, index) {
        this.loanAmountIndex = index;
        delete this.params.loanAmountMax;
        delete this.params.loanAmountMin;
        this.params = {
            ...this.params,
            ...val
        };
    }
    resetData() {
        this.loanAmountIndex = null;
        this.params = {
            productTo: [],
            onlyNdt: "",
            loanTypes: []
        };
    }
    getData() {
        if ((typeof this.params.onlyNdt).toLowerCase() === "string") {
            delete this.params.onlyNdt;
        }
        mui.fire(plus.webview.currentWebview().opener(), "getData", { ...this.params });
        // console.log(JSON.stringify(this.params));
    }
}

// 关闭back、menu按键监听，这样侧滑主界面会自动获得back和memu的按键事件，仅在主界面处理按键逻辑即可；
mui.init({
    keyEventBind: {
        backbutton: false,
        menubutton: false
    }
});
let main = null;

const filterPage = CreatePage("filterPage", FilterComponent, (view) => {
    mui.plusReady(() => {
        main = plus.webview.currentWebview().opener();
    });
    // 左滑显示出来的菜单，只需监听右滑，然后将菜单关闭即可；在该菜单上左滑，不做任何操作；
    window.addEventListener("swiperight", closeMenu);
});

getCodeTable(27, (result) => {
    filterPage.productTo = result;
});

getCodeTable(28, (result) => {
    filterPage.loanTypes = result;
});

function closeMenu() {
    mui.fire(main, "menu:swiperight");
}