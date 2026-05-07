import { template, effect } from "solid-js/web";
import jsesc from "jsesc";
var _tmpl$ = /* @__PURE__ */ template(`<script class=tsr-once>`);
function ScriptOnce({
  children,
  log
}) {
  if (typeof document !== "undefined") {
    return null;
  }
  return (() => {
    var _el$ = _tmpl$();
    effect(() => _el$.innerHTML = [children, (log ?? true) && process.env.NODE_ENV === "development" ? `console.info(\`Injected From Server:
${jsesc(children.toString(), {
      quotes: "backtick"
    })}\`)` : "", 'if (typeof __TSR_SSR__ !== "undefined") __TSR_SSR__.cleanScripts()'].filter(Boolean).join("\n"));
    return _el$;
  })();
}
export {
  ScriptOnce
};
//# sourceMappingURL=ScriptOnce.js.map
