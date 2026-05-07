import { createComponent, Dynamic, template, insert, memo, delegateEvents } from "solid-js/web";
import * as Solid from "solid-js";
var _tmpl$ = /* @__PURE__ */ template(`<div><div><strong>Something went wrong!</strong><button></button></div><div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><pre>`), _tmpl$3 = /* @__PURE__ */ template(`<code>`);
function CatchBoundary(props) {
  return createComponent(Solid.ErrorBoundary, {
    fallback: (error, reset) => {
      var _a;
      (_a = props.onCatch) == null ? void 0 : _a.call(props, error);
      Solid.createEffect(Solid.on([props.getResetKey], () => reset(), {
        defer: true
      }));
      return createComponent(Dynamic, {
        get component() {
          return props.errorComponent ?? ErrorComponent;
        },
        error,
        reset
      });
    },
    get children() {
      return props.children;
    }
  });
}
function ErrorComponent({
  error
}) {
  const [show, setShow] = Solid.createSignal(process.env.NODE_ENV !== "production");
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$2.nextSibling;
    _el$.style.setProperty("padding", ".5rem");
    _el$.style.setProperty("max-width", "100%");
    _el$2.style.setProperty("display", "flex");
    _el$2.style.setProperty("align-items", "center");
    _el$2.style.setProperty("gap", ".5rem");
    _el$3.style.setProperty("font-size", "1rem");
    _el$4.$$click = () => setShow((d) => !d);
    _el$4.style.setProperty("appearance", "none");
    _el$4.style.setProperty("font-size", ".6em");
    _el$4.style.setProperty("border", "1px solid currentColor");
    _el$4.style.setProperty("padding", ".1rem .2rem");
    _el$4.style.setProperty("font-weight", "bold");
    _el$4.style.setProperty("border-radius", ".25rem");
    insert(_el$4, () => show() ? "Hide Error" : "Show Error");
    _el$5.style.setProperty("height", ".25rem");
    insert(_el$, (() => {
      var _c$ = memo(() => !!show());
      return () => _c$() ? (() => {
        var _el$6 = _tmpl$2(), _el$7 = _el$6.firstChild;
        _el$7.style.setProperty("font-size", ".7em");
        _el$7.style.setProperty("border", "1px solid red");
        _el$7.style.setProperty("border-radius", ".25rem");
        _el$7.style.setProperty("padding", ".3rem");
        _el$7.style.setProperty("color", "red");
        _el$7.style.setProperty("overflow", "auto");
        insert(_el$7, (() => {
          var _c$2 = memo(() => !!error.message);
          return () => _c$2() ? (() => {
            var _el$8 = _tmpl$3();
            insert(_el$8, () => error.message);
            return _el$8;
          })() : null;
        })());
        return _el$6;
      })() : null;
    })(), null);
    return _el$;
  })();
}
delegateEvents(["click"]);
export {
  CatchBoundary,
  ErrorComponent
};
//# sourceMappingURL=CatchBoundary.js.map
