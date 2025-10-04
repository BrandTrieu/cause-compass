'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { 
  FaLeaf, 
  FaRainbow, 
  FaShieldAlt, 
  FaHandshake, 
  FaFlag, 
  FaFistRaised, 
  FaChild, 
  FaHeart 
} from 'react-icons/fa'

interface Cause {
  key: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const causes: Cause[] = [
  { 
    key: 'environmentally_friendly', 
    name: 'Environment', 
    description: 'Climate action and sustainability',
    icon: FaLeaf,
    color: 'text-green-600'
  },
  { 
    key: 'lgbtq', 
    name: 'LGBTQ+ Rights', 
    description: 'Equality and inclusion',
    icon: FaRainbow,
    color: 'text-pink-600'
  },
  { 
    key: 'data_privacy', 
    name: 'Data Privacy', 
    description: 'Protection of personal information',
    icon: FaShieldAlt,
    color: 'text-blue-600'
  },
  { 
    key: 'ethical_sourcing', 
    name: 'Ethical Sourcing', 
    description: 'Fair trade and supply chains',
    icon: FaHandshake,
    color: 'text-purple-600'
  },
  { 
    key: 'free_palestine', 
    name: 'Free Palestine', 
    description: 'Support for Palestinian rights',
    icon: FaFlag,
    color: 'text-red-600'
  },
  { 
    key: 'women_workplace', 
    name: 'Women in the Workplace', 
    description: 'Gender equality and workplace diversity',
    icon: FaFistRaised,
    color: 'text-orange-600'
  },
  { 
    key: 'child_labor', 
    name: 'Child Labour', 
    description: 'Opposition to child labor and support for children\'s rights',
    icon: FaChild,
    color: 'text-yellow-600'
  },
  { 
    key: 'animal_cruelty', 
    name: 'Animal Cruelty', 
    description: 'Opposition to animal cruelty and support for animal welfare',
    icon: FaHeart,
    color: 'text-pink-500'
  },
]

export default function InfiniteCauseCards() {
  // Duplicate the causes array to create seamless infinite scroll
  const duplicatedCauses = [...causes, ...causes, ...causes]

  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-scroll">
        {duplicatedCauses.map((cause, index) => {
          const IconComponent = cause.icon
          return (
            <div key={`${cause.key}-${index}`} className="flex-shrink-0 mx-4">
              <Card className="w-80 h-48 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
                  <div className={`mb-4 ${cause.color}`}>
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-foreground">{cause.name}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{cause.description}</p>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
