"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Image from "next/image";

interface AI_SummaryProps {
  companyId: string;
  mode: "user" | "guest";
}

export function AI_Summary({ companyId, mode }: AI_SummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [citations, setCitations] = useState<
    { url: string; title?: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Automatically run the fetch when the component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/ai/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, mode }),
        });

        if (!response.ok) throw new Error("Failed to generate summary");

        const data = await response.json();
        setSummary(data.paragraph);
        setCitations(data.citations || []);
      } catch (err) {
        console.error(err);
        setError("Failed to generate AI summary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [companyId, mode]);

  return (
    <Card>
      <CardHeader>
         <div className="flex items-center justify-left">
           <CardTitle>
             <div className="flex flex-col gap-2">
               <span>Summary Powered by</span>
               <Image
                 src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg"
                 alt="Gemini"
                 width={70}
                 height={70}
                 className="inline-block"
               />
             </div>
           </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-4">
              <p>Generating summary...</p>
            </div>

            {/* Loading placeholder */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>

            {/* Sources placeholder */}
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : summary ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{summary}</p>

            {citations.length > 0 && (
              <div className="mt-3 text-sm">
                <p className="font-semibold mb-2">Sources:</p>
                <ul className="space-y-1">
                  {citations.map((c, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {c.title || c.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No summary available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
