import clickOut from "./clickOut";
const install = function (Vue) {
  Vue.directive("clickOut", clickOut);
};
if (window.Vue) {
  window.clickOut = clickOut;
  Vue.use(install); // eslint-disable-line
}

clickOut.install = install;
export default clickOut;
