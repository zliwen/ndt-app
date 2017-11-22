export declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import { CreatePage, setImmersed } from "../../common";
import "./calculator.scss";

@Component({
    template: require("./calculator.html")
})
export class Calculator extends Vue {
    constructor() {
        super();
    }

    mounted() {
        setImmersed();
    }
}

const calculator = CreatePage("calculator", Calculator, (view) => {

});