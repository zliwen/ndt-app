declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import "./netStatus.scss";

@Component({
    template: require("./netStatus.html"),
    props: ["reload", "loading", "noData"]
})
export default class NetStatus extends Vue {
    constructor() {
        super();
    }

    mounted() { }
}