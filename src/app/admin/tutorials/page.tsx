"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Archive,
  Edit3,
  Filter,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Tutorial {
  id: string;
  device_model: string;
  fault_type: string;
  title: string;
  description: string;
  steps: any[];
  video_url: string | null;
  tools: string[];
  parts: string[];
  cover_image: string | null;
  difficulty_level: number;
  estimated_time: number;
  view_count: number;
  like_count: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export default function TutorialsManagementPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);

  // 获取教程列表
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tutorials");
      const result = await response.json();

      if (response.ok) {
        setTutorials(result.tutorials || []);
      } else {
        console.error("获取教程列表失败:", result.error);
      }
    } catch (error) {
      console.error("获取教程列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤教程
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.device_model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || tutorial.status === filterStatus;
    const matchesDevice =
      filterDevice === "all" || tutorial.device_model === filterDevice;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  // 获取唯一的设备型
  const uniqueDevices = [...new Set(tutorials.map((t) => t.device_model))];

  // 状态标签样
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">已发/Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">草稿</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">已归/Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 难度等级显示
  const getDifficultyLevel = (level: number) => {
    const levels = ["入门", "简, "中等", "困难", "专家"];
    return levels[level - 1] || "未知";
  };

  // 处理创建教程
  const handleCreateTutorial = () => {
    setEditingTutorial(null);
    setShowCreateModal(true);
  };

  // 处理编辑教程
  const handleEditTutorial = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setShowCreateModal(true);
  };

  // 处理删除教程
  const handleDeleteTutorial = async (id: string) => {
    if (!confirm("确定要删除这个教程吗？此操作不可撤销)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tutorials/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTutorials(); // 重新加载列表
      } else {
        const result = await response.json();
        alert(`删除失败: ${result.error}`);
      }
    } catch (error) {
      console.error("删除教程错误:", error);
      alert("删除失败");
    }
  };

  // 处理状态变
  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const response = await fetch(`/api/admin/tutorials/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTutorials(); // 重新加载列表
      } else {
        const result = await response.json();
        alert(`状态更新失 ${result.error}`);
      }
    } catch (error) {
      console.error("更新状态错", error);
      alert("状态更新失);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">维修教程管理</h1>
          <p className="text-gray-600 mt-1">管理所有的维修教程内容</p>
        </div>
        <Button onClick={handleCreateTutorial}>
          <Plus className="w-4 h-4 mr-2" />
          新建教程
        </Button>
      </div>

      {/* 搜索和筛*/}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索教程标题、描述或设备型号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">所有状/option>
                <option value="published">已发/option>
                <option value="draft">草稿</option>
                <option value="archived">已归/option>
              </select>
            </div>

            <div>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">所有设/option>
                {uniqueDevices.map((device) => (
                  <option key={device} value={device}>
                    {device}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              筛
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 教程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>教程列表 ({filteredTutorials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTutorials.length === 0  (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无教程
              </h3>
              <p className="text-gray-500 mb-4">开始创建您的第一个维修教程吧</p>
              <Button onClick={handleCreateTutorial}>
                <Plus className="w-4 h-4 mr-2" />
                创建教程
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      教程信息
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      设备/故障
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      难度/时间
                    </th>
                    <th className="text-left py-3 px-4 font-medium">状/th>
                    <th className="text-left py-3 px-4 font-medium">统计</th>
                    <th className="text-left py-3 px-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutorials.map((tutorial) => (
                    <tr key={tutorial.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {tutorial.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {tutorial.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">
                            {tutorial.device_model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tutorial.fault_type}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-sm">
                            难度:{" "}
                            {getDifficultyLevel(tutorial.difficulty_level)}
                          </div>
                          <div className="text-sm text-gray-500">
                            预估: {tutorial.estimated_time}分钟
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(tutorial.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>浏览: {tutorial.view_count}</div>
                          <div className="text-gray-500">
                            点赞: {tutorial.like_count}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTutorial(tutorial)}
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (tutorial.status === "published") {
                                handleStatusChange(tutorial.id, "draft");
                              } else {
                                handleStatusChange(tutorial.id, "published");
                              }
                            }}
                            title={
                              tutorial.status === "published"
                                 "设为草稿"
                                : "发布"
                            }
                          >
                            {tutorial.status === "published" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(tutorial.id, "archived")
                            }
                            title="归档"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTutorial(tutorial.id)}
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑模态框 */}
      {showCreateModal && (
        <TutorialModal
          tutorial={editingTutorial}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTutorial(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingTutorial(null);
            fetchTutorials();
          }}
        />
      )}
    </div>
  );
}

// 教程创建/编辑模态框组件
function TutorialModal({
  tutorial,
  onClose,
  onSave,
}: {
  tutorial: Tutorial | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: tutorial.title || "",
    device_model: tutorial.device_model || "",
    fault_type: tutorial.fault_type || "",
    description: tutorial.description || "",
    steps: tutorial.steps || [
      { id: "step1", title: "", description: "", estimated_time: 10 },
    ],
    video_url: tutorial.video_url || "",
    tools: tutorial.join(", ") || "",
    parts: tutorial.join(", ") || "",
    cover_image: tutorial.cover_image || "",
    difficulty_level: tutorial.difficulty_level || 3,
    estimated_time: tutorial.estimated_time || 30,
    status: tutorial.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tutorialData = {
        ...formData,
        tools: formData.tools
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean),
        parts: formData.parts
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
        steps: formData.steps,
      };

      const url = tutorial
         `/api/admin/tutorials/${tutorial.id}`
        : "/api/admin/tutorials";

      const method = tutorial  "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tutorialData),
      });

      if (response.ok) {
        onSave();
      } else {
        const result = await response.json();
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error("保存教程错误:", error);
      alert("保存失败");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {tutorial  "编辑教程" : "创建新教}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  教程标题 *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  设备型号 *
                </label>
                <Input
                  value={formData.device_model}
                  onChange={(e) =>
                    setFormData({ ...formData, device_model: e.target.value })
                  }
                  placeholder="例如: iPhone 14 Pro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  故障类型 *
                </label>
                <Input
                  value={formData.fault_type}
                  onChange={(e) =>
                    setFormData({ ...formData, fault_type: e.target.value })
                  }
                  placeholder="例如: screen_broken"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty_level: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>入门 (1)</option>
                  <option value={2}>简(2)</option>
                  <option value={3}>中等 (3)</option>
                  <option value={4}>困难 (4)</option>
                  <option value={5}>专家 (5)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教程描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="简要描述这个教程的内容和适用场景"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所需工具 (逗号分隔)
                </label>
                <Input
                  value={formData.tools}
                  onChange={(e) =>
                    setFormData({ ...formData, tools: e.target.value })
                  }
                  placeholder="螺丝刀, 撬棒, 镊子"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所需配件 (逗号分隔)
                </label>
                <Input
                  value={formData.parts}
                  onChange={(e) =>
                    setFormData({ ...formData, parts: e.target.value })
                  }
                  placeholder="屏幕总成, 胶水"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频链接
                </label>
                <Input
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://youtube.com/watchv=..."
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图片URL
                </label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image: e.target.value })
                  }
                  placeholder="https://example.com/cover.jpg"
                  type="url"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">
                {tutorial  "更新教程" : "创建教程"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

