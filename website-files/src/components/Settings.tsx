import { useEffect, useState, type FormEvent } from "react";
import type { User } from "../types";
import { fmtNum } from "../types";
import type { UserRecord } from "../api";
import {
  FlaskIcon, GearIcon, LockIcon, LogoutIcon,
  PlusIcon, RestoreIcon, ShieldIcon, TrashIcon, UserIcon,
} from "../icons";

interface Props {
  user: User;
  isAdmin: boolean;
  users: UserRecord[];
  onLoadUsers: () => Promise<void>;
  onCreateUser: (payload: { username: string; password: string; name: string; role: string }) => Promise<boolean>;
  onResetUserPassword: (username: string, password: string) => Promise<boolean>;
  onDeleteUser: (username: string) => Promise<boolean>;
  onChangePassword: (current: string, next: string) => Promise<boolean>;
  onLogout: () => void;
  restoreSeed: () => Promise<void>;
  clearAll: () => Promise<void>;
  medicineCount: number;
  invoiceCount: number;
}

const ROLES = ["مدير النظام", "موظفة مبيعات", "موظف مبيعات", "محاسب"];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25";

export function Settings({
  user, isAdmin, users, onLoadUsers, onCreateUser, onResetUserPassword, onDeleteUser,
  onChangePassword, onLogout, restoreSeed, clearAll, medicineCount, invoiceCount,
}: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  /* تغيير كلمة المرور */
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passBusy, setPassBusy] = useState(false);

  /* إدارة المستخدمين */
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState(ROLES[1]);
  const [newUserPass, setNewUserPass] = useState("");
  const [userError, setUserError] = useState("");
  const [userBusy, setUserBusy] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) void onLoadUsers();
  }, [isAdmin, onLoadUsers]);

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setPassError("");
    if (!curPass || !newPass) { setPassError("أدخل كلمة المرور الحالية والجديدة"); return; }
    if (newPass.length < 4) { setPassError("كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل"); return; }
    if (newPass !== confirmPass) { setPassError("تأكيد كلمة المرور غير مطابق"); return; }
    setPassBusy(true);
    const ok = await onChangePassword(curPass, newPass);
    setPassBusy(false);
    if (ok) { setCurPass(""); setNewPass(""); setConfirmPass(""); }
  };

  const submitNewUser = async (e: FormEvent) => {
    e.preventDefault();
    setUserError("");
    if (!newUsername.trim() || !newName.trim() || !newUserPass) {
      setUserError("أكمل كل الحقول: المعرّف والاسم وكلمة المرور");
      return;
    }
    setUserBusy(true);
    const ok = await onCreateUser({
      username: newUsername.trim(),
      password: newUserPass,
      name: newName.trim(),
      role: newRole,
    });
    setUserBusy(false);
    if (ok) { setNewUsername(""); setNewName(""); setNewUserPass(""); }
  };

  const submitReset = async (username: string) => {
    if (resetPass.length < 4) { setPassError(""); return; }
    const ok = await onResetUserPassword(username, resetPass);
    if (ok) { setResetFor(null); setResetPass(""); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="anim-fade-up">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">الإعدادات</h1>
        <p className="mt-1 text-sm text-slate-400">إدارة الحساب والمستخدمين وبيانات النظام المركزية</p>
      </div>

      {/* الحساب */}
      <section className="anim-fade-up overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <UserIcon className="text-xl text-cyan-700" />
          <h2 className="font-display text-base font-extrabold text-slate-900">الحساب الحالي</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-bl from-blue-950 to-cyan-800 font-display text-xl font-black text-cyan-200 shadow-md shadow-cyan-900/25">
              {user.name.slice(0, 2)}
            </span>
            <div>
              <p className="font-display text-lg font-extrabold text-slate-900">{user.name}</p>
              <p className="text-[13px] text-slate-400">
                {user.role} · <span dir="ltr" className="font-medium text-slate-500">@{user.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-100"
          >
            <LogoutIcon className="text-base" />
            تسجيل الخروج
          </button>
        </div>
      </section>

      {/* تغيير كلمة المرور */}
      <section className="anim-fade-up overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: "110ms" }}>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <LockIcon className="text-xl text-cyan-700" />
          <h2 className="font-display text-base font-extrabold text-slate-900">تغيير كلمة المرور</h2>
        </div>
        <form onSubmit={submitPassword} className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
          <input type="password" dir="ltr" className={inputCls} placeholder="كلمة المرور الحالية" value={curPass} onChange={(e) => setCurPass(e.target.value)} autoComplete="current-password" />
          <input type="password" dir="ltr" className={inputCls} placeholder="كلمة المرور الجديدة" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" />
          <input type="password" dir="ltr" className={inputCls} placeholder="تأكيد كلمة المرور الجديدة" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} autoComplete="new-password" />
          {passError && <p className="anim-fade-in sm:col-span-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12.5px] font-bold text-rose-700">{passError}</p>}
          <button
            type="submit"
            disabled={passBusy}
            className="sm:col-span-3 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-600/25 transition-all hover:-translate-y-0.5 hover:bg-cyan-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passBusy ? "جارٍ الحفظ..." : "تحديث كلمة المرور"}
          </button>
        </form>
      </section>

      {/* إدارة المستخدمين — للمدير فقط */}
      {isAdmin && (
        <section className="anim-fade-up overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: "130ms" }}>
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <ShieldIcon className="text-xl text-cyan-700" />
            <h2 className="font-display text-base font-extrabold text-slate-900">مستخدمو النظام</h2>
            <span className="ms-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500 tabular-nums">
              {fmtNum(users.length)} مستخدم
            </span>
          </div>

          {/* إضافة مستخدم */}
          <form onSubmit={submitNewUser} className="border-b border-slate-100 bg-slate-50/60 p-5">
            <p className="mb-2.5 text-[13px] font-extrabold text-slate-600">إضافة مستخدم جديد</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input dir="ltr" className={inputCls} placeholder="معرّف الدخول (أحرف إنجليزية)" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              <input className={inputCls} placeholder="الاسم الكامل" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <select className={inputCls} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input dir="ltr" className={inputCls} placeholder="كلمة المرور" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} />
            </div>
            {userError && <p className="anim-fade-in mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700">{userError}</p>}
            <button
              type="submit"
              disabled={userBusy}
              className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusIcon className="text-sm" />
              {userBusy ? "جارٍ الإضافة..." : "إضافة المستخدم"}
            </button>
          </form>

          {/* القائمة */}
          <ul className="divide-y divide-slate-100">
            {users.map((u) => (
              <li key={u.username} className="px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-50 font-display text-[13px] font-black text-cyan-800 ring-1 ring-cyan-200/60">
                    {u.name.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">
                      {u.name}
                      {u.username === user.username && <span className="ms-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">أنت</span>}
                    </p>
                    <p className="text-[11.5px] text-slate-400">
                      {u.role} · <span dir="ltr" className="font-medium">@{u.username}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setResetFor(resetFor === u.username ? null : u.username); setResetPass(""); }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition-all hover:border-cyan-300 hover:text-cyan-700"
                    >
                      <LockIcon className="text-[13px]" /> كلمة المرور
                    </button>
                    {u.username !== user.username && (
                      confirmDeleteUser === u.username ? (
                        <button
                          onClick={() => { void onDeleteUser(u.username); setConfirmDeleteUser(null); }}
                          className="rounded-md bg-rose-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white transition-colors hover:bg-rose-700"
                        >
                          متأكد من الحذف؟
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteUser(u.username)}
                          className="grid size-8 place-items-center rounded-md text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="حذف المستخدم"
                        >
                          <TrashIcon className="text-sm" />
                        </button>
                      )
                    )}
                  </div>
                </div>
                {resetFor === u.username && (
                  <div className="anim-fade-in mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-200">
                    <input
                      dir="ltr"
                      className={`${inputCls} max-w-52`}
                      placeholder="كلمة المرور الجديدة"
                      value={resetPass}
                      onChange={(e) => setResetPass(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") void submitReset(u.username); }}
                    />
                    <button
                      onClick={() => void submitReset(u.username)}
                      disabled={resetPass.length < 4}
                      className="rounded-lg bg-cyan-600 px-3.5 py-2 text-[12px] font-extrabold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      تعيين
                    </button>
                    <button
                      onClick={() => setResetFor(null)}
                      className="rounded-lg px-3 py-2 text-[12px] font-bold text-slate-400 transition-colors hover:bg-slate-100"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* البيانات */}
      <section className="anim-fade-up overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <GearIcon className="text-xl text-cyan-700" />
          <h2 className="font-display text-base font-extrabold text-slate-900">بيانات النظام المركزية</h2>
          <span className="ms-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500 tabular-nums">
            {fmtNum(medicineCount)} صنف · {fmtNum(invoiceCount)} فاتورة
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-lg text-cyan-700 ring-1 ring-cyan-200/70">
                <RestoreIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">استعادة البيانات التجريبية</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">يعيد 18 صنفاً، 8 فواتير، 5 طلبيات و7 جهات افتراضية — يستبدل كل البيانات الحالية <strong>لجميع المستخدمين</strong></p>
              </div>
            </div>
            <button
              onClick={() => void restoreSeed()}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm shadow-cyan-600/25 transition-all hover:-translate-y-0.5 hover:bg-cyan-700 active:translate-y-0"
            >
              استعادة
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-rose-50 text-lg text-rose-600 ring-1 ring-rose-200/70">
                <TrashIcon />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">حذف جميع البيانات</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">يمسح المخزون والفواتير والطلبيات نهائياً من الخادم — <strong>لجميع المستخدمين</strong></p>
              </div>
            </div>
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-[13px] font-bold text-rose-600 transition-all hover:-translate-y-0.5 hover:bg-rose-50 active:translate-y-0"
            >
              حذف الكل
            </button>
          </div>
        </div>
      </section>

      {/* حول النظام */}
      <section className="anim-fade-up rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm" style={{ animationDelay: "200ms" }}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-900 text-lg text-cyan-300">
            <FlaskIcon />
          </span>
          <div className="text-[13px] leading-6 text-slate-500">
            <p className="font-display text-sm font-extrabold text-slate-800">نظام إدارة الأدوية — إصدار الخادم 2.0</p>
            <p className="mt-1">
              مبني خصيصاً لمكتب الفيض الدوائي العلمي: مخزون لحظي، فواتير بخصم تلقائي، تنبيهات صلاحية، وتقارير قابلة للطباعة.
              البيانات محفوظة في قاعدة بيانات مركزية على الخادم ومشتركة بين جميع الأجهزة والمستخدمين — أنشئ نسخة احتياطية دورياً من صفحة التقارير.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldIcon className="text-emerald-600" />
              اتصال مشفّر بجلسة آمنة · بيانات مشتركة بين كل الأجهزة
            </p>
          </div>
        </div>
      </section>

      {/* تأكيد الحذف الكلي */}
      {confirmClear && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[3px]" onClick={() => setConfirmClear(false)}>
          <div className="anim-pop-in w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <span className="pulse-danger mx-auto grid size-14 place-items-center rounded-full bg-rose-100 text-[26px] text-rose-600">
              <TrashIcon />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900">حذف جميع البيانات؟</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              سيتم مسح <strong>{fmtNum(medicineCount)} صنف</strong>، <strong>{fmtNum(invoiceCount)} فاتورة</strong>، وكل الطلبيات والجهات نهائياً من الخادم — لجميع المستخدمين.
              ننصح بتنزيل نسخة احتياطية من صفحة التقارير أولاً.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                تراجع
              </button>
              <button
                onClick={() => { setConfirmClear(false); void clearAll(); }}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-rose-600/30 transition-all hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0"
              >
                نعم، امسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
