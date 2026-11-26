"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, UserRole } from "@/types";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Building,
  UserCheck,
  ChevronRight,
  Sparkles,
  Save,
  X
} from "lucide-react";

export default function OrganizationPage() {
  const { users, refreshUsers, currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("技術工程部");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [managerId, setManagerId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingUser(null);
    setId(`EMP${String(users.length + 1).padStart(3, "0")}`);
    setName("");
    setEmail("");
    setDepartment("技術工程部");
    setTitle("軟體工程師");
    setRole("STAFF");
    setManagerId("MGR001");
    setPhone("0912-000-000");
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setId(user.id);
    setName(user.name);
    setEmail(user.email);
    setDepartment(user.department);
    setTitle(user.title);
    setRole(user.role);
    setManagerId(user.managerId || "");
    setPhone(user.phone || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !department.trim()) {
      alert("請填寫工號、姓名與部門");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: User = {
        id,
        name,
        email: email || `${id.toLowerCase()}@company.com`,
        department,
        title,
        role,
        managerId: managerId || null,
        phone
      };

      const method = editingUser ? "PUT" : "POST";
      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await refreshUsers();
        setModalOpen(false);
        alert(editingUser ? "人員與層級更新成功！" : "新增人員成功！");
      } else {
        const data = await res.json();
        alert(data.error || "儲存失敗");
      }
    } catch (err) {
      console.error(err);
      alert("系統錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(`確定要刪除同仁 [${userId}] 嗎？`)) return;
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        await refreshUsers();
        alert("已成功刪除");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case "STAFF":
        return { label: "一般員工", color: "bg-slate-100 text-slate-700 border-slate-200" };
      case "MANAGER":
        return { label: "單位主管 (第一審)", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "DEPT_HEAD":
        return { label: "部門最高主管 (核准)", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "HR_MANAGER":
        return { label: "人資部主管 (預算審批)", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "HR_STAFF":
        return { label: "人資訓練承辦", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "ADMIN":
        return { label: "系統管理員", color: "bg-amber-100 text-amber-800 border-amber-200" };
    }
  };

  // Group by departments
  const departments = Array.from(new Set(users.map((u) => u.department)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              Org Structure & Hierarchy
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">組織架構與人員層級設定</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            設定企業內部部門、主管回報層級、審核權限職級，動態決定申請單與心得報告的簽核對象
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          新增人員與層級
        </button>
      </div>

      {/* Visual Hierarchy Diagram / Tree View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              組織簽核層級樹狀結構
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              教育訓練申請表與心得報告將依此回報鏈進行單位主管審核 $\rightarrow$ 最高主管核准
            </p>
          </div>
          <span className="text-xs text-slate-400">共 {users.length} 名在職成員</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Executive tier */}
          <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              決策與核准層 (最高主管 / 人資長)
            </div>
            <div className="space-y-2">
              {users
                .filter((u) => u.role === "DEPT_HEAD" || u.role === "HR_MANAGER")
                .map((u) => (
                  <div
                    key={u.id}
                    className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {u.name}
                        <span className="text-[10px] text-slate-400 font-mono">({u.id})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {u.department} · {u.title}
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                      {u.role === "DEPT_HEAD" ? "最高主管" : "人資主管"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Unit Managers */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              審核層 (單位主管經理)
            </div>
            <div className="space-y-2">
              {users
                .filter((u) => u.role === "MANAGER")
                .map((u) => {
                  const manager = users.find((m) => m.id === u.managerId);
                  return (
                    <div
                      key={u.id}
                      className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          <span className="text-[10px] text-slate-400 font-mono">({u.id})</span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          單位主管
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {u.department} · {u.title}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        直屬上級：{manager ? `${manager.name} (${manager.title})` : "最高決策層"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Staff & HR Coordinator */}
          <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              執行與同仁層 (員工 / 人資承辦)
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {users
                .filter((u) => u.role === "STAFF" || u.role === "HR_STAFF")
                .map((u) => {
                  const manager = users.find((m) => m.id === u.managerId);
                  return (
                    <div
                      key={u.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {u.name} <span className="text-[10px] text-slate-400">({u.id})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.department} · {u.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          主管：{manager ? manager.name : "未指派"}
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {u.role === "HR_STAFF" ? "人資承辦" : "員工"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Full Personnel Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">成員清單與權限設定</h3>
          <span className="text-xs text-slate-400">點擊右側編輯按鈕即可調整同仁職稱與直屬主管</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5">工號</th>
                <th className="px-5 py-3.5">姓名</th>
                <th className="px-5 py-3.5">部門</th>
                <th className="px-5 py-3.5">職稱</th>
                <th className="px-5 py-3.5">角色層級 (權限)</th>
                <th className="px-5 py-3.5">直屬審核主管</th>
                <th className="px-5 py-3.5">聯絡 Email</th>
                <th className="px-5 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const badge = getRoleLabel(u.role);
                const manager = users.find((m) => m.id === u.managerId);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">{u.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{u.department}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.title}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700">
                      {manager ? (
                        <span className="font-medium text-slate-900">
                          {manager.name}{" "}
                          <span className="text-[10px] text-slate-400">({manager.title})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">無 (最高層級)</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯人員與層級"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? "編輯人員與層級設定" : "新增企業人員"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">員工工號 *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">部門 *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">職稱 *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">系統角色職級 (權限) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="STAFF">一般員工 (STAFF)</option>
                    <option value="MANAGER">單位主管 (MANAGER - 第一層審核)</option>
                    <option value="DEPT_HEAD">部門最高主管 (DEPT_HEAD - 最終核准)</option>
                    <option value="HR_MANAGER">人資主管 (HR_MANAGER - 預算核准)</option>
                    <option value="HR_STAFF">人資承辦人員 (HR_STAFF - 詢價與成案)</option>
                    <option value="ADMIN">系統管理員 (ADMIN - 全權限)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">直屬審核主管 (Manager)</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- 無 (最高主管或獨立) --</option>
                    {users
                      .filter((u) => u.id !== id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department} · {u.title})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">電子郵件 (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "儲存中..." : "儲存設定"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
