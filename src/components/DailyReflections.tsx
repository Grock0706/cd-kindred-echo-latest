import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Check, X, Download, Smile, Meh, Frown } from "lucide-react";
import { jsPDF } from "jspdf";
import { reflectionsDB } from "../db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

console.log("✅ DailyReflections – Phase 7 Sentiment Insights Active");

// ─────────── Helpers ───────────

// Basic sentiment detection (local keyword-based)
const analyzeSentiment = (text: string): "positive" | "neutral" | "negative" => {
  const lower = text.toLowerCase();
  const positives = ["happy", "grateful", "productive", "calm", "good", "great"];
  const negatives = ["sad", "angry", "tired", "bad", "overwhelmed", "anxious"];
  if (positives.some((w) => lower.includes(w))) return "positive";
  if (negatives.some((w) => lower.includes(w))) return "negative";
  return "neutral";
};

const getEchoReply = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes("happy") || lower.includes("good"))
    return "That’s wonderful to hear! Celebrate those moments!";
  if (lower.includes("tired") || lower.includes("overwhelmed"))
    return "It’s okay to feel overwhelmed sometimes; you’re not alone in this.";
  if (lower.includes("anxious"))
    return "I hear you — it sounds like you’re carrying a lot. Remember, it’s okay to feel this way.";
  return "Thank you for sharing — it’s good to pause and reflect.";
};

// ─────────── Component ───────────
export default function DailyReflections() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [newText, setNewText] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");
  const [filterRange, setFilterRange] = useState<"all" | "7days">("all");
  const [filterEchoOnly, setFilterEchoOnly] = useState(false);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ─────────── Load from Dexie ───────────
  useEffect(() => {
    const loadReflections = async () => {
      const all = await reflectionsDB.reflections.toArray();
      setReflections(all.reverse());
    };
    loadReflections();
  }, []);

  // ─────────── CRUD ───────────
  const addReflection = async () => {
    if (!newText.trim()) return;
    const now = new Date();
    const sentiment = analyzeSentiment(newText);
    const entry = {
      date: now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: newText.trim(),
      echo: getEchoReply(newText),
      sentiment,
    };
    const id = await reflectionsDB.reflections.add(entry);
    setReflections((prev) => [{ id, ...entry }, ...prev]);
    setNewText("");
  };

  const deleteReflection = async (id: number) => {
    await reflectionsDB.reflections.delete(id);
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditedText(text);
  };

  const saveEdit = async (id: number) => {
    const newSentiment = analyzeSentiment(editedText);
    await reflectionsDB.reflections.update(id, {
      text: editedText,
      sentiment: newSentiment,
    });
    setReflections((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, text: editedText, sentiment: newSentiment } : r
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);
  const toggleExpand = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ─────────── Filters ───────────
  const filteredReflections = reflections.filter((r) => {
    const matchesText =
      filterText.trim() === "" ||
      r.text.toLowerCase().includes(filterText.toLowerCase()) ||
      r.echo.toLowerCase().includes(filterText.toLowerCase());
    const matchesDate =
      filterRange === "all" ||
      (filterRange === "7days" &&
        new Date(r.date).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000);
    const matchesEcho = !filterEchoOnly || (filterEchoOnly && r.echo);
    return matchesText && matchesDate && matchesEcho;
  });

  // ─────────── Export ───────────
  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Daily Reflections", 20, 20);
    doc.setFontSize(11);
    let y = 30;

    filteredReflections.forEach((r, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}. ${r.date} (${r.sentiment})`, 20, y);
      y += 6;
      if (!filterEchoOnly) {
        doc.setFont("helvetica", "bold");
        doc.text("Reflection:", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(r.text, 45, y, { maxWidth: 140 });
        y += 10;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Echo:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(r.echo, 45, y, { maxWidth: 140 });
      y += 12;
    });

    doc.save("Sentiment_Reflections.pdf");
  };

  // ─────────── Sentiment Chart Data ───────────
  const chartData = reflections
    .slice(0, 14)
    .reverse()
    .map((r, idx) => ({
      name: r.date.split("•")[0].trim(),
      score:
        r.sentiment === "positive"
          ? 2
          : r.sentiment === "neutral"
          ? 1
          : 0,
    }));

  // ─────────── UI ───────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F6] to-[#FFF3EC] flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="max-w-md w-full text-center mb-6">
        <h1 className="text-2xl font-bold text-[#1E1E1E] tracking-tight">
          Daily Reflections
        </h1>
        <p className="text-gray-600 mt-1">
          Capture your thoughts and let Echo respond with empathy.
        </p>
      </div>

      {/* Sentiment Trend */}
      {reflections.length > 0 && (
        <div className="max-w-md w-full bg-white rounded-2xl p-4 shadow-sm mb-6 border border-[#E9E1DA]">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Mood Trend (last 14 reflections)
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis
                tickFormatter={(v) =>
                  v === 2 ? "😊" : v === 1 ? "😐" : "😞"
                }
                domain={[0, 2]}
                tick={{ fontSize: 14 }}
              />
              <Tooltip
                formatter={(v) =>
                  v === 2 ? "Positive" : v === 1 ? "Neutral" : "Negative"
                }
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#F8C5B4"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6E3FA9" }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Input */}
      <div className="max-w-md w-full bg-white rounded-2xl p-4 shadow-sm mb-6 border border-[#F8E2D6]/40 hover:shadow-md transition">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write your reflection here..."
          className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-[#F8C5B4] outline-none resize-none text-gray-700"
          rows={3}
        ></textarea>
        <div className="flex justify-between mt-3">
          <button
            onClick={addReflection}
            className="bg-[#F8C5B4] text-[#1E1E1E] font-semibold px-4 py-2 rounded-xl hover:bg-[#f5bba6] transition"
          >
            Begin Your Journey
          </button>
          <button
            onClick={exportToPDF}
            className="border border-[#F8C5B4] text-[#1E1E1E] flex items-center space-x-1 px-4 py-2 rounded-xl hover:bg-[#fff3ef] transition"
          >
            <Download size={16} /> <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-md w-full bg-white p-3 rounded-2xl shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 border border-gray-100">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Search reflections..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#F8C5B4] outline-none"
        />
        <select
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value as "all" | "7days")}
          className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:ring-2 focus:ring-[#F8C5B4] outline-none"
        >
          <option value="all">All</option>
          <option value="7days">Last 7 Days</option>
        </select>
        <label className="flex items-center space-x-1 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filterEchoOnly}
            onChange={(e) => setFilterEchoOnly(e.target.checked)}
            className="accent-[#F8C5B4]"
          />
          <span>Echo only</span>
        </label>
      </div>

      {/* Feed */}
      <div className="max-w-md w-full space-y-3">
        {filteredReflections.length === 0 && (
          <p className="text-center text-gray-400 italic">
            No reflections found.
          </p>
        )}

        <AnimatePresence>
          {filteredReflections.map((reflection) => {
            const isOpen = expanded[reflection.id];
            const isEditing = editingId === reflection.id;
            const isHovered = hoveredId === reflection.id;
            const contentRef = (el: HTMLDivElement | null) =>
              (contentRefs.current[reflection.id] = el);

            const sentimentColor =
              reflection.sentiment === "positive"
                ? "text-green-500"
                : reflection.sentiment === "neutral"
                ? "text-yellow-500"
                : "text-red-500";

            const SentimentIcon =
              reflection.sentiment === "positive"
                ? Smile
                : reflection.sentiment === "neutral"
                ? Meh
                : Frown;

            return (
              <motion.div
                key={reflection.id}
                onMouseEnter={() => setHoveredId(reflection.id)}
                onMouseLeave={() => setHoveredId(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-[2px]"
              >
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <SentimentIcon className={`${sentimentColor}`} size={14} />
                      <span>{reflection.date}</span>
                    </span>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex space-x-2 items-center"
                    >
                      <button
                        onClick={() =>
                          startEdit(reflection.id, reflection.text)
                        }
                        className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteReflection(reflection.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2 text-gray-800 focus:ring-2 focus:ring-[#F8C5B4] outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => saveEdit(reflection.id)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                        >
                          <Check size={16} /> <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} /> <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {reflection.text}
                      </p>
                      <button
                        onClick={() => toggleExpand(reflection.id)}
                        className={`text-gray-400 hover:text-gray-600 text-lg ml-2 transform transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </button>
                    </div>
                  )}

                  <motion.div
                    ref={contentRef}
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 border-l-2 border-[#D6C9EF] pl-3 bg-[#F7F4FD] rounded-r-xl p-3 mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-[#6E3FA9]">Echo – </span>
                        {reflection.echo}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

