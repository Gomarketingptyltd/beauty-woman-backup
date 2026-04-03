"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit2, Save, X, Loader2, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Technician, TechnicianStatus } from "@/types";
import { toast } from "sonner";

interface TechnicianManagementProps {
  canViewAgent: boolean;
}

export function TechnicianManagement({ canViewAgent }: TechnicianManagementProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Technician>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [techRes, agentRes] = await Promise.all([
        fetch("/api/technicians?active=true"),
        canViewAgent ? fetch("/api/agents") : Promise.resolve(null),
      ]);
      if (techRes.ok) setTechnicians(await techRes.json());
      if (agentRes?.ok) setAgents(await agentRes.json());
      setLoading(false);
    };
    load();
  }, [canViewAgent]);

  const startEdit = (tech: Technician) => {
    setEditing(tech.id);
    setEditData({
      name: tech.name,
      age: tech.age ?? undefined,
      body: tech.body ?? "",
      cup_size: tech.cup_size ?? "",
      height: tech.height ?? "",
      type: tech.type ?? "",
      speciality: tech.speciality ?? "",
      starting_price: tech.starting_price ?? "",
      holder_description: tech.holder_description ?? "",
      agent_id: tech.agent_id ?? undefined,
      language: tech.language ?? [],
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/technicians/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "保存失败");
        return;
      }
      const updated = await res.json();
      setTechnicians((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditing(null);
      toast.success("保存成功");
    } catch {
      toast.error("网络错误");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-red/15">
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              技师
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              状态
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              基本信息
            </th>
            <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
              起步价
            </th>
            {canViewAgent && (
              <th className="text-left py-3 px-3 text-brand-silver-dim font-medium">
                所属中介
              </th>
            )}
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody>
          {technicians.map((tech, idx) => (
            <tr
              key={tech.id}
              className={`border-b border-brand-red/5 ${
                idx % 2 === 0 ? "bg-noir-700/20" : "bg-noir-600/10"
              } hover:bg-brand-red/5 transition-colors`}
            >
              <td className="py-3 px-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-noir-600 flex-shrink-0">
                    {tech.photos?.[0] ? (
                      <Image
                        src={tech.photos[0]}
                        alt={tech.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-silver/30 font-cinzel font-bold">
                        {tech.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    {editing === tech.id ? (
                      <input
                        value={editData.name ?? ""}
                        onChange={(e) =>
                          setEditData((d) => ({ ...d, name: e.target.value }))
                        }
                        className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-sm w-24"
                      />
                    ) : (
                      <p className="text-brand-silver font-medium font-cinzel">
                        {tech.name}
                      </p>
                    )}
                    <p className="text-brand-silver-dim/50 text-xs">{tech.code}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3">
                <StatusBadge status={tech.status} size="sm" />
              </td>
              <td className="py-3 px-3 text-brand-silver-dim text-xs">
                {editing === tech.id ? (
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      placeholder="年龄"
                      type="number"
                      value={editData.age ?? ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          age: parseInt(e.target.value) || undefined,
                        }))
                      }
                      className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-xs w-16"
                    />
                    <input
                      placeholder="身高"
                      value={editData.height ?? ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, height: e.target.value }))
                      }
                      className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-xs w-20"
                    />
                    <input
                      placeholder="罩杯"
                      value={editData.cup_size ?? ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, cup_size: e.target.value }))
                      }
                      className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-xs w-16"
                    />
                    <input
                      placeholder="体型"
                      value={editData.body ?? ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, body: e.target.value }))
                      }
                      className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-xs w-20"
                    />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {tech.age && <p>{tech.age}岁</p>}
                    {tech.height && <p>{tech.height}</p>}
                    {tech.cup_size && <p>{tech.cup_size} Cup</p>}
                  </div>
                )}
              </td>
              <td className="py-3 px-3">
                {editing === tech.id ? (
                  <input
                    placeholder="$200起"
                    value={editData.starting_price ?? ""}
                    onChange={(e) =>
                      setEditData((d) => ({
                        ...d,
                        starting_price: e.target.value,
                      }))
                    }
                    className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-red text-sm w-24"
                  />
                ) : (
                  <span className="text-brand-red font-medium">
                    {tech.starting_price || "—"}
                  </span>
                )}
              </td>
              {canViewAgent && (
                <td className="py-3 px-3">
                  {editing === tech.id ? (
                    <select
                      value={editData.agent_id ?? ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          agent_id: e.target.value || undefined,
                        }))
                      }
                      className="px-2 py-1 rounded bg-noir-600 border border-brand-red/30 text-brand-silver text-xs"
                    >
                      <option value="">无中介</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-brand-silver-dim text-xs">
                      {(tech as Technician & { agent?: { name: string } }).agent?.name ||
                        (tech.agent_id ? "—" : "无")}
                    </span>
                  )}
                </td>
              )}
              <td className="py-3 px-3">
                {editing === tech.id ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveEdit(tech.id)}
                      disabled={saving}
                      className="p-1.5 rounded bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded bg-gray-500/15 border border-gray-500/30 text-gray-400 hover:bg-gray-500/25"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(tech)}
                    className="p-1.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
