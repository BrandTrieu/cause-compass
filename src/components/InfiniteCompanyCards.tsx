"use client";

import { Card, CardContent } from "@/components/ui/Card";
import InfiniteScrollCards from "./InfiniteScrollCards";
import { useState } from "react";
import Image from "next/image";
import {
  FaApple,
  FaCoffee,
  FaCar,
  FaFacebook,
  FaMountain,
  FaRunning,
} from "react-icons/fa";

interface Company {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  logoUrl?: string;
  color: string;
}

const companies: Company[] = [
  {
    name: "Apple",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/apple.svg",
    icon: FaApple,
    color: "text-gray-800",
  },
  {
    name: "Nike",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/nike.svg",
    icon: FaRunning,
    color: "text-orange-500",
  },
  {
    name: "Patagonia",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/patagonia.svg",
    icon: FaMountain,
    color: "text-green-600",
  },
  {
    name: "Starbucks",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/starbucks.svg",
    icon: FaCoffee,
    color: "text-green-700",
  },
  {
    name: "Tesla",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/tesla.svg",
    icon: FaCar,
    color: "text-red-500",
  },
  {
    name: "Meta",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/meta.svg",
    icon: FaFacebook,
    color: "text-blue-600",
  },
];

export default function InfiniteCompanyCards() {
  return (
    <InfiniteScrollCards direction="right" speed={40}>
      {companies.map((company) => (
        <CompanyCard key={company.name} company={company} />
      ))}
    </InfiniteScrollCards>
  );
}

function CompanyCard({
  company,
  ariaHidden = false,
}: {
  company: Company;
  ariaHidden?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  return (
    <div className="flex-shrink-0 px-4" aria-hidden={ariaHidden || undefined}>
      <Card className="w-64 h-32 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
          <div
            className={`mb-3 ${company.color} flex items-center justify-center`}
          >
            {company.logoUrl && !imageError ? (
              <Image
                src={company.logoUrl}
                alt={`${company.name} logo`}
                width={32}
                height={32}
                className="object-contain"
                onError={() => setImageError(true)}
              />
            ) : company.icon ? (
              <company.icon className="w-8 h-8" />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            {company.name}
          </h3>
        </CardContent>
      </Card>
    </div>
  );
}
