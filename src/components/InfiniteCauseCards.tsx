"use client";

import { Card, CardContent } from "@/components/ui/Card";
import InfiniteScrollCards from "./InfiniteScrollCards";
import Image from "next/image";
import {
  FaChild,
} from "react-icons/fa";



interface Cause {
  key: string;
  name: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  imageUrl?: string;
  color: string;
}

const causes: Cause[] = [
  {
    key: "environmentally_friendly",
    name: "Environmentally Friendly",
    description: "Climate action and sustainability",
    imageUrl: "/icons/earth.jpg",
    color: "text-green-600",
  },
  {
    key: "lgbtq",
    name: "LGBTQ+ Rights",
    description: "Equality and inclusion",
    imageUrl: "/icons/lgbtqflag.png",
    color: "text-pink-600",
  },
  {
    key: "data_privacy",
    name: "Data Privacy",
    description: "Protection of personal information",
    imageUrl: "/icons/lock.jpg",
    color: "text-blue-600",
  },
  {
    key: "ethical_sourcing",
    name: "Ethical Sourcing",
    description: "Fair trade and supply chains",
    imageUrl: "/icons/Fairtrade.png",
    color: "text-purple-600",
  },
  {
    key: "free_palestine",
    name: "Free Palestine",
    description: "Support for Palestinian rights",
    imageUrl: "/icons/pal.svg",
    color: "text-red-600",
  },
  {
    key: "women_workplace",
    name: "Women in the Workplace",
    description: "Gender equality and workplace diversity",
    imageUrl: "/icons/woman.png",
    color: "text-pink-600",
  },
  {
    key: "child_labor",
    name: "Against Child Labour",
    description: "Opposition to child labor and support for children's rights",
    icon: FaChild,
    color: "text-yellow-600",
  },
  {
    key: "animal_cruelty",
    name: "Against Animal Cruelty",
    description: "Opposition to animal cruelty and support for animal welfare",
    imageUrl:"/icons/animalrights.jpg",
    color: "text-pink-500",
  },
  {
    key: "justice_for_ukraine",
    name: "Justice for Ukraine",
    description: "Support for Ukraine's sovereignty and territorial integrity",
    imageUrl: "/icons/ukraine.png",
    color: "text-blue-600",
  },
];

export default function InfiniteCauseCards() {
  return (
    <InfiniteScrollCards direction="left" speed={40}>
      {causes.map((cause) => {
        return (
          <div key={cause.key} className="flex-shrink-0 px-4">
            <Card className="w-80 h-48 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
                <div className={`mb-4 ${cause.color}`}>
                  {cause.imageUrl ? (
                    <Image
                      src={cause.imageUrl}
                      alt={`${cause.name} icon`}
                      width={48}
                      height={48}
                      className="max-w-12 max-h-12 object-contain"
                    />
                  ) : cause.icon ? (
                    <cause.icon className="w-12 h-12" />
                  ) : null}
                </div>
                <h3 className="font-bold text-xl mb-2 text-foreground">
                  {cause.name}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {cause.description}
                </p>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </InfiniteScrollCards>
  );
}
