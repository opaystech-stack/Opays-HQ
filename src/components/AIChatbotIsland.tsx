"use client";

import dynamic from 'next/dynamic';

const AIChatbot = dynamic(() => import('@/components/AIChatbot'), {
  ssr: false,
  loading: () => null,
});

export default function AIChatbotIsland() {
  return <AIChatbot />;
}
