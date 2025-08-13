import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import { Pencil } from "lucide-react";

export default function EditableTextArea({ grammar = null }) {
  const [mode, setMode] = useState("plain");
  const [value, setValue] = useState(`# Hello!\n\nThis is a *simple* editable area.\n\n\`\`\`${grammar || "javascript"}\nconsole.log("Hi!")\n\`\`\`\n`);
  const [isEditing, setIsEditing] = useState(false);

  const highlightBlock = (code, lang) => {
    const key = (lang || grammar || "").toLowerCase();
    const g = Prism.languages[key];
    if (!g) return code;
    return Prism.highlight(code, g, key);
  };

  const Markdown = ({ text }) => (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const m = /language-(\w+)/.exec(className || "");
          const lang = m?.[1] || grammar || null;
          const raw = String(children);
          if (inline) return <code className={className} {...props}>{children}</code>;
          const html = highlightBlock(raw, lang);
          return (
            <pre className="rounded-2xl border border-slate-200 bg-white p-3 overflow-x-auto">
              <code dangerouslySetInnerHTML={{ __html: html }} />
            </pre>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="mx-auto max-w-4xl relative">
        {!isEditing && (
          <div className="relative">
            <Card className="shadow-lg border-slate-200 relative">
              {/* Edit button inset in top-right corner of the card */}
              <button
                type="button"
                aria-label="Edit"
                onClick={() => setIsEditing(true)}
                className="absolute top-3 right-3 z-10 w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-[0.98]"
              >
                <Pencil className="w-5 h-5" />
              </button>

              <CardHeader>
                <CardTitle className="text-xl">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <Markdown text={value} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AnimatePresence>
          {isEditing && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col"
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Edit Mode</CardTitle>
                  <div className="flex gap-2 text-sm">
                    <button
                      className={`px-3 py-1 rounded ${mode === "plain" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                      onClick={() => setMode("plain")}
                    >
                      Plain
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${mode === "preview" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                      onClick={() => setMode("preview")}
                    >
                      Preview
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${mode === "split" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
                      onClick={() => setMode("split")}
                    >
                      Split
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden">
                  {mode === "plain" && (
                    <textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Type here…"
                      spellCheck={false}
                      className="h-[50vh] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm shadow-inner outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  )}

                  {mode === "preview" && (
                    <div className="prose prose-slate max-w-none h-[50vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
                      <Markdown text={value} />
                    </div>
                  )}

                  {mode === "split" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[50vh]">
                      <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Type here…"
                        spellCheck={false}
                        className="resize-none rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm shadow-inner outline-none focus:ring-2 focus:ring-slate-300"
                      />
                      <div className="prose prose-slate max-w-none overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
                        <Markdown text={value} />
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
                  <button
                    className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200"
                    onClick={() => setIsEditing(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

try {
  if (typeof window !== "undefined") {
    console.assert(typeof EditableTextArea === "function", "EditableTextArea should be a function component");
    const sample = 'const x = 1;';
    const hasJs = !!Prism.languages.javascript;
    if (hasJs) {
      const html = Prism.highlight(sample, Prism.languages.javascript, 'javascript');
      console.assert(typeof html === "string" && html.length >= sample.length, "Prism highlight should return HTML");
    }
  }
} catch (err) {
  console.warn("[EditableTextArea] self-tests failed:", err);
}
