/* ============================================================
 * auth.js —— 研究总览外部版 登录门（SHA-256 前端密码门）
 * 
 * ⚠️ 说明：GitHub Pages 无服务端，此为纯前端门槛。
 *    能挡住无关访客，但懂技术的人查看源码可绕过。
 *    仅适用于「熟人小范围共享」，勿用于敏感数据。
 *
 * 凭据存储：用户名明文字段 + 密码的 SHA-256 十六进制哈希（不存明文密码）
 * 验证通过后写入 sessionStorage，关闭浏览器即失效，需重新登录。
 * ============================================================ */
(function () {
  // ── 修改密码：改下面两个值即可 ──
  // USER: 登录用户名（明文）
  var AUTH_USER = "realhunter";
  // HASH: 密码的 SHA-256 十六进制哈希（用 Python 生成：hashlib.sha256(pwd.encode()).hexdigest()）
  var AUTH_HASH = "86623cafb592ab3769a9e5bf6ee13e80e61550f618455ec9cf4014c47a2996dc";
  var SESSION_KEY = "research_overview_auth";

  // 已登录则直接放行
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
  } catch (e) { return; }  // sessionStorage 不可用（隐私模式）则放行，避免锁死

  function sha256hex(str) {
    // 用 Web Crypto API 计算 SHA-256（异步）
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buf).then(function (hash) {
      return Array.prototype.map.call(new Uint8Array(hash), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  // 全屏遮罩
  var overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:99999;background:linear-gradient(135deg,#0f172a,#1e293b);" +
    "display:flex;align-items:center;justify-content:center;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;";
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:16px;padding:36px 40px;width:340px;' +
    'box-shadow:0 20px 60px rgba(0,0,0,.4);text-align:center;">' +
    '<div style="font-size:34px;margin-bottom:10px;">🔒</div>' +
    '<div style="font-size:18px;font-weight:700;color:#1c2534;margin-bottom:4px;">研究总览 · 数据看板</div>' +
    '<div style="font-size:12px;color:#7a8798;margin-bottom:22px;">请输入访问凭据</div>' +
    '<div style="text-align:left;margin-bottom:12px;">' +
    '<label style="font-size:12px;color:#5d6b81;display:block;margin-bottom:5px;">用户名</label>' +
    '<input id="auth-user" type="text" placeholder="用户名" style="width:100%;padding:11px 12px;border:1px solid #dde3ed;' +
    'border-radius:9px;font-size:14px;box-sizing:border-box;outline:none;" autocomplete="off">' +
    '</div>' +
    '<div style="text-align:left;margin-bottom:18px;">' +
    '<label style="font-size:12px;color:#5d6b81;display:block;margin-bottom:5px;">密码</label>' +
    '<input id="auth-pass" type="password" placeholder="密码" style="width:100%;padding:11px 12px;border:1px solid #dde3ed;' +
    'border-radius:9px;font-size:14px;box-sizing:border-box;outline:none;" autocomplete="off">' +
    '</div>' +
    '<div id="auth-err" style="color:#e03131;font-size:12px;min-height:18px;margin-bottom:10px;display:none;">用户名或密码错误</div>' +
    '<button id="auth-btn" style="width:100%;padding:12px;border:none;border-radius:9px;background:#2f6bd8;color:#fff;' +
    'font-size:14px;font-weight:600;cursor:pointer;">登 录</button>' +
    '<div style="font-size:11px;color:#b0b7c3;margin-top:16px;">凭据仅供内部访问 · 关闭浏览器后需重新登录</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // 防止页面滚动
  document.documentElement.style.overflow = "hidden";

  function fail() {
    var err = document.getElementById("auth-err");
    err.style.display = "block";
    document.getElementById("auth-pass").value = "";
  }

  function submit() {
    var u = document.getElementById("auth-user").value.trim();
    var p = document.getElementById("auth-pass").value;
    if (!u || !p) { fail(); return; }
    // 用户名必须先匹配，再异步比对密码哈希
    if (u !== AUTH_USER) { fail(); return; }
    sha256hex(p).then(function (h) {
      if (h !== AUTH_HASH) { fail(); return; }
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
      overlay.remove();
      document.documentElement.style.overflow = "";
      document.getElementById("auth-user").value = "";
      document.getElementById("auth-pass").value = "";
    }).catch(function () { fail(); });
  }

  document.getElementById("auth-btn").addEventListener("click", submit);
  document.getElementById("auth-pass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") submit();
  });
})();
