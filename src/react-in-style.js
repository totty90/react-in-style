
import autoprefixer from 'autoprefixer-core';
let defaultAddOptions = {
    noWarnings: false,
    prefix:false
};
function toKebab(str){
    str = str.replace(/([A-Z])/g, '-$1').toLowerCase();
    return str;
}
class ReactInStyle {
    constructor(options) {
        this.setOptions(options);
        this.init();
    }
    setOptions(options) {
        options = options || {};
        this.options = options;
    }
    init() {
        this.unApliedStyles = {};
        this.appliedStyles = {};
        this.initStyleTag();
    }
    destroy() {
        if (this.styleTag.parentNode) {
            this.styleTag.parentNode.removeChild(this.styleTag);
        }
        this.init();
    }
    initStyleTag() {
        this.styleTag = document.createElement('style');
        this.styleTag.id = 'react-in-style';
        document.getElementsByTagName('head')[0].appendChild(this.styleTag);
    }
    add(reactClass, selector, options = defaultAddOptions) {
        this.unApliedStyles[selector] = reactClass.prototype.style;
        this.renderStyles(options);       
    }
    renderStyles(options) {
        Object.keys(this.unApliedStyles).forEach((selector) => {
            var style = this.unApliedStyles[selector];
            delete this.unApliedStyles[selector];
            this.appliedStyles[selector] = style;
            var styleString = this.objToCss(style, selector);
            if(options.prefix){
                styleString = autoprefixer.process(styleString).css;
            }
            this.styleTag.innerHTML += styleString + '\n';
        });
    }

    objToCss(style, rootSelector = '', styles = []) {
        var rootStyle = '';
        Object.keys(style).forEach((key) => {
            let spacer = ' ',
            firstLetter = key[0], 
            selector = key;

            if (firstLetter === '&') {
                spacer = '';
                selector = key.substring(1);
            } 
            selector = selector.replace(/&/g, rootSelector);
            if (typeof style[key] !== 'object') {
                rootStyle += toKebab(key) + ':' + style[key] + '; ';
            } else {
                if (firstLetter === ':') {
                    spacer = '';
                }
                var newKey = rootSelector + spacer + selector;
                this.objToCss(style[key], newKey, styles);
            }
        });
        styles.unshift(rootSelector.trim() + '{' + rootStyle.trim() + '}');
        return styles.join('\n');
    }
}
export default new ReactInStyle();
