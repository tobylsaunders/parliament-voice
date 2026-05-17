import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── YOUR SUPABASE CREDENTIALS ────────────────────────────────────────────────
// Replace these two values with your own from: Supabase → Settings → API
const SUPABASE_URL = 'https://qndvhklkedznvallazrb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_iPsVAlEILkvUi0a3-b75VQ_sSxVfZBY'
// ─────────────────────────────────────────────────────────────────────────────

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy:#0d1b2a; --midnight:#152237; --ink:#1a2942;
      --gold:#c9a84c; --gold-lt:#e8c97a;
      --crimson:#9b1d20; --sage:#2e7d50;
      --fog:#e8e4dc; --parchment:#f4f0e6;
      --text:#1a1a2e; --muted:#6b7280;
      --lab:#E4003B; --con:#0087DC; --snp:#FFF95D;
      --lib:#FAA61A; --grn:#02A95B; --ref:#12B6CF;
      --pc:#3F8428; --dup:#D46A12; --sdlp:#2AA82C;
      --oth:#888;
    }
    body { font-family:'Source Serif 4',Georgia,serif; background:var(--parchment); color:var(--text); min-height:100vh; overflow-x:hidden; }
    body::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:0; opacity:.4; }
    .app { position:relative; z-index:1; }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
    @keyframes barGrow { from{width:0} to{width:var(--w)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
    @keyframes notifIn  { from{opacity:0;transform:translateX(120%)} to{opacity:1;transform:none} }
    @keyframes notifOut { from{opacity:1;transform:none} to{opacity:0;transform:translateX(120%)} }
    .fade-up { animation:fadeUp .5s ease both; }

    /* HEADER */
    .header { background:var(--navy); color:var(--fog); padding:0 24px; display:flex; align-items:center; justify-content:space-between; height:68px; border-bottom:3px solid var(--gold); position:sticky; top:0; z-index:200; box-shadow:0 4px 24px rgba(0,0,0,.35); }
    .header-logo { display:flex; align-items:center; gap:12px; font-family:'Playfair Display',serif; font-size:1.2rem; letter-spacing:.03em; }
    .crown { font-size:1.6rem; }
    .header-tagline { font-size:.72rem; color:var(--gold); letter-spacing:.12em; text-transform:uppercase; }
    .header-right { display:flex; align-items:center; gap:12px; }
    .live-badge { display:flex; align-items:center; gap:6px; background:rgba(155,29,32,.2); border:1px solid var(--crimson); color:#ff8a8a; padding:4px 12px; border-radius:20px; font-size:.75rem; letter-spacing:.08em; }
    .live-dot { width:7px; height:7px; border-radius:50%; background:var(--crimson); animation:pulse 1.4s infinite; }
    .notif-btn { position:relative; background:none; border:none; cursor:pointer; font-size:1.3rem; color:var(--fog); padding:4px 6px; }
    .notif-pip { position:absolute; top:0; right:0; width:9px; height:9px; background:var(--crimson); border-radius:50%; border:2px solid var(--navy); }

    /* TOASTS */
    .toast-stack { position:fixed; top:80px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none; max-width:360px; }
    .toast { background:var(--navy); color:var(--fog); border-left:4px solid var(--gold); border-radius:4px; padding:14px 18px; box-shadow:0 6px 28px rgba(0,0,0,.4); pointer-events:all; animation:notifIn .35s ease both; }
    .toast.out { animation:notifOut .3s ease forwards; }
    .toast-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:700; color:var(--gold); margin-bottom:4px; display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
    .toast-body  { font-size:.82rem; color:rgba(232,228,220,.85); line-height:1.5; }
    .toast-x { background:none; border:none; color:rgba(232,228,220,.4); cursor:pointer; font-size:1rem; flex-shrink:0; }

    /* ADS */
    .ad-slot { border-radius:4px; padding:14px 18px; margin:18px 0; display:flex; gap:14px; align-items:center; position:relative; flex-wrap:wrap; }
    .ad-slot.banner { border:1px dashed #c9b870; background:#fffbf0; }
    .ad-slot.inline { border:1px dashed #b0d0b5; background:#f0fff4; }
    .ad-slot.square { border:1px dashed #d0c090; background:#fffbee; flex-direction:column; text-align:center; min-height:150px; justify-content:center; }
    .ad-label { font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:#a09040; position:absolute; top:4px; left:10px; }
    .ad-emoji { font-size:1.7rem; }
    .ad-body { flex:1; }
    .ad-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:700; color:var(--navy); }
    .ad-sub   { font-size:.76rem; color:var(--muted); margin-top:2px; }
    .ad-cta { padding:6px 14px; background:var(--gold); color:var(--navy); border:none; border-radius:3px; font-weight:700; font-size:.76rem; cursor:pointer; white-space:nowrap; flex-shrink:0; }

    /* AUTH */
    .auth-wrap { min-height:calc(100vh - 68px); display:flex; align-items:center; justify-content:center; padding:40px 16px; }
    .auth-card { background:white; border:1px solid #d9d3c7; border-top:4px solid var(--gold); border-radius:4px; padding:44px 40px; width:100%; max-width:460px; box-shadow:0 8px 40px rgba(0,0,0,.10); animation:fadeUp .5s ease; }
    .auth-title { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:900; color:var(--navy); margin-bottom:6px; }
    .auth-sub { color:var(--muted); font-size:.9rem; margin-bottom:32px; }
    .auth-tabs { display:flex; border-bottom:2px solid var(--fog); margin-bottom:28px; }
    .auth-tab { padding:10px 20px; font-size:.85rem; letter-spacing:.06em; text-transform:uppercase; background:none; border:none; cursor:pointer; color:var(--muted); border-bottom:3px solid transparent; margin-bottom:-2px; transition:.2s; }
    .auth-tab.active { color:var(--navy); border-bottom-color:var(--gold); font-weight:600; }
    .field { margin-bottom:18px; }
    .field label { display:block; font-size:.78rem; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); margin-bottom:7px; }
    .field input,.field select,.field textarea { width:100%; padding:11px 14px; border:1.5px solid #d0cac0; border-radius:3px; font-family:inherit; font-size:.92rem; background:var(--parchment); transition:border-color .2s; outline:none; }
    .field input:focus,.field select:focus { border-color:var(--gold); background:white; }
    .field textarea { min-height:80px; resize:vertical; }
    .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee; }
    .toggle-label { font-size:.88rem; color:var(--text); }
    .toggle-sub { font-size:.74rem; color:var(--muted); }
    .tog { position:relative; width:44px; height:24px; flex-shrink:0; }
    .tog input { opacity:0; width:0; height:0; position:absolute; }
    .tog-slider { position:absolute; inset:0; background:#ccc; border-radius:24px; cursor:pointer; transition:.3s; }
    .tog-slider::before { content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; }
    .tog input:checked + .tog-slider { background:var(--sage); }
    .tog input:checked + .tog-slider::before { transform:translateX(20px); }
    .btn-primary { width:100%; padding:13px; background:var(--navy); color:var(--gold); border:none; border-radius:3px; font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; letter-spacing:.06em; cursor:pointer; transition:background .2s; margin-top:8px; }
    .btn-primary:hover { background:var(--ink); }
    .auth-note { font-size:.78rem; color:var(--muted); text-align:center; margin-top:18px; line-height:1.5; }

    /* LAYOUT */
    .main { display:grid; grid-template-columns:260px 1fr; min-height:calc(100vh - 68px); }
    .sidebar { background:var(--midnight); color:var(--fog); padding:24px 0; border-right:1px solid rgba(201,168,76,.25); position:sticky; top:68px; height:calc(100vh - 68px); overflow-y:auto; }
    .sidebar-user { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(255,255,255,.06); border-radius:4px; margin:0 18px 22px; }
    .avatar { width:38px; height:38px; border-radius:50%; background:var(--gold); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1rem; color:var(--navy); font-weight:900; }
    .sidebar-name { font-size:.88rem; font-weight:600; color:white; }
    .sidebar-con  { font-size:.72rem; color:rgba(201,168,76,.8); }
    .sidebar-lbl  { font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(201,168,76,.6); margin-bottom:10px; padding:0 18px; }
    .nav-item { display:flex; align-items:center; gap:10px; padding:10px 18px; cursor:pointer; font-size:.87rem; color:rgba(232,228,220,.7); border-left:3px solid transparent; transition:.2s; margin-bottom:2px; }
    .nav-item:hover { color:var(--fog); background:rgba(255,255,255,.05); }
    .nav-item.active { color:white; border-left-color:var(--gold); background:rgba(201,168,76,.08); }
    .nav-icon { font-size:1.1rem; width:22px; }
    .nav-badge { margin-left:auto; background:var(--crimson); color:white; font-size:.62rem; padding:2px 7px; border-radius:10px; }
    .sidebar-div { height:1px; background:rgba(255,255,255,.08); margin:14px 18px; }
    .btn-logout { width:calc(100% - 36px); margin:0 18px; padding:9px; background:transparent; border:1px solid rgba(255,255,255,.15); color:rgba(232,228,220,.6); border-radius:3px; cursor:pointer; font-size:.82rem; transition:.2s; }
    .btn-logout:hover { border-color:var(--crimson); color:#ff8a8a; }

    /* CONTENT */
    .content { padding:32px 36px; }
    .page-header { margin-bottom:28px; animation:fadeUp .4s ease; }
    .page-title { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:900; color:var(--navy); margin-bottom:6px; }
    .page-sub { color:var(--muted); font-size:.9rem; }
    .divider-gold { height:3px; width:52px; background:var(--gold); margin:10px 0 0; border-radius:2px; }

    /* VOTE CARDS */
    .votes-grid { display:flex; flex-direction:column; gap:20px; }
    .vote-card { background:white; border:1px solid #ddd7cd; border-radius:4px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); transition:box-shadow .2s; }
    .vote-card:hover { box-shadow:0 6px 28px rgba(0,0,0,.11); }
    .v-accent { width:5px; background:var(--gold); align-self:stretch; flex-shrink:0; }
    .v-accent.live { background:var(--crimson); }
    .v-accent.closed { background:var(--muted); }
    .v-accent.hist { background:linear-gradient(to bottom, var(--navy), var(--gold)); }
    .vote-body { padding:22px; flex:1; min-width:0; }
    .vote-meta { display:flex; align-items:center; gap:7px; margin-bottom:9px; flex-wrap:wrap; }
    .tag { font-size:.63rem; letter-spacing:.1em; text-transform:uppercase; padding:3px 8px; border-radius:2px; font-weight:700; }
    .tag-live { background:rgba(155,29,32,.1); color:var(--crimson); border:1px solid rgba(155,29,32,.3); }
    .tag-open { background:rgba(46,125,80,.1); color:var(--sage); border:1px solid rgba(46,125,80,.3); }
    .tag-closed { background:#f0ede7; color:var(--muted); border:1px solid #ccc; }
    .tag-cat  { background:#f0ede7; color:var(--ink); border:1px solid #d8d2c8; }
    .tag-hist { background:rgba(13,27,42,.1); color:var(--navy); border:1px solid rgba(13,27,42,.25); }
    .vote-title  { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:var(--navy); margin-bottom:7px; line-height:1.35; }
    .vote-desc   { font-size:.86rem; color:#555; line-height:1.65; margin-bottom:13px; }
    .vote-impact { font-size:.77rem; color:var(--navy); background:rgba(201,168,76,.1); border-left:3px solid var(--gold); padding:7px 11px; margin-bottom:13px; border-radius:0 3px 3px 0; }
    .vote-info   { font-size:.74rem; color:var(--muted); margin-bottom:14px; }
    .results-label { font-size:.7rem; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:7px; }
    .bar-row { display:flex; align-items:center; gap:9px; margin-bottom:6px; }
    .bar-label { font-size:.78rem; width:36px; text-align:right; color:var(--muted); }
    .bar-track { flex:1; height:8px; background:#f0ede7; border-radius:4px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:4px; width:var(--w); animation:barGrow .6s .1s ease both; }
    .bar-fill.aye { background:var(--sage); }
    .bar-fill.no  { background:var(--crimson); }
    .bar-fill.abs { background:#c0b89a; }
    .bar-pct { font-size:.76rem; color:var(--muted); width:30px; }
    .bar-num { font-size:.76rem; color:var(--muted); width:56px; text-align:right; }
    .vote-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:13px; }
    .btn-vote { flex:1; min-width:80px; padding:9px 6px; border-radius:3px; border:2px solid; cursor:pointer; font-family:'Playfair Display',serif; font-weight:700; font-size:.86rem; letter-spacing:.04em; transition:.18s; }
    .btn-aye { background:rgba(46,125,80,.08); border-color:var(--sage); color:var(--sage); }
    .btn-aye:hover,.btn-aye.sel { background:var(--sage); color:white; }
    .btn-no  { background:rgba(155,29,32,.08); border-color:var(--crimson); color:var(--crimson); }
    .btn-no:hover,.btn-no.sel  { background:var(--crimson); color:white; }
    .btn-abs { background:#f0ede7; border-color:#b0a990; color:var(--muted); }
    .btn-abs:hover,.btn-abs.sel { background:#b0a990; color:white; }
    .btn-vote.sel { transform:scale(1.02); box-shadow:0 2px 10px rgba(0,0,0,.13); }
    .voted-note { font-size:.77rem; color:var(--sage); margin-top:9px; display:flex; align-items:center; gap:5px; }

    /* DUAL RECORD (historic bills) */
    .dual-record { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-bottom:4px; border:1px solid #ddd7cd; border-radius:4px; overflow:hidden; }
    @media(max-width:640px){ .dual-record{grid-template-columns:1fr;} }
    .record-panel { padding:14px 16px; }
    .record-panel.official { background:#f7f4ee; border-right:1px solid #ddd7cd; }
    .record-panel.public-view { background:#f0f7f2; }
    .record-panel-title { font-size:.65rem; letter-spacing:.12em; text-transform:uppercase; font-weight:700; margin-bottom:9px; display:flex; align-items:center; gap:6px; }
    .official-badge { font-size:.58rem; background:var(--navy); color:var(--gold); padding:2px 6px; border-radius:2px; letter-spacing:.06em; }
    .public-badge   { font-size:.58rem; background:var(--sage); color:white; padding:2px 6px; border-radius:2px; }
    .record-outcome { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:700; margin-bottom:9px; }
    .outcome-passed { color:var(--sage); }
    .outcome-rejected { color:var(--crimson); }
    .retro-section { border-top:2px dashed #d4cdb8; margin-top:18px; padding-top:16px; }
    .retro-header { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
    .retro-icon { font-size:1.2rem; }
    .retro-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:700; color:var(--navy); }
    .retro-sub { font-size:.76rem; color:var(--muted); margin-top:1px; }

    /* ── PARTY BREAKDOWN ── */
    .breakdown-section { border-top:1px solid #eee8de; margin-top:16px; padding-top:16px; }
    .breakdown-title { font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:12px; font-weight:700; }
    .party-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; margin-bottom:14px; }
    .party-chip { border-radius:4px; padding:9px 12px; border:1px solid; display:flex; align-items:center; gap:8px; }
    .party-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .party-name { font-size:.76rem; font-weight:700; color:var(--navy); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .party-vote-badge { font-size:.64rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:2px; white-space:nowrap; }
    .pv-aye { background:rgba(46,125,80,.15); color:var(--sage); }
    .pv-no  { background:rgba(155,29,32,.15); color:var(--crimson); }
    .pv-split { background:rgba(201,168,76,.2); color:#806010; }
    .pv-abs { background:#f0ede7; color:var(--muted); }

    /* ── YOUR MP PANEL ── */
    .my-mp-panel { background:linear-gradient(135deg,#f0f7f2,#e8f5ec); border:1px solid rgba(46,125,80,.3); border-radius:4px; padding:14px 16px; margin-top:14px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
    .mp-avatar { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:900; color:white; flex-shrink:0; }
    .mp-info { flex:1; min-width:0; }
    .mp-label { font-size:.62rem; letter-spacing:.1em; text-transform:uppercase; color:var(--sage); font-weight:700; margin-bottom:2px; }
    .mp-name  { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--navy); }
    .mp-seat  { font-size:.76rem; color:var(--muted); margin-top:1px; }
    .mp-vote-display { display:flex; align-items:center; gap:8px; }
    .mp-vote-icon { font-size:1.4rem; }
    .mp-vote-text { font-family:'Playfair Display',serif; font-size:.9rem; font-weight:700; }
    .mp-vote-text.aye { color:var(--sage); }
    .mp-vote-text.no  { color:var(--crimson); }
    .mp-vote-text.abstain { color:var(--muted); }
    .mp-vote-text.absent { color:var(--muted); }
    .mp-agree { font-size:.72rem; margin-top:3px; }
    .mp-agree.agree { color:var(--sage); }
    .mp-agree.disagree { color:var(--crimson); }

    /* STATS */
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(175px,1fr)); gap:14px; margin-bottom:26px; }
    .stat-card { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:20px 22px; border-top:3px solid var(--gold); }
    .stat-num { font-family:'Playfair Display',serif; font-size:2.1rem; font-weight:900; color:var(--navy); }
    .stat-label { font-size:.73rem; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-top:4px; }
    .stat-sub { font-size:.78rem; color:var(--sage); margin-top:2px; }
    .hist-item { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:13px 17px; display:flex; align-items:center; gap:13px; margin-bottom:9px; animation:slideIn .35s ease both; }
    .hist-title { font-size:.87rem; font-weight:600; color:var(--navy); flex:1; }
    .hist-date  { font-size:.73rem; color:var(--muted); margin-top:2px; }
    .hist-chip { font-size:.7rem; letter-spacing:.07em; text-transform:uppercase; padding:3px 9px; border-radius:2px; font-weight:700; white-space:nowrap; }
    .hist-chip.aye { background:rgba(46,125,80,.1); color:var(--sage); }
    .hist-chip.no  { background:rgba(155,29,32,.1); color:var(--crimson); }
    .hist-chip.abstain { background:#f0ede7; color:var(--muted); }

    /* SETTINGS */
    .setting-block { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:24px 28px; margin-bottom:16px; max-width:560px; }
    .setting-h { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--navy); margin-bottom:3px; }
    .setting-sub { font-size:.81rem; color:var(--muted); margin-bottom:16px; line-height:1.5; }
    .sub-box { background:rgba(46,125,80,.07); border:1px solid rgba(46,125,80,.3); border-radius:4px; padding:16px 20px; margin-top:4px; }
    .sub-box h4 { font-family:'Playfair Display',serif; color:var(--sage); margin-bottom:6px; }
    .sub-row { display:flex; gap:10px; margin-top:11px; }
    .sub-row input { flex:1; padding:9px 12px; border:1.5px solid rgba(46,125,80,.4); border-radius:3px; font-family:inherit; font-size:.9rem; }
    .btn-sub { padding:9px 18px; background:var(--sage); color:white; border:none; border-radius:3px; font-family:'Playfair Display',serif; font-weight:700; font-size:.88rem; cursor:pointer; }
    .btn-unsub { padding:8px 16px; background:transparent; color:var(--crimson); border:1.5px solid var(--crimson); border-radius:3px; font-family:'Playfair Display',serif; font-weight:700; font-size:.86rem; cursor:pointer; }
    .ok-msg { font-size:.8rem; color:var(--sage); margin-top:9px; }
    .alert-box { background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.4); border-radius:4px; padding:13px 17px; font-size:.84rem; color:var(--ink); line-height:1.6; }
    .btn-save { padding:9px 24px; background:var(--navy); color:var(--gold); border:none; border-radius:3px; font-family:'Playfair Display',serif; font-weight:700; font-size:.88rem; cursor:pointer; margin-top:14px; }

    /* ── MPs PAGE ── */
    .mp-search-bar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .mp-search-bar input { flex:1; min-width:180px; padding:10px 14px; border:1.5px solid #d0cac0; border-radius:3px; font-family:inherit; font-size:.9rem; background:white; outline:none; }
    .mp-search-bar input:focus { border-color:var(--gold); }
    .mp-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .mp-card { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.05); transition:box-shadow .2s; cursor:pointer; }
    .mp-card:hover { box-shadow:0 5px 20px rgba(0,0,0,.1); }
    .mp-card-top { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    .mp-card-avatar { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:900; color:white; flex-shrink:0; }
    .mp-card-name { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--navy); }
    .mp-card-seat { font-size:.75rem; color:var(--muted); margin-top:2px; }
    .mp-card-party { font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:2px 8px; border-radius:2px; display:inline-block; margin-top:3px; }
    .mp-votes-mini { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .mp-vote-mini-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #f0ede7; font-size:.74rem; }
    .mp-vote-mini-row:last-child { border-bottom:none; }
    .mp-bill-name { color:var(--muted); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-right:8px; }
    .vchip { font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:2px; white-space:nowrap; }
    .vchip.aye { background:rgba(46,125,80,.12); color:var(--sage); }
    .vchip.no  { background:rgba(155,29,32,.12); color:var(--crimson); }
    .vchip.abstain { background:#f0ede7; color:var(--muted); }
    .vchip.absent { background:#f5f5f5; color:#aaa; }
    .mp-detail-overlay { position:fixed; inset:0; background:rgba(13,27,42,.6); z-index:300; display:flex; align-items:center; justify-content:center; padding:20px; }
    .mp-detail-card { background:white; border-radius:6px; max-width:620px; width:100%; max-height:85vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.4); animation:fadeUp .3s ease; }
    .mp-detail-header { padding:24px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:16px; }
    .mp-detail-avatar { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:900; color:white; }
    .mp-detail-name { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:900; color:var(--navy); }
    .mp-detail-meta { font-size:.82rem; color:var(--muted); margin-top:3px; }
    .mp-detail-close { margin-left:auto; background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--muted); }
    .mp-detail-body { padding:24px; }
    .mp-detail-vote-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f0ede7; gap:12px; }
    .mp-detail-vote-row:last-child { border-bottom:none; }
    .mp-detail-bill { font-size:.86rem; color:var(--navy); font-weight:600; flex:1; }
    .mp-detail-year { font-size:.73rem; color:var(--muted); }

    /* ABOUT */
    .about-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; }
    .about-card { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:24px 20px; }
    .about-icon { font-size:1.8rem; margin-bottom:9px; }
    .about-h { font-family:'Playfair Display',serif; font-size:.98rem; font-weight:700; color:var(--navy); margin-bottom:6px; }
    .about-p { font-size:.83rem; color:#555; line-height:1.65; }

    /* ADMIN */
    .admin-form { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:24px 28px; max-width:600px; margin-bottom:28px; }
    .btn-add { padding:10px 26px; background:var(--sage); color:white; border:none; border-radius:3px; cursor:pointer; font-family:'Playfair Display',serif; font-weight:700; font-size:.93rem; transition:.2s; }
    .btn-add:hover { background:#246040; }
    .ok-flash { color:var(--sage); font-size:.82rem; margin-top:9px; animation:fadeIn .3s ease; }
    .revenue-card { background:linear-gradient(135deg,var(--navy),var(--ink)); color:var(--fog); border-radius:4px; padding:22px 26px; margin-bottom:22px; border:1px solid rgba(201,168,76,.3); }
    .revenue-card h3 { font-family:'Playfair Display',serif; color:var(--gold); margin-bottom:6px; font-size:1.1rem; }
    .rev-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:14px; }
    .rev-num   { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:900; color:var(--gold-lt); }
    .rev-label { font-size:.68rem; color:rgba(232,228,220,.55); text-transform:uppercase; letter-spacing:.08em; }
    .bill-row { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:10px 14px; display:flex; align-items:center; gap:9px; flex-wrap:wrap; margin-bottom:7px; }
    .btn-sm { padding:4px 10px; font-size:.7rem; border-radius:2px; cursor:pointer; border:1px solid; transition:.15s; font-family:inherit; }
    .ad-mgmt { background:white; border:1px solid #ddd7cd; border-radius:4px; padding:20px 24px; max-width:600px; }
    .ad-row { display:flex; align-items:center; gap:9px; padding:10px 0; border-bottom:1px solid #eee; flex-wrap:wrap; }
    .ad-row:last-child { border-bottom:none; }
    .dot-on  { width:8px; height:8px; border-radius:50%; background:var(--sage); flex-shrink:0; }
    .dot-off { width:8px; height:8px; border-radius:50%; background:#ccc; flex-shrink:0; }
    .filter-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
    .fbtn { padding:5px 14px; border-radius:20px; border:1.5px solid; cursor:pointer; font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; transition:.18s; font-family:inherit; }
    .fsel { padding:5px 12px; border-radius:20px; border:1.5px solid #ccc; background:white; color:var(--muted); font-size:.76rem; cursor:pointer; font-family:inherit; }
    @media(max-width:768px){ .main{grid-template-columns:1fr;} .sidebar{position:static;height:auto;} .content{padding:18px 14px;} .auth-card{padding:30px 20px;} }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// PARTY DATA
// ─────────────────────────────────────────────────────────────────────────────
const PARTIES = {
  Labour:       { color:"#E4003B", short:"Lab" },
  Conservative: { color:"#0087DC", short:"Con" },
  SNP:          { color:"#FFF95D", short:"SNP", textColor:"#333" },
  "Lib Dem":    { color:"#FAA61A", short:"LD" },
  Green:        { color:"#02A95B", short:"Grn" },
  Reform:       { color:"#12B6CF", short:"Ref" },
  "Plaid Cymru":{ color:"#3F8428", short:"PC" },
  DUP:          { color:"#D46A12", short:"DUP" },
  Independent:  { color:"#888",    short:"Ind" },
};

// Party-line votes for each bill. "split" = meaningful rebellion
const PARTY_VOTES = {
  101: { Labour:"no", Conservative:"aye", SNP:"no", "Lib Dem":"no", Green:"no", "Plaid Cymru":"no" }, // Brexit WA
  102: { Labour:"aye", Conservative:"aye", SNP:"aye", "Lib Dem":"aye", Green:"aye" }, // Coronavirus Act
  103: { Labour:"no", Conservative:"aye", SNP:"no", "Lib Dem":"no", Green:"no" }, // Health & Care 2022
  104: { Labour:"aye", Conservative:"aye", SNP:"aye", "Lib Dem":"aye", Green:"aye" }, // Online Safety Act
  105: { Labour:"no", Conservative:"aye", SNP:"no", "Lib Dem":"no", Green:"no" }, // Police & Crime Act
  106: { Labour:"aye", Conservative:"aye", SNP:"aye", "Lib Dem":"aye" }, // Energy Act 2023
  107: { Labour:"no", Conservative:"aye", SNP:"no", "Lib Dem":"no", Green:"no", "Plaid Cymru":"no" }, // Illegal Migration
  108: { Labour:"aye", Conservative:"aye", SNP:"aye", "Lib Dem":"aye", Green:"aye" }, // Economic Crime
  109: { Labour:"split", Conservative:"aye", SNP:"no", "Lib Dem":"no" }, // Levelling Up
  110: { Labour:"aye", Conservative:"split", SNP:"aye", "Lib Dem":"aye", Green:"aye", "Plaid Cymru":"aye" }, // Assisted Dying
  111: { Labour:"aye", Conservative:"no", SNP:"aye", "Lib Dem":"aye", Green:"aye" }, // Workers Rights
  112: { Labour:"aye", Conservative:"split", SNP:"aye", "Lib Dem":"aye", Green:"aye" }, // Same-Sex Marriage
};

// ─────────────────────────────────────────────────────────────────────────────
// MP DATA — name, party, constituency, votes on each bill
// keyed by constituency name
// ─────────────────────────────────────────────────────────────────────────────
const MP_DATA = {
  "Hackney North":       { name:"Diane Abbott", party:"Labour", since:1987,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  // ── BRISTOL — all 5 current constituencies (post-2024 boundaries) ──────────
  "Bristol Central":     { name:"Carla Denyer", party:"Green", since:2024,
    notes:"Co-leader of the Green Party of England and Wales. Won Bristol Central at the 2024 general election, beating incumbent Labour MP Thangam Debbonaire by over 10,000 votes.",
    votes:{ 102:"aye",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Bristol North West":  { name:"Darren Jones", party:"Labour", since:2017,
    notes:"Chief Secretary to the Treasury since July 2024. Previously chaired the Business and Trade Select Committee, known for robust questioning of CEOs.",
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",108:"aye",109:"aye",110:"aye",111:"aye",112:"aye" }},
  "Bristol North East":  { name:"Damien Egan", party:"Labour", since:2024,
    notes:"New constituency created in 2024. Egan previously won the Kingswood by-election in 2024 and was former Mayor of Lewisham. Grew up in the area.",
    votes:{ 110:"aye",111:"aye" }},
  "Bristol East":        { name:"Kerry McCarthy", party:"Labour", since:2005,
    notes:"Parliamentary Under-Secretary of State for Climate (2024–2025). Long-serving MP with strong record on environmental issues, animal welfare, and food policy.",
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",108:"aye",110:"aye",111:"aye",112:"aye" }},
  "Bristol South":       { name:"Karin Smyth", party:"Labour", since:2015,
    notes:"Minister of State for Secondary Care since July 2024. Former NHS manager. Holds the safest Labour seat in Bristol.",
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",108:"aye",110:"aye",111:"aye",112:"aye" }},
  "Sheffield Hallam":    { name:"Olivia Blake", party:"Labour", since:2019,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Edinburgh South":     { name:"Ian Murray", party:"Labour", since:2010,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",110:"aye",111:"aye",112:"aye" }},
  "Cardiff Central":     { name:"Jenny Rathbone", party:"Labour", since:2010,
    votes:{ 101:"no",102:"aye",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Leeds North East":    { name:"Fabian Hamilton", party:"Labour", since:1997,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Manchester Withington":{ name:"Jeff Smith", party:"Labour", since:2015,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Brighton Pavilion":   { name:"Sian Berry", party:"Green", since:2024,
    votes:{ 104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Oxford East":         { name:"Anneliese Dodds", party:"Labour", since:2017,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",109:"no",110:"aye",111:"aye",112:"aye" }},
  "Liverpool Wavertree": { name:"Paula Barker", party:"Labour", since:2019,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Birmingham Ladywood": { name:"Shabana Mahmood", party:"Labour", since:2010,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",107:"no",110:"no",111:"aye",112:"aye" }},
  "Glasgow Central":     { name:"Alison Thewliss", party:"SNP", since:2015,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Norwich South":       { name:"Clive Lewis", party:"Labour", since:2015,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Cambridge":           { name:"Daniel Zeichner", party:"Labour", since:2015,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",106:"aye",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Exeter":              { name:"Ben Bradshaw", party:"Labour", since:1997,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Southampton Test":    { name:"Alan Whitehead", party:"Labour", since:1997,
    votes:{ 101:"no",102:"aye",104:"aye",105:"no",106:"aye",107:"no",110:"aye",111:"aye",112:"aye" }},
  "York Central":        { name:"Rachael Maskell", party:"Labour", since:2015,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Nottingham East":     { name:"Nadia Whittome", party:"Labour", since:2019,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Newcastle Central":   { name:"Chi Onwurah", party:"Labour", since:2010,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
  "Reading East":        { name:"Matt Rodda", party:"Labour", since:2017,
    votes:{ 101:"no",102:"aye",103:"no",104:"aye",105:"no",107:"no",110:"aye",111:"aye",112:"aye" }},
};

// ─────────────────────────────────────────────────────────────────────────────
// BILLS DATA
// ─────────────────────────────────────────────────────────────────────────────
const CATS = ["Housing","Energy","Health","Finance","Defence","Education","Immigration","Transport","Environment","Justice","Constitution","Digital","Welfare"];

function makeBill(f) {
  const isH = (f.year||2026) < 2025;
  return { pubAyes:0, pubNoes:0, pubAbs:0, ...f,
    parlAyes:isH?f.ayes:undefined, parlNoes:isH?f.noes:undefined, parlAbs:isH?f.abs:undefined,
    ayes:isH?0:(f.ayes||0), noes:isH?0:(f.noes||0), abs:isH?0:(f.abs||0) };
}

const BILLS = [
  makeBill({id:1,status:"live",year:2026,title:"Renters' Rights Bill — Second Reading",category:"Housing",chamber:"House of Commons",date:"28 Apr 2026",desc:"Abolishes no-fault Section 21 evictions, introduces a Decent Homes Standard for private rentals, and strengthens tenant protections across England.",impact:"Could affect 11 million private renters in England.",ayes:0,noes:0,abs:0}),
  makeBill({id:2,status:"open",year:2026,title:"Great British Energy Bill — Committee Stage",category:"Energy",chamber:"House of Commons",date:"2 May 2026",desc:"Establishes a publicly-owned clean energy company to accelerate offshore wind, solar and new nuclear.",impact:"£8.3bn public investment; flagship Labour energy policy.",ayes:0,noes:0,abs:0}),
  makeBill({id:3,status:"open",year:2026,title:"NHS Workforce Plan Amendment",category:"Health",chamber:"House of Lords",date:"5 May 2026",desc:"Requires the Secretary of State to publish independently verified NHS workforce projections every two years.",impact:"Targets the 100,000+ NHS staff vacancy crisis.",ayes:0,noes:0,abs:0}),
  makeBill({id:101,status:"closed",year:2020,title:"Brexit — EU Withdrawal Agreement Act 2020",category:"Constitution",chamber:"House of Commons",date:"23 Jan 2020",desc:"Ratified the UK's departure from the European Union, implementing the Withdrawal Agreement with a transition period ending 31 December 2020.",impact:"The most consequential constitutional change in 50 years.",ayes:330,noes:231,abs:0,parlOutcome:"passed"}),
  makeBill({id:102,status:"closed",year:2020,title:"Coronavirus Act 2020",category:"Health",chamber:"House of Commons",date:"25 Mar 2020",desc:"Granted sweeping emergency powers during the COVID-19 pandemic, enabling furlough and lockdowns.",impact:"£70bn furlough scheme protected 11 million jobs at peak.",ayes:484,noes:0,abs:0,parlOutcome:"passed"}),
  makeBill({id:103,status:"closed",year:2022,title:"Health and Care Act 2022",category:"Health",chamber:"House of Commons",date:"28 Apr 2022",desc:"The largest NHS restructuring in a decade — abolished CCGs, created Integrated Care Systems.",impact:"Affected 1.3m NHS employees and restructured care for 56m patients.",ayes:285,noes:234,abs:0,parlOutcome:"passed"}),
  makeBill({id:104,status:"closed",year:2023,title:"Online Safety Act 2023",category:"Digital",chamber:"House of Commons",date:"26 Oct 2023",desc:"Required social media platforms to remove illegal content and protect children from harmful material.",impact:"First law of its kind globally.",ayes:350,noes:0,abs:0,parlOutcome:"passed"}),
  makeBill({id:105,status:"closed",year:2022,title:"Police, Crime, Sentencing and Courts Act 2022",category:"Justice",chamber:"House of Commons",date:"28 Apr 2022",desc:"Extended stop-and-search powers and created new offences around public protests.",impact:"Sparked mass protests across the UK.",ayes:365,noes:265,abs:0,parlOutcome:"passed"}),
  makeBill({id:106,status:"closed",year:2023,title:"Energy Act 2023",category:"Energy",chamber:"House of Commons",date:"26 Oct 2023",desc:"Established Great British Nuclear and created a new national energy system operator.",impact:"Largest energy legislation in 30 years.",ayes:302,noes:220,abs:0,parlOutcome:"passed"}),
  makeBill({id:107,status:"closed",year:2023,title:"Illegal Migration Act 2023",category:"Immigration",chamber:"House of Commons",date:"20 Jul 2023",desc:"Required removal of anyone arriving via illegal routes to Rwanda or a safe third country.",impact:"Ruled unlawful by the Supreme Court in November 2023.",ayes:289,noes:230,abs:0,parlOutcome:"passed"}),
  makeBill({id:108,status:"closed",year:2022,title:"Economic Crime (Transparency & Enforcement) Act 2022",category:"Finance",chamber:"House of Commons",date:"15 Mar 2022",desc:"Created a Register of Overseas Entities owning UK property and expanded unexplained wealth orders.",impact:"Over £1.5bn of assets frozen.",ayes:417,noes:0,abs:0,parlOutcome:"passed"}),
  makeBill({id:109,status:"closed",year:2023,title:"Levelling-up and Regeneration Act 2023",category:"Housing",chamber:"House of Commons",date:"26 Oct 2023",desc:"Reformed planning law and introduced new infrastructure levies for English councils.",impact:"Most significant planning reform in a generation.",ayes:269,noes:208,abs:0,parlOutcome:"passed"}),
  makeBill({id:110,status:"closed",year:2024,title:"Assisted Dying Bill — Second Reading 2024",category:"Health",chamber:"House of Commons",date:"29 Nov 2024",desc:"Proposed allowing terminally ill adults with less than 6 months to live to request assisted dying.",impact:"First parliamentary majority for assisted dying in UK history.",ayes:330,noes:275,abs:0,parlOutcome:"passed"}),
  makeBill({id:111,status:"closed",year:2024,title:"Workers' Rights (Employment Relations Reform) Act 2024",category:"Welfare",chamber:"House of Commons",date:"21 Oct 2024",desc:"Introduced day-one unfair dismissal rights, banned zero-hours contracts, strengthened trade union rights.",impact:"Affects 28 million workers.",ayes:347,noes:234,abs:0,parlOutcome:"passed"}),
  makeBill({id:112,status:"closed",year:2013,title:"Marriage (Same Sex Couples) Act 2013",category:"Justice",chamber:"House of Commons",date:"17 Jul 2013",desc:"Legalised same-sex marriage in England and Wales.",impact:"Over 100,000 same-sex couples have since married.",ayes:366,noes:161,abs:0,parlOutcome:"passed"}),
];

const DEFAULT_ADS = [
  {id:"a1",active:true,slot:"banner",emoji:"📰",title:"The Parliamentary Record",sub:"In-depth analysis of every bill. Subscribe free.",cta:"Read Now",bg:"#f0f7ff",border:"#b3d4f0"},
  {id:"a2",active:true,slot:"inline",emoji:"⚖️",title:"Citizens Advice Bureau",sub:"Know your legal rights — free & confidential.",cta:"Get Help",bg:"#f0fff4",border:"#a0d4b0"},
  {id:"a3",active:true,slot:"square",emoji:"🏦",title:"Ethical Finance Co.",sub:"ISAs & pensions aligned with your values.",cta:"Learn More",bg:"#fffbf0",border:"#e8d99a"},
];

const CONSTITUENCIES = Object.keys(MP_DATA);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function partyColor(party) { return PARTIES[party]?.color || "#888"; }
function partyText(party)  { return PARTIES[party]?.textColor || "white"; }

function AdSlot({ ads, slot }) {
  const pool = ads.filter(a => a.active && a.slot === slot);
  if (!pool.length) return null;
  const ad = pool[0];
  return (
    <div className={`ad-slot ${slot}`} style={{background:ad.bg,border:`1px dashed ${ad.border}`}}>
      <span className="ad-label">Advertisement</span>
      <span className="ad-emoji">{ad.emoji}</span>
      <div className="ad-body"><div className="ad-title">{ad.title}</div><div className="ad-sub">{ad.sub}</div></div>
      <button className="ad-cta">{ad.cta} →</button>
    </div>
  );
}

function Tog({ checked, onChange }) {
  return (
    <label className="tog">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>
      <span className="tog-slider"/>
    </label>
  );
}

function Toasts({ list, dismiss }) {
  return (
    <div className="toast-stack">
      {list.map(t=>(
        <div key={t.id} className={`toast${t.out?" out":""}`}>
          <div className="toast-title">{t.title}<button className="toast-x" onClick={()=>dismiss(t.id)}>✕</button></div>
          <div className="toast-body">{t.body}</div>
        </div>
      ))}
    </div>
  );
}

function Bar({ label, count, total, cls }) {
  const pct = total ? Math.round((count/total)*100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track"><div className={`bar-fill ${cls}`} style={{"--w":`${pct}%`}}/></div>
      <span className="bar-pct">{pct}%</span>
      <span className="bar-num">{count.toLocaleString()}</span>
    </div>
  );
}

// ─── PARTY BREAKDOWN ──────────────────────────────────────────────────────────
function PartyBreakdown({ billId }) {
  const votes = PARTY_VOTES[billId];
  if (!votes) return null;
  const voteLabel = { aye:"✓ Aye", no:"✗ No", split:"Split vote", abstain:"Abstained", absent:"Not present" };
  const voteClass = { aye:"pv-aye", no:"pv-no", split:"pv-split", abstain:"pv-abs", absent:"pv-abs" };
  return (
    <div className="breakdown-section">
      <div className="breakdown-title">🏛️ How each party voted</div>
      <div className="party-grid">
        {Object.entries(votes).map(([party, vote]) => (
          <div key={party} className="party-chip" style={{borderColor:partyColor(party)+"44",background:partyColor(party)+"0d"}}>
            <div className="party-dot" style={{background:partyColor(party)}}/>
            <span className="party-name">{party}</span>
            <span className={`party-vote-badge ${voteClass[vote]||"pv-abs"}`}>{voteLabel[vote]||vote}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MY MP PANEL ──────────────────────────────────────────────────────────────
function MyMPPanel({ constituency, billId, userVote }) {
  const mp = MP_DATA[constituency];
  if (!mp) return null;
  const mpVote = mp.votes[billId];
  if (!mpVote) return null; // MP not in this vote (e.g. pre-election)

  const agree = userVote && mpVote && userVote === mpVote;
  const disagree = userVote && mpVote && userVote !== mpVote && mpVote !== "abstain";

  const voteIcon = { aye:"✅", no:"❌", abstain:"⬜", absent:"—" };
  const voteLabel = { aye:"Voted Aye", no:"Voted No", abstain:"Abstained", absent:"Was absent" };

  return (
    <div className="my-mp-panel">
      <div className="mp-avatar" style={{background:partyColor(mp.party)}}>
        {mp.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
      </div>
      <div className="mp-info">
        <div className="mp-label">Your MP — {constituency}</div>
        <div className="mp-name">{mp.name}</div>
        <div className="mp-seat">{mp.party} · MP since {mp.since}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div className="mp-vote-display">
          <span className="mp-vote-icon">{voteIcon[mpVote]||"—"}</span>
          <span className={`mp-vote-text ${mpVote}`}>{voteLabel[mpVote]||mpVote}</span>
        </div>
        {userVote && (
          <div className={`mp-agree ${agree?"agree":disagree?"disagree":""}`}>
            {agree ? "✓ You agreed with your MP" : disagree ? "✗ You disagreed with your MP" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VOTE CARD ────────────────────────────────────────────────────────────────
function VoteCard({ v, userVotes, onVote, delay, constituency }) {
  const my      = userVotes[v.id];
  const historic= v.year < 2025;
  const isOpen  = v.status !== "closed";
  const pubAyes = historic ? v.pubAyes : v.ayes;
  const pubNoes = historic ? v.pubNoes : v.noes;
  const pubAbs  = historic ? v.pubAbs  : v.abs;
  const pubTot  = pubAyes + pubNoes + pubAbs;
  const parlTot = (v.parlAyes||0) + (v.parlNoes||0) + (v.parlAbs||0);
  const accCls  = isOpen ? (v.status==="live"?"live":"") : (historic?"hist":"closed");
  const stTag   = v.status==="live"?"tag-live":v.status==="open"?"tag-open":"tag-closed";

  const showMPPanel = historic && MP_DATA[constituency]?.votes[v.id];
  const showPartyBreakdown = historic && PARTY_VOTES[v.id];

  return (
    <div className="vote-card fade-up" style={{animationDelay:`${delay}s`}}>
      <div style={{display:"flex"}}>
        <div className={`v-accent ${accCls}`}/>
        <div className="vote-body">
          <div className="vote-meta">
            <span className={`tag ${stTag}`}>{v.status==="live"?"🔴 LIVE NOW":v.status==="open"?"Open":"Closed"}</span>
            {historic && <span className="tag tag-hist">🏛 Historic</span>}
            <span className="tag tag-cat">{v.category}</span>
            <span className="tag tag-cat">{v.chamber}</span>
            <span style={{fontSize:".72rem",color:"var(--muted)",fontStyle:"italic"}}>{v.year}</span>
          </div>
          <div className="vote-title">{v.title}</div>
          <div className="vote-desc">{v.desc}</div>
          {v.impact && <div className="vote-impact">⚡ {v.impact}</div>}
          <div className="vote-info">📅 {v.date}</div>

          {historic ? (
            <>
              <div className="dual-record">
                <div className="record-panel official">
                  <div className="record-panel-title"><span>Official Parliamentary Record</span><span className="official-badge">FINAL</span></div>
                  <div className={`record-outcome ${v.parlOutcome==="passed"?"outcome-passed":"outcome-rejected"}`}>
                    {v.parlOutcome==="passed"?"✓ Passed":"✗ Rejected"}
                  </div>
                  {parlTot>0 && <>
                    <Bar label="Aye" count={v.parlAyes} total={parlTot} cls="aye"/>
                    <Bar label="No"  count={v.parlNoes} total={parlTot} cls="no"/>
                  </>}
                  <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:7}}>MPs voting: {parlTot.toLocaleString()}</div>
                </div>
                <div className="record-panel public-view">
                  <div className="record-panel-title"><span>Public Sentiment Today</span><span className="public-badge">LIVE</span></div>
                  {pubTot===0
                    ? <div style={{fontSize:".8rem",color:"var(--muted)",fontStyle:"italic"}}>No public votes yet — be the first.</div>
                    : <>
                        <Bar label="Aye" count={pubAyes} total={pubTot} cls="aye"/>
                        <Bar label="No"  count={pubNoes} total={pubTot} cls="no"/>
                        <Bar label="Abs" count={pubAbs}  total={pubTot} cls="abs"/>
                      </>
                  }
                  <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:7}}>{pubTot.toLocaleString()} public votes cast</div>
                </div>
              </div>

              {/* Party breakdown */}
              {showPartyBreakdown && <PartyBreakdown billId={v.id}/>}

              {/* Your MP */}
              {showMPPanel && <MyMPPanel constituency={constituency} billId={v.id} userVote={my}/>}

              <div className="retro-section">
                <div className="retro-header">
                  <span className="retro-icon">🗳️</span>
                  <div>
                    <div className="retro-title">How would you have voted?</div>
                    <div className="retro-sub">Recorded in Public Sentiment only — official record stays unchanged.</div>
                  </div>
                </div>
                <div className="vote-actions">
                  <button className={`btn-vote btn-aye${my==="aye"?" sel":""}`}     onClick={()=>onVote(v.id,"aye",true)}>✓ Aye</button>
                  <button className={`btn-vote btn-no${my==="no"?" sel":""}`}       onClick={()=>onVote(v.id,"no",true)}>✗ No</button>
                  <button className={`btn-vote btn-abs${my==="abstain"?" sel":""}`} onClick={()=>onVote(v.id,"abstain",true)}>— Abstain</button>
                </div>
                {my && <div className="voted-note">✓ Your view: <strong style={{textTransform:"capitalize"}}>{my}</strong></div>}
              </div>
            </>
          ) : (
            <>
              {pubTot>0 && (
                <div style={{marginBottom:14}}>
                  <div className="results-label">Public Sentiment — {pubTot.toLocaleString()} votes cast</div>
                  <Bar label="Aye" count={pubAyes} total={pubTot} cls="aye"/>
                  <Bar label="No"  count={pubNoes} total={pubTot} cls="no"/>
                  <Bar label="Abs" count={pubAbs}  total={pubTot} cls="abs"/>
                </div>
              )}
              {isOpen && (
                <>
                  <div className="vote-actions">
                    <button className={`btn-vote btn-aye${my==="aye"?" sel":""}`}     onClick={()=>onVote(v.id,"aye")}>✓ Aye</button>
                    <button className={`btn-vote btn-no${my==="no"?" sel":""}`}       onClick={()=>onVote(v.id,"no")}>✗ No</button>
                    <button className={`btn-vote btn-abs${my==="abstain"?" sel":""}`} onClick={()=>onVote(v.id,"abstain")}>— Abstain</button>
                  </div>
                  {my && <div className="voted-note">✓ Your vote: <strong style={{textTransform:"capitalize"}}>{my}</strong></div>}
                </>
              )}
              {!isOpen && <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:8}}>🔒 Voting closed</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VOTES PAGE ───────────────────────────────────────────────────────────────
function VotesPage({ votes, userVotes, onVote, filter, setFilter, ads, constituency }) {
  const filtered = votes.filter(v=>
    (filter.status==="all"||v.status===filter.status)&&
    (filter.cat==="all"||v.category===filter.cat)&&
    (filter.era==="all"||(filter.era==="current"?v.year>=2025:v.year<2025))
  );
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Parliamentary Votes</div>
        <div className="page-sub">Current bills · historic legislation · how your MP and parties voted</div>
        <div className="divider-gold"/>
      </div>
      <AdSlot ads={ads} slot="banner"/>
      <div className="filter-bar">
        {["all","live","open","closed"].map(s=>(
          <button key={s} className="fbtn" onClick={()=>setFilter(f=>({...f,status:s}))}
            style={{background:filter.status===s?"var(--navy)":"white",color:filter.status===s?"var(--gold)":"var(--muted)",borderColor:filter.status===s?"var(--navy)":"#ccc"}}>
            {s==="all"?"All":s[0].toUpperCase()+s.slice(1)}
          </button>
        ))}
        {["all","current","historic"].map(e=>(
          <button key={e} className="fbtn" onClick={()=>setFilter(f=>({...f,era:e}))}
            style={{background:filter.era===e?"var(--ink)":"white",color:filter.era===e?"var(--gold-lt)":"var(--muted)",borderColor:filter.era===e?"var(--ink)":"#ccc"}}>
            {e==="all"?"All Eras":e==="current"?"2025–Now":"Historic"}
          </button>
        ))}
        <select className="fsel" value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}>
          <option value="all">All Categories</option>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="votes-grid">
        {filtered.length===0&&<div style={{color:"var(--muted)",fontStyle:"italic"}}>No votes match your filter.</div>}
        {filtered.map((v,i)=>(
          <>
            <VoteCard key={v.id} v={v} userVotes={userVotes} onVote={onVote} delay={i*0.04} constituency={constituency}/>
            {(i+1)%3===0&&<AdSlot key={`ad${i}`} ads={ads} slot="inline"/>}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── MPs PAGE ─────────────────────────────────────────────────────────────────
function MPsPage({ userConstituency }) {
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [selectedMP, setSelectedMP] = useState(null);

  const historicBills = BILLS.filter(b => b.year < 2025 && PARTY_VOTES[b.id]);
  const allParties = [...new Set(Object.values(MP_DATA).map(m=>m.party))].sort();

  const filtered = Object.entries(MP_DATA).filter(([con, mp]) => {
    const q = search.toLowerCase();
    const matchSearch = !q || mp.name.toLowerCase().includes(q) || con.toLowerCase().includes(q) || mp.party.toLowerCase().includes(q);
    const matchParty  = partyFilter==="all" || mp.party===partyFilter;
    return matchSearch && matchParty;
  });

  const voteIcon = { aye:"✅", no:"❌", abstain:"⬜", absent:"—" };
  const voteLabel= { aye:"Aye", no:"No", abstain:"Abs", absent:"—" };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">MPs & How They Voted</div>
        <div className="page-sub">Browse every MP in our database and see their voting record on key bills</div>
        <div className="divider-gold"/>
      </div>

      <div className="mp-search-bar">
        <input placeholder="Search by MP name, constituency or party…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="fsel" style={{borderRadius:4}} value={partyFilter} onChange={e=>setPartyFilter(e.target.value)}>
          <option value="all">All Parties</option>
          {allParties.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Highlight your MP */}
      {userConstituency && MP_DATA[userConstituency] && (
        <div style={{marginBottom:20,padding:"12px 16px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",borderRadius:4,fontSize:".84rem",color:"var(--ink)"}}>
          👤 Your MP is <strong>{MP_DATA[userConstituency].name}</strong> ({MP_DATA[userConstituency].party}, {userConstituency}).
          <button onClick={()=>setSelectedMP([userConstituency, MP_DATA[userConstituency]])}
            style={{marginLeft:12,padding:"3px 12px",border:"1px solid var(--gold)",borderRadius:2,background:"transparent",cursor:"pointer",fontSize:".78rem",color:"var(--navy)"}}>
            View their record →
          </button>
        </div>
      )}

      <div className="mp-cards">
        {filtered.map(([con, mp]) => {
          const recentVotes = historicBills.slice(0,4);
          return (
            <div key={con} className="mp-card" onClick={()=>setSelectedMP([con,mp])}>
              <div className="mp-card-top">
                <div className="mp-card-avatar" style={{background:partyColor(mp.party),color:partyText(mp.party)}}>
                  {mp.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="mp-card-name">{mp.name}</div>
                  <div className="mp-card-seat">{con}</div>
                  <span className="mp-card-party" style={{background:partyColor(mp.party),color:partyText(mp.party)}}>
                    {mp.party}
                  </span>
                  {con===userConstituency&&<span style={{marginLeft:6,fontSize:".65rem",color:"var(--gold)",fontWeight:700}}>YOUR MP</span>}
                </div>
              </div>
              <div>
                {recentVotes.map(bill=>{
                  const vote = mp.votes[bill.id];
                  if(!vote) return null;
                  return (
                    <div key={bill.id} className="mp-vote-mini-row">
                      <span className="mp-bill-name" title={bill.title}>{bill.title.split("—")[0].trim()}</span>
                      <span className={`vchip ${vote}`}>{voteLabel[vote]||vote}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MP Detail Modal */}
      {selectedMP && (() => {
        const [con, mp] = selectedMP;
        const allVotedBills = historicBills.filter(b=>mp.votes[b.id]);
        return (
          <div className="mp-detail-overlay" onClick={()=>setSelectedMP(null)}>
            <div className="mp-detail-card" onClick={e=>e.stopPropagation()}>
              <div className="mp-detail-header">
                <div className="mp-detail-avatar" style={{background:partyColor(mp.party),color:partyText(mp.party)}}>
                  {mp.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div className="mp-detail-name">{mp.name}</div>
                  <div className="mp-detail-meta">{mp.party} · {con} · MP since {mp.since}</div>
                </div>
                <button className="mp-detail-close" onClick={()=>setSelectedMP(null)}>✕</button>
              </div>
              <div className="mp-detail-body">
                {mp.notes && (
                  <div style={{fontSize:".84rem",color:"#555",lineHeight:1.65,padding:"12px 16px",background:"#f7f4ee",borderRadius:3,marginBottom:18,borderLeft:"3px solid var(--gold)"}}>
                    {mp.notes}
                  </div>
                )}
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",marginBottom:14,fontSize:"1rem"}}>
                  Voting Record — {allVotedBills.length} recorded votes
                </div>
                {allVotedBills.map(bill=>{
                  const vote = mp.votes[bill.id];
                  return (
                    <div key={bill.id} className="mp-detail-vote-row">
                      <div style={{flex:1}}>
                        <div className="mp-detail-bill">{bill.title}</div>
                        <div className="mp-detail-year">{bill.date} · {bill.category}</div>
                      </div>
                      <span className={`vchip ${vote}`} style={{fontSize:".75rem",padding:"3px 10px"}}>
                        {vote==="aye"?"✓ Aye":vote==="no"?"✗ No":vote==="abstain"?"Abstained":"Absent"}
                      </span>
                    </div>
                  );
                })}
                {allVotedBills.length===0&&<div style={{color:"var(--muted)",fontStyle:"italic"}}>No recorded votes for this MP in our database.</div>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── STATS PAGE ───────────────────────────────────────────────────────────────
function StatsPage({ votes, userVotes, user, ads }) {
  const myVoted   = votes.filter(v=>userVotes[v.id]);
  const totalCast = votes.reduce((a,v)=>a+v.pubAyes+v.pubNoes+v.pubAbs,0);
  const retroVotes= myVoted.filter(v=>v.year<2025).length;
  const curVotes  = myVoted.filter(v=>v.year>=2025).length;

  // Agreement score with user's MP
  const mp = MP_DATA[user.constituency];
  let agrees=0, total=0;
  if(mp) {
    myVoted.filter(v=>v.year<2025).forEach(v=>{
      const mpV = mp.votes[v.id];
      if(mpV && userVotes[v.id]) { total++; if(mpV===userVotes[v.id]) agrees++; }
    });
  }

  return (
    <div>
      <div className="page-header"><div className="page-title">My Record</div><div className="page-sub">Your complete voting history and MP alignment</div><div className="divider-gold"/></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{curVotes}</div><div className="stat-label">Current Votes</div><div className="stat-sub">on live/open bills</div></div>
        <div className="stat-card"><div className="stat-num">{retroVotes}</div><div className="stat-label">Historic Views</div><div className="stat-sub">retrospective</div></div>
        <div className="stat-card"><div className="stat-num">{totalCast.toLocaleString()}</div><div className="stat-label">Community Votes</div><div className="stat-sub">platform-wide</div></div>
        {total>0
          ? <div className="stat-card"><div className="stat-num">{Math.round((agrees/total)*100)}%</div><div className="stat-label">MP Agreement</div><div className="stat-sub">{agrees}/{total} votes matched</div></div>
          : <div className="stat-card"><div className="stat-num">{user.constituency?.split(" ")[0]||"—"}</div><div className="stat-label">Constituency</div><div className="stat-sub">{user.constituency}</div></div>
        }
      </div>

      {mp && total>0 && (
        <div style={{background:"white",border:"1px solid #ddd7cd",borderRadius:4,padding:"18px 22px",marginBottom:24,maxWidth:480}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",marginBottom:8}}>
            Your alignment with {mp.name} ({mp.party})
          </div>
          <div style={{fontSize:".85rem",color:"var(--muted)"}}>
            You agreed with your MP on <strong style={{color:"var(--sage)"}}>{agrees}</strong> out of <strong>{total}</strong> comparable votes.
          </div>
          <div style={{marginTop:10,height:8,borderRadius:4,background:"#f0ede7",overflow:"hidden"}}>
            <div style={{width:`${Math.round((agrees/total)*100)}%`,height:"100%",background:"var(--sage)",borderRadius:4,transition:"width .6s ease"}}/>
          </div>
        </div>
      )}

      <AdSlot ads={ads} slot="square"/>
      {myVoted.length===0&&<div style={{color:"var(--muted)",fontStyle:"italic"}}>You haven't voted yet. Head to Active Votes to get started.</div>}
      {curVotes>0&&<>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,color:"var(--navy)",marginBottom:10}}>Current Bills</div>
        {myVoted.filter(v=>v.year>=2025).map((v,i)=>(
          <div key={v.id} className="hist-item" style={{animationDelay:`${i*.06}s`}}>
            <span style={{fontSize:"1.2rem"}}>🗳️</span>
            <div style={{flex:1}}><div className="hist-title">{v.title}</div><div className="hist-date">{v.date} · {v.category}</div></div>
            <span className={`hist-chip ${userVotes[v.id]}`}>{userVotes[v.id]}</span>
          </div>
        ))}
      </>}
      {retroVotes>0&&<>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,color:"var(--navy)",marginTop:22,marginBottom:6}}>Historic Retrospective Views</div>
        <div style={{fontSize:".78rem",color:"var(--muted)",marginBottom:10}}>Your views on closed bills · official record unaffected</div>
        {myVoted.filter(v=>v.year<2025).map((v,i)=>{
          const mpVote = mp?.votes[v.id];
          const myV = userVotes[v.id];
          return (
            <div key={v.id} className="hist-item" style={{animationDelay:`${i*.06}s`}}>
              <span style={{fontSize:"1.2rem"}}>🏛️</span>
              <div style={{flex:1}}>
                <div className="hist-title">{v.title}</div>
                <div className="hist-date">
                  {v.date} · Official: {v.parlOutcome==="passed"?"✓ Passed":"✗ Rejected"}
                  {mpVote&&<span style={{marginLeft:8,color:mpVote===myV?"var(--sage)":"var(--crimson)"}}>· Your MP: {mpVote}</span>}
                </div>
              </div>
              <span className={`hist-chip ${myV}`}>{myV}</span>
            </div>
          );
        })}
      </>}
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user, setUser, addToast }) {
  const [nVote,  setNVote]  = useState(user.pushNotif??true);
  const [subbed, setSubbed] = useState(user.emailSub??true);
  const [email,  setEmail]  = useState(user.email||"");
  const [msg,    setMsg]    = useState("");

  const saveN = () => { setUser(u=>({...u,pushNotif:nVote})); addToast({title:"Saved",body:"Notification preferences updated."}); };

  const subscribe = () => {
    if(!email.includes("@")){setMsg("❌ Enter a valid email.");return;}
    setSubbed(true); setUser(u=>({...u,emailSub:true}));
    setMsg(`✓ Subscribed! Digests will go to ${email}`);
    addToast({title:"📧 Subscribed!",body:`Confirmed for ${email}`});
  };
  const unsubscribe = () => {
    setSubbed(false); setUser(u=>({...u,emailSub:false}));
    setMsg("Unsubscribed from all emails.");
    addToast({title:"Unsubscribed",body:"No further newsletters will be sent."});
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Preferences</div><div className="page-sub">Notifications, email and privacy</div><div className="divider-gold"/></div>
      <div className="setting-block">
        <div className="setting-h">🔔 Push Notifications</div>
        <div className="setting-sub">Pop-up alerts when new votes go live.</div>
        <div className="toggle-row"><div><div className="toggle-label">All notifications</div><div className="toggle-sub">New votes, results, weekly digest</div></div><Tog checked={nVote} onChange={setNVote}/></div>
        <button className="btn-save" onClick={saveN}>Save</button>
      </div>
      <div className="setting-block">
        <div className="setting-h">📧 Email Newsletter</div>
        <div className="setting-sub">Weekly digest of parliamentary activity. Every Friday morning.</div>
        <div className="sub-box">
          <h4>{subbed?"✓ You are subscribed":"Subscribe to the newsletter"}</h4>
          <div style={{fontSize:".83rem",color:"#555"}}>{subbed?`Sending to ${email}`:"Join thousands of citizens staying informed."}</div>
          {!subbed&&<div className="sub-row"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/><button className="btn-sub" onClick={subscribe}>Subscribe</button></div>}
          {subbed&&<div style={{marginTop:12,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:".83rem",color:"var(--sage)"}}>Active: {email}</span><button className="btn-unsub" onClick={unsubscribe}>Unsubscribe</button></div>}
          {msg&&<div className="ok-msg">{msg}</div>}
        </div>
        <div style={{fontSize:".73rem",color:"var(--muted)",marginTop:11}}>We never sell your email. GDPR compliant.</div>
      </div>
      <div className="setting-block">
        <div className="setting-h">🔒 Privacy & Advertising</div>
        <div className="setting-sub">How Parliament Voice stays free.</div>
        <div className="alert-box"><strong>How we make money:</strong> Non-political ads from vetted partners. Your individual votes are never shared. Anonymised aggregate data only. GDPR applies.</div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div>
      <div className="page-header"><div className="page-title">How It Works</div><div className="page-sub">Parliament Voice explained</div><div className="divider-gold"/></div>
      <div className="alert-box" style={{marginBottom:20}}><strong>ℹ️ About:</strong> Parliament Voice represents <em>public sentiment</em> — it does not alter Parliamentary outcomes. Official records are always preserved.</div>
      <div className="about-grid">
        {[
          {i:"🗳️",h:"Vote on Current Bills",p:"Cast Aye, No or Abstain on bills being debated right now. Feeds into live public sentiment."},
          {i:"🏛️",h:"Retrospective Votes",p:"On historic bills, cast your view via 'How would you have voted?' — the official record stays frozen."},
          {i:"🏟️",h:"Party Breakdown",p:"See at a glance how Labour, Conservatives, SNP, Lib Dems and others voted on every bill."},
          {i:"👤",h:"Your MP's Vote",p:"Know exactly how your constituency MP voted on every historic bill — and whether they agreed with you."},
          {i:"🔍",h:"Browse All MPs",p:"Search the full MP database, filter by party, and see their complete voting record side by side."},
          {i:"💷",h:"Free Forever",p:"Funded by carefully vetted, non-political advertising. Civic engagement should never cost the citizen."},
        ].map((c,i)=>(
          <div key={i} className="about-card fade-up" style={{animationDelay:`${i*.07}s`}}>
            <div className="about-icon">{c.i}</div><div className="about-h">{c.h}</div><div className="about-p">{c.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ votes, setVotes, ads, setAds, addToast }) {
  const [form,  setForm]  = useState({title:"",category:"Housing",desc:"",impact:"",chamber:"House of Commons",date:"",status:"open",year:2026,parlOutcome:"passed"});
  const [saved, setSaved] = useState(false);
  const [adForm,setAdForm]= useState({emoji:"📰",title:"",sub:"",cta:"Learn More",slot:"banner"});
  const h  = e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const ha = e=>setAdForm(f=>({...f,[e.target.name]:e.target.value}));
  const totalPub = votes.reduce((a,v)=>a+v.pubAyes+v.pubNoes+v.pubAbs,0);
  const estRev   = Math.round(totalPub*0.004*30);

  const addBill = () => {
    if(!form.title||!form.desc||!form.date) return;
    const yr=+form.year, isH=yr<2025;
    const newV={...form,id:Date.now(),year:yr,ayes:0,noes:0,abs:0,pubAyes:0,pubNoes:0,pubAbs:0,
      parlAyes:isH?0:undefined,parlNoes:isH?0:undefined,parlAbs:isH?0:undefined};
    setVotes(vv=>[newV,...vv]);
    setForm({title:"",category:"Housing",desc:"",impact:"",chamber:"House of Commons",date:"",status:"open",year:2026,parlOutcome:"passed"});
    setSaved(true); setTimeout(()=>setSaved(false),3000);
    addToast({title:"Bill Added",body:`"${form.title}" is now live.`});
  };
  const setStatus=(id,s)=>setVotes(vv=>vv.map(v=>v.id===id?{...v,status:s}:v));
  const addAd=()=>{
    if(!adForm.title||!adForm.sub)return;
    setAds(aa=>[...aa,{...adForm,id:`a${Date.now()}`,active:true,bg:"#fffbf0",border:"#e8d99a"}]);
    setAdForm({emoji:"📰",title:"",sub:"",cta:"Learn More",slot:"banner"});
    addToast({title:"Ad Live",body:`"${adForm.title}" is now showing.`});
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Admin Panel</div><div className="page-sub">Manage bills, advertising and settings</div><div className="divider-gold"/></div>
      <div className="revenue-card">
        <h3>💷 Revenue Dashboard</h3>
        <p style={{fontSize:".82rem",color:"rgba(232,228,220,.7)"}}>Connect Google AdSense to replace placeholders.</p>
        <div className="rev-grid">
          <div><div className="rev-num">{ads.filter(a=>a.active).length}</div><div className="rev-label">Active Ads</div></div>
          <div><div className="rev-num">{totalPub.toLocaleString()}</div><div className="rev-label">Public Votes</div></div>
          <div><div className="rev-num">£{estRev.toLocaleString()}</div><div className="rev-label">Est. Monthly Revenue</div></div>
        </div>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",marginBottom:11}}>Add New Bill</div>
      <div className="admin-form">
        <div className="field"><label>Bill Title</label><input name="title" value={form.title} onChange={h} placeholder="e.g. Digital Markets Act — Third Reading"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="field"><label>Category</label><select name="category" value={form.category} onChange={h}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Chamber</label><select name="chamber" value={form.chamber} onChange={h}><option>House of Commons</option><option>House of Lords</option></select></div>
        </div>
        <div className="field"><label>Description</label><textarea name="desc" value={form.desc} onChange={h} placeholder="Describe what this bill does..."/></div>
        <div className="field"><label>Impact (optional)</label><input name="impact" value={form.impact} onChange={h} placeholder="e.g. Affects 5 million renters"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
          <div className="field"><label>Date</label><input name="date" type="date" value={form.date} onChange={h}/></div>
          <div className="field"><label>Year</label><input name="year" type="number" value={form.year} onChange={h} min="2010" max="2030"/></div>
          <div className="field"><label>Status</label><select name="status" value={form.status} onChange={h}><option value="live">Live</option><option value="open">Open</option><option value="closed">Closed</option></select></div>
          <div className="field"><label>Outcome</label><select name="parlOutcome" value={form.parlOutcome} onChange={h}><option value="passed">Passed</option><option value="rejected">Rejected</option></select></div>
        </div>
        <button className="btn-add" onClick={addBill}>+ Add Bill</button>
        {saved&&<div className="ok-flash">✓ Bill added successfully</div>}
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",marginBottom:11}}>Manage Bills</div>
      {votes.map(v=>(
        <div key={v.id} className="bill-row">
          <span className={`tag ${v.status==="live"?"tag-live":v.status==="open"?"tag-open":"tag-closed"}`}>{v.status}</span>
          {v.year<2025&&<span className="tag tag-hist">Historic</span>}
          <span style={{fontSize:".86rem",fontWeight:600,color:"var(--navy)",flex:1,minWidth:80}}>{v.title}</span>
          <span style={{fontSize:".73rem",color:"var(--muted)"}}>{(v.pubAyes+v.pubNoes+v.pubAbs).toLocaleString()} pub votes</span>
          <button className="btn-sm" style={{borderColor:"var(--crimson)",color:"var(--crimson)",background:"rgba(155,29,32,.07)"}} onClick={()=>setStatus(v.id,"live")}>→ Live</button>
          <button className="btn-sm" style={{borderColor:"var(--sage)",color:"var(--sage)",background:"rgba(46,125,80,.07)"}} onClick={()=>setStatus(v.id,"open")}>→ Open</button>
          <button className="btn-sm" style={{borderColor:"#b0a990",color:"var(--muted)",background:"#f0ede7"}} onClick={()=>setStatus(v.id,"closed")}>Close</button>
        </div>
      ))}
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",margin:"26px 0 11px"}}>Add New Advertisement</div>
      <div className="admin-form">
        <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:12}}>
          <div className="field"><label>Icon</label><input name="emoji" value={adForm.emoji} onChange={ha}/></div>
          <div className="field"><label>Advertiser Name</label><input name="title" value={adForm.title} onChange={ha} placeholder="e.g. Open University"/></div>
        </div>
        <div className="field"><label>Tagline</label><input name="sub" value={adForm.sub} onChange={ha} placeholder="e.g. Study Politics online"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="field"><label>CTA Text</label><input name="cta" value={adForm.cta} onChange={ha}/></div>
          <div className="field"><label>Slot</label><select name="slot" value={adForm.slot} onChange={ha}><option value="banner">Banner</option><option value="inline">Inline</option><option value="square">Square</option></select></div>
        </div>
        <button className="btn-add" onClick={addAd}>+ Add Ad</button>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--navy)",margin:"22px 0 11px"}}>Ad Inventory</div>
      <div className="ad-mgmt">
        {ads.map(ad=>(
          <div key={ad.id} className="ad-row">
            {ad.active?<span className="dot-on"/>:<span className="dot-off"/>}
            <span style={{fontSize:"1.1rem"}}>{ad.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:".86rem",fontWeight:600,color:"var(--navy)"}}>{ad.title}</div><div style={{fontSize:".72rem",color:"var(--muted)"}}>{ad.slot} · {ad.sub}</div></div>
            <button className="btn-sm" style={{borderColor:ad.active?"#b0a990":"var(--sage)",color:ad.active?"var(--muted)":"var(--sage)"}} onClick={()=>setAds(aa=>aa.map(a=>a.id===ad.id?{...a,active:!a.active}:a))}>{ad.active?"Pause":"Activate"}</button>
            <button className="btn-sm" style={{borderColor:"var(--crimson)",color:"var(--crimson)"}} onClick={()=>setAds(aa=>aa.filter(a=>a.id!==ad.id))}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab,setTab]=useState("login");
  const [f,setF]=useState({name:"",email:"",password:"",constituency:"",emailSub:true,pushNotif:true});
  const [err,setErr]=useState("");
  const h=e=>setF(x=>({...x,[e.target.name]:e.target.value}));

  const submit=()=>{
    if(!f.email||!f.password){setErr("Please fill in all fields.");return;}
    if(tab==="register"&&!f.name){setErr("Please enter your name.");return;}
    setErr("");
    onLogin({name:tab==="login"?f.email.split("@")[0]:f.name,email:f.email,
      constituency:f.constituency||CONSTITUENCIES[0],
      role:f.email.includes("admin")?"admin":"voter",
      emailSub:f.emailSub,pushNotif:f.pushNotif});
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-title">Parliament Voice</div>
        <div className="auth-sub">Participate in current votes · see how your MP and parties voted · browse every MP's record</div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab==="login"?" active":""}`} onClick={()=>setTab("login")}>Sign In</button>
          <button className={`auth-tab${tab==="register"?" active":""}`} onClick={()=>setTab("register")}>Register</button>
        </div>
        {tab==="register"&&<div className="field"><label>Full Name</label><input name="name" value={f.name} onChange={h} placeholder="Jane Smith"/></div>}
        <div className="field"><label>Email</label><input name="email" type="email" value={f.email} onChange={h} placeholder="you@example.com"/></div>
        <div className="field"><label>Password</label><input name="password" type="password" value={f.password} onChange={h} placeholder="••••••••"/></div>
        {tab==="register"&&<>
          <div className="field"><label>Constituency</label>
            <select name="constituency" value={f.constituency} onChange={h}>
              <option value="">Select your constituency</option>
              {CONSTITUENCIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:18}}>
            <div className="toggle-row"><div><div className="toggle-label">📧 Email Newsletter</div><div className="toggle-sub">Weekly digest</div></div><Tog checked={f.emailSub} onChange={v=>setF(x=>({...x,emailSub:v}))}/></div>
            <div className="toggle-row"><div><div className="toggle-label">🔔 Push Notifications</div><div className="toggle-sub">New vote alerts</div></div><Tog checked={f.pushNotif} onChange={v=>setF(x=>({...x,pushNotif:v}))}/></div>
          </div>
        </>}
        {err&&<div style={{color:"var(--crimson)",fontSize:".82rem",marginBottom:12,padding:"8px 12px",background:"rgba(155,29,32,.07)",borderRadius:3}}>{err}</div>}
        <button className="btn-primary" onClick={submit}>{tab==="login"?"Sign In":"Create Account"}</button>
        <p className="auth-note">Free forever — funded by advertising, not subscriptions.<br/><em>Use an email with "admin" for the Admin Panel.</em></p>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,   setUser]   = useState(null);
  const [page,   setPage]   = useState("votes");
  const [votes,  setVotes]  = useState(BILLS);
  const [myVotes,setMyVotes]= useState({});
  const [filter, setFilter] = useState({status:"all",cat:"all",era:"all"});
  const [ads,    setAds]    = useState(DEFAULT_ADS);
  const [toasts, setToasts] = useState([]);
  const tid = useRef(0);

  const addToast = useCallback(({title,body})=>{
    if(user&&!user.pushNotif) return;
    const id=++tid.current;
    setToasts(ts=>[...ts,{id,title,body,out:false}]);
    setTimeout(()=>{
      setToasts(ts=>ts.map(t=>t.id===id?{...t,out:true}:t));
      setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),350);
    },5500);
  },[user]);

  const dismiss=useCallback(id=>{
    setToasts(ts=>ts.map(t=>t.id===id?{...t,out:true}:t));
    setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),350);
  },[]);

  useEffect(()=>{
    if(!user)return;
    const t1=setTimeout(()=>addToast({title:"🔴 Vote Live Now",body:"The Renters' Rights Bill is being debated. Cast your vote."}),3000);
    const t2=setTimeout(()=>addToast({title:"👤 Your MP's Record",body:`See how ${MP_DATA[user.constituency]?.name||"your MP"} voted on every major bill in the MPs section.`}),8000);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[user?.email]);

  const handleVote=(id,choice,isHistoric=false)=>{
    const prev=myVotes[id];
    setMyVotes(mv=>({...mv,[id]:choice}));
    setVotes(vv=>vv.map(v=>{
      if(v.id!==id)return v;
      const u={...v};
      if(isHistoric){
        if(prev==="aye")    u.pubAyes=Math.max(0,u.pubAyes-1);
        if(prev==="no")     u.pubNoes=Math.max(0,u.pubNoes-1);
        if(prev==="abstain")u.pubAbs =Math.max(0,u.pubAbs-1);
        if(choice==="aye")    u.pubAyes++;
        if(choice==="no")     u.pubNoes++;
        if(choice==="abstain")u.pubAbs++;
      } else {
        if(prev==="aye")    u.ayes=Math.max(0,u.ayes-1);
        if(prev==="no")     u.noes=Math.max(0,u.noes-1);
        if(prev==="abstain")u.abs =Math.max(0,u.abs-1);
        if(choice==="aye")    u.ayes++;
        if(choice==="no")     u.noes++;
        if(choice==="abstain")u.abs++;
      }
      return u;
    }));
    const bill=votes.find(v=>v.id===id);
    if(bill) addToast({title:`✓ ${isHistoric?"View":"Vote"} Recorded`,body:`You voted "${choice}" on: ${bill.title.substring(0,55)}…`});
  };

  const logout=()=>{setUser(null);setMyVotes({});setPage("votes");setToasts([]);};

  const navItems=[
    {id:"votes", icon:"🗳️",label:"Active Votes", badge:votes.filter(v=>v.status!=="closed"&&!myVotes[v.id]).length||null},
    {id:"mps",   icon:"👥",label:"MPs & Voting"},
    {id:"stats", icon:"📊",label:"My Record"},
    {id:"settings",icon:"⚙️",label:"Preferences"},
    {id:"about", icon:"🏛️",label:"How It Works"},
    ...(user?.role==="admin"?[{id:"admin",icon:"🔧",label:"Admin Panel"}]:[]),
  ];

  return (
    <div className="app">
      <GlobalStyle/>
      <Toasts list={toasts} dismiss={dismiss}/>
      <header className="header">
        <div className="header-logo">
          <span className="crown">♛</span>
          <div><div>Parliament&nbsp;Voice</div><div className="header-tagline">Your Vote. Your Parliament.</div></div>
        </div>
        <div className="header-right">
          <div className="live-badge"><span className="live-dot"/>&nbsp;LIVE VOTES</div>
          {user&&(
            <button className="notif-btn" onClick={()=>addToast({title:"🏛️ Parliament This Week",body:"3 new votes added. Check how your MP voted on the Assisted Dying Bill."})}>
              🔔{toasts.length>0&&<span className="notif-pip"/>}
            </button>
          )}
          {user&&<span style={{fontSize:".8rem",color:"rgba(232,228,220,.6)"}}>{user.name}</span>}
        </div>
      </header>

      {!user ? <AuthPage onLogin={u=>{setUser(u);setPage("votes");}}/> : (
        <div className="main">
          <nav className="sidebar">
            <div className="sidebar-user">
              <div className="avatar">{user.name[0].toUpperCase()}</div>
              <div><div className="sidebar-name">{user.name}</div><div className="sidebar-con">{user.constituency}</div></div>
            </div>
            <div className="sidebar-lbl">Navigation</div>
            {navItems.map(n=>(
              <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
                {n.badge?<span className="nav-badge">{n.badge}</span>:null}
              </div>
            ))}
            <div className="sidebar-div"/>
            <div style={{padding:"0 18px 12px",fontSize:".7rem",color:"rgba(201,168,76,.45)",lineHeight:1.5}}>Free forever · funded by advertising</div>
            <button className="btn-logout" onClick={logout}>Sign Out</button>
          </nav>
          <main className="content">
            {page==="votes"   &&<VotesPage votes={votes} userVotes={myVotes} onVote={handleVote} filter={filter} setFilter={setFilter} ads={ads} constituency={user.constituency}/>}
            {page==="mps"     &&<MPsPage userConstituency={user.constituency}/>}
            {page==="stats"   &&<StatsPage votes={votes} userVotes={myVotes} user={user} ads={ads}/>}
            {page==="settings"&&<SettingsPage user={user} setUser={setUser} addToast={addToast}/>}
            {page==="about"   &&<AboutPage/>}
            {page==="admin"&&user.role==="admin"&&<AdminPage votes={votes} setVotes={setVotes} ads={ads} setAds={setAds} addToast={addToast}/>}
          </main>
        </div>
      )}
    </div>
  );
}