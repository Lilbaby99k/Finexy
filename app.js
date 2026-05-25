/* ════════════════════════════════════════════
   FINEXY DASHBOARD — app.js  v5.0
   Role-Based Access Control (RBAC)
   Roles: admin | manager | staff | rider
════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════
   SUPABASE CONFIG
══════════════════════════════════════ */
const SUPA_URL = 'https://ymkgqqerdocfcgyphfzs.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta2dxcWVyZG9jZmNneXBoZnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODA3MzUsImV4cCI6MjA5NTA1NjczNX0.SqwwSpwvsstfumhpTJasSsGMbe0LAm7Z3N-H0U2PoVc';

async function sbQuery(path, options={}) {
  const method  = options.method || 'GET';
  const headers = {
    'apikey':        SUPA_KEY,
    'Authorization': 'Bearer ' + SUPA_KEY,
    'Content-Type':  'application/json',
  };
  if (method === 'POST' || method === 'PATCH') headers['Prefer'] = 'return=representation';
  if (method === 'DELETE') headers['Prefer'] = 'return=minimal';
  const fetchOpts = { method, headers };
  if (options.body) fetchOpts.body = options.body;
  const res = await fetch(SUPA_URL + '/rest/v1/' + path, fetchOpts);
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : [];
}

/* ══════════════════════════════════════
   PERMISSIONS MAP
   true  = allowed | false = denied
══════════════════════════════════════ */
const PERMISSIONS = {
  /*
   ┌─────────────────────────────────────────────────────────┐
   │  ROLE MATRIX — what each role can and cannot do         │
   ├────────────────────┬────────┬─────────┬───────┬─────────┤
   │ Action             │ Admin  │ Manager │ Staff │  Rider  │
   ├────────────────────┼────────┼─────────┼───────┼─────────┤
   │ Dashboard          │  ✅    │   ✅    │  ✅   │   ✅   │
   │ View Orders        │  ✅    │   ✅    │  ✅   │   ❌   │
   │ Add Order          │  ✅    │   ✅    │  ✅   │   ❌   │
   │ Edit Order/Status  │  ✅    │   ✅    │  ✅   │   ❌   │
   │ Delete Order       │  ✅    │   ❌    │  ❌   │   ❌   │
   │ Assign Rider       │  ✅    │   ✅    │  ❌   │   ❌   │
   │ View Inventory     │  ✅    │   ✅    │  ✅   │   ❌   │
   │ Add Product        │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Edit Product       │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Restock Product    │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Delete Product     │  ✅    │   ❌    │  ❌   │   ❌   │
   │ Export CSV         │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Analytics          │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Customers          │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Discounts          │  ✅    │   ✅    │  ❌   │   ❌   │
   │ User Management    │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Approve Users      │  ✅    │   ✅    │  ❌   │   ❌   │
   │ Remove Users       │  ✅    │   ❌    │  ❌   │   ❌   │
   │ Settings           │  ✅    │   ❌    │  ❌   │   ❌   │
   │ View Deliveries    │  ❌    │   ❌    │  ❌   │   ✅   │
   │ Update Delivery    │  ❌    │   ❌    │  ❌   │   ✅   │
   └────────────────────┴────────┴─────────┴───────┴─────────┘
  */
  admin: {
    viewDashboard:true,
    addOrder:true, editOrder:true, deleteOrder:true, assignRider:true,
    viewInventory:true, addProduct:true, editProduct:true, deleteProduct:true, restockProduct:true, exportCSV:true,
    viewAnalytics:true, viewCustomers:true, viewDiscounts:true, viewStore:true, viewHelpdesk:true,
    viewSettings:true,
    viewUserManagement:true, approveUsers:true, removeUsers:true,
    viewDeliveries:false, updateDeliveryStatus:false,
  },
  manager: {
    viewDashboard:true,
    addOrder:true, editOrder:true, deleteOrder:false, assignRider:true,
    viewInventory:true, addProduct:true, editProduct:true, deleteProduct:false, restockProduct:true, exportCSV:true,
    viewAnalytics:true, viewCustomers:true, viewDiscounts:true, viewStore:true, viewHelpdesk:true,
    viewSettings:false,
    viewUserManagement:true, approveUsers:true, removeUsers:false,
    viewDeliveries:false, updateDeliveryStatus:false,
  },
  staff: {
    viewDashboard:true,
    addOrder:true, editOrder:true, deleteOrder:false, assignRider:false,
    viewInventory:true, addProduct:false, editProduct:false, deleteProduct:false, restockProduct:false, exportCSV:false,
    viewAnalytics:false, viewCustomers:false, viewDiscounts:false, viewStore:false, viewHelpdesk:true,
    viewSettings:false,
    viewUserManagement:false, approveUsers:false, removeUsers:false,
    viewDeliveries:false, updateDeliveryStatus:false,
  },
  rider: {
    viewDashboard:false,
    addOrder:false, editOrder:false, deleteOrder:false, assignRider:false,
    viewInventory:false, addProduct:false, editProduct:false, deleteProduct:false, restockProduct:false, exportCSV:false,
    viewAnalytics:false, viewCustomers:false, viewDiscounts:false, viewStore:false, viewHelpdesk:false,
    viewSettings:false,
    viewUserManagement:false, approveUsers:false, removeUsers:false,
    viewDeliveries:true, updateDeliveryStatus:true,
  },
};

function can(action) {
  const role  = CURRENT_USER ? CURRENT_USER.role : 'staff';
  return (PERMISSIONS[role] || PERMISSIONS.staff)[action] === true;
}
function denied(msg) {
  const role = CURRENT_USER ? CURRENT_USER.role : 'staff';
  const cap  = role.charAt(0).toUpperCase() + role.slice(1);
  showToast('🚫 ' + msg + ' — not allowed for ' + cap + ' role.', 'error');
}


/* ══════════════════════
   LIVE DATABASES (empty)
══════════════════════ */
let ORDERS_DB    = [];
let INV_DB       = [];
let NOTIFS_DB    = [];
let nextOrderNum = 1;
let nextSkuNum   = 1;
let currencySymbol = '$';
let CURRENT_USER   = null;   // set by initSession()

/* ══════════════════════
   SESSION MANAGEMENT
══════════════════════ */
const ROLE_META = {
  admin:   { label:'Admin',   color:'#E8441A', bg:'rgba(232,68,26,.15)',  icon:'👑' },
  manager: { label:'Manager', color:'#7C3AED', bg:'rgba(124,58,237,.15)', icon:'📊' },
  staff:   { label:'Staff',   color:'#0284C7', bg:'rgba(2,132,199,.15)',  icon:'🧑‍💼' },
  rider:   { label:'Rider',   color:'#059669', bg:'rgba(5,150,105,.15)',  icon:'🛵' },
};

async function initSession() {
  const raw = sessionStorage.getItem('finexy_session');
  if (!raw) { window.location.replace('auth.html'); return; }
  try { CURRENT_USER = JSON.parse(raw); }
  catch(e) { window.location.replace('auth.html'); return; }

  // Re-verify user status from Supabase on every page load
  if (CURRENT_USER.role !== 'admin') {
    try {
      const results = await sbQuery('users?id=eq.' + CURRENT_USER.userId + '&select=approved,deactivated');
      const freshUser = results[0];

      if (freshUser && freshUser.deactivated) {
        document.body.innerHTML = `
          <div style="min-height:100vh;background:#0C0D0F;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#F5F5F7;">
            <div style="background:#141518;border:1px solid rgba(239,68,68,.25);border-radius:18px;padding:48px 40px;max-width:440px;width:90%;text-align:center;">
              <div style="font-size:3rem;margin-bottom:16px;">🚫</div>
              <h2 style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:10px;color:#FCA5A5;">Account Deactivated</h2>
              <p style="color:#8A8F9E;font-size:.88rem;line-height:1.6;margin-bottom:28px;">
                Your <strong style="color:#F5F5F7;">${(CURRENT_USER.role||'').charAt(0).toUpperCase()+(CURRENT_USER.role||'').slice(1)}</strong> account has been deactivated.<br/>
                Contact your <strong style="color:#F5F5F7;">Admin or Manager</strong> to reactivate your account.
              </p>
              <button onclick="sessionStorage.removeItem('finexy_session');window.location.replace('auth.html');" style="padding:11px 28px;border-radius:10px;background:#EF4444;border:none;color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;">
                Back to Sign In
              </button>
            </div>
          </div>`;
        return;
      }
      if (freshUser && !freshUser.approved) {
        document.body.innerHTML = `
          <div style="min-height:100vh;background:#0C0D0F;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#F5F5F7;">
            <div style="background:#141518;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:48px 40px;max-width:420px;width:90%;text-align:center;">
              <div style="font-size:3rem;margin-bottom:16px;">⏳</div>
              <h2 style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:10px;">Waiting for Approval</h2>
              <p style="color:#8A8F9E;font-size:.88rem;line-height:1.6;margin-bottom:28px;">
                Your <strong style="color:#F5F5F7;">${(CURRENT_USER.role||'').charAt(0).toUpperCase()+(CURRENT_USER.role||'').slice(1)}</strong> account is pending approval.<br/>
                You will be able to access the dashboard once an Admin or Manager approves your registration.
              </p>
              <button onclick="sessionStorage.removeItem('finexy_session');window.location.replace('auth.html');" style="padding:11px 28px;border-radius:10px;background:#E8441A;border:none;color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;">
                Back to Sign In
              </button>
            </div>
          </div>`;
        return;
      }
    } catch(e) { console.warn('Could not verify user status:', e); }
  }

  const role = CURRENT_USER.role || 'staff';
  const meta = ROLE_META[role] || ROLE_META.staff;

  /* ── Topbar ── */
  const avatarEl   = document.getElementById('topAvatar');
  const nameEl     = document.getElementById('topName');
  const businessEl = document.getElementById('topBusiness');
  if (avatarEl) {
    avatarEl.textContent   = CURRENT_USER.initials || '?';
    avatarEl.style.background = meta.color;
  }
  if (nameEl)     nameEl.textContent     = CURRENT_USER.name     || 'User';
  if (businessEl) businessEl.textContent = CURRENT_USER.business || 'Finexy';

  /* ── Role badge in topbar ── */
  const topUser = document.getElementById('topUser');
  if (topUser) {
    // Remove existing badge if any
    const oldBadge = topUser.querySelector('.role-badge');
    if (oldBadge) oldBadge.remove();
    const badge = document.createElement('span');
    badge.className = 'role-badge';
    badge.textContent = meta.icon + ' ' + meta.label;
    badge.style.cssText = `font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${meta.bg};color:${meta.color};white-space:nowrap;`;
    topUser.insertBefore(badge, topUser.querySelector('.chev'));
  }

  /* ── Settings page populate ── */
  const sName = document.getElementById('settingName');
  const sEmail= document.getElementById('settingEmail');
  const sBiz  = document.getElementById('settingBusiness');
  if (sName)  sName.value  = CURRENT_USER.name     || '';
  if (sEmail) sEmail.value = CURRENT_USER.email    || '';
  if (sBiz)   sBiz.value   = CURRENT_USER.business || '';

  /* ── Currency ── */
  const savedCur = localStorage.getItem('finexy_currency_' + CURRENT_USER.userId);
  if (savedCur) {
    currencySymbol = savedCur;
    const sel = document.getElementById('settingCurrency');
    if (sel) sel.value = savedCur;
  }

  /* ── Apply RBAC to sidebar ── */
  applyRBACtoSidebar(role);

  /* ── Apply RBAC to page titles ── */
  const ph = document.querySelector('#page-dashboard .ph h1');
  if (ph) ph.textContent = `Sales Overview  ${meta.icon}`;
}

/* ── RBAC: hide/dim sidebar items the role cannot access ── */
function applyRBACtoSidebar(role) {
  const rules = {
    settings:        can('viewSettings'),
    analytics:       can('viewAnalytics'),
    customers:       can('viewCustomers'),
    discounts:       can('viewDiscounts'),
    store:           can('viewStore'),
    inventory:       can('viewInventory'),
    orders:          can('addOrder') || can('editOrder'),
    'user-management': can('viewUserManagement'),
    deliveries:      role === 'rider',
  };

  // For rider: hide most pages, only show dashboard, deliveries, helpdesk
  if (role === 'rider') {
    ['analytics','customers','discounts','store','inventory','orders','settings','user-management'].forEach(page => {
      rules[page] = false;
    });
  }

  Object.entries(rules).forEach(([page, allowed]) => {
    const link = document.querySelector(`.sb-link[data-page="${page}"]`);
    if (!link) return;
    if (!allowed) {
      link.style.opacity     = '0.35';
      link.style.cursor      = 'not-allowed';
      link.style.pointerEvents = 'none';
      if (!link.querySelector('.lock-ic')) {
        const lock = document.createElement('span');
        lock.className = 'lock-ic';
        lock.textContent = '🔒';
        lock.style.cssText = 'margin-left:auto;font-size:.7rem;';
        link.appendChild(lock);
      }
    } else {
      link.style.opacity = '';
      link.style.cursor  = '';
      link.style.pointerEvents = '';
    }
  });

  // Show user-management link for admin and manager
  const umLink = document.querySelector('.sb-link[data-page="user-management"]');
  if (umLink) umLink.style.display = can('viewUserManagement') ? '' : 'none';

  // Show deliveries link only for rider
  const delLink = document.querySelector('.sb-link[data-page="deliveries"]');
  if (delLink) delLink.style.display = role === 'rider' ? '' : 'none';
}

/* ── RBAC: apply visual + functional restrictions to buttons and pages ── */
function applyRBACtoButtons() {
  const role = CURRENT_USER ? CURRENT_USER.role : 'staff';

  // Settings page — replace with access denied for non-admin
  if (!can('viewSettings')) {
    const pg = document.getElementById('page-settings');
    if (pg) pg.innerHTML = `
      <div class="ph"><h1>Settings</h1></div>
      <div class="blank-page">
        <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h2>Access Restricted</h2>
        <p>Settings is only available to <strong>Admin</strong> accounts.<br/>Contact your administrator to make changes.</p>
        <button class="btn-primary" onclick="navigateTo('dashboard')">← Dashboard</button>
      </div>`;
  }

  // Analytics — restricted for staff and rider
  if (!can('viewAnalytics')) {
    const pg = document.getElementById('page-analytics');
    if (pg) pg.innerHTML = `
      <div class="ph"><h1>Analytics</h1></div>
      <div class="blank-page">
        <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h2>Access Restricted</h2>
        <p>Analytics is available to <strong>Admin</strong> and <strong>Manager</strong> roles only.</p>
        <button class="btn-primary" onclick="navigateTo('dashboard')">← Dashboard</button>
      </div>`;
  }

  // Inventory Add Product button — make read-only for staff
  if (!can('addProduct')) {
    const btn = document.getElementById('addProductBtn');
    if (btn) {
      btn.innerHTML = '🔒 Read Only';
      btn.style.cssText += ';background:var(--bg);color:var(--t2);border:1px solid var(--border);box-shadow:none;cursor:default;pointer-events:none;';
    }
  }

  // Staff banner on inventory page
  if (role === 'staff') {
    const invPg = document.getElementById('page-inventory');
    if (invPg) {
      const b = document.createElement('div');
      b.style.cssText = 'background:rgba(2,132,199,.08);border:1px solid rgba(2,132,199,.2);border-radius:8px;padding:10px 16px;font-size:.8rem;color:#7DD3FC;margin-bottom:16px;display:flex;gap:8px;align-items:center;';
      b.innerHTML = '🧑‍💼 <span>You are viewing inventory as <strong>Staff</strong> — read-only. Contact a Manager or Admin to make changes.</span>';
      const ref = invPg.querySelector('.kpi-row');
      if (ref) invPg.insertBefore(b, ref);
    }
  }

  // Rider: replace all non-delivery pages with access denied, land on deliveries
  if (role === 'rider') {
    ['page-orders','page-inventory','page-analytics','page-customers',
     'page-discounts','page-store','page-dashboard','page-settings',
     'page-user-management','page-helpdesk'].forEach(pgId => {
      const pg = document.getElementById(pgId);
      if (pg) pg.innerHTML = `
        <div class="ph"><h1>${pgId.replace('page-','').replace(/-/g,' ').replace(/^\w/,c=>c.toUpperCase())}</h1></div>
        <div class="blank-page">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h2>Access Restricted</h2>
          <p>This section is not available to <strong>Riders</strong>.<br/>Use the Deliveries page to manage your assigned orders.</p>
          <button class="btn-primary" onclick="navigateTo('deliveries')">🛵 Go to My Deliveries</button>
        </div>`;
    });
    // Build rider deliveries page and navigate to it
    renderRiderDeliveriesPage();
    navigateTo('deliveries');
  }

  // Admin and Manager: build user management page
  if (can('viewUserManagement')) {
    renderUserManagementPage();
  }
}

/* ══════════════════════════════════════
   USER MANAGEMENT PAGE
   Admin  → manages: manager, staff, rider
   Manager → manages: staff, rider only
══════════════════════════════════════ */
function renderUserManagementPage() {
  const pg = document.getElementById('page-user-management');
  if (!pg) return;

  const isAdmin   = CURRENT_USER && CURRENT_USER.role === 'admin';
  const isManager = CURRENT_USER && CURRENT_USER.role === 'manager';

  async function buildPage() {
    pg.innerHTML = `<div class="ph"><h1>User Management 👥</h1></div><div style="max-width:900px;padding:40px;text-align:center;color:var(--t2);">Loading users…</div>`;

    let visible = [];
    try {
      const visibleRoles = isAdmin ? ['manager','staff','rider'] : ['staff','rider'];
      const roleFilter = 'role=in.('+visibleRoles.join(',')+')&';
      visible = await sbQuery('users?'+roleFilter+'&select=*&order=created_at.asc');
    } catch(e) {
      pg.innerHTML = `<div class="ph"><h1>User Management 👥</h1></div><div style="padding:40px;text-align:center;color:#FCA5A5;">Failed to load users. Check your connection.</div>`;
      return;
    }

    const pending     = visible.filter(u => !u.approved && !u.deactivated);
    const active      = visible.filter(u =>  u.approved && !u.deactivated);
    const deactivated = visible.filter(u =>  u.deactivated);

    const roleColor = { manager:'#7C3AED', staff:'#0284C7', rider:'#059669' };
    const roleIcon  = { manager:'📊', staff:'🧑‍💼', rider:'🛵' };

    const userRow = (u, bucket) => {
      const initials = (u.first[0] + (u.last?.[0]||'')).toUpperCase();
      const avatarBg = u.deactivated ? '#4A4F5E' : (roleColor[u.role]||'#888');
      let statusBadge;
      if (bucket==='pending')     statusBadge = `<span style="font-size:.7rem;padding:3px 9px;border-radius:20px;background:rgba(245,158,11,.15);color:#FCD34D;font-weight:600;white-space:nowrap;">⏳ Pending</span>`;
      else if (bucket==='deactivated') statusBadge = `<span style="font-size:.7rem;padding:3px 9px;border-radius:20px;background:rgba(239,68,68,.12);color:#FCA5A5;font-weight:600;white-space:nowrap;">🚫 Inactive</span>`;
      else statusBadge = `<span style="font-size:.7rem;padding:3px 9px;border-radius:20px;background:rgba(34,197,94,.12);color:#86EFAC;font-weight:600;white-space:nowrap;">✅ Active</span>`;

      let actionBtns = '';
      if (bucket==='pending') {
        actionBtns = `<button onclick="approveUser(${u.id})" style="padding:5px 12px;border-radius:8px;border:none;background:#059669;color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;">✓ Approve</button>
          <button onclick="deactivateUser(${u.id})" style="padding:5px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.08);color:#FCA5A5;font-size:.75rem;cursor:pointer;white-space:nowrap;">🚫 Deactivate</button>`;
      } else if (bucket==='active') {
        actionBtns = `<button onclick="deactivateUser(${u.id})" style="padding:5px 11px;border-radius:8px;border:1px solid rgba(245,158,11,.35);background:rgba(245,158,11,.08);color:#FCD34D;font-size:.75rem;cursor:pointer;white-space:nowrap;">⏸ Deactivate</button>
          <button onclick="removeUser(${u.id})" style="padding:5px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.08);color:#FCA5A5;font-size:.75rem;cursor:pointer;white-space:nowrap;">✕ Remove</button>`;
      } else {
        actionBtns = `<button onclick="reactivateUser(${u.id})" style="padding:5px 12px;border-radius:8px;border:none;background:#0284C7;color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;">♻ Reactivate</button>
          <button onclick="removeUser(${u.id})" style="padding:5px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.08);color:#FCA5A5;font-size:.75rem;cursor:pointer;white-space:nowrap;">✕ Remove</button>`;
      }

      return `<div class="um-row" id="umrow-${u.id}" style="display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid var(--border);${u.deactivated?'opacity:.6;':''}">
        <div style="width:38px;height:38px;border-radius:50%;background:${avatarBg};display:grid;place-items:center;font-size:.85rem;font-weight:700;color:#fff;flex-shrink:0;">${initials}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:.88rem;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.first} ${u.last}</div>
          <div style="font-size:.72rem;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.email}</div>
        </div>
        <span style="font-size:.7rem;padding:3px 9px;border-radius:20px;font-weight:700;background:${roleColor[u.role]||'#888'}22;color:${roleColor[u.role]||'#888'};white-space:nowrap;">${roleIcon[u.role]||''} ${(u.role||'').charAt(0).toUpperCase()+(u.role||'').slice(1)}</span>
        ${statusBadge}
        <div style="display:flex;gap:7px;flex-shrink:0;">${actionBtns}</div>
      </div>`;
    };

    const scopeNote = isManager
      ? `<div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.2);border-radius:10px;padding:10px 16px;font-size:.78rem;color:#C4B5FD;margin-bottom:20px;display:flex;gap:8px;align-items:center;">📊 <span>As <strong>Manager</strong>, you can manage <strong>Staff</strong> and <strong>Rider</strong> accounts only.</span></div>`
      : `<div style="background:rgba(232,68,26,.07);border:1px solid rgba(232,68,26,.18);border-radius:10px;padding:10px 16px;font-size:.78rem;color:#FDBA74;margin-bottom:20px;display:flex;gap:8px;align-items:center;">👑 <span>As <strong>Admin</strong>, you have full access to manage all Manager, Staff, and Rider accounts.</span></div>`;

    const section = (title, dotColor, borderColor, items, bucket) =>
      items.length === 0 ? '' : `
        <div style="margin-bottom:28px;">
          <h3 style="font-size:.78rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;display:flex;align-items:center;gap:7px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};"></span>${title} (${items.length})
          </h3>
          <div style="background:var(--surface);border:1px solid ${borderColor};border-radius:12px;overflow:hidden;">${items.map(u=>userRow(u,bucket)).join('')}</div>
        </div>`;

    const isEmpty = !pending.length && !active.length && !deactivated.length;
    pg.innerHTML = `
      <div class="ph"><h1>User Management 👥</h1></div>
      <div style="max-width:900px;">
        ${scopeNote}
        ${section('Pending Approval','#F59E0B','rgba(245,158,11,.25)',pending,'pending')}
        ${section('Active Users','#22C55E','var(--border)',active,'active')}
        ${section('Deactivated / Inactive','#EF4444','rgba(239,68,68,.2)',deactivated,'deactivated')}
        ${isEmpty ? `<div class="blank-page">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h2>No Users Yet</h2>
          <p>${isManager ? 'Staff and Rider accounts will appear here once they register.' : 'Manager, Staff, and Rider accounts will appear here once they register.'}</p>
        </div>` : ''}
      </div>`;
  }

  window.approveUser = async function(id) {
    try {
      const rows = await sbQuery('users?id=eq.'+id+'&select=first,last,role');
      const u = rows[0]; if(!u) return;
      if (isManager && !['staff','rider'].includes(u.role)) { showToast('🚫 Managers can only approve Staff and Rider accounts.','error'); return; }
      confirmAction('Approve User', `Approve ${u.first} ${u.last}? They will be able to sign in immediately.`, async () => {
        await sbQuery('users?id=eq.'+id, { method:'PATCH', body: JSON.stringify({ approved:true, deactivated:false }) });
        showToast(`✅ ${u.first} ${u.last} approved! They can now sign in.`, 'success');
        buildPage();
      });
    } catch(e) { showToast('Error: '+e.message,'error'); }
  };

  window.deactivateUser = async function(id) {
    try {
      const rows = await sbQuery('users?id=eq.'+id+'&select=first,last,role');
      const u = rows[0]; if(!u) return;
      if (isManager && !['staff','rider'].includes(u.role)) { showToast('🚫 Managers can only deactivate Staff and Rider accounts.','error'); return; }
      confirmAction('Deactivate User', `Deactivate ${u.first} ${u.last}? They will no longer be able to sign in until reactivated.`, async () => {
        await sbQuery('users?id=eq.'+id, { method:'PATCH', body: JSON.stringify({ approved:false, deactivated:true }) });
        showToast(`⏸ ${u.first} ${u.last} has been deactivated.`, 'success');
        buildPage();
      });
    } catch(e) { showToast('Error: '+e.message,'error'); }
  };

  window.reactivateUser = async function(id) {
    try {
      const rows = await sbQuery('users?id=eq.'+id+'&select=first,last,role');
      const u = rows[0]; if(!u) return;
      if (isManager && !['staff','rider'].includes(u.role)) { showToast('🚫 Managers can only reactivate Staff and Rider accounts.','error'); return; }
      confirmAction('Reactivate User', `Reactivate ${u.first} ${u.last}? Their account access will be fully restored.`, async () => {
        await sbQuery('users?id=eq.'+id, { method:'PATCH', body: JSON.stringify({ approved:true, deactivated:false }) });
        showToast(`♻ ${u.first} ${u.last} has been reactivated and can sign in again.`, 'success');
        buildPage();
      });
    } catch(e) { showToast('Error: '+e.message,'error'); }
  };

  window.removeUser = async function(id) {
    try {
      const rows = await sbQuery('users?id=eq.'+id+'&select=first,last,role');
      const u = rows[0]; if(!u) return;
      if (isManager && !['staff','rider'].includes(u.role)) { showToast('🚫 Managers can only remove Staff and Rider accounts.','error'); return; }
      confirmAction('Remove User', `Permanently remove ${u.first} ${u.last} (${u.role})? This cannot be undone.`, async () => {
        await sbQuery('users?id=eq.'+id, { method:'DELETE', prefer:'return=minimal' });
        showToast(`🗑 ${u.first} ${u.last} has been permanently removed.`, 'success');
        buildPage();
      });
    } catch(e) { showToast('Error: '+e.message,'error'); }
  };

  buildPage();
}

/* ══════════════════════════════════════
   RIDER DELIVERIES PAGE
══════════════════════════════════════ */
function renderRiderDeliveriesPage() {
  const pg = document.getElementById('page-deliveries');
  if (!pg) return;

  const riderId = CURRENT_USER ? CURRENT_USER.userId : null;

  async function buildDeliveries() {
    pg.innerHTML = `
      <div class="ph"><h1>My Deliveries 🛵</h1></div>
      <div style="max-width:860px;"><div style="text-align:center;padding:48px 0;color:var(--t2);">⏳ Loading deliveries…</div></div>`;

    let deliveries = [];
    try {
      /* Load only orders assigned to this rider from Supabase */
      const rows = await sbQuery('orders?rider_id=eq.' + riderId + '&order=created_at.desc&select=*');
      deliveries = rows.map(r => ({
        id:       r.order_id || ('#' + r.id),
        _supaId:  r.id,
        date:     r.date || r.created_at?.slice(0,10),
        customer: r.customer || '—',
        phone:    r.phone || '',
        address:  r.address || '',
        items:    r.items_summary || '',
        total:    parseFloat(r.total) || 0,
        status:   r.status || 'pending',
        payment:  r.payment_method || '',
      }));
    } catch(e) {
      pg.innerHTML = `
        <div class="ph"><h1>My Deliveries 🛵</h1></div>
        <div class="blank-page"><h2>Could not load deliveries</h2><p>Check your connection and try again.</p>
        <button class="btn-primary" onclick="renderRiderDeliveriesPage()">Retry</button></div>`;
      return;
    }

    const sc = { pending:'#F59E0B', processing:'#7C3AED', shipped:'#0284C7', delivered:'#22C55E', cancelled:'#EF4444' };

    pg.innerHTML = `
      <div class="ph"><h1>My Deliveries 🛵</h1></div>
      <div style="max-width:860px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;">
            <div style="font-size:.72rem;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Assigned</div>
            <div style="font-size:1.6rem;font-weight:800;color:#F59E0B;">${deliveries.filter(o=>o.status==='pending'||o.status==='processing').length}</div>
          </div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;">
            <div style="font-size:.72rem;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Out for Delivery</div>
            <div style="font-size:1.6rem;font-weight:800;color:#0284C7;">${deliveries.filter(o=>o.status==='shipped').length}</div>
          </div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;">
            <div style="font-size:.72rem;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Delivered</div>
            <div style="font-size:1.6rem;font-weight:800;color:#22C55E;">${deliveries.filter(o=>o.status==='delivered').length}</div>
          </div>
        </div>

        ${deliveries.length === 0
          ? `<div class="blank-page">
               <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/></svg>
               <h2>No Deliveries Assigned</h2>
               <p>No orders have been assigned to you yet. An Admin or Manager will assign deliveries to you.</p>
             </div>`
          : `<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;">
               <div style="padding:12px 18px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1.6fr 1fr 1fr 1fr auto;gap:10px;font-size:.7rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.06em;">
                 <span>Order ID</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span><span>Action</span>
               </div>
               ${deliveries.map(o => `
               <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1.6fr 1fr 1fr 1fr auto;gap:10px;align-items:center;font-size:.83rem;">
                 <div>
                   <div style="font-weight:700;color:var(--brand);font-size:.82rem;">${o.id}</div>
                   ${o.phone ? `<div style="font-size:.7rem;color:var(--t2);">${o.phone}</div>` : ''}
                 </div>
                 <div>
                   <div style="color:var(--t1);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o.customer}</div>
                   ${o.address ? `<div style="font-size:.7rem;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${o.address}">${o.address}</div>` : ''}
                 </div>
                 <span style="color:var(--t2);font-size:.78rem;">${o.date || '—'}</span>
                 <span style="font-weight:700;color:var(--brand);">₦${o.total.toLocaleString()}</span>
                 <span style="padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;background:${sc[o.status]||'#888'}22;color:${sc[o.status]||'#888'};text-transform:capitalize;white-space:nowrap;">${o.status}</span>
                 <div style="display:flex;gap:6px;">
                   ${o.status === 'completed' || o.status === 'rejected' || o.status === 'cancelled'
                     ? `<span style="font-size:.72rem;color:${o.status==='completed'?'#22C55E':'#EF4444'};font-weight:700;">
                          ${o.status==='completed'?'✅ Done':'❌ '+cap(o.status)}
                        </span>`
                     : `<button onclick="markDelivered('${o.id}',${o._supaId},this)"
                           style="padding:5px 10px;border-radius:8px;border:none;background:#059669;color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap;">
                           ✓ Delivered
                         </button>
                        <button onclick="markRejected('${o.id}',${o._supaId},this)"
                           style="padding:5px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.1);color:#FCA5A5;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap;">
                           ✕ Reject
                         </button>`
                   }
                 </div>
               </div>`).join('')}
             </div>`
        }

        <div style="margin-top:14px;text-align:right;">
          <button onclick="renderRiderDeliveriesPage()" class="btn-ghost sm">🔄 Refresh</button>
        </div>
      </div>`;
  }

  buildDeliveries();
}

/* ── Rider: mark order as delivered (defined globally so onclick always finds it) ── */
window.markDelivered = async function(orderId, supaId, btn) {
  if (btn) { btn.textContent = '⏳…'; btn.disabled = true; }
  try {
    await sbQuery('orders?id=eq.' + supaId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed', rider_status: 'delivered' }),
    });
    const o = ORDERS_DB.find(x => x.id === orderId);
    if (o) {
      o.status = 'completed'; o.rider_status = 'delivered';
      saveToStorage(); refreshDashboardKPIs(); renderOrdersTable();
    }
    const riderName = CURRENT_USER ? CURRENT_USER.name : 'Rider';
    pushNotif('📦 Order ' + orderId + ' delivered by ' + riderName + ' — automatically marked ✅ Completed. Balance updated.');
    showToast('📦 Order ' + orderId + ' delivered and completed!', 'success');
    renderRiderDeliveriesPage();
  } catch(e) {
    if (btn) { btn.textContent = '✓ Delivered'; btn.disabled = false; }
    showToast('Error updating order: ' + e.message, 'error');
  }
};

/* ── Rider: mark order as rejected (defined globally so onclick always finds it) ── */
window.markRejected = async function(orderId, supaId, btn) {
  if (btn) { btn.textContent = '⏳…'; btn.disabled = true; }
  try {
    await sbQuery('orders?id=eq.' + supaId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', rider_status: 'rejected' }),
    });
    const o = ORDERS_DB.find(x => x.id === orderId);
    if (o) {
      o.status = 'rejected'; o.rider_status = 'rejected';
      saveToStorage(); refreshDashboardKPIs(); renderOrdersTable();
    }
    const riderName = CURRENT_USER ? CURRENT_USER.name : 'Rider';
    pushNotif('❌ Order ' + orderId + ' was REJECTED by ' + riderName + '. Please reassign or follow up with the customer.');
    showToast('Order ' + orderId + ' marked as Rejected.', 'warning');
    renderRiderDeliveriesPage();
  } catch(e) {
    if (btn) { btn.textContent = '✕ Reject'; btn.disabled = false; }
    showToast('Error updating order: ' + e.message, 'error');
  }
};

window.saveSettings = async function() {
  if (!CURRENT_USER) return;

  const newName = document.getElementById('settingName').value.trim();
  const newBiz  = document.getElementById('settingBusiness').value.trim();
  const sel     = document.getElementById('settingCurrency');
  const newCur  = sel ? sel.value : '$';

  if (newName) {
    CURRENT_USER.name     = newName;
    CURRENT_USER.business = newBiz || CURRENT_USER.business;
    const parts = newName.split(' ');
    const first = parts[0] || '';
    const last  = parts.slice(1).join(' ') || '';
    CURRENT_USER.initials = ((first[0]||'') + (last[0]||'')).toUpperCase() || '?';
    sessionStorage.setItem('finexy_session', JSON.stringify(CURRENT_USER));

    try {
      await sbQuery('users?id=eq.'+CURRENT_USER.userId, {
        method: 'PATCH',
        body: JSON.stringify({ first, last, business: CURRENT_USER.business }),
      });
    } catch(e) { console.warn('Could not update user in Supabase:', e); }

    const avatarEl   = document.getElementById('topAvatar');
    const nameEl     = document.getElementById('topName');
    const businessEl = document.getElementById('topBusiness');
    if (avatarEl)   avatarEl.textContent   = CURRENT_USER.initials;
    if (nameEl)     nameEl.textContent     = CURRENT_USER.name;
    if (businessEl) businessEl.textContent = CURRENT_USER.business;
  }

  currencySymbol = newCur;
  localStorage.setItem('finexy_currency_' + CURRENT_USER.userId, newCur);
  saveToStorage();
  refreshDashboardKPIs();
  renderOrdersTable();
  renderInvTable();
  showToast('Settings saved!', 'success');
};

/* ══════════════════════
   CHANGE PASSWORD
══════════════════════ */
window.changePassword = async function() {
  if (!CURRENT_USER) return;
  const current = document.getElementById('pwCurrent').value;
  const newPw   = document.getElementById('pwNew').value;
  const confirm = document.getElementById('pwConfirm').value;

  if (!current || !newPw || !confirm) { showToast('Please fill all password fields.', 'error'); return; }
  if (newPw.length < 6)              { showToast('New password must be at least 6 characters.', 'error'); return; }
  if (newPw !== confirm)             { showToast('New passwords do not match.', 'error'); return; }

  try {
    const rows = await sbQuery('users?id=eq.'+CURRENT_USER.userId+'&select=password');
    const user = rows[0];
    if (!user)                  { showToast('User not found.', 'error'); return; }
    if (user.password !== current) { showToast('Current password is incorrect.', 'error'); return; }

    await sbQuery('users?id=eq.'+CURRENT_USER.userId, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPw }),
    });
    document.getElementById('pwCurrent').value = '';
    document.getElementById('pwNew').value     = '';
    document.getElementById('pwConfirm').value = '';
    showToast('Password updated successfully!', 'success');
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
};

/* ══════════════════════
   STATE
══════════════════════ */
const S = {
  ordersFiltered: [],
  orderPage: 1, orderPerPage: 8,
  orderSortCol: 'date', orderSortDir: 'desc',
  orderSearch: '',
  orderSelected: new Set(),
  invFiltered: [],
  invSearch: '', invCat: '', invStatus: '',
  invSelected: new Set(),
  notifOpen: false,
};

/* ══════════════════════
   BOOT
══════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await initSession();
  loadFromStorage();
  await loadInventoryFromSupabase();
  await loadOrdersFromSupabase();
  initSidebar();
  initTopbar();
  initNotifs();
  initOrdersSection();
  initInventorySection();
  initModals();
  applyRBACtoButtons();
  refreshDashboardKPIs();
  renderOrdersTable();
  renderInvTable();
  renderStockAlertBanner();
  /* ── Live sync: poll Supabase every 15 seconds ──
     • Detects new orders, status changes (rider delivered/rejected)
     • Auto-completes orders when rider marks delivered
     • Updates dashboard KPIs and notifies all roles in real-time   */
  setInterval(async () => {
    await loadOrdersFromSupabase();
    /* If rider is logged in, refresh their deliveries list too */
    if (CURRENT_USER && CURRENT_USER.role === 'rider') {
      renderRiderDeliveriesPage();
    }
  }, 15000);
});

async function loadOrdersFromSupabase() {
  try {
    const rows = await sbQuery('orders?select=*&order=created_at.desc');

    /* Map Supabase rows to local format */
    const mapped = rows.map(r => ({
      id:             r.order_id || ('STO-' + r.id),
      date:           r.date || r.created_at?.slice(0,10),
      customer:       r.customer || '—',
      phone:          r.phone || '',
      email:          r.email || '',
      address:        r.address || '',
      notes:          r.notes || '',
      category:       r.items_summary || '',
      items:          r.items_count   || 1,
      total:          parseFloat(r.total) || 0,
      status:         r.status || 'pending',
      payment_method: r.payment_method || '',
      rider_id:       r.rider_id    || null,
      rider_name:     r.rider_name  || '',
      rider_status:   r.rider_status|| '',
      _fromStore:     true,
      _supaId:        r.id,
    }));

    /* ── SUPABASE IS THE SINGLE SOURCE OF TRUTH ──
       Always replace ORDERS_DB entirely from Supabase.
       This means deletions by admin instantly reflect on
       manager/staff dashboards on the next poll.          */
    const prevOrders = ORDERS_DB.slice(); // snapshot for change detection
    ORDERS_DB = mapped;

    /* Detect new orders and status changes for notifications */
    mapped.forEach(o => {
      const prev = prevOrders.find(x => x.id === o.id);

      if (!prev) {
        /* Brand new order */
        const payLabel = o.payment_method === 'Pay Online' ? '💳 Online payment' : '💵 Pay on delivery';
        pushNotif('🛒 New order ' + o.id + ' from ' + o.customer + ' — ₦' + parseFloat(o.total).toLocaleString() + ' (' + payLabel + ')');
      } else if (prev.status !== o.status) {
        /* Status changed — notify */
        if (o.status === 'delivered') {
          /* Auto-complete: delivered → completed */
          o.status = 'completed';
          sbQuery('orders?id=eq.' + o._supaId, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'completed', rider_status: 'delivered' }),
          }).catch(() => {});
          pushNotif('📦 Order ' + o.id + ' delivered by ' + (o.rider_name || 'rider') + ' — automatically ✅ Completed. Balance updated.');
        } else if (o.status === 'completed') {
          pushNotif('✅ Order ' + o.id + ' completed — ₦' + parseFloat(o.total).toLocaleString() + ' received from ' + o.customer + '.');
        } else if (o.status === 'rejected') {
          pushNotif('❌ Order ' + o.id + ' was rejected by ' + (o.rider_name || 'rider') + ' — please reassign or follow up.');
        } else if (o.status === 'paid') {
          pushNotif('💳 Order ' + o.id + ' (' + o.customer + ') — online payment received. Awaiting delivery.');
        } else if (o.status === 'shipped') {
          pushNotif('🚚 Order ' + o.id + ' is out for delivery by ' + (o.rider_name || 'rider') + '.');
        } else if (o.status === 'cancelled') {
          pushNotif('🚫 Order ' + o.id + ' was cancelled.');
        }
      }
    });

    /* Notify if orders were deleted by admin */
    prevOrders.forEach(prev => {
      if (!mapped.find(o => o.id === prev.id)) {
        pushNotif('🗑 Order ' + prev.id + ' was deleted by admin.');
      }
    });

    saveToStorage();
    renderOrdersTable();
    refreshDashboardKPIs();
  } catch(e) {
    console.warn('[Finexy] Could not load orders from Supabase:', e);
  }
}

async function loadInventoryFromSupabase() {
  try {
    const rows = await sbQuery('inventory?select=*&order=created_at.asc');
    INV_DB = rows.map(r => {
      const rawDesc = r.description || '';
      const ratingMatch = rawDesc.match(/\|\|r:([0-9.]+)\|\|/);
      const rating  = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      const colorsMatch = rawDesc.match(/\|\|c:([^|][^\|]*(?:\|[^|][^\|]*)*)\|\|/);
      const sizesMatch  = rawDesc.match(/\|\|s:([^|][^\|]*(?:\|[^|][^\|]*)*)\|\|/);
      const colors  = colorsMatch ? colorsMatch[1].split('|').map(s=>s.trim()).filter(Boolean) : [];
      const sizes   = sizesMatch  ? sizesMatch[1].split('|').map(s=>s.trim()).filter(Boolean)  : [];
      const cleanDesc = rawDesc
        .replace(/\|\|r:[0-9.]+\|\|/, '')
        .replace(/\|\|c:[^\|]*(?:\|[^\|]*)*\|\|/, '')
        .replace(/\|\|s:[^\|]*(?:\|[^\|]*)*\|\|/, '')
        .trim();
      return {
        id:       r.id,
        sku:      r.sku,
        name:     r.name,
        category: r.category,
        price:    parseFloat(r.price) || 0,
        qty:      parseInt(r.qty)     || 0,
        lowAt:    parseInt(r.low_at)  || 5,
        desc:     cleanDesc,
        colors:   colors,
        sizes:    sizes,
        image:    r.image             || null,
        rating:   rating,
        updated:  r.updated           || todayStr(),
      };
    });
    // Sync SKU counter
    const nums = INV_DB.map(p => parseInt(p.sku.replace('SKU-',''))||0);
    if (nums.length) nextSkuNum = Math.max(...nums) + 1;
  } catch(e) {
    console.warn('Could not load inventory from Supabase:', e);
  }
}

/* ══════════════════════
   LOCAL STORAGE
══════════════════════ */
function userKey(k) {
  return CURRENT_USER ? 'finexy_' + k + '_' + CURRENT_USER.userId : 'finexy_' + k;
}

/* ── Storage keys ──
   Orders/orderNum are per-user (each role sees their own orders).
   Inventory (INV_DB, skuNum) is SHARED across ALL users on the same device/browser
   so that products added by admin/manager appear for all staff, and purchases
   made by any role decrement the same stock pool.
── */
const SHARED_INV_KEY    = 'finexy_shared_inv';
const SHARED_SKU_KEY    = 'finexy_shared_skuNum';

function saveToStorage() {
  try {
    localStorage.setItem(userKey('orders'),   JSON.stringify(ORDERS_DB));
    localStorage.setItem(userKey('orderNum'), nextOrderNum);
    // Inventory is shared — NOT scoped to a single user
    localStorage.setItem(SHARED_INV_KEY,  JSON.stringify(INV_DB));
    localStorage.setItem(SHARED_SKU_KEY,  nextSkuNum);
  } catch(e) {}
}
function loadFromStorage() {
  try {
    /* NOTE: ORDERS_DB is NOT loaded from localStorage.
       It is always fetched fresh from Supabase so that
       deletions and changes by any role are immediately
       reflected on all dashboards. */
    const i  = localStorage.getItem(SHARED_INV_KEY);
    const on = localStorage.getItem(userKey('orderNum'));
    const sn = localStorage.getItem(SHARED_SKU_KEY);
    const cy = localStorage.getItem(CURRENT_USER ? 'finexy_currency_' + CURRENT_USER.userId : 'finexy_currency');
    if (i)  INV_DB         = JSON.parse(i);
    if (on) nextOrderNum   = parseInt(on);
    if (sn) nextSkuNum     = parseInt(sn);
    if (cy) currencySymbol = cy;

    /* Clear any stale cached orders from localStorage */
    localStorage.removeItem(userKey('orders'));
  } catch(e) {}
}

/* ── Cross-tab inventory sync ──
   When another tab (same browser) changes the shared inventory,
   reload it and refresh the UI so all open dashboards stay in sync.
── */
window.addEventListener('storage', e => {
  if (e.key === SHARED_INV_KEY && e.newValue) {
    try { INV_DB = JSON.parse(e.newValue); } catch(_) {}
    applyInvFilters();
    renderStockAlertBanner();
    renderInvKPIs();
    refreshDashboardKPIs();
    showToast('📦 Inventory updated by another session.', '');
  }
});

/* ══════════════════════
   NAVIGATION
══════════════════════ */
function initSidebar() {
  document.querySelectorAll('.sb-link[data-page]').forEach(a => {
    a.addEventListener('click', () => navigateTo(a.dataset.page));
  });
  document.getElementById('burger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sbOverlay').classList.toggle('open');
  });
  document.getElementById('sbOverlay').addEventListener('click', closeSidebar);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    confirmAction('Log Out', 'Are you sure you want to log out of Finexy?', () => {
      sessionStorage.removeItem('finexy_session');
      showToast('Logged out. See you soon!', 'success');
      setTimeout(() => { window.location.replace('auth.html'); }, 800);
    });
  });
}
/* Page → permission map */
const PAGE_PERMS = {
  settings:         'viewSettings',
  analytics:        'viewAnalytics',
  customers:        'viewCustomers',
  discounts:        'viewDiscounts',
  store:            'viewStore',
  'user-management':'viewUserManagement',
};

function navigateTo(page) {
  // Check permission
  const permKey = PAGE_PERMS[page];
  if (permKey && !can(permKey)) {
    denied(`"${page.charAt(0).toUpperCase()+page.slice(1)}" page`);
    showAccessDeniedPage(page);
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(a => a.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');
  const ln = document.querySelector(`.sb-link[data-page="${page}"]`);
  if (ln) ln.classList.add('active');
  closeSidebar();
}

function showAccessDeniedPage(page) {
  // Show dashboard with a toast — don't navigate
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(a => a.classList.remove('active'));
  const dash = document.getElementById('page-dashboard');
  if (dash) dash.classList.add('active');
  const ln = document.querySelector('.sb-link[data-page="dashboard"]');
  if (ln) ln.classList.add('active');
  closeSidebar();
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('open');
}
window.navigateTo = navigateTo;

/* ══════════════════════
   TOPBAR
══════════════════════ */
function initTopbar() {
  document.getElementById('topSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    S.orderSearch = q;
    applyOrderFilters();
    if (q.length >= 2) navigateTo('dashboard');
  });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('topSearch').focus();
    }
    if (e.key === 'Escape') { closeModal(); closeConfirm(); }
  });
  document.getElementById('notifTrigger').addEventListener('click', e => {
    e.stopPropagation();
    S.notifOpen = !S.notifOpen;
    document.getElementById('notifPanel').classList.toggle('open', S.notifOpen);
    renderNotifPanel();
  });
  document.addEventListener('click', e => {
    const panel = document.getElementById('notifPanel');
    if (!panel.contains(e.target) && e.target.id !== 'notifTrigger') {
      S.notifOpen = false;
      panel.classList.remove('open');
    }
  });
}

/* ══════════════════════
   NOTIFICATIONS
══════════════════════ */
function initNotifs() {
  document.getElementById('markAllRead').addEventListener('click', () => {
    NOTIFS_DB.forEach(n => n.unread = false);
    renderNotifPanel(); updatePip();
    showToast('All notifications marked as read', 'success');
  });
  renderNotifPanel(); updatePip();
}
function pushNotif(text) {
  NOTIFS_DB.unshift({ id: Date.now(), text, time: 'Just now', unread: true });
  if (NOTIFS_DB.length > 30) NOTIFS_DB.pop();
  renderNotifPanel(); updatePip();
}
function renderNotifPanel() {
  const body = document.getElementById('notifBody');
  if (!NOTIFS_DB.length) {
    body.innerHTML = '<p class="notif-empty">No notifications yet.</p>';
    return;
  }
  body.innerHTML = `<div class="notif-body-inner">${
    NOTIFS_DB.map(n => `
      <div class="notif-item ${n.unread?'unread':''}" data-nid="${n.id}">
        <div class="n-pip ${n.unread?'':'empty'}"></div>
        <div><div class="n-text">${n.text}</div><div class="n-time">${n.time}</div></div>
      </div>`).join('')
  }</div>`;
  body.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const n = NOTIFS_DB.find(x => x.id === +el.dataset.nid);
      if (n) { n.unread = false; renderNotifPanel(); updatePip(); }
    });
  });
}
function updatePip() {
  const pip = document.getElementById('notifPip');
  pip.style.display = NOTIFS_DB.some(n => n.unread) ? 'block' : 'none';
}

/* ══════════════════════
   DASHBOARD KPIs
══════════════════════ */
function refreshDashboardKPIs() {
  const sym = currencySymbol;
  /* Total orders */
  document.getElementById('kpiSales').textContent = ORDERS_DB.length;
  /* Unique customers */
  const unique = new Set(ORDERS_DB.filter(o=>o.customer).map(o => o.customer.toLowerCase())).size;
  document.getElementById('kpiCustomers').textContent = unique;
  /* Rejected + cancelled orders */
  const rejected = ORDERS_DB.filter(o => o.status === 'cancelled' || o.status === 'rejected').length;
  document.getElementById('kpiReturns').textContent = rejected;
  /* Revenue = completed + delivered (rider marked done, auto-completed) + paid online */
  const revenue = ORDERS_DB
    .filter(o => ['completed','delivered','paid'].includes(o.status))
    .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  document.getElementById('kpiRevenue').textContent = sym + revenue.toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2});
}

/* ══════════════════════
   STATUS LABEL HELPER
   Maps internal status codes to display labels
══════════════════════ */
function statusLabel(o) {
  const map = {
    pending:    '⏳ Pending',
    processing: '⚙️ Processing',
    shipped:    '🚚 Out for Delivery',
    delivered:  '📦 Delivered',
    completed:  '✅ Completed',
    paid:       '💳 Paid — Awaiting Delivery',
    rejected:   '❌ Rejected',
    cancelled:  '🚫 Cancelled',
  };
  return map[o.status] || cap(o.status);
}

/* ══════════════════════
   ORDERS
══════════════════════ */
function initOrdersSection() {
  const addBtn = document.getElementById('addOrderBtn');
  if (addBtn) {
    if (!can('addOrder')) {
      addBtn.disabled = true;
      addBtn.style.opacity = '0.4';
      addBtn.title = 'Not allowed for your role';
    } else {
      addBtn.addEventListener('click', openAddOrder);
    }
  }
  document.getElementById('orderSearch').addEventListener('input', e => {
    S.orderSearch = e.target.value.toLowerCase();
    applyOrderFilters();
  });
  document.getElementById('selectAll').addEventListener('change', e => {
    currentOrderPage().forEach(o => e.target.checked ? S.orderSelected.add(o.id) : S.orderSelected.delete(o.id));
    renderOrdersTable();
  });
  document.getElementById('sortToggle').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('sortMenu').classList.toggle('open');
  });
  document.addEventListener('click', () => document.getElementById('sortMenu').classList.remove('open'));
  document.querySelectorAll('#sortMenu .drop-item').forEach(el => {
    el.addEventListener('click', () => {
      const map = { 'date-desc':['date','desc'],'date-asc':['date','asc'],'total-desc':['total','desc'],'total-asc':['total','asc'],'status':['status','asc'] };
      const m = map[el.dataset.sort];
      if (m) { [S.orderSortCol, S.orderSortDir] = m; applyOrderFilters(); showToast('Sorted: ' + el.textContent.trim()); }
    });
  });
  applyOrderFilters();
}

function applyOrderFilters() {
  let data = [...ORDERS_DB];
  if (S.orderSearch) data = data.filter(o =>
    o.customer.toLowerCase().includes(S.orderSearch) ||
    o.id.toLowerCase().includes(S.orderSearch) ||
    o.category.toLowerCase().includes(S.orderSearch) ||
    o.status.toLowerCase().includes(S.orderSearch)
  );
  data.sort((a, b) => {
    let av = a[S.orderSortCol], bv = b[S.orderSortCol];
    if (S.orderSortCol === 'date') { av = new Date(av); bv = new Date(bv); }
    else if (['total','items'].includes(S.orderSortCol)) { av = +av; bv = +bv; }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    return S.orderSortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });
  S.ordersFiltered = data;
  S.orderPage = 1;
  renderOrdersTable();
}

function currentOrderPage() {
  const s = (S.orderPage - 1) * S.orderPerPage;
  return S.ordersFiltered.slice(s, s + S.orderPerPage);
}

function renderOrdersTable() {
  const tbody = document.getElementById('ordersTbody');
  const info  = document.getElementById('tblInfo');
  const rows  = currentOrderPage();

  if (!ORDERS_DB.length) {
    tbody.innerHTML = `
      <tr><td colspan="9">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <h4>No orders yet</h4>
          <p>Click "Add Order" to record your first order.</p>
        </div>
      </td></tr>`;
    info.textContent = 'No orders';
    document.getElementById('pager').innerHTML = '';
    return;
  }
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--t3)">No results match your search.</td></tr>`;
    info.textContent = '0 results';
    document.getElementById('pager').innerHTML = '';
    return;
  }

  const sym = currencySymbol;
  const canEdit   = can('editOrder');
  const canDelete = can('deleteOrder');
  tbody.innerHTML = rows.map(o => `
    <tr class="${S.orderSelected.has(o.id) ? 'row-selected' : ''}">
      <td><input type="checkbox" class="o-chk" data-id="${o.id}" ${S.orderSelected.has(o.id)?'checked':''}/></td>
      <td style="font-weight:700;color:var(--brand);">
        ${o.id}
        ${o._fromStore ? `<span style="font-size:.58rem;background:#059669;color:#fff;padding:1px 5px;border-radius:4px;display:inline-block;margin-left:4px;vertical-align:middle;">STORE</span>` : ''}
      </td>
      <td>${fmtDate(o.date)}</td>
      <td>
        <div style="font-weight:600;font-size:.84rem;">${o.customer}</div>
        ${o.phone ? `<div style="font-size:.7rem;color:var(--t2);">${o.phone}</div>` : ''}
      </td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem;" title="${o.category}">${o.category}</td>
      <td>
        <span class="badge ${o.status}">${statusLabel(o)}</span>
        ${o.payment_method ? `<div style="font-size:.65rem;color:var(--t2);margin-top:3px;">${o.payment_method}</div>` : ''}
        ${o.rider_name ? `<div style="font-size:.65rem;color:#34D399;margin-top:2px;">🛵 ${o.rider_name}</div>` : ''}
      </td>
      <td>${o.items} item${o.items !== 1 ? 's':''}</td>
      <td style="font-weight:700">${sym}${o.total.toFixed(2)}</td>
      <td><div class="row-acts">
        <button class="ra" data-act="view"  data-id="${o.id}" title="View">👁</button>
        ${can('assignRider') ? `<button class="ra" data-act="assign" data-id="${o.id}" title="Assign Rider" style="color:#059669;">🛵</button>` : ''}
        ${canEdit   ? `<button class="ra" data-act="edit" data-id="${o.id}" title="Edit">✏️</button>` : `<button class="ra" style="opacity:.3;cursor:not-allowed" title="Edit not allowed for your role" disabled>✏️</button>`}
        ${canDelete ? `<button class="ra red" data-act="del" data-id="${o.id}" title="Delete">🗑</button>` : `<button class="ra" style="opacity:.3;cursor:not-allowed" title="Delete not allowed for your role" disabled>🗑</button>`}
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('.o-chk').forEach(cb => {
    cb.addEventListener('change', e => {
      e.target.checked ? S.orderSelected.add(e.target.dataset.id) : S.orderSelected.delete(e.target.dataset.id);
      const all = currentOrderPage().every(o => S.orderSelected.has(o.id));
      document.getElementById('selectAll').checked = all;
    });
  });
  tbody.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const o = ORDERS_DB.find(x => x.id === btn.dataset.id);
      if (!o) return;
      if (btn.dataset.act === 'view') { openOrderView(o); return; }
      if (btn.dataset.act === 'assign') {
        if (!can('assignRider')) { denied('Assign Rider'); return; }
        openAssignRider(o.id); return;
      }
      if (btn.dataset.act === 'edit') {
        if (!can('editOrder')) { denied('Edit Order'); return; }
        openOrderEdit(o); return;
      }
      if (btn.dataset.act === 'del') {
        if (!can('deleteOrder')) { denied('Delete Order'); return; }
        confirmAction('Delete Order', `Delete order ${o.id}? This cannot be undone.`, async () => {
          /* 1. Delete from Supabase so it never comes back on next poll */
          if (o._supaId) {
            try {
              await sbQuery('orders?id=eq.' + o._supaId, { method: 'DELETE' });
            } catch(e) {
              showToast('Could not delete from database: ' + e.message, 'error');
              return;
            }
          }
          /* 2. Remove from local ORDERS_DB */
          ORDERS_DB.splice(ORDERS_DB.findIndex(x => x.id === o.id), 1);
          S.orderSelected.delete(o.id);
          saveToStorage(); applyOrderFilters(); refreshDashboardKPIs();
          showToast(`Order ${o.id} deleted.`, 'warning');
          pushNotif(`🗑 Order ${o.id} was permanently deleted.`);
        });
      }
    });
  });

  const s = (S.orderPage - 1) * S.orderPerPage + 1;
  const e = Math.min(s + S.orderPerPage - 1, S.ordersFiltered.length);
  info.textContent = `Showing ${s}–${e} of ${S.ordersFiltered.length} order${S.ordersFiltered.length !== 1 ? 's':''}`;
  renderPager('pager', S.orderPage, Math.ceil(S.ordersFiltered.length / S.orderPerPage), p => { S.orderPage = p; renderOrdersTable(); });
}

/* ── Add Order Modal ── */
function openAddOrder() {
  const today = todayStr();

  // Build product dropdown from live inventory (in-stock items only first, then others)
  const inStockProducts  = INV_DB.filter(p => stockStatus(p) !== 'out_of_stock');
  const outStockProducts = INV_DB.filter(p => stockStatus(p) === 'out_of_stock');
  const allProducts      = [...inStockProducts, ...outStockProducts];

  const prodOptions = allProducts.length
    ? allProducts.map(p => {
        const st     = stockStatus(p);
        const label  = `${p.name} — ${p.qty} in stock (${currencySymbol}${p.price.toFixed(2)})`;
        const disabled = st === 'out_of_stock' ? 'disabled' : '';
        return `<option value="${p.name}" data-price="${p.price}" data-qty="${p.qty}" ${disabled}>${label}${st === 'out_of_stock' ? ' [OUT OF STOCK]' : ''}</option>`;
      }).join('')
    : `<option value="">No products in inventory yet</option>`;

  openModal('Add New Order', `
    <div class="mform-row">
      <div class="fg"><label>Customer Name *</label><input id="oCust" type="text" placeholder="Full name"/></div>
      <div class="fg"><label>Date *</label><input id="oDate" type="date" value="${today}"/></div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Product *</label>
        ${allProducts.length
          ? `<select id="oCatSel" onchange="(function(){
               const sel=document.getElementById('oCatSel');
               const opt=sel.options[sel.selectedIndex];
               document.getElementById('oCat').value=opt.value;
               const price=parseFloat(opt.dataset.price)||0;
               const qty=parseInt(opt.dataset.qty)||0;
               const items=parseInt(document.getElementById('oItems').value)||1;
               document.getElementById('oTotal').value=(price*items).toFixed(2);
               document.getElementById('oStockHint').textContent=opt.value?'Available: '+qty+' units':'';
             })()">
               <option value="">— Select a product —</option>
               ${prodOptions}
             </select>
             <input id="oCat" type="hidden" value=""/>
             <span id="oStockHint" style="font-size:.72rem;color:var(--t2);margin-top:4px;display:block"></span>`
          : `<input id="oCat" type="text" placeholder="e.g. Shoes, Shirt (no products in inventory yet)"/>
             <input type="hidden" id="oCatSel"/>
             <span id="oStockHint"></span>`}
      </div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Status *</label><select id="oStatus">
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed / Paid ✓</option>
        <option value="cancelled">Cancelled</option>
      </select></div>
      <div class="fg"><label>No. of Items *</label><input id="oItems" type="number" placeholder="1" min="1" value="1" oninput="(function(){
        const sel=document.getElementById('oCatSel');
        if(!sel||!sel.options) return;
        const opt=sel.options[sel.selectedIndex];
        if(!opt||!opt.dataset.price) return;
        const price=parseFloat(opt.dataset.price)||0;
        const items=parseInt(document.getElementById('oItems').value)||1;
        document.getElementById('oTotal').value=(price*items).toFixed(2);
      })()"/></div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Total (${currencySymbol}) *</label><input id="oTotal" type="number" placeholder="0.00" min="0" step="0.01"/></div>
      <div class="fg"><label>Notes (optional)</label><input id="oNotes" type="text" placeholder="Any notes…"/></div>
    </div>
    <div id="oDeductNote" style="font-size:.76rem;color:#86EFAC;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 12px;margin-top:4px">
      💡 <strong>Stock auto-deduct:</strong> Setting status to <em>Completed / Paid</em> will automatically reduce the product's inventory quantity.
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNewOrder()">Add Order</button>
    </div>`);
}
/* ── Inventory deduction helper ──
   Looks for a product in INV_DB whose name or category matches the order's
   category/product field, then reduces qty by the number of items ordered.
   Called whenever an order is created or its status changes to "completed".
── */
function deductInventoryForOrder(order) {
  /* ════════════════════════════════════════════════════════
     Parse every line item from items_summary.
     Format: "Nike Air [Size: 42, Colour: #FF0000] (x2), Plain Tee (x1)"
     We split on commas NOT inside brackets, extract name + qty
     for each item, match to INV_DB, and deduct individually.
  ════════════════════════════════════════════════════════ */
  const summary = (order.category || '').trim();
  if (!summary) return false;

  /* Split on commas that are NOT inside [ ] */
  const parts = summary.split(/,(?![^\[]*\])/);

  let anyDeducted = false;

  parts.forEach(part => {
    part = part.trim();
    if (!part) return;

    /* Extract qty from "(xN)" suffix */
    const qtyMatch = part.match(/\(x(\d+)\)\s*$/);
    const qty      = qtyMatch ? parseInt(qtyMatch[1]) : 1;

    /* Strip bracket variants and qty to get product name */
    const namePart = part
      .replace(/\(x\d+\)\s*$/, '')
      .replace(/\s*\[.*?\]\s*$/, '')
      .trim();

    if (!namePart) return;

    /* Match against inventory — exact first, then contains */
    const nameLower = namePart.toLowerCase();
    let p = INV_DB.find(x => x.name.toLowerCase() === nameLower);
    if (!p) p = INV_DB.find(x => x.name.toLowerCase().includes(nameLower) || nameLower.includes(x.name.toLowerCase()));
    if (!p) return;

    const before = p.qty;
    p.qty        = Math.max(0, p.qty - qty);
    p.updated    = todayStr();

    /* Persist to Supabase immediately — storefront Realtime listener picks this up */
    sbQuery('inventory?sku=eq.' + encodeURIComponent(p.sku), {
      method: 'PATCH',
      body:   JSON.stringify({ qty: p.qty, updated: p.updated }),
    }).catch(() => {});

    const st = stockStatus(p);
    if (st === 'out_of_stock') {
      pushNotif(`🚨 "${p.name}" is now OUT OF STOCK after order ${order.id}.`);
    } else if (st === 'low_stock') {
      pushNotif(`⚠️ "${p.name}" is running low — only ${p.qty} left after order ${order.id}.`);
    }

    showToast(`📦 "${p.name}" stock: ${before} → ${p.qty}`, 'success');
    anyDeducted = true;
  });

  if (anyDeducted) {
    saveToStorage();
    applyInvFilters();
    renderStockAlertBanner();
    refreshDashboardKPIs();
  }

  return anyDeducted;
}
window.deductInventoryForOrder = deductInventoryForOrder;

window.saveNewOrder = async function() {
  const customer = document.getElementById('oCust').value.trim();
  const date     = document.getElementById('oDate').value;
  const catEl    = document.getElementById('oCat');
  const catSelEl = document.getElementById('oCatSel');
  let category   = catEl ? catEl.value.trim() : '';
  if (!category && catSelEl && catSelEl.tagName === 'SELECT') {
    category = catSelEl.value;
  }
  const status   = document.getElementById('oStatus').value;
  const items    = parseInt(document.getElementById('oItems').value) || 1;
  const total    = parseFloat(document.getElementById('oTotal').value);
  const phone    = document.getElementById('oPhone') ? document.getElementById('oPhone').value.trim() : '';
  const notes    = document.getElementById('oNotes') ? document.getElementById('oNotes').value.trim() : '';
  if (!customer || !date || !category || isNaN(total)) {
    showToast('Please fill all required fields.', 'error'); return;
  }
  const orderId = 'ORD-' + String(nextOrderNum).padStart(4, '0');
  nextOrderNum++;

  const orderPayload = {
    order_id:       orderId,
    date:           date,
    customer:       customer,
    phone:          phone,
    items_summary:  category,
    items_count:    items,
    total:          total,
    status:         status,
    notes:          notes,
    payment_method: 'Manual Entry',
    created_at:     new Date().toISOString(),
  };

  try {
    const result = await sbQuery('orders', { method: 'POST', body: JSON.stringify(orderPayload) });
    const supaRow = result[0];
    const order = {
      id: orderId, date, customer, phone,
      category, items, total, status, notes,
      payment_method: 'Manual Entry',
      _fromStore: false,
      _supaId: supaRow ? supaRow.id : null,
    };
    ORDERS_DB.unshift(order);
    saveToStorage(); closeModal(); applyOrderFilters(); refreshDashboardKPIs();
    showToast(`Order ${orderId} added!`, 'success');
    pushNotif(`New order ${orderId} added for ${customer}.`);
    if (status === 'completed') {
      const didDeduct = deductInventoryForOrder(order);
      if (!didDeduct) showToast(`Order added. No matching product found to deduct stock.`, 'warning');
    }
  } catch(e) {
    showToast('Error saving order: ' + e.message, 'error');
  }
};

/* ── View Order ── */
function openOrderView(o) {
  const sym = currencySymbol;

  /* ════════════════════════════════════════
     Parse items_summary into structured rows
     Format: "Nike Air Max [Size: 42, Colour: #FF0000] (x2), Plain Tee (x1)"
  ════════════════════════════════════════ */
  function parseOrderItems(summary) {
    if (!summary) return [];
    /* Split on commas that are NOT inside square brackets */
    const parts = summary.split(/,(?![^\[]*\])/);
    return parts.map(part => {
      part = part.trim();
      if (!part) return null;
      const qtyMatch   = part.match(/\(x(\d+)\)\s*$/);
      const qty        = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      const withoutQty = part.replace(/\(x\d+\)\s*$/, '').trim();
      const bracketMatch = withoutQty.match(/^(.+?)\s*\[(.+)\]\s*$/);
      let name  = withoutQty;
      let size  = '';
      let color = '';
      if (bracketMatch) {
        name = bracketMatch[1].trim();
        const attrs  = bracketMatch[2];
        const sizeM  = attrs.match(/Size:\s*([^,\]]+)/i);
        const colorM = attrs.match(/Colour:\s*([^,\]]+)/i);
        if (sizeM)  size  = sizeM[1].trim();
        if (colorM) color = colorM[1].trim();
      }
      return { name, size, color, qty };
    }).filter(Boolean);
  }

  const lineItems   = parseOrderItems(o.category);  /* o.category holds items_summary */
  const hasVariants = lineItems.some(i => i.size || i.color);

  /* Build the items table */
  const itemsHTML = lineItems.length
    ? `<div style="border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden;">
        <div style="display:grid;grid-template-columns:1fr${hasVariants?' 150px':''} 56px 90px;gap:0;background:var(--bg);padding:8px 14px;font-size:.66rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--border);">
          <span>Product</span>${hasVariants?'<span>Colour / Size</span>':''}<span style="text-align:center;">Qty</span><span style="text-align:right;">Subtotal</span>
        </div>
        ${lineItems.map((item, idx) => {
          const inv       = INV_DB.find(p => p.name.toLowerCase() === item.name.toLowerCase())
                          || INV_DB.find(p => item.name.toLowerCase().includes(p.name.toLowerCase()));
          const unitPrice = inv       ? inv.price
                          : lineItems.length === 1 ? o.total / item.qty
                          : null;
          const subtotal  = unitPrice !== null ? unitPrice * item.qty : null;
          const isLast    = idx === lineItems.length - 1;
          return `<div style="display:grid;grid-template-columns:1fr${hasVariants?' 150px':''} 56px 90px;gap:0;padding:11px 14px;align-items:center;font-size:.83rem;${!isLast?'border-bottom:1px solid var(--border);':''}">
            <div>
              <div style="font-weight:600;color:var(--t1);line-height:1.35;">${item.name}</div>
              ${inv?`<div style="font-size:.67rem;color:var(--t3);margin-top:1px;">SKU: ${inv.sku}</div>`:''}
            </div>
            ${hasVariants?`<div style="display:flex;flex-direction:column;gap:4px;">
              ${item.color?`<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px 2px 5px;border-radius:10px;background:#EDE9FE;font-size:.67rem;font-weight:700;color:#7C3AED;width:fit-content;">
                <span style="width:11px;height:11px;border-radius:50%;background:${item.color};border:1.5px solid rgba(0,0,0,.15);flex-shrink:0;display:inline-block;"></span>${item.color}
              </span>`:''}
              ${item.size?`<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:10px;background:#DBEAFE;color:#1D4ED8;font-size:.67rem;font-weight:700;width:fit-content;">📐 ${item.size}</span>`:''}
              ${!item.color&&!item.size?`<span style="font-size:.7rem;color:var(--t3);">—</span>`:''}
            </div>`:''}
            <div style="text-align:center;font-weight:800;color:var(--t1);">×${item.qty}</div>
            <div style="text-align:right;font-weight:700;color:var(--brand);">
              ${subtotal!==null?sym+subtotal.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}
            </div>
          </div>`;
        }).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-top:2px solid var(--border);background:linear-gradient(90deg,rgba(232,68,26,.04),rgba(232,68,26,.01));">
          <span style="font-size:.75rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.06em;">Order Total</span>
          <span style="font-size:1.1rem;font-weight:800;color:var(--brand);">${sym}${o.total.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
      </div>`
    : `<div style="padding:12px 14px;background:var(--bg);border-radius:var(--r-sm);font-size:.82rem;color:var(--t2);">${o.category||'—'}</div>`;

  openModal(`Order ${o.id}`, `

    <!-- ── Order header ── -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:14px 16px;background:linear-gradient(135deg,rgba(232,68,26,.06),rgba(232,68,26,.02));border:1px solid rgba(232,68,26,.12);border-radius:var(--r-md);margin-bottom:18px;">
      <div>
        <div style="font-size:.64rem;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;">Order ID</div>
        <div style="font-size:1.05rem;font-weight:800;color:var(--brand);display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${o.id}
          ${o._fromStore?`<span style="font-size:.58rem;background:#059669;color:#fff;padding:2px 7px;border-radius:4px;vertical-align:middle;">STORE</span>`:''}
        </div>
        <div style="font-size:.73rem;color:var(--t2);margin-top:3px;">📅 ${fmtDate(o.date)}</div>
      </div>
      <div style="text-align:right;">
        <span class="badge ${o.status}" style="font-size:.76rem;padding:5px 13px;">${statusLabel(o)}</span>
        ${o.payment_method?`<div style="font-size:.7rem;color:var(--t2);margin-top:6px;">${o.payment_method==='Pay on Delivery'?'💵':o.payment_method==='Bank Transfer'?'🏦':'💳'} ${o.payment_method}</div>`:''}
      </div>
    </div>

    <!-- ── Customer details ── -->
    <div style="margin-bottom:16px;">
      <div style="font-size:.66rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px;">Customer Details</div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div>
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Name</div>
          <div style="font-weight:700;color:var(--t1);font-size:.9rem;">${o.customer}</div>
        </div>
        ${o.phone?`<div>
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Phone</div>
          <div style="font-weight:600;color:var(--t1);font-size:.88rem;">${o.phone}</div>
        </div>`:''}
        ${o.email?`<div style="grid-column:1/-1;">
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Email</div>
          <div style="font-weight:600;color:var(--t1);font-size:.88rem;">${o.email}</div>
        </div>`:''}
        ${o.address?`<div style="grid-column:1/-1;">
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Delivery Address</div>
          <div style="font-weight:600;color:var(--t1);font-size:.88rem;line-height:1.45;">${o.address}</div>
        </div>`:''}
        ${o.notes?`<div style="grid-column:1/-1;">
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Delivery Notes</div>
          <div style="font-style:italic;color:var(--t2);font-size:.82rem;">"${o.notes}"</div>
        </div>`:''}
        ${o.rider_name?`<div style="grid-column:1/-1;">
          <div style="font-size:.65rem;color:var(--t3);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em;">Assigned Rider</div>
          <div style="font-weight:700;color:#059669;font-size:.88rem;">🛵 ${o.rider_name}</div>
        </div>`:''}
      </div>
    </div>

    <!-- ── Items ordered ── -->
    <div style="margin-bottom:18px;">
      <div style="font-size:.66rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px;">
        Items Ordered
        <span style="font-weight:400;color:var(--t3);margin-left:5px;">(${o.items} item${o.items!==1?'s':''})</span>
      </div>
      ${itemsHTML}
    </div>

    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Close</button>
      ${can('assignRider')?`<button class="btn-outline" onclick="closeModal();openAssignRider('${o.id}')">🛵 Assign Rider</button>`:''}
      ${can('editOrder')?`<button class="btn-primary" onclick="closeModal();openOrderEdit(ORDERS_DB.find(x=>x.id==='${o.id}'))">✏️ Edit Status</button>`:''}
    </div>`);
}

/* ── Edit Order ── */
function openOrderEdit(o) {
  if (!can('editOrder')) { denied('Edit Order'); return; }
  const sym    = currencySymbol;
  const isAdmin = CURRENT_USER && CURRENT_USER.role === 'admin';
  /* Admin and Manager can change all fields. Staff can only update status. */
  openModal(`Edit Order ${o.id}`, `
    <div class="mform-row">
      <div class="fg">
        <label>Customer</label>
        <input id="ec" type="text" value="${o.customer}" ${!isAdmin ? 'readonly style="background:var(--bg);color:var(--t2);cursor:default"' : ''}/>
      </div>
      <div class="fg">
        <label>Date</label>
        <input id="ed" type="date" value="${o.date}" ${!isAdmin ? 'readonly style="background:var(--bg);color:var(--t2);cursor:default"' : ''}/>
      </div>
    </div>
    <div class="mform-row">
      <div class="fg">
        <label>Items</label>
        <input id="ecat" type="text" value="${o.category}" readonly style="background:var(--bg);color:var(--t2);cursor:default"/>
      </div>
      <div class="fg">
        <label>Status *</label>
        <select id="est">
          <option value="pending"    ${o.status==='pending'    ?'selected':''}>⏳ Pending</option>
          <option value="processing" ${o.status==='processing' ?'selected':''}>⚙️ Processing</option>
          <option value="paid"       ${o.status==='paid'       ?'selected':''}>💳 Paid — Awaiting Delivery</option>
          <option value="shipped"    ${o.status==='shipped'    ?'selected':''}>🚚 Shipped / Out for Delivery</option>
          <option value="delivered"  ${o.status==='delivered'  ?'selected':''}>📦 Delivered</option>
          <option value="completed"  ${o.status==='completed'  ?'selected':''}>✅ Completed</option>
          <option value="rejected"   ${o.status==='rejected'   ?'selected':''}>❌ Rejected</option>
          <option value="cancelled"  ${o.status==='cancelled'  ?'selected':''}>🚫 Cancelled</option>
        </select>
      </div>
    </div>
    <div class="mform-row">
      <div class="fg">
        <label>Items Count</label>
        <input id="eit" type="number" value="${o.items}" min="1" ${!isAdmin ? 'readonly style="background:var(--bg);color:var(--t2);cursor:default"' : ''}/>
      </div>
      <div class="fg">
        <label>Total (${sym})</label>
        <input id="etot" type="number" value="${o.total}" step="0.01" min="0" ${!isAdmin ? 'readonly style="background:var(--bg);color:var(--t2);cursor:default"' : ''}/>
      </div>
    </div>
    ${o.status !== 'completed'
      ? `<div style="font-size:.76rem;color:#86EFAC;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 12px;margin:8px 0;">
           💡 Changing status to <strong>Completed / Paid</strong> will automatically deduct stock from inventory.
         </div>`
      : `<div style="font-size:.76rem;color:var(--t2);background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin:8px 0;">
           ✅ This order is already completed — stock was already deducted.
         </div>`}
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveOrderEdit('${o.id}')">Save Changes</button>
    </div>`);
}
window.openOrderEdit = openOrderEdit;
window.saveOrderEdit = async function(id) {
  const o = ORDERS_DB.find(x => x.id === id);
  if (!o) return;
  const prevStatus = o.status;
  const isAdmin    = CURRENT_USER && CURRENT_USER.role === 'admin';

  /* Admin can change everything; others only change status */
  if (isAdmin) {
    o.customer = document.getElementById('ec').value.trim()    || o.customer;
    o.date     = document.getElementById('ed').value           || o.date;
    o.items    = parseInt(document.getElementById('eit').value)    || o.items;
    o.total    = parseFloat(document.getElementById('etot').value) || o.total;
  }
  o.status = document.getElementById('est').value;

  /* Always sync to Supabase — all orders now live there */
  if (o._supaId) {
    try {
      const patch = { status: o.status };
      if (isAdmin) {
        patch.customer    = o.customer;
        patch.date        = o.date;
        patch.items_count = o.items;
        patch.total       = o.total;
      }
      await sbQuery('orders?id=eq.'+o._supaId, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    } catch(e) { console.warn('Could not sync order status to Supabase:', e); }
  }

  saveToStorage(); closeModal(); applyOrderFilters(); refreshDashboardKPIs();
  showToast(`Order ${id} updated to "${statusLabel(o)}"!`, 'success');

  /* Fire appropriate notifications based on new status */
  if (o.status === 'completed' && prevStatus !== 'completed') {
    const didDeduct = deductInventoryForOrder(o);
    if (!didDeduct) showToast('No matching product found to deduct stock.', 'warning');
    pushNotif(`✅ Order ${id} completed — ₦${o.total.toLocaleString()} received from ${o.customer}.`);
    refreshDashboardKPIs();
  }
  if (o.status === 'delivered' && prevStatus !== 'delivered') {
    pushNotif(`📦 Order ${id} delivered to ${o.customer}. Awaiting completion confirmation.`);
  }
  if (o.status === 'paid' && prevStatus !== 'paid') {
    pushNotif(`💳 Order ${id} — online payment received from ${o.customer}. Awaiting delivery.`);
  }
  if (o.status === 'shipped' && prevStatus !== 'shipped') {
    pushNotif(`🚚 Order ${id} is out for delivery to ${o.customer}${o.rider_name ? ' via ' + o.rider_name : ''}.`);
  }
  if (o.status === 'rejected' && prevStatus !== 'rejected') {
    pushNotif(`❌ Order ${id} marked as Rejected. Follow up with ${o.customer}.`);
  }
  if (o.status === 'cancelled' && prevStatus !== 'cancelled') {
    pushNotif(`🚫 Order ${id} cancelled.`);
  }
};

/* ══════════════════════
   ASSIGN RIDER
══════════════════════ */
window.openAssignRider = async function(orderId) {
  const o = ORDERS_DB.find(x => x.id === orderId);
  if (!o) return;

  // Load available (active, approved) riders from Supabase
  let riders = [];
  try {
    riders = await sbQuery('users?role=eq.rider&approved=eq.true&deactivated=eq.false&select=id,first,last,email');
  } catch(e) {
    showToast('Could not load riders. Check connection.', 'error'); return;
  }

  if (riders.length === 0) {
    openModal('Assign Rider 🛵', `
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🛵</div>
        <p style="color:var(--t2);font-size:.88rem;">No approved riders available yet.<br/>Add and approve a Rider account first.</p>
      </div>
      <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Close</button></div>`);
    return;
  }

  const currentRider = o.rider_name || null;

  openModal('Assign Rider 🛵', `
    <div style="margin-bottom:16px;">
      <p style="font-size:.82rem;color:var(--t2);margin-bottom:4px;">Order: <strong style="color:var(--t1);">${o.id}</strong></p>
      <p style="font-size:.82rem;color:var(--t2);margin-bottom:${currentRider?'8px':'0'};">Customer: <strong style="color:var(--t1);">${o.customer}</strong></p>
      ${currentRider ? `<div style="font-size:.78rem;color:#86EFAC;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:8px 12px;">Currently assigned to: <strong>${currentRider}</strong></div>` : ''}
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:.78rem;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:10px;">Select Rider</label>
      <div style="display:flex;flex-direction:column;gap:8px;" id="riderList">
        ${riders.map(r => `
          <label style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .15s;" id="riderOpt_${r.id}" onclick="selectRiderOpt(${r.id})">
            <input type="radio" name="riderSel" value="${r.id}" style="display:none;" ${o.rider_id==r.id?'checked':''} />
            <div style="width:36px;height:36px;border-radius:50%;background:#059669;display:grid;place-items:center;font-size:.8rem;font-weight:700;color:#fff;flex-shrink:0;">${(r.first[0]+(r.last?.[0]||'')).toUpperCase()}</div>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:.85rem;color:var(--t1);">${r.first} ${r.last}</div>
              <div style="font-size:.72rem;color:var(--t2);">${r.email}</div>
            </div>
            <div id="riderCheck_${r.id}" style="width:18px;height:18px;border-radius:50%;background:${o.rider_id==r.id?'#059669':'var(--border)'};display:grid;place-items:center;flex-shrink:0;">
              ${o.rider_id==r.id?'<svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2L7.5 2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>':''}
            </div>
          </label>`).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="confirmAssignRider('${orderId}')">🛵 Assign Rider</button>
    </div>`);

  // Pre-select current rider if any
  if (o.rider_id) selectRiderOpt(o.rider_id);
};

window.selectRiderOpt = function(riderId) {
  document.querySelectorAll('input[name="riderSel"]').forEach(r => {
    const id    = r.value;
    const opt   = document.getElementById('riderOpt_' + id);
    const check = document.getElementById('riderCheck_' + id);
    if (parseInt(id) === parseInt(riderId)) {
      r.checked = true;
      if (opt)   opt.style.borderColor = '#059669';
      if (check) { check.style.background = '#059669'; check.innerHTML = '<svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2L7.5 2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'; }
    } else {
      r.checked = false;
      if (opt)   opt.style.borderColor = 'var(--border)';
      if (check) { check.style.background = 'var(--border)'; check.innerHTML = ''; }
    }
  });
};

window.confirmAssignRider = async function(orderId) {
  const sel = document.querySelector('input[name="riderSel"]:checked');
  if (!sel) { showToast('Please select a rider first.', 'error'); return; }

  const riderId = parseInt(sel.value);
  const riderLabel = sel.closest('label');
  const riderName  = riderLabel ? riderLabel.querySelector('.font-weight-600, [style*="font-weight:600"]')?.textContent?.trim() || '' : '';

  // Get rider full name from DOM
  const nameEl = document.querySelector(`#riderOpt_${riderId} div[style*="font-weight:600"]`);
  const fullName = nameEl ? nameEl.textContent.trim() : 'Rider';

  const o = ORDERS_DB.find(x => x.id === orderId);
  if (!o) return;

  try {
    await sbQuery('orders?id=eq.'+o._supaId, {
      method: 'PATCH',
      body: JSON.stringify({
        rider_id:   riderId,
        rider_name: fullName,
        status:     'processing',
        rider_status: 'assigned',
      }),
    });

    // Update local
    o.rider_id    = riderId;
    o.rider_name  = fullName;
    o.status      = 'processing';
    saveToStorage();
    applyOrderFilters();
    refreshDashboardKPIs();
    closeModal();
    showToast(`🛵 ${fullName} assigned to order ${orderId}!`, 'success');
    pushNotif(`Order ${orderId} assigned to ${fullName} for delivery.`);
  } catch(e) { showToast('Error assigning rider: ' + e.message, 'error'); }
};

/* ══════════════════════
   INVENTORY
══════════════════════ */
function initInventorySection() {
  /* Add Product - RBAC */
  const addBtn = document.getElementById('addProductBtn');
  if (addBtn) {
    if (!can('addProduct')) {
      addBtn.disabled = true; addBtn.style.opacity = '0.4';
      addBtn.title = 'Not allowed for your role';
    } else { addBtn.addEventListener('click', openAddProduct); }
  }
  /* Export - RBAC */
  const expBtn = document.getElementById('exportInvBtn');
  if (expBtn) {
    if (!can('exportCSV')) {
      expBtn.disabled = true; expBtn.style.opacity = '0.4';
      expBtn.title = 'Not allowed for your role';
    } else { expBtn.addEventListener('click', exportCSV); }
  }
  document.getElementById('invSearch').addEventListener('input', e => { S.invSearch = e.target.value.toLowerCase(); applyInvFilters(); });
  document.getElementById('invCatFilter').addEventListener('change', e => { S.invCat = e.target.value; applyInvFilters(); });
  document.getElementById('invStatusFilter').addEventListener('change', e => { S.invStatus = e.target.value; applyInvFilters(); });
  document.getElementById('invSelectAll').addEventListener('change', e => {
    S.invFiltered.forEach(p => e.target.checked ? S.invSelected.add(p.sku) : S.invSelected.delete(p.sku));
    renderInvTable();
  });
  document.getElementById('bulkRestockBtn').addEventListener('click', () => {
    if (!can('restockProduct')) { denied('Bulk Restock'); return; }
    if (!S.invSelected.size) return;
    confirmAction('Restock Selected', `Add 50 units to all ${S.invSelected.size} selected product(s)?`, async () => {
      const skus = [...S.invSelected];
      await Promise.all(skus.map(async sku => {
        const p = INV_DB.find(x => x.sku === sku);
        if (!p) return;
        p.qty += 50; p.updated = todayStr();
        try { await sbQuery('inventory?sku=eq.'+encodeURIComponent(sku), { method:'PATCH', body: JSON.stringify({ qty:p.qty, updated:p.updated }) }); } catch(e){}
      }));
      S.invSelected.clear();
      saveToStorage(); applyInvFilters(); renderStockAlertBanner();
      showToast('Selected products restocked (+50 each)!', 'success');
    });
  });
  document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
    if (!can('deleteProduct')) { denied('Bulk Delete'); return; }
    if (!S.invSelected.size) return;
    confirmAction('Delete Products', `Delete ${S.invSelected.size} selected product(s)? This cannot be undone.`, async () => {
      const skus = [...S.invSelected];
      await Promise.all(skus.map(async sku => {
        try { await sbQuery('inventory?sku=eq.'+encodeURIComponent(sku), { method:'DELETE' }); } catch(e){}
        const i = INV_DB.findIndex(x => x.sku === sku); if (i !== -1) INV_DB.splice(i, 1);
      }));
      S.invSelected.clear();
      saveToStorage(); applyInvFilters(); renderStockAlertBanner();
      showToast('Selected products deleted.', 'warning');
    });
  });
  applyInvFilters();
}

function stockStatus(p) {
  if (p.qty === 0)      return 'out_of_stock';
  if (p.qty <= p.lowAt) return 'low_stock';
  return 'in_stock';
}
function stockLabel(s) {
  return { in_stock:'In Stock', low_stock:'Low Stock', out_of_stock:'Out of Stock' }[s] || s;
}

function applyInvFilters() {
  let data = [...INV_DB];
  if (S.invSearch)  data = data.filter(p => p.name.toLowerCase().includes(S.invSearch) || p.sku.toLowerCase().includes(S.invSearch) || p.category.toLowerCase().includes(S.invSearch));
  if (S.invCat)     data = data.filter(p => p.category === S.invCat);
  if (S.invStatus)  data = data.filter(p => stockStatus(p) === S.invStatus);
  S.invFiltered = data;
  renderInvTable();
  renderInvKPIs();
}

function renderInvKPIs() {
  document.getElementById('invTotal').textContent   = INV_DB.length;
  document.getElementById('invInStock').textContent = INV_DB.filter(p => stockStatus(p) === 'in_stock').length;
  document.getElementById('invLow').textContent     = INV_DB.filter(p => stockStatus(p) === 'low_stock').length;
  document.getElementById('invOut').textContent     = INV_DB.filter(p => stockStatus(p) === 'out_of_stock').length;
}

function renderInvTable() {
  const tbody = document.getElementById('invTbody');
  const info  = document.getElementById('invInfo');
  const sym   = currencySymbol;

  if (!INV_DB.length) {
    tbody.innerHTML = `
      <tr><td colspan="11">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <h4>No products yet</h4>
          <p>Click "Add Product" to add your first item to inventory.</p>
        </div>
      </td></tr>`;
    info.textContent = 'No products yet — click "Add Product" to begin';
    updateBulkBar();
    return;
  }
  if (!S.invFiltered.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:36px;color:var(--t3)">No products match your filters.</td></tr>`;
    info.textContent = '0 results';
    updateBulkBar();
    return;
  }

  tbody.innerHTML = S.invFiltered.map(p => {
    const st  = stockStatus(p);
    const img = p.image
      ? `<img class="prod-img" src="${p.image}" alt="${p.name}"/>`
      : `<div class="prod-img-placeholder"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    return `
    <tr class="${S.invSelected.has(p.sku) ? 'row-selected':''}">
      <td><input type="checkbox" class="i-chk" data-sku="${p.sku}" ${S.invSelected.has(p.sku)?'checked':''}/></td>
      <td>${img}</td>
      <td style="font-weight:600;color:var(--t3);font-size:.72rem">${p.sku}</td>
      <td style="font-weight:600">${p.name}</td>
      <td>${p.category}</td>
      <td style="font-weight:700">${sym}${p.price.toFixed(2)}</td>
      <td>
        <div class="qty-ctrl">
          <div class="qty-btn" data-sku="${p.sku}" data-dir="-1">−</div>
          <input class="qty-input" type="number" min="0" value="${p.qty}" data-sku="${p.sku}"/>
          <div class="qty-btn" data-sku="${p.sku}" data-dir="1">+</div>
        </div>
      </td>
      <td>${p.lowAt}</td>
      <td><span class="badge ${st}">${stockLabel(st)}</span></td>
      <td style="font-size:.72rem;color:var(--t3)">${fmtDate(p.updated)}</td>
      <td><div class="row-acts">
        <button class="ra" data-act="view" data-sku="${p.sku}" title="View">👁</button>
        ${can('editProduct')    ? `<button class="ra" data-act="edit" data-sku="${p.sku}" title="Edit">✏️</button>` : `<button class="ra" style="opacity:.3;cursor:not-allowed" title="Not allowed" disabled>✏️</button>`}
        ${can('restockProduct') ? `<button class="ra" data-act="restock" data-sku="${p.sku}" title="Restock">📦</button>` : `<button class="ra" style="opacity:.3;cursor:not-allowed" title="Not allowed" disabled>📦</button>`}
        ${can('deleteProduct')  ? `<button class="ra red" data-act="del" data-sku="${p.sku}" title="Delete">🗑</button>` : `<button class="ra" style="opacity:.3;cursor:not-allowed" title="Not allowed" disabled>🗑</button>`}
      </div></td>
    </tr>`;
  }).join('');

  // Checkboxes
  tbody.querySelectorAll('.i-chk').forEach(cb => {
    cb.addEventListener('change', e => {
      e.target.checked ? S.invSelected.add(e.target.dataset.sku) : S.invSelected.delete(e.target.dataset.sku);
      document.getElementById('invSelectAll').checked = S.invFiltered.every(p => S.invSelected.has(p.sku));
      updateBulkBar();
    });
  });

  // Qty +/- buttons — Staff cannot modify
  tbody.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!can('editProduct')) { denied('Adjust Qty'); return; }
      const p = INV_DB.find(x => x.sku === btn.dataset.sku);
      if (!p) return;
      p.qty = Math.max(0, p.qty + parseInt(btn.dataset.dir));
      p.updated = todayStr();
      try {
        await sbQuery('inventory?sku=eq.'+encodeURIComponent(p.sku), { method:'PATCH', body: JSON.stringify({ qty:p.qty, updated:p.updated }) });
        saveToStorage(); applyInvFilters(); renderStockAlertBanner();
        if (stockStatus(p) === 'low_stock')    pushNotif(`⚠️ ${p.name} is running low (${p.qty} left).`);
        if (stockStatus(p) === 'out_of_stock') pushNotif(`🚨 ${p.name} is now OUT OF STOCK.`);
      } catch(e) { showToast('Error updating qty: ' + e.message, 'error'); }
    });
  });

  // Qty direct input
  tbody.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', async e => {
      const p = INV_DB.find(x => x.sku === inp.dataset.sku);
      if (!p) return;
      p.qty = Math.max(0, parseInt(e.target.value) || 0);
      p.updated = todayStr();
      try {
        await sbQuery('inventory?sku=eq.'+encodeURIComponent(p.sku), { method:'PATCH', body: JSON.stringify({ qty:p.qty, updated:p.updated }) });
        saveToStorage(); applyInvFilters(); renderStockAlertBanner();
        showToast(`${p.name} — qty updated to ${p.qty}`, 'success');
      } catch(e) { showToast('Error updating qty: ' + e.message, 'error'); }
    });
  });

  // Row action buttons - RBAC guarded
  tbody.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const p = INV_DB.find(x => x.sku === btn.dataset.sku);
      if (!p) return;
      if (btn.dataset.act === 'view')    { openProductView(p); return; }
      if (btn.dataset.act === 'edit')    { if (!can('editProduct'))    { denied('Edit Product');    return; } openProductEdit(p); return; }
      if (btn.dataset.act === 'restock') { if (!can('restockProduct')) { denied('Restock Product'); return; } openRestock(p); return; }
      if (btn.dataset.act === 'del') {
        if (!can('deleteProduct')) { denied('Delete Product'); return; }
        confirmAction('Delete Product', `Delete "${p.name}" permanently?`, async () => {
          try {
            await sbQuery('inventory?sku=eq.'+encodeURIComponent(p.sku), { method:'DELETE' });
            INV_DB.splice(INV_DB.findIndex(x => x.sku === p.sku), 1);
            S.invSelected.delete(p.sku);
            saveToStorage(); applyInvFilters(); renderStockAlertBanner();
            showToast(`"${p.name}" deleted.`, 'warning');
          } catch(e) { showToast('Error deleting product: ' + e.message, 'error'); }
        });
      }
    });
  });

  info.textContent = `${S.invFiltered.length} product${S.invFiltered.length !== 1 ? 's':''}`;
  updateBulkBar();
}

function updateBulkBar() {
  const bar = document.getElementById('bulkBar');
  if (S.invSelected.size > 0) {
    bar.style.display = 'flex';
    document.getElementById('bulkCount').textContent = `${S.invSelected.size} selected`;
  } else {
    bar.style.display = 'none';
  }
}

/* ── Add Product ── */
/* ── Star Rating Picker helpers ── */
window._currentRating = 0;
window.setStarRating = function(val) {
  window._currentRating = val;
  const inp = document.getElementById('prating') || document.getElementById('eprating');
  if (inp) inp.value = val;
  renderStarPicker(val);
};
window.previewStars = function(val) { renderStarPicker(val, true); };
window.restoreStars = function()    { renderStarPicker(window._currentRating); };

function renderStarPicker(val, preview) {
  const btns = document.querySelectorAll('#starPicker button[data-star]');
  btns.forEach(b => {
    const n = parseFloat(b.dataset.star);
    b.textContent = n <= val ? '★' : '☆';
    b.style.color = n <= val ? '#F59E0B' : 'var(--t3)';
    b.style.transform = (!preview && n <= val) ? 'scale(1.15)' : 'scale(1)';
  });
  const label = document.getElementById('starLabel');
  if (label) {
    if (val === 0) { label.textContent = 'No rating set'; label.style.color = 'var(--t3)'; }
    else { label.textContent = val + ' / 5 stars'; label.style.color = '#F59E0B'; }
  }
  // Highlight quick-pick buttons
  document.querySelectorAll('[id^="ratingBtn_"]').forEach(b => {
    const bv = parseFloat(b.id.replace('ratingBtn_','').replace('_','.'));
    const active = !preview && bv === val;
    b.style.background = active ? '#F59E0B' : 'var(--surface)';
    b.style.color       = active ? '#fff'    : 'var(--t2)';
    b.style.borderColor = active ? '#F59E0B' : 'var(--border)';
  });
}

/* ── Color preview helper ── */
function renderColorPreviews(value, container) {
  if (!container) return;
  const parts = value.split(',').map(s => s.trim()).filter(Boolean);
  container.innerHTML = parts.map(c => {
    const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(c);
    const display = isHex ? c : c;
    return `<span title="${display}" style="
      display:inline-flex;align-items:center;gap:4px;
      padding:3px 10px 3px 6px;border-radius:20px;
      border:1px solid var(--border);background:var(--surface);
      font-size:.72rem;font-weight:600;color:var(--t1);">
      <span style="width:14px;height:14px;border-radius:50%;background:${display};border:1px solid rgba(0,0,0,.15);flex-shrink:0;display:inline-block;"></span>
      ${display}
    </span>`;
  }).join('');
}

function openAddProduct() {
  const sku = 'SKU-' + String(nextSkuNum).padStart(3, '0');
  openModal('Add New Product', `
    <div class="mform-row single">
      <div class="fg">
        <label>Product Image</label>
        <div class="img-preview-wrap" id="imgPreviewWrap">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>Click to upload image</p>
          <input type="file" id="prodImgInput" accept="image/*"/>
        </div>
      </div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Product Name *</label><input id="pn" type="text" placeholder="e.g. Air Max 90"/></div>
      <div class="fg"><label>Category *</label><select id="pcat">
        <option value="">Select…</option>
        <option>Shoes</option><option>Clothing</option><option>Accessories</option>
        <option>Bags</option><option>Sportswear</option><option>Electronics</option>
        <option>Food & Drinks</option><option>Health & Beauty</option><option>Other</option>
      </select></div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Unit Price (${currencySymbol}) *</label><input id="pp" type="number" placeholder="0.00" min="0" step="0.01"/></div>
      <div class="fg"><label>Initial Qty *</label><input id="pq" type="number" placeholder="0" min="0" value="0"/></div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Low Stock Alert At</label><input id="pla" type="number" placeholder="5" min="1" value="5"/></div>
      <div class="fg"><label>SKU (auto-generated)</label><input id="psku" type="text" value="${sku}" readonly/></div>
    </div>
    <div class="mform-row single">
      <div class="fg"><label>Description (optional)</label><textarea id="pdesc" placeholder="Product description…"></textarea></div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Available Colours <span style="font-size:.72rem;color:var(--t3);font-weight:400;">(comma-separated hex codes or names, e.g. #FF0000, #000080, White)</span></label>
        <input id="pcolors" type="text" placeholder="e.g. #000000, #FFFFFF, #FF0000" style="font-family:monospace;"/>
        <div id="pcolorsPreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;min-height:20px;"></div>
      </div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Available Sizes <span style="font-size:.72rem;color:var(--t3);font-weight:400;">(comma-separated, e.g. S, M, L, XL or 40, 41, 42)</span></label>
        <input id="psizes" type="text" placeholder="e.g. S, M, L, XL, XXL"/>
      </div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Product Rating</label>
        <div id="starPickerWrap" style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
          <div id="starPicker" style="display:flex;gap:6px;align-items:center;">
            ${[1,2,3,4,5].map(i => `
              <button type="button" data-star="${i}" onclick="setStarRating(${i})"
                style="font-size:1.6rem;background:none;border:none;cursor:pointer;padding:0;line-height:1;transition:transform .1s;"
                onmouseover="previewStars(${i})" onmouseout="restoreStars()">☆</button>`).join('')}
            <span id="starLabel" style="font-size:.82rem;color:var(--t2);margin-left:8px;">No rating set</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${[1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => `
              <button type="button" onclick="setStarRating(${v})"
                style="padding:3px 10px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--t2);font-size:.72rem;font-weight:700;cursor:pointer;transition:all .15s;"
                id="ratingBtn_${String(v).replace('.','_')}">${v}★</button>`).join('')}
          </div>
        </div>
        <input type="hidden" id="prating" value="0"/>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveNewProduct()">Add Product</button>
    </div>`);

  // Image preview handler
  setTimeout(() => {
    const fileInput = document.getElementById('prodImgInput');
    const wrap      = document.getElementById('imgPreviewWrap');
    if (fileInput) {
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          wrap.innerHTML = `<img src="${ev.target.result}" alt="Preview"/><input type="file" id="prodImgInput" accept="image/*"/>`;
          wrap.querySelector('input').addEventListener('change', e2 => {
            const f2 = e2.target.files[0];
            if (!f2) return;
            const r2 = new FileReader();
            r2.onload = ev2 => { wrap.querySelector('img').src = ev2.target.result; };
            r2.readAsDataURL(f2);
          });
          window._prodImgData = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
    window._prodImgData = null;
    window._currentRating = 0;

    /* Colour preview */
    const colInp = document.getElementById('pcolors');
    const colPrev = document.getElementById('pcolorsPreview');
    if (colInp && colPrev) {
      colInp.addEventListener('input', () => renderColorPreviews(colInp.value, colPrev));
    }
  }, 50);
}

window.saveNewProduct = async function() {
  const name   = document.getElementById('pn').value.trim();
  const cat    = document.getElementById('pcat').value;
  const price  = parseFloat(document.getElementById('pp').value);
  const qty    = parseInt(document.getElementById('pq').value) || 0;
  const lowAt  = parseInt(document.getElementById('pla').value) || 5;
  const desc   = document.getElementById('pdesc').value.trim();
  const rating = parseFloat(document.getElementById('prating')?.value) || 0;
  const colorsRaw = (document.getElementById('pcolors')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  const sizesRaw  = (document.getElementById('psizes')?.value  || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (!name || !cat || isNaN(price) || price < 0) {
    showToast('Please fill all required fields.', 'error'); return;
  }
  const sku = 'SKU-' + String(nextSkuNum).padStart(3, '0');
  nextSkuNum++;
  /* Encode rating, colors, sizes as meta prefix in description so no schema change is needed */
  let encodedDesc = desc;
  if (rating > 0)          encodedDesc = `||r:${rating}||` + encodedDesc;
  if (colorsRaw.length)    encodedDesc = `||c:${colorsRaw.join('|')}||` + encodedDesc;
  if (sizesRaw.length)     encodedDesc = `||s:${sizesRaw.join('|')}||` + encodedDesc;
  const newProduct = { sku, name, category:cat, price, qty, low_at:lowAt, description:encodedDesc, image: window._prodImgData || null, updated: todayStr() };
  try {
    const rows = await sbQuery('inventory', { method:'POST', body: JSON.stringify(newProduct) });
    const saved = rows[0];
    INV_DB.push({ id:saved.id, sku, name, category:cat, price, qty, lowAt, desc, colors:colorsRaw, sizes:sizesRaw, image: window._prodImgData||null, updated: todayStr(), rating });
    window._prodImgData = null;
    saveToStorage(); closeModal(); applyInvFilters(); renderStockAlertBanner();
    showToast(`"${name}" added to inventory!`, 'success');
    pushNotif(`New product "${name}" added to inventory.`);
  } catch(e) {
    showToast('Error saving product: ' + e.message, 'error');
  }
};

/* ── View Product ── */
function openProductView(p) {
  const sym = currencySymbol;
  const st  = stockStatus(p);
  const imgHTML = p.image ? `<img src="${p.image}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--r-sm);border:1px solid var(--border);margin-bottom:14px"/>` : '';
  const colorsHTML = (p.colors && p.colors.length && !(p.colors.length === 1 && p.colors[0] === '#374151'))
    ? `<div class="di" style="grid-column:1/-1;"><label>Available Colours</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          ${p.colors.map(c => `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px 3px 6px;border-radius:20px;border:1px solid var(--border);background:var(--surface);font-size:.72rem;font-weight:600;color:var(--t1);">
            <span style="width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,.15);flex-shrink:0;display:inline-block;"></span>${c}
          </span>`).join('')}
        </div>
      </div>` : '';
  const sizesHTML = (p.sizes && p.sizes.length && !(p.sizes.length === 1 && p.sizes[0] === 'One Size'))
    ? `<div class="di" style="grid-column:1/-1;"><label>Available Sizes</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          ${p.sizes.map(s => `<span style="padding:3px 12px;border-radius:20px;border:1px solid var(--border);background:var(--surface);font-size:.78rem;font-weight:700;color:var(--t1);">${s}</span>`).join('')}
        </div>
      </div>` : '';
  openModal(p.name, `
    ${imgHTML}
    <div class="detail-grid">
      <div class="di"><label>SKU</label><span>${p.sku}</span></div>
      <div class="di"><label>Category</label><span>${p.category}</span></div>
      <div class="di"><label>Unit Price</label><span style="color:var(--brand);font-weight:800">${sym}${p.price.toFixed(2)}</span></div>
      <div class="di"><label>Qty in Stock</label><span style="font-size:1.3rem;font-weight:800">${p.qty}</span></div>
      <div class="di"><label>Low Stock At</label><span>${p.lowAt} units</span></div>
      <div class="di"><label>Status</label><span><span class="badge ${st}">${stockLabel(st)}</span></span></div>
      <div class="di"><label>Last Updated</label><span>${fmtDate(p.updated)}</span></div>
      ${colorsHTML}
      ${sizesHTML}
    </div>
    ${p.desc ? `<p style="font-size:.82rem;color:var(--t2);margin-top:8px;line-height:1.6">${p.desc}</p>` : ''}
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Close</button>
      <button class="btn-ghost" onclick="closeModal();openRestock(INV_DB.find(x=>x.sku==='${p.sku}'))">📦 Restock</button>
      <button class="btn-primary" onclick="closeModal();openProductEdit(INV_DB.find(x=>x.sku==='${p.sku}'))">Edit</button>
    </div>`);
}
window.openProductView  = openProductView;
window.openRestock      = openRestock;

/* ── Edit Product ── */
function openProductEdit(p) {
  const sym = currencySymbol;
  openModal(`Edit: ${p.name}`, `
    <div class="mform-row single">
      <div class="fg">
        <label>Product Image</label>
        <div class="img-preview-wrap" id="editImgWrap">
          ${p.image
            ? `<img src="${p.image}" alt=""/><input type="file" id="editImgInput" accept="image/*"/>`
            : `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p>Click to change image</p><input type="file" id="editImgInput" accept="image/*"/>`
          }
        </div>
      </div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Product Name</label><input id="en" type="text" value="${p.name}"/></div>
      <div class="fg"><label>Category</label><select id="ec2">
        <option ${p.category==='Shoes'?'selected':''}>Shoes</option>
        <option ${p.category==='Clothing'?'selected':''}>Clothing</option>
        <option ${p.category==='Accessories'?'selected':''}>Accessories</option>
        <option ${p.category==='Bags'?'selected':''}>Bags</option>
        <option ${p.category==='Sportswear'?'selected':''}>Sportswear</option>
        <option ${p.category==='Electronics'?'selected':''}>Electronics</option>
        <option ${p.category==='Food & Drinks'?'selected':''}>Food & Drinks</option>
        <option ${p.category==='Health & Beauty'?'selected':''}>Health & Beauty</option>
        <option ${p.category==='Other'?'selected':''}>Other</option>
      </select></div>
    </div>
    <div class="mform-row">
      <div class="fg"><label>Unit Price (${sym})</label><input id="ep" type="number" value="${p.price}" step="0.01" min="0"/></div>
      <div class="fg"><label>Qty in Stock</label><input id="eq" type="number" value="${p.qty}" min="0"/></div>
    </div>
    <div class="mform-row single">
      <div class="fg"><label>Low Stock Alert At</label><input id="ela" type="number" value="${p.lowAt}" min="1"/></div>
    </div>
    <div class="mform-row single">
      <div class="fg"><label>Description</label><textarea id="edesc">${p.desc||''}</textarea></div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Available Colours <span style="font-size:.72rem;color:var(--t3);font-weight:400;">(comma-separated hex codes or names)</span></label>
        <input id="ecolors" type="text" value="${(p.colors && !(p.colors.length===1&&p.colors[0]==='#374151')) ? p.colors.join(', ') : ''}" placeholder="e.g. #000000, #FFFFFF, #FF0000" style="font-family:monospace;"/>
        <div id="ecolorsPreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;min-height:20px;"></div>
      </div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Available Sizes <span style="font-size:.72rem;color:var(--t3);font-weight:400;">(comma-separated)</span></label>
        <input id="esizes" type="text" value="${(p.sizes && !(p.sizes.length===1&&p.sizes[0]==='One Size')) ? p.sizes.join(', ') : ''}" placeholder="e.g. S, M, L, XL, XXL"/>
      </div>
    </div>
    <div class="mform-row single">
      <div class="fg">
        <label>Product Rating</label>
        <div id="starPickerWrap" style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
          <div id="starPicker" style="display:flex;gap:6px;align-items:center;">
            ${[1,2,3,4,5].map(i => `
              <button type="button" data-star="${i}" onclick="setStarRating(${i})"
                style="font-size:1.6rem;background:none;border:none;cursor:pointer;padding:0;line-height:1;transition:transform .1s;"
                onmouseover="previewStars(${i})" onmouseout="restoreStars()">☆</button>`).join('')}
            <span id="starLabel" style="font-size:.82rem;color:var(--t2);margin-left:8px;">No rating set</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${[1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => `
              <button type="button" onclick="setStarRating(${v})"
                style="padding:3px 10px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--t2);font-size:.72rem;font-weight:700;cursor:pointer;transition:all .15s;"
                id="ratingBtn_${String(v).replace('.','_')}">${v}★</button>`).join('')}
          </div>
        </div>
        <input type="hidden" id="eprating" value="${p.rating || 0}"/>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveProductEdit('${p.sku}')">Save Changes</button>
    </div>`);

  window._editImgData = p.image || null;
  window._currentRating = p.rating || 0;
  setTimeout(() => {
    const inp  = document.getElementById('editImgInput');
    const wrap = document.getElementById('editImgWrap');
    if (inp) {
      inp.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = ev => {
          window._editImgData = ev.target.result;
          let img = wrap.querySelector('img');
          if (!img) { img = document.createElement('img'); wrap.prepend(img); }
          img.src = ev.target.result;
        };
        r.readAsDataURL(file);
      });
    }
    /* Restore the existing rating into the picker */
    if (window._currentRating) renderStarPicker(window._currentRating);

    /* Colour preview for edit modal */
    const eColInp  = document.getElementById('ecolors');
    const eColPrev = document.getElementById('ecolorsPreview');
    if (eColInp && eColPrev) {
      renderColorPreviews(eColInp.value, eColPrev);
      eColInp.addEventListener('input', () => renderColorPreviews(eColInp.value, eColPrev));
    }
  }, 50);
}
window.openProductEdit = openProductEdit;
window.saveProductEdit = async function(sku) {
  const p = INV_DB.find(x => x.sku === sku);
  if (!p) return;
  p.name     = document.getElementById('en').value.trim()        || p.name;
  p.category = document.getElementById('ec2').value;
  p.price    = parseFloat(document.getElementById('ep').value)   || p.price;
  p.qty      = parseInt(document.getElementById('eq').value)     ?? p.qty;
  p.lowAt    = parseInt(document.getElementById('ela').value)    || p.lowAt;
  p.desc     = document.getElementById('edesc').value.trim();
  p.image    = window._editImgData;
  p.rating   = parseFloat(document.getElementById('eprating')?.value) || p.rating || 0;
  p.updated  = todayStr();
  const colorsRaw = (document.getElementById('ecolors')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  const sizesRaw  = (document.getElementById('esizes')?.value  || '').split(',').map(s=>s.trim()).filter(Boolean);
  p.colors = colorsRaw.length ? colorsRaw : (p.colors || []);
  p.sizes  = sizesRaw.length  ? sizesRaw  : (p.sizes  || []);
  window._editImgData = null;
  try {
    /* Encode rating, colors, sizes in description so no extra Supabase columns are needed */
    let encodedDesc = p.desc || '';
    if (p.rating > 0)        encodedDesc = `||r:${p.rating}||` + encodedDesc;
    if (p.colors.length)     encodedDesc = `||c:${p.colors.join('|')}||` + encodedDesc;
    if (p.sizes.length)      encodedDesc = `||s:${p.sizes.join('|')}||` + encodedDesc;
    await sbQuery('inventory?sku=eq.'+encodeURIComponent(sku), {
      method: 'PATCH',
      body: JSON.stringify({ name:p.name, category:p.category, price:p.price, qty:p.qty, low_at:p.lowAt, description:encodedDesc, image:p.image, updated:p.updated }),
    });
    saveToStorage(); closeModal(); applyInvFilters(); renderStockAlertBanner();
    showToast(`"${p.name}" updated!`, 'success');
  } catch(e) { showToast('Error updating product: ' + e.message, 'error'); }
};

/* ── Restock ── */
function openRestock(p) {
  openModal(`Restock: ${p.name}`, `
    <p style="font-size:.84rem;color:var(--t2);margin-bottom:16px">
      Current stock: <strong style="color:var(--t1);font-size:1rem">${p.qty} units</strong>
    </p>
    <div class="mform-row single">
      <div class="fg"><label>Add Quantity *</label><input id="radd" type="number" placeholder="e.g. 50" min="1"/></div>
    </div>
    <div class="mform-row single">
      <div class="fg"><label>Supplier / Note (optional)</label><textarea id="rnote" placeholder="e.g. Received from Supplier ABC…"></textarea></div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="doRestock('${p.sku}')">Confirm Restock</button>
    </div>`);
}
window.doRestock = async function(sku) {
  const p   = INV_DB.find(x => x.sku === sku);
  const add = parseInt(document.getElementById('radd').value);
  if (!p || !add || add < 1) { showToast('Enter a valid quantity.', 'error'); return; }
  p.qty += add; p.updated = todayStr();
  try {
    await sbQuery('inventory?sku=eq.'+encodeURIComponent(sku), {
      method: 'PATCH',
      body: JSON.stringify({ qty: p.qty, updated: p.updated }),
    });
    saveToStorage(); closeModal(); applyInvFilters(); renderStockAlertBanner();
    showToast(`${p.name}: +${add} units. New stock: ${p.qty}`, 'success');
    pushNotif(`${p.name} restocked. +${add} units → ${p.qty} total.`);
  } catch(e) { showToast('Error restocking: ' + e.message, 'error'); }
};

/* ── Export CSV ── */
function exportCSV() {
  if (!INV_DB.length) { showToast('No products to export.', 'warning'); return; }
  const sym  = currencySymbol;
  const rows = [['SKU','Name','Category','Price','Qty','LowStockAt','Status','Updated']];
  INV_DB.forEach(p => rows.push([p.sku, `"${p.name}"`, p.category, sym+p.price.toFixed(2), p.qty, p.lowAt, stockLabel(stockStatus(p)), p.updated]));
  const csv  = rows.map(r => r.join(',')).join('\n');
  const a    = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:'finexy_inventory.csv' });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('Inventory exported!', 'success');
}

/* ── Stock Alert Banner ── */
function renderStockAlertBanner() {
  const banner = document.getElementById('stockAlertBanner');
  if (!banner) return;
  const bad = INV_DB.filter(p => stockStatus(p) !== 'in_stock');
  if (!bad.length) { banner.innerHTML = ''; return; }
  const out = bad.filter(p => stockStatus(p) === 'out_of_stock').length;
  const low = bad.filter(p => stockStatus(p) === 'low_stock').length;
  let msg = '';
  if (out) msg += `<strong>${out}</strong> product${out>1?'s':''} out of stock. `;
  if (low) msg += `<strong>${low}</strong> product${low>1?'s':''} running low. `;
  banner.innerHTML = `
    <div class="stock-alert">
      <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      ⚠️ Stock Alert: ${msg}<a onclick="navigateTo('inventory')">Go to Inventory →</a>
    </div>`;
}

/* saveSettings is defined above in SESSION MANAGEMENT */

/* ══════════════════════
   MODAL HELPERS
══════════════════════ */
function initModals() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBg').addEventListener('click', e => { if (e.target.id === 'modalBg') closeModal(); });
  document.getElementById('confirmClose').addEventListener('click', closeConfirm);
  document.getElementById('confirmNo').addEventListener('click', closeConfirm);
  document.getElementById('confirmBg').addEventListener('click', e => { if (e.target.id === 'confirmBg') closeConfirm(); });
}
function openModal(title, body) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML    = body;
  document.getElementById('modalBg').classList.add('open');
}
function closeModal() { document.getElementById('modalBg').classList.remove('open'); }
window.closeModal = closeModal;
function confirmAction(title, msg, onYes) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent   = msg;
  document.getElementById('confirmYes').onclick = () => { closeConfirm(); onYes(); };
  document.getElementById('confirmBg').classList.add('open');
}
function closeConfirm() { document.getElementById('confirmBg').classList.remove('open'); }

/* ══════════════════════
   PAGINATION
══════════════════════ */
function renderPager(id, current, total, onPage) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  if (total <= 1) return;
  const add = (label, page, active, disabled) => {
    const b = document.createElement('button');
    b.className   = 'pg-btn' + (active ? ' active' : '');
    b.textContent = label;
    b.disabled    = !!disabled;
    b.addEventListener('click', () => !disabled && onPage(page));
    el.appendChild(b);
  };
  add('‹', current - 1, false, current === 1);
  getPageNums(current, total).forEach(p => {
    if (p === '…') {
      const s = document.createElement('span');
      s.textContent = '…'; s.style.cssText = 'padding:0 4px;color:var(--t3);font-size:.8rem;align-self:center';
      el.appendChild(s);
    } else add(p, p, p === current, false);
  });
  add('›', current + 1, false, current === total);
}
function getPageNums(c, t) {
  if (t <= 7) return Array.from({length:t},(_,i)=>i+1);
  if (c <= 4)      return [1,2,3,4,5,'…',t];
  if (c >= t - 3)  return [1,'…',t-4,t-3,t-2,t-1,t];
  return [1,'…',c-1,c,c+1,'…',t];
}

/* ══════════════════════
   TOAST
══════════════════════ */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 3400);
}
window.showToast = showToast;

/* ══════════════════════
   UTILS
══════════════════════ */
function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
